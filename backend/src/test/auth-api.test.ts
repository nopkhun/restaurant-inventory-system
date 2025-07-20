import request from 'supertest';
import app from '../app';
import { sequelize } from '../models';
import User, { UserRole } from '../models/User';
import UserSession from '../models/UserSession';
import { hashPassword, generateTokens } from '../utils/auth';

describe('Authentication API', () => {
  beforeAll(async () => {
    // Ensure database connection
    await sequelize.authenticate();
  });

  beforeEach(async () => {
    // Clean up test data
    await UserSession.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  afterAll(async () => {
    // Clean up and close connection
    await UserSession.destroy({ where: {} });
    await User.destroy({ where: {} });
    await sequelize.close();
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Create test user
      const passwordHash = await hashPassword('password123');
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: passwordHash,
        first_name: 'Test',
        last_name: 'User',
        role: UserRole.STAFF,
        is_active: true
      });
    });

    it('should login successfully with username', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.username).toBe('testuser');
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');
      expect(response.body.message).toBe('เข้าสู่ระบบสำเร็จ');
    });

    it('should login successfully with email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('should fail with invalid username', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTH_CREDENTIALS_INVALID');
      expect(response.body.error.message).toBe('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    });

    it('should fail with invalid password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTH_CREDENTIALS_INVALID');
    });

    it('should fail with inactive user', async () => {
      await User.update({ is_active: false }, { where: { username: 'testuser' } });

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'testuser',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTH_CREDENTIALS_INVALID');
    });

    it('should fail with missing username', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should fail with missing password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'testuser'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should fail with short username', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'ab',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/register', () => {
    let adminUser: User;
    let adminTokens: any;

    beforeEach(async () => {
      // Create admin user
      const passwordHash = await hashPassword('admin123');
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password_hash: passwordHash,
        first_name: 'Admin',
        last_name: 'User',
        role: UserRole.ADMIN,
        is_active: true
      });

      adminTokens = await generateTokens(adminUser);
    });

    it('should register new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .set('Authorization', `Bearer ${adminTokens.accessToken}`)
        .send({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
          firstName: 'New',
          lastName: 'User',
          role: UserRole.STAFF
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe('newuser');
      expect(response.body.data.user.email).toBe('newuser@example.com');
      expect(response.body.message).toBe('สร้างบัญชีผู้ใช้สำเร็จ');

      // Verify user was created in database
      const createdUser = await User.findOne({ where: { username: 'newuser' } });
      expect(createdUser).toBeTruthy();
      expect(createdUser?.is_active).toBe(true);
    });

    it('should fail without admin token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
          firstName: 'New',
          lastName: 'User',
          role: UserRole.STAFF
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTH_TOKEN_MISSING');
    });

    it('should fail with non-admin user', async () => {
      // Create staff user
      const staffPasswordHash = await hashPassword('staff123');
      const staffUser = await User.create({
        username: 'staff',
        email: 'staff@example.com',
        password_hash: staffPasswordHash,
        first_name: 'Staff',
        last_name: 'User',
        role: UserRole.STAFF,
        is_active: true
      });

      const staffTokens = await generateTokens(staffUser);

      const response = await request(app)
        .post('/api/v1/auth/register')
        .set('Authorization', `Bearer ${staffTokens.accessToken}`)
        .send({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
          firstName: 'New',
          lastName: 'User',
          role: UserRole.STAFF
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });

    it('should fail with duplicate username', async () => {
      // Create user first
      await User.create({
        username: 'existinguser',
        email: 'existing@example.com',
        password_hash: await hashPassword('password123'),
        first_name: 'Existing',
        last_name: 'User',
        role: UserRole.STAFF,
        is_active: true
      });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .set('Authorization', `Bearer ${adminTokens.accessToken}`)
        .send({
          username: 'existinguser',
          email: 'newuser@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
          firstName: 'New',
          lastName: 'User',
          role: UserRole.STAFF
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('DUPLICATE_ENTRY');
      expect(response.body.error.message).toBe('ชื่อผู้ใช้นี้มีอยู่แล้ว');
    });

    it('should fail with duplicate email', async () => {
      // Create user first
      await User.create({
        username: 'existinguser',
        email: 'existing@example.com',
        password_hash: await hashPassword('password123'),
        first_name: 'Existing',
        last_name: 'User',
        role: UserRole.STAFF,
        is_active: true
      });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .set('Authorization', `Bearer ${adminTokens.accessToken}`)
        .send({
          username: 'newuser',
          email: 'existing@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
          firstName: 'New',
          lastName: 'User',
          role: UserRole.STAFF
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('DUPLICATE_ENTRY');
      expect(response.body.error.message).toBe('อีเมลนี้มีอยู่แล้ว');
    });

    it('should fail with weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .set('Authorization', `Bearer ${adminTokens.accessToken}`)
        .send({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'weak',
          confirmPassword: 'weak',
          firstName: 'New',
          lastName: 'User',
          role: UserRole.STAFF
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should fail with mismatched passwords', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .set('Authorization', `Bearer ${adminTokens.accessToken}`)
        .send({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'Password123',
          confirmPassword: 'Password456',
          firstName: 'New',
          lastName: 'User',
          role: UserRole.STAFF
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    let testUser: User;
    let tokens: any;

    beforeEach(async () => {
      const passwordHash = await hashPassword('password123');
      testUser = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: passwordHash,
        first_name: 'Test',
        last_name: 'User',
        role: UserRole.STAFF,
        is_active: true
      });

      tokens = await generateTokens(testUser);
    });

    it('should refresh token successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: tokens.refreshToken
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');
      expect(response.body.message).toBe('ต่ออายุ token สำเร็จ');

      // New tokens should be different from old ones
      expect(response.body.data.tokens.accessToken).not.toBe(tokens.accessToken);
      expect(response.body.data.tokens.refreshToken).not.toBe(tokens.refreshToken);
    });

    it('should fail with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: 'invalid.refresh.token'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTH_TOKEN_INVALID');
    });

    it('should fail with missing refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    let testUser: User;
    let tokens: any;

    beforeEach(async () => {
      const passwordHash = await hashPassword('password123');
      testUser = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: passwordHash,
        first_name: 'Test',
        last_name: 'User',
        role: UserRole.STAFF,
        is_active: true
      });

      tokens = await generateTokens(testUser);
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .send({
          refreshToken: tokens.refreshToken
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('ออกจากระบบสำเร็จ');

      // Verify session was removed
      const session = await UserSession.findOne({
        where: { refresh_token: tokens.refreshToken }
      });
      expect(session).toBeNull();
    });

    it('should logout successfully without refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('ออกจากระบบสำเร็จ');
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    let testUser: User;
    let tokens: any;

    beforeEach(async () => {
      const passwordHash = await hashPassword('password123');
      testUser = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: passwordHash,
        first_name: 'Test',
        last_name: 'User',
        role: UserRole.STAFF,
        is_active: true
      });

      tokens = await generateTokens(testUser);
    });

    it('should get user profile successfully', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${tokens.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.id).toBe(testUser.id);
      expect(response.body.data.user.username).toBe('testuser');
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.user).not.toHaveProperty('password_hash');
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTH_TOKEN_MISSING');
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid.token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTH_TOKEN_INVALID');
    });
  });

  describe('PUT /api/v1/auth/change-password', () => {
    let testUser: User;
    let tokens: any;

    beforeEach(async () => {
      const passwordHash = await hashPassword('password123');
      testUser = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: passwordHash,
        first_name: 'Test',
        last_name: 'User',
        role: UserRole.STAFF,
        is_active: true
      });

      tokens = await generateTokens(testUser);
    });

    it('should change password successfully', async () => {
      const response = await request(app)
        .put('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'NewPassword123',
          confirmNewPassword: 'NewPassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('เปลี่ยนรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบใหม่');

      // Verify all sessions were revoked
      const sessions = await UserSession.findAll({
        where: { user_id: testUser.id }
      });
      expect(sessions).toHaveLength(0);
    });

    it('should fail with wrong current password', async () => {
      const response = await request(app)
        .put('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'NewPassword123',
          confirmNewPassword: 'NewPassword123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CURRENT_PASSWORD');
    });

    it('should fail with mismatched new passwords', async () => {
      const response = await request(app)
        .put('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${tokens.accessToken}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'NewPassword123',
          confirmNewPassword: 'DifferentPassword123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put('/api/v1/auth/change-password')
        .send({
          currentPassword: 'password123',
          newPassword: 'NewPassword123',
          confirmNewPassword: 'NewPassword123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTH_TOKEN_MISSING');
    });
  });
});