import { Request, Response } from 'express';
import { Op } from 'sequelize';
import User from '../models/User';
import {
  hashPassword,
  comparePassword,
  generateTokens,
  refreshAccessToken,
  revokeRefreshToken,
  revokeAllUserSessions
} from '../utils/auth';

/**
 * User login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Find user by username or email
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username },
          { email: username }
        ],
        is_active: true
      }
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_CREDENTIALS_INVALID',
          message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_CREDENTIALS_INVALID',
          message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Generate tokens
    const tokens = await generateTokens(user);

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
          locationId: user.location_id
        },
        tokens
      },
      message: 'เข้าสู่ระบบสำเร็จ',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Login error:', error);
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
 * User registration (admin only)
 */
export const register = async (req: Request, res: Response): Promise<void> => {
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
          locationId: user.location_id
        }
      },
      message: 'สร้างบัญชีผู้ใช้สำเร็จ',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Registration error:', error);
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
 * Refresh access token
 */
export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    const tokens = await refreshAccessToken(refreshToken);

    res.json({
      success: true,
      data: { tokens },
      message: 'ต่ออายุ token สำเร็จ',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_TOKEN_INVALID',
        message: 'Refresh token ไม่ถูกต้องหรือหมดอายุ'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * User logout
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    res.json({
      success: true,
      message: 'ออกจากระบบสำเร็จ',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Logout error:', error);
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
 * Logout from all devices
 */
export const logoutAll = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_TOKEN_MISSING',
          message: 'ไม่พบข้อมูลผู้ใช้งาน'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    await revokeAllUserSessions(req.user.userId);

    res.json({
      success: true,
      message: 'ออกจากระบบทุกอุปกรณ์สำเร็จ',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Logout all error:', error);
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
 * Get current user profile
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_TOKEN_MISSING',
          message: 'ไม่พบข้อมูลผู้ใช้งาน'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const user = await User.findByPk(req.user.userId, {
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
    console.error('Get profile error:', error);
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
 * Change password
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_TOKEN_MISSING',
          message: 'ไม่พบข้อมูลผู้ใช้งาน'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(req.user.userId);
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

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CURRENT_PASSWORD',
          message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await user.update({ password_hash: newPasswordHash });

    // Revoke all sessions to force re-login
    await revokeAllUserSessions(user.id);

    res.json({
      success: true,
      message: 'เปลี่ยนรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบใหม่',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Change password error:', error);
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