import { Request, Response } from 'express';
import { Op } from 'sequelize';
import User, { UserRole } from '../models/User';
import { hashPassword } from '../utils/auth';

/**
 * Get all users with filtering and pagination
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      locationId,
      isActive
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const whereClause: any = {};

    // Build search conditions
    if (search) {
      whereClause[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } }
      ];
    }

    if (role) {
      whereClause.role = role;
    }

    if (locationId) {
      whereClause.location_id = locationId;
    }

    if (isActive !== undefined) {
      whereClause.is_active = isActive === 'true';
    }

    // Apply location-based access control
    if (req.user) {
      const currentUser = req.user;
      
      // Non-admin users can only see users from their location
      if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.AREA_MANAGER) {
        if (currentUser.locationId) {
          whereClause.location_id = currentUser.locationId;
        } else {
          // If user has no location, they can only see themselves
          whereClause.id = currentUser.userId;
        }
      }
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password_hash'] },
      limit: Number(limit),
      offset,
      order: [['created_at', 'DESC']]
    });

    const totalPages = Math.ceil(count / Number(limit));

    res.json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          locationId: user.location_id,
          isActive: user.is_active,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        })),
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalItems: count,
          itemsPerPage: Number(limit)
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'เกิดข้อผิดพลาดภายในระบบ'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'ไม่พบข้อมูลผู้ใช้งาน'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check access permissions
    if (req.user) {
      const currentUser = req.user;
      
      // Non-admin users can only view users from their location or themselves
      if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.AREA_MANAGER) {
        if (currentUser.userId !== user.id && currentUser.locationId !== user.location_id) {
          res.status(403).json({
            success: false,
            error: {
              code: 'ACCESS_DENIED',
              message: 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้'
            },
            timestamp: new Date().toISOString()
          });
          return;
        }
      }
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          locationId: user.location_id,
          isActive: user.is_active,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'เกิดข้อผิดพลาดภายในระบบ'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Create new user
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, firstName, lastName, role, locationId } = req.body;

    // Check if username already exists
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE_ENTRY',
          message: 'ชื่อผู้ใช้นี้มีอยู่แล้ว'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      res.status(400).json({
        success: false,
        error: {
          code: 'DUPLICATE_ENTRY',
          message: 'อีเมลนี้มีอยู่แล้ว'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await User.create({
      username,
      email,
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      role,
      location_id: locationId || null
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          locationId: user.location_id,
          isActive: user.is_active,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        }
      },
      message: 'สร้างบัญชีผู้ใช้สำเร็จ',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'เกิดข้อผิดพลาดภายในระบบ'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Update user
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { username, email, firstName, lastName, role, locationId } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'ไม่พบข้อมูลผู้ใช้งาน'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check access permissions
    if (req.user) {
      const currentUser = req.user;
      
      // Non-admin users can only update themselves
      if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.AREA_MANAGER) {
        if (currentUser.userId !== user.id) {
          res.status(403).json({
            success: false,
            error: {
              code: 'ACCESS_DENIED',
              message: 'ไม่มีสิทธิ์แก้ไขข้อมูลนี้'
            },
            timestamp: new Date().toISOString()
          });
          return;
        }
        
        // Non-admin users cannot change their role or location
        if (role && role !== user.role) {
          res.status(403).json({
            success: false,
            error: {
              code: 'INSUFFICIENT_PERMISSIONS',
              message: 'ไม่สามารถเปลี่ยนบทบาทของตนเองได้'
            },
            timestamp: new Date().toISOString()
          });
          return;
        }
        
        if (locationId && locationId !== user.location_id) {
          res.status(403).json({
            success: false,
            error: {
              code: 'INSUFFICIENT_PERMISSIONS',
              message: 'ไม่สามารถเปลี่ยนสาขาของตนเองได้'
            },
            timestamp: new Date().toISOString()
          });
          return;
        }
      }
    }

    // Check for duplicate username (excluding current user)
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ 
        where: { 
          username,
          id: { [Op.ne]: id }
        } 
      });
      if (existingUsername) {
        res.status(400).json({
          success: false,
          error: {
            code: 'DUPLICATE_ENTRY',
            message: 'ชื่อผู้ใช้นี้มีอยู่แล้ว'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }
    }

    // Check for duplicate email (excluding current user)
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ 
        where: { 
          email,
          id: { [Op.ne]: id }
        } 
      });
      if (existingEmail) {
        res.status(400).json({
          success: false,
          error: {
            code: 'DUPLICATE_ENTRY',
            message: 'อีเมลนี้มีอยู่แล้ว'
          },
          timestamp: new Date().toISOString()
        });
        return;
      }
    }

    // Update user
    await user.update({
      username: username || user.username,
      email: email || user.email,
      first_name: firstName || user.first_name,
      last_name: lastName || user.last_name,
      role: role || user.role,
      location_id: locationId !== undefined ? locationId : user.location_id
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          locationId: user.location_id,
          isActive: user.is_active,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        }
      },
      message: 'อัปเดตข้อมูลผู้ใช้สำเร็จ',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'เกิดข้อผิดพลาดภายในระบบ'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Delete user (soft delete by deactivating)
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'ไม่พบข้อมูลผู้ใช้งาน'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Prevent users from deleting themselves
    if (req.user && req.user.userId === id) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_OPERATION',
          message: 'ไม่สามารถลบบัญชีของตนเองได้'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Soft delete by deactivating the user
    await user.update({ is_active: false });

    res.json({
      success: true,
      message: 'ปิดใช้งานบัญชีผู้ใช้สำเร็จ',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'เกิดข้อผิดพลาดภายในระบบ'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Activate user
 */
export const activateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'ไม่พบข้อมูลผู้ใช้งาน'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    await user.update({ is_active: true });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          locationId: user.location_id,
          isActive: user.is_active,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        }
      },
      message: 'เปิดใช้งานบัญชีผู้ใช้สำเร็จ',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'เกิดข้อผิดพลาดภายในระบบ'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Reset user password (admin only)
 */
export const resetUserPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'ไม่พบข้อมูลผู้ใช้งาน'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await user.update({ password_hash: passwordHash });

    res.json({
      success: true,
      message: 'รีเซ็ตรหัสผ่านสำเร็จ',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'เกิดข้อผิดพลาดภายในระบบ'
      },
      timestamp: new Date().toISOString()
    });
  }
};