import {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
  getUsersQuerySchema
} from '../validators/user.validator';
import { UserRole } from '../models/User';

describe('User Validators', () => {
  describe('createUserSchema', () => {
    it('should validate valid user data', () => {
      const validData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.STAFF,
        locationId: '550e8400-e29b-41d4-a716-446655440000'
      };

      const { error } = createUserSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject invalid username', () => {
      const invalidData = {
        username: 'ab', // Too short
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.STAFF
      };

      const { error } = createUserSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร');
    });

    it('should reject invalid email', () => {
      const invalidData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'Password123',
        confirmPassword: 'Password123',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.STAFF
      };

      const { error } = createUserSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('รูปแบบอีเมลไม่ถูกต้อง');
    });

    it('should reject weak password', () => {
      const invalidData = {
        username: 'testuser',
        email: 'test@example.com',
        password: '123', // Too weak
        confirmPassword: '123',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.STAFF
      };

      const { error } = createUserSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details.some(detail => 
        detail.message.includes('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร')
      )).toBe(true);
    });

    it('should reject mismatched password confirmation', () => {
      const invalidData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'DifferentPassword123',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.STAFF
      };

      const { error } = createUserSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('รหัสผ่านยืนยันไม่ตรงกัน');
    });

    it('should reject invalid role', () => {
      const invalidData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'invalid_role'
      };

      const { error } = createUserSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('บทบาทไม่ถูกต้อง');
    });

    it('should accept null locationId', () => {
      const validData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.STAFF,
        locationId: null
      };

      const { error } = createUserSchema.validate(validData);
      expect(error).toBeUndefined();
    });
  });

  describe('updateUserSchema', () => {
    it('should validate partial update data', () => {
      const validData = {
        firstName: 'Updated',
        lastName: 'Name'
      };

      const { error } = updateUserSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should validate all fields when provided', () => {
      const validData = {
        username: 'updateduser',
        email: 'updated@example.com',
        firstName: 'Updated',
        lastName: 'Name',
        role: UserRole.HEAD_CHEF,
        locationId: '550e8400-e29b-41d4-a716-446655440001'
      };

      const { error } = updateUserSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email-format'
      };

      const { error } = updateUserSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('รูปแบบอีเมลไม่ถูกต้อง');
    });

    it('should accept empty object', () => {
      const { error } = updateUserSchema.validate({});
      expect(error).toBeUndefined();
    });
  });

  describe('resetPasswordSchema', () => {
    it('should validate valid password reset data', () => {
      const validData = {
        newPassword: 'NewPassword123',
        confirmNewPassword: 'NewPassword123'
      };

      const { error } = resetPasswordSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject weak new password', () => {
      const invalidData = {
        newPassword: '123',
        confirmNewPassword: '123'
      };

      const { error } = resetPasswordSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details.some(detail => 
        detail.message.includes('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร')
      )).toBe(true);
    });

    it('should reject mismatched password confirmation', () => {
      const invalidData = {
        newPassword: 'NewPassword123',
        confirmNewPassword: 'DifferentPassword123'
      };

      const { error } = resetPasswordSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('รหัสผ่านใหม่ยืนยันไม่ตรงกัน');
    });
  });

  describe('getUsersQuerySchema', () => {
    it('should validate valid query parameters', () => {
      const validQuery = {
        page: 1,
        limit: 10,
        search: 'test',
        role: UserRole.STAFF,
        locationId: '550e8400-e29b-41d4-a716-446655440002',
        isActive: 'true'
      };

      const { error } = getUsersQuerySchema.validate(validQuery);
      expect(error).toBeUndefined();
    });

    it('should apply default values', () => {
      const { error, value } = getUsersQuerySchema.validate({});
      expect(error).toBeUndefined();
      expect(value.page).toBe(1);
      expect(value.limit).toBe(10);
    });

    it('should reject invalid page number', () => {
      const invalidQuery = {
        page: 0
      };

      const { error } = getUsersQuerySchema.validate(invalidQuery);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('หน้าต้องมากกว่าหรือเท่ากับ 1');
    });

    it('should reject invalid limit', () => {
      const invalidQuery = {
        limit: 101 // Too high
      };

      const { error } = getUsersQuerySchema.validate(invalidQuery);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('จำนวนรายการต่อหน้าต้องไม่เกิน 100');
    });

    it('should reject invalid role', () => {
      const invalidQuery = {
        role: 'invalid_role'
      };

      const { error } = getUsersQuerySchema.validate(invalidQuery);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('บทบาทไม่ถูกต้อง');
    });

    it('should reject invalid isActive value', () => {
      const invalidQuery = {
        isActive: 'maybe'
      };

      const { error } = getUsersQuerySchema.validate(invalidQuery);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain('สถานะการใช้งานต้องเป็น true หรือ false');
    });
  });
});