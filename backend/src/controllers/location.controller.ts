import { Request, Response } from 'express';
import Location, { LocationType } from '../models/Location';
import User from '../models/User';
import { Op } from 'sequelize';

export class LocationController {
  // Get all locations with optional filtering
  async getLocations(req: Request, res: Response) {
    try {
      const { type, is_active, search } = req.query;
      
      const whereClause: any = {};
      
      if (type) {
        whereClause.type = type;
      }
      
      if (is_active !== undefined) {
        whereClause.is_active = is_active === 'true';
      }
      
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { address: { [Op.like]: `%${search}%` } }
        ];
      }

      const locations = await Location.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'manager',
            attributes: ['id', 'first_name', 'last_name', 'email'],
            required: false
          }
        ],
        order: [['name', 'ASC']]
      });

      res.json({
        success: true,
        data: locations
      });
    } catch (error) {
      console.error('Error fetching locations:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสาขา'
        }
      });
    }
  }

  // Get location by ID
  async getLocationById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const location = await Location.findByPk(id, {
        include: [
          {
            model: User,
            as: 'manager',
            attributes: ['id', 'first_name', 'last_name', 'email'],
            required: false
          }
        ]
      });

      if (!location) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'LOCATION_NOT_FOUND',
            message: 'ไม่พบข้อมูลสาขาที่ระบุ'
          }
        });
      }

      return res.json({
        success: true,
        data: location
      });
    } catch (error) {
      console.error('Error fetching location:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสาขา'
        }
      });
    }
  }

  // Create new location
  async createLocation(req: Request, res: Response) {
    try {
      const { name, type, address, phone, manager_id } = req.body;

      // Validate required fields
      if (!name || !type) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'ข้อมูลไม่ครบถ้วน',
            details: [
              { field: 'name', message: 'กรุณาระบุชื่อสาขา' },
              { field: 'type', message: 'กรุณาระบุประเภทสาขา' }
            ]
          }
        });
      }

      // Validate location type
      if (!Object.values(LocationType).includes(type)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'ประเภทสาขาไม่ถูกต้อง'
          }
        });
      }

      // Check if manager exists (if provided)
      if (manager_id) {
        const manager = await User.findByPk(manager_id);
        if (!manager) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'ไม่พบข้อมูลผู้จัดการที่ระบุ'
            }
          });
        }
      }

      const location = await Location.create({
        name,
        type,
        address,
        phone,
        manager_id
      });

      // Fetch the created location with manager info
      const createdLocation = await Location.findByPk(location.id, {
        include: [
          {
            model: User,
            as: 'manager',
            attributes: ['id', 'first_name', 'last_name', 'email'],
            required: false
          }
        ]
      });

      return res.status(201).json({
        success: true,
        data: createdLocation,
        message: 'สร้างสาขาใหม่เรียบร้อยแล้ว'
      });
    } catch (error) {
      console.error('Error creating location:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'เกิดข้อผิดพลาดในการสร้างสาขา'
        }
      });
    }
  }

  // Update location
  async updateLocation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, type, address, phone, manager_id, is_active } = req.body;

      const location = await Location.findByPk(id);
      if (!location) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'LOCATION_NOT_FOUND',
            message: 'ไม่พบข้อมูลสาขาที่ระบุ'
          }
        });
      }

      // Validate location type if provided
      if (type && !Object.values(LocationType).includes(type)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'ประเภทสาขาไม่ถูกต้อง'
          }
        });
      }

      // Check if manager exists (if provided)
      if (manager_id) {
        const manager = await User.findByPk(manager_id);
        if (!manager) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'ไม่พบข้อมูลผู้จัดการที่ระบุ'
            }
          });
        }
      }

      await location.update({
        name: name || location.name,
        type: type || location.type,
        address: address !== undefined ? address : location.address,
        phone: phone !== undefined ? phone : location.phone,
        manager_id: manager_id !== undefined ? manager_id : location.manager_id,
        is_active: is_active !== undefined ? is_active : location.is_active
      });

      // Fetch updated location with manager info
      const updatedLocation = await Location.findByPk(id, {
        include: [
          {
            model: User,
            as: 'manager',
            attributes: ['id', 'first_name', 'last_name', 'email'],
            required: false
          }
        ]
      });

      return res.json({
        success: true,
        data: updatedLocation,
        message: 'อัปเดตข้อมูลสาขาเรียบร้อยแล้ว'
      });
    } catch (error) {
      console.error('Error updating location:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลสาขา'
        }
      });
    }
  }

  // Delete location (soft delete by setting is_active to false)
  async deleteLocation(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const location = await Location.findByPk(id);
      if (!location) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'LOCATION_NOT_FOUND',
            message: 'ไม่พบข้อมูลสาขาที่ระบุ'
          }
        });
      }

      // TODO: Check if location has inventory before allowing deletion
      // This will be implemented when inventory system is ready

      await location.update({ is_active: false });

      return res.json({
        success: true,
        message: 'ลบสาขาเรียบร้อยแล้ว'
      });
    } catch (error) {
      console.error('Error deleting location:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'เกิดข้อผิดพลาดในการลบสาขา'
        }
      });
    }
  }

  // Get location hierarchy (for future use with parent-child relationships)
  async getLocationHierarchy(_req: Request, res: Response) {
    try {
      const locations = await Location.findAll({
        where: { is_active: true },
        include: [
          {
            model: User,
            as: 'manager',
            attributes: ['id', 'first_name', 'last_name', 'email'],
            required: false
          }
        ],
        order: [['type', 'ASC'], ['name', 'ASC']]
      });

      // Group by type for hierarchy display
      const hierarchy = {
        central_kitchen: locations.filter(loc => loc.type === LocationType.CENTRAL_KITCHEN),
        restaurant_branches: locations.filter(loc => loc.type === LocationType.RESTAURANT_BRANCH)
      };

      return res.json({
        success: true,
        data: hierarchy
      });
    } catch (error) {
      console.error('Error fetching location hierarchy:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'เกิดข้อผิดพลาดในการดึงข้อมูลโครงสร้างสาขา'
        }
      });
    }
  }
}

export default new LocationController();