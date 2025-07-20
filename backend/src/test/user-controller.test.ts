import { Request, Response } from 'express';
import { Op } from 'sequelize';
import User, { UserRole } from '../models/User';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
  resetUserPassword
} from '../controllers/user.controller';
import * as authUtils from '../utils/auth';

// Mock the User model
jest.mock('../models/User');
jest.mock('../utils/auth');

const MockUser = User as jest.Mocked<typeof User>;
const mockAuthUtils = authUtils as jest.Mocked<typeof authUtils>;

describe('User Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockRequest = {
      user: {
        userId: 'admin-id',
        username: 'admin',
        email: 'admin@test.com',
        role: UserRole.ADMIN
      },
      query: {},
      params: {},
      body: {}
    };
    
    mockResponse = {
      json: mockJson,
      status: mockStatus
    };

    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should return users list with pagination', async () => {
      const mockUsers = [
        {
          id: 'user1',
          username: 'user1',
          email: 'user1@test.com',
          first_name: 'User',
          last_name: 'One',
          role: UserRole.STAFF,
          location_id: 'location1',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      MockUser.findAndCountAll.mockResolvedValue({
        count: 1 as any,
        rows: mockUsers as any
      });

      await getUsers(mockRequest as Request, mockResponse as Response);

      expect(MockUser.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        attributes: { exclude: ['password_hash'] },
        limit: 10,
        offset: 0,
        order: [['created_at', 'DESC']]
      });

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: {
          users: expect.arrayContaining([
            expect.objectContaining({
              id: 'user1',
              username: 'user1',
              email: 'user1@test.com'
            })
          ]),
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 1,
            itemsPerPage: 10
          }
        },
        timestamp: expect.any(String)
      });
    });

    it('should apply search filter', async () => {
      mockRequest.query = { search: 'admin' };

      MockUser.findAndCountAll.mockResolvedValue({
        count: 0 as any,
        rows: []
      });

      await getUsers(mockRequest as Request, mockResponse as Response);

      expect(MockUser.findAndCountAll).toHaveBeenCalledWith({
        where: {
          [Op.or]: [
            { username: { [Op.like]: '%admin%' } },
            { email: { [Op.like]: '%admin%' } },
            { first_name: { [Op.like]: '%admin%' } },
            { last_name: { [Op.like]: '%admin%' } }
          ]
        },
        attributes: { exclude: ['password_hash'] },
        limit: 10,
        offset: 0,
        order: [['created_at', 'DESC']]
      });
    });

    it('should apply role filter', async () => {
      mockRequest.query = { role: UserRole.ADMIN };

      MockUser.findAndCountAll.mockResolvedValue({
        count: 0 as any,
        rows: []
      });

      await getUsers(mockRequest as Request, mockResponse as Response);

      expect(MockUser.findAndCountAll).toHaveBeenCalledWith({
        where: { role: UserRole.ADMIN },
        attributes: { exclude: ['password_hash'] },
        limit: 10,
        offset: 0,
        order: [['created_at', 'DESC']]
      });
    });

    it('should restrict access for non-admin users', async () => {
      mockRequest.user = {
        userId: 'staff-id',
        username: 'staff',
        email: 'staff@test.com',
        role: UserRole.STAFF,
        locationId: 'location1'
      };

      MockUser.findAndCountAll.mockResolvedValue({
        count: 0 as any,
        rows: []
      });

      await getUsers(mockRequest as Request, mockResponse as Response);

      expect(MockUser.findAndCountAll).toHaveBeenCalledWith({
        where: { location_id: 'location1' },
        attributes: { exclude: ['password_hash'] },
        limit: 10,
        offset: 0,
        order: [['created_at', 'DESC']]
      });
    });

    it('should handle database errors', async () => {
      MockUser.findAndCountAll.mockRejectedValue(new Error('Database error'));

      await getUsers(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'เกิดข้อผิดพลาดภายในระบบ'
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('getUserById', () => {
    it('should return user by ID for admin', async () => {
      const mockUser = {
        id: 'user1',
        username: 'user1',
        email: 'user1@test.com',
        first_name: 'User',
        last_name: 'One',
        role: UserRole.STAFF,
        location_id: 'location1',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockRequest.params = { id: 'user1' };
      MockUser.findByPk.mockResolvedValue(mockUser as any);

      await getUserById(mockRequest as Request, mockResponse as Response);

      expect(MockUser.findByPk).toHaveBeenCalledWith('user1', {
        attributes: { exclude: ['password_hash'] }
      });

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: {
          user: expect.objectContaining({
            id: 'user1',
            username: 'user1',
            email: 'user1@test.com'
          })
        },
        timestamp: expect.any(String)
      });
    });

    it('should return 404 for non-existent user', async () => {
      mockRequest.params = { id: 'non-existent' };
      MockUser.findByPk.mockResolvedValue(null);

      await getUserById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'ไม่พบข้อมูลผู้ใช้งาน'
        },
        timestamp: expect.any(String)
      });
    });

    it('should deny access for unauthorized users', async () => {
      const mockUser = {
        id: 'user1',
        location_id: 'location2'
      };

      mockRequest.user = {
        userId: 'staff-id',
        username: 'staff',
        email: 'staff@test.com',
        role: UserRole.STAFF,
        locationId: 'location1'
      };
      mockRequest.params = { id: 'user1' };
      MockUser.findByPk.mockResolvedValue(mockUser as any);

      await getUserById(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้'
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@test.com',
        password: 'Password123',
        firstName: 'New',
        lastName: 'User',
        role: UserRole.STAFF,
        locationId: 'location1'
      };

      const mockCreatedUser = {
        id: 'new-user-id',
        username: 'newuser',
        email: 'newuser@test.com',
        first_name: 'New',
        last_name: 'User',
        role: UserRole.STAFF,
        location_id: 'location1',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockRequest.body = userData;
      MockUser.findOne.mockResolvedValue(null); // No existing user
      mockAuthUtils.hashPassword.mockResolvedValue('hashed-password');
      MockUser.create.mockResolvedValue(mockCreatedUser as any);

      await createUser(mockRequest as Request, mockResponse as Response);

      expect(MockUser.findOne).toHaveBeenCalledTimes(2); // Check username and email
      expect(mockAuthUtils.hashPassword).toHaveBeenCalledWith('Password123');
      expect(MockUser.create).toHaveBeenCalledWith({
        username: 'newuser',
        email: 'newuser@test.com',
        password_hash: 'hashed-password',
        first_name: 'New',
        last_name: 'User',
        role: UserRole.STAFF,
        location_id: 'location1'
      });

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: {
          user: expect.objectContaining({
            id: 'new-user-id',
            username: 'newuser',
            email: 'newuser@test.com'
          })
        },
        message: 'สร้างบัญชีผู้ใช้สำเร็จ',
        timestamp: expect.any(String)
      });
    });

    it('should prevent duplicate username', async () => {
      const userData = {
        username: 'existinguser',
        email: 'new@test.com',
        password: 'Password123',
        firstName: 'New',
        lastName: 'User',
        role: UserRole.STAFF
      };

      mockRequest.body = userData;
      MockUser.findOne.mockResolvedValueOnce({ username: 'existinguser' } as any);

      await createUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'DUPLICATE_ENTRY',
          message: 'ชื่อผู้ใช้นี้มีอยู่แล้ว'
        },
        timestamp: expect.any(String)
      });
    });

    it('should prevent duplicate email', async () => {
      const userData = {
        username: 'newuser',
        email: 'existing@test.com',
        password: 'Password123',
        firstName: 'New',
        lastName: 'User',
        role: UserRole.STAFF
      };

      mockRequest.body = userData;
      MockUser.findOne
        .mockResolvedValueOnce(null) // No existing username
        .mockResolvedValueOnce({ email: 'existing@test.com' } as any); // Existing email

      await createUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'DUPLICATE_ENTRY',
          message: 'อีเมลนี้มีอยู่แล้ว'
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name'
      };

      const mockUser = {
        id: 'user1',
        username: 'user1',
        email: 'user1@test.com',
        first_name: 'User',
        last_name: 'One',
        role: UserRole.STAFF,
        location_id: 'location1',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        update: jest.fn().mockResolvedValue(true)
      };

      mockRequest.params = { id: 'user1' };
      mockRequest.body = updateData;
      MockUser.findByPk.mockResolvedValue(mockUser as any);

      await updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockUser.update).toHaveBeenCalledWith({
        username: 'user1',
        email: 'user1@test.com',
        first_name: 'Updated',
        last_name: 'Name',
        role: UserRole.STAFF,
        location_id: 'location1'
      });

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: {
          user: expect.objectContaining({
            firstName: 'User', // Note: This would be updated in real scenario
            lastName: 'One'
          })
        },
        message: 'อัปเดตข้อมูลผู้ใช้สำเร็จ',
        timestamp: expect.any(String)
      });
    });

    it('should prevent non-admin users from changing role', async () => {
      const updateData = {
        role: UserRole.ADMIN
      };

      const mockUser = {
        id: 'user1',
        role: UserRole.STAFF
      };

      mockRequest.user = {
        userId: 'user1',
        username: 'user1',
        email: 'user1@test.com',
        role: UserRole.STAFF,
        locationId: 'location1'
      };
      mockRequest.params = { id: 'user1' };
      mockRequest.body = updateData;
      MockUser.findByPk.mockResolvedValue(mockUser as any);

      await updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'ไม่สามารถเปลี่ยนบทบาทของตนเองได้'
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('deleteUser', () => {
    it('should deactivate user successfully', async () => {
      const mockUser = {
        id: 'user1',
        update: jest.fn().mockResolvedValue(true)
      };

      mockRequest.params = { id: 'user1' };
      MockUser.findByPk.mockResolvedValue(mockUser as any);

      await deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockUser.update).toHaveBeenCalledWith({ is_active: false });
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'ปิดใช้งานบัญชีผู้ใช้สำเร็จ',
        timestamp: expect.any(String)
      });
    });

    it('should prevent users from deleting themselves', async () => {
      const mockUser = {
        id: 'admin-id'
      };

      mockRequest.params = { id: 'admin-id' };
      MockUser.findByPk.mockResolvedValue(mockUser as any);

      await deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_OPERATION',
          message: 'ไม่สามารถลบบัญชีของตนเองได้'
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('activateUser', () => {
    it('should activate user successfully', async () => {
      const mockUser = {
        id: 'user1',
        username: 'user1',
        email: 'user1@test.com',
        first_name: 'User',
        last_name: 'One',
        role: UserRole.STAFF,
        location_id: 'location1',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        update: jest.fn().mockResolvedValue(true)
      };

      mockRequest.params = { id: 'user1' };
      MockUser.findByPk.mockResolvedValue(mockUser as any);

      await activateUser(mockRequest as Request, mockResponse as Response);

      expect(mockUser.update).toHaveBeenCalledWith({ is_active: true });
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: {
          user: expect.objectContaining({
            id: 'user1',
            isActive: true
          })
        },
        message: 'เปิดใช้งานบัญชีผู้ใช้สำเร็จ',
        timestamp: expect.any(String)
      });
    });
  });

  describe('resetUserPassword', () => {
    it('should reset password successfully', async () => {
      const resetData = {
        newPassword: 'NewPassword123'
      };

      const mockUser = {
        id: 'user1',
        update: jest.fn().mockResolvedValue(true)
      };

      mockRequest.params = { id: 'user1' };
      mockRequest.body = resetData;
      MockUser.findByPk.mockResolvedValue(mockUser as any);
      mockAuthUtils.hashPassword.mockResolvedValue('new-hashed-password');

      await resetUserPassword(mockRequest as Request, mockResponse as Response);

      expect(mockAuthUtils.hashPassword).toHaveBeenCalledWith('NewPassword123');
      expect(mockUser.update).toHaveBeenCalledWith({ password_hash: 'new-hashed-password' });
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'รีเซ็ตรหัสผ่านสำเร็จ',
        timestamp: expect.any(String)
      });
    });

    it('should return 404 for non-existent user', async () => {
      mockRequest.params = { id: 'non-existent' };
      mockRequest.body = { newPassword: 'NewPassword123' };
      MockUser.findByPk.mockResolvedValue(null);

      await resetUserPassword(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'ไม่พบข้อมูลผู้ใช้งาน'
        },
        timestamp: expect.any(String)
      });
    });
  });
});