import request from 'supertest';
import app from '../app';
import { sequelize } from '../models';
import User, { UserRole } from '../models/User';
import UserSession from '../models/UserSession';
import { generateTokens } from '../utils/auth';

describe('User Management API', () => {
  let adminToken: string;
  let managerToken: string;
  let staffToken: string;
  let adminUser: User;
  let managerUser: User;
  let staffUser: User;

  beforeAll(async () => {
    // Ensure database connection
    await sequelize.authenticate();
  });

  beforeEach(async () => {
    // Clean up test data
    await UserSession.destroy({ where: {} });
    await User.destroy({ where: {} });
    
    // Create test users
    adminUser = await User.create({
      username: 'admin',
      email: 'admin@test.com',
      password_hash: '$2b$10$test.hash.admin',
      first_name: 'Admin',
      last_name: 'User',
      role: UserRole.ADMIN,
      is_active: true
    });

    managerUser = await User.create({
      username: 'manager',
      email: 'manager@test.com',
      password_hash: '$2b$10$test.hash.manager',
      first_name: 'Manager',
      last_name: 'User',
      role: UserRole.AREA_MANAGER,
      location_id: 'location-1',
      is_active: true
    });

    staffUser = await User.create({
      username: 'staff',
      email: 'staff@test.com',
      password_hash: '$2b$10$test.hash.staff',
      first_name: 'Staff',
      last_name: 'User',
      role: UserRole.STAFF,
      location_id: 'location-1',
      is_active: true
    });

    // Generate tokens
    const adminTokens = await generateTokens(adminUser);
    const managerTokens = await generateTokens(managerUser);
    const staffTokens = await generateTokens(staffUser);
    
    adminToken = adminTokens.accessToken;
    managerToken = managerTokens.accessToken;
    staffToken = staffTokens.accessToken;
  });

  afterEach(async () => {
    // Clean up test data after each test
    await UserSession.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  afterAll(async () => {
    // Final cleanup and close connection
    await UserSession.destroy({ where: {} });
    await User.destroy({ where: {} });
    await sequelize.close();
  });

  describe('GET /api/v1/users', () => {
    it('should return users list for admin', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toHaveLength(3);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should return filtered users for area manager', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users.length).toBeGreaterThan(0);
    });

    it('should return limited users for staff', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      // Staff should only see users from their location
      expect(response.body.data.users.length).toBeLessThanOrEqual(2);
    });

    it('should support search functionality', async () => {
      const response = await request(app)
        .get('/api/v1/users?search=admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users.length).toBeGreaterThan(0);
      expect(response.body.data.users[0].username).toContain('admin');
    });

    it('should support role filtering', async () => {
      const response = await request(app)
        .get(`/api/v1/users?role=${UserRole.ADMIN}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users.length).toBeGreaterThan(0);
      expect(response.body.data.users[0].role).toBe(UserRole.ADMIN);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/users?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users.length).toBeLessThanOrEqual(2);
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.itemsPerPage).toBe(2);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/v1/users')
        .expect(401);
    });

    it('should validate query parameters', async () => {
      const response = await request(app)
        .get('/api/v1/users?page=invalid')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should return user by ID for admin', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${staffUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.id).toBe(staffUser.id);
      expect(response.body.data.user.username).toBe(staffUser.username);
    });

    it('should allow users to view their own profile', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${staffUser.id}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.id).toBe(staffUser.id);
    });

    it('should deny access to other users for staff', async () => {
      await request(app)
        .get(`/api/v1/users/${adminUser.id}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/v1/users/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('USER_NOT_FOUND');
    });

    it('should require authentication', async () => {
      await request(app)
        .get(`/api/v1/users/${staffUser.id}`)
        .expect(401);
    });
  });

  describe('POST /api/v1/users', () => {
    const validUserData = {
      username: 'newuser',
      email: 'newuser@test.com',
      password: 'Password123',
      confirmPassword: 'Password123',
      firstName: 'New',
      lastName: 'User',
      role: UserRole.STAFF,
      locationId: 'location-1'
    };

    it('should create user for admin', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validUserData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe(validUserData.username);
      expect(response.body.data.user.email).toBe(validUserData.email);
      expect(response.body.data.user.role).toBe(validUserData.role);
    });

    it('should create user for area manager', async () => {
      const userData = {
        ...validUserData,
        username: 'newuser2',
        email: 'newuser2@test.com'
      };

      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${managerToken}`)
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe(userData.username);
    });

    it('should deny access for staff', async () => {
      const userData = {
        ...validUserData,
        username: 'newuser3',
        email: 'newuser3@test.com'
      };

      await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${staffToken}`)
        .send(userData)
        .expect(403);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toBeDefined();
    });

    it('should validate password strength', async () => {
      const userData = {
        ...validUserData,
        username: 'weakpass',
        email: 'weakpass@test.com',
        password: '123',
        confirmPassword: '123'
      };

      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate password confirmation', async () => {
      const userData = {
        ...validUserData,
        username: 'mismatch',
        email: 'mismatch@test.com',
        confirmPassword: 'DifferentPassword123'
      };

      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should prevent duplicate username', async () => {
      const userData = {
        ...validUserData,
        username: 'admin', // Already exists
        email: 'duplicate@test.com'
      };

      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('DUPLICATE_ENTRY');
    });

    it('should prevent duplicate email', async () => {
      const userData = {
        ...validUserData,
        username: 'uniqueuser',
        email: 'admin@test.com' // Already exists
      };

      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('DUPLICATE_ENTRY');
    });

    it('should require authentication', async () => {
      await request(app)
        .post('/api/v1/users')
        .send(validUserData)
        .expect(401);
    });
  });

  describe('PUT /api/v1/users/:id', () => {
    let testUser: User;

    beforeEach(async () => {
      testUser = await User.create({
        username: 'testupdate',
        email: 'testupdate@test.com',
        password_hash: '$2b$10$test.hash.update',
        first_name: 'Test',
        last_name: 'Update',
        role: UserRole.STAFF,
        location_id: 'location-1',
        is_active: true
      });
    });

    it('should update user for admin', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        role: UserRole.HEAD_CHEF
      };

      const response = await request(app)
        .put(`/api/v1/users/${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.firstName).toBe(updateData.firstName);
      expect(response.body.data.user.lastName).toBe(updateData.lastName);
      expect(response.body.data.user.role).toBe(updateData.role);
    });

    it('should allow users to update their own profile', async () => {
      const updateData = {
        firstName: 'Self',
        lastName: 'Updated'
      };

      // Create token for test user
      const testTokens = await generateTokens(testUser);
      
      const response = await request(app)
        .put(`/api/v1/users/${testUser.id}`)
        .set('Authorization', `Bearer ${testTokens.accessToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.firstName).toBe(updateData.firstName);
    });

    it('should prevent users from changing their own role', async () => {
      const updateData = {
        role: UserRole.ADMIN
      };

      const testTokens = await generateTokens(testUser);
      
      const response = await request(app)
        .put(`/api/v1/users/${testUser.id}`)
        .set('Authorization', `Bearer ${testTokens.accessToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });

    it('should prevent duplicate username', async () => {
      const updateData = {
        username: 'admin' // Already exists
      };

      const response = await request(app)
        .put(`/api/v1/users/${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('DUPLICATE_ENTRY');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .put('/api/v1/users/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName: 'Test' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('USER_NOT_FOUND');
    });

    it('should require authentication', async () => {
      await request(app)
        .put(`/api/v1/users/${testUser.id}`)
        .send({ firstName: 'Test' })
        .expect(401);
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    let testUser: User;

    beforeEach(async () => {
      testUser = await User.create({
        username: 'testdelete',
        email: 'testdelete@test.com',
        password_hash: '$2b$10$test.hash.delete',
        first_name: 'Test',
        last_name: 'Delete',
        role: UserRole.STAFF,
        location_id: 'location-1',
        is_active: true
      });
    });

    it('should deactivate user for admin', async () => {
      const response = await request(app)
        .delete(`/api/v1/users/${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify user is deactivated
      const updatedUser = await User.findByPk(testUser.id);
      expect(updatedUser?.is_active).toBe(false);
    });

    it('should deactivate user for area manager', async () => {
      const response = await request(app)
        .delete(`/api/v1/users/${testUser.id}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should deny access for staff', async () => {
      await request(app)
        .delete(`/api/v1/users/${testUser.id}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(403);
    });

    it('should prevent users from deleting themselves', async () => {
      const response = await request(app)
        .delete(`/api/v1/users/${adminUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_OPERATION');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .delete('/api/v1/users/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('USER_NOT_FOUND');
    });

    it('should require authentication', async () => {
      await request(app)
        .delete(`/api/v1/users/${testUser.id}`)
        .expect(401);
    });
  });

  describe('PATCH /api/v1/users/:id/activate', () => {
    let inactiveUser: User;

    beforeEach(async () => {
      inactiveUser = await User.create({
        username: 'inactive',
        email: 'inactive@test.com',
        password_hash: '$2b$10$test.hash.inactive',
        first_name: 'Inactive',
        last_name: 'User',
        role: UserRole.STAFF,
        location_id: 'location-1',
        is_active: false
      });
    });

    it('should activate user for admin', async () => {
      const response = await request(app)
        .patch(`/api/v1/users/${inactiveUser.id}/activate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.isActive).toBe(true);
    });

    it('should activate user for area manager', async () => {
      const response = await request(app)
        .patch(`/api/v1/users/${inactiveUser.id}/activate`)
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should deny access for staff', async () => {
      await request(app)
        .patch(`/api/v1/users/${inactiveUser.id}/activate`)
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .patch('/api/v1/users/non-existent-id/activate')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('USER_NOT_FOUND');
    });

    it('should require authentication', async () => {
      await request(app)
        .patch(`/api/v1/users/${inactiveUser.id}/activate`)
        .expect(401);
    });
  });

  describe('PATCH /api/v1/users/:id/reset-password', () => {
    let testUser: User;

    beforeEach(async () => {
      testUser = await User.create({
        username: 'resetpass',
        email: 'resetpass@test.com',
        password_hash: '$2b$10$test.hash.reset',
        first_name: 'Reset',
        last_name: 'Password',
        role: UserRole.STAFF,
        location_id: 'location-1',
        is_active: true
      });
    });

    it('should reset password for admin', async () => {
      const resetData = {
        newPassword: 'NewPassword123',
        confirmNewPassword: 'NewPassword123'
      };

      const response = await request(app)
        .patch(`/api/v1/users/${testUser.id}/reset-password`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(resetData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should deny access for area manager', async () => {
      const resetData = {
        newPassword: 'NewPassword123',
        confirmNewPassword: 'NewPassword123'
      };

      await request(app)
        .patch(`/api/v1/users/${testUser.id}/reset-password`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send(resetData)
        .expect(403);
    });

    it('should deny access for staff', async () => {
      const resetData = {
        newPassword: 'NewPassword123',
        confirmNewPassword: 'NewPassword123'
      };

      await request(app)
        .patch(`/api/v1/users/${testUser.id}/reset-password`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send(resetData)
        .expect(403);
    });

    it('should validate password strength', async () => {
      const resetData = {
        newPassword: '123',
        confirmNewPassword: '123'
      };

      const response = await request(app)
        .patch(`/api/v1/users/${testUser.id}/reset-password`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(resetData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate password confirmation', async () => {
      const resetData = {
        newPassword: 'NewPassword123',
        confirmNewPassword: 'DifferentPassword123'
      };

      const response = await request(app)
        .patch(`/api/v1/users/${testUser.id}/reset-password`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(resetData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 for non-existent user', async () => {
      const resetData = {
        newPassword: 'NewPassword123',
        confirmNewPassword: 'NewPassword123'
      };

      const response = await request(app)
        .patch('/api/v1/users/non-existent-id/reset-password')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(resetData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('USER_NOT_FOUND');
    });

    it('should require authentication', async () => {
      const resetData = {
        newPassword: 'NewPassword123',
        confirmNewPassword: 'NewPassword123'
      };

      await request(app)
        .patch(`/api/v1/users/${testUser.id}/reset-password`)
        .send(resetData)
        .expect(401);
    });
  });
});