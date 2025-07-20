import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import config from '../config';
import User, { UserRole } from '../models/User';
import UserSession from '../models/UserSession';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokens,
  refreshAccessToken,
  revokeRefreshToken,
  revokeAllUserSessions,
  cleanupExpiredSessions,
  TokenPayload
} from '../utils/auth';

// Mock the models
jest.mock('../models/User');
jest.mock('../models/UserSession');
jest.mock('../config', () => ({
  jwt: {
    secret: 'test-secret',
    refreshSecret: 'test-refresh-secret',
    expiresIn: '1h',
    refreshExpiresIn: '7d'
  }
}));

const MockUser = User as jest.Mocked<typeof User>;
const MockUserSession = UserSession as jest.Mocked<typeof UserSession>;

describe('Auth Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Password Hashing', () => {
    describe('hashPassword', () => {
      it('should hash password with bcrypt', async () => {
        const password = 'testPassword123';
        const hashedPassword = await hashPassword(password);

        expect(hashedPassword).toBeDefined();
        expect(hashedPassword).not.toBe(password);
        expect(hashedPassword.length).toBeGreaterThan(50);
      });

      it('should generate different hashes for same password', async () => {
        const password = 'testPassword123';
        const hash1 = await hashPassword(password);
        const hash2 = await hashPassword(password);

        expect(hash1).not.toBe(hash2);
      });
    });

    describe('comparePassword', () => {
      it('should return true for correct password', async () => {
        const password = 'testPassword123';
        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await comparePassword(password, hashedPassword);
        expect(result).toBe(true);
      });

      it('should return false for incorrect password', async () => {
        const password = 'testPassword123';
        const wrongPassword = 'wrongPassword';
        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await comparePassword(wrongPassword, hashedPassword);
        expect(result).toBe(false);
      });
    });
  });

  describe('JWT Token Generation', () => {
    const mockPayload: TokenPayload = {
      userId: 'user-123',
      username: 'testuser',
      email: 'test@example.com',
      role: UserRole.STAFF,
      locationId: 'location-123'
    };

    describe('generateAccessToken', () => {
      it('should generate valid JWT access token', () => {
        const token = generateAccessToken(mockPayload);

        expect(token).toBeDefined();
        expect(typeof token).toBe('string');

        const decoded = jwt.verify(token, config.jwt.secret) as any;
        expect(decoded.userId).toBe(mockPayload.userId);
        expect(decoded.username).toBe(mockPayload.username);
        expect(decoded.email).toBe(mockPayload.email);
        expect(decoded.role).toBe(mockPayload.role);
        expect(decoded.locationId).toBe(mockPayload.locationId);
        expect(decoded.iss).toBe('restaurant-inventory-api');
        expect(decoded.aud).toBe('restaurant-inventory-client');
      });
    });

    describe('generateRefreshToken', () => {
      it('should generate valid JWT refresh token', () => {
        const token = generateRefreshToken();

        expect(token).toBeDefined();
        expect(typeof token).toBe('string');

        const decoded = jwt.verify(token, config.jwt.refreshSecret) as any;
        expect(decoded.tokenId).toBeDefined();
        expect(decoded.iss).toBe('restaurant-inventory-api');
        expect(decoded.aud).toBe('restaurant-inventory-client');
      });

      it('should generate different tokens each time', () => {
        const token1 = generateRefreshToken();
        const token2 = generateRefreshToken();

        expect(token1).not.toBe(token2);
      });
    });
  });

  describe('JWT Token Verification', () => {
    const mockPayload: TokenPayload = {
      userId: 'user-123',
      username: 'testuser',
      email: 'test@example.com',
      role: UserRole.STAFF,
      locationId: 'location-123'
    };

    describe('verifyAccessToken', () => {
      it('should verify valid access token', () => {
        const token = generateAccessToken(mockPayload);
        const decoded = verifyAccessToken(token);

        expect(decoded).toEqual(expect.objectContaining(mockPayload));
      });

      it('should throw error for invalid token', () => {
        const invalidToken = 'invalid.token.here';

        expect(() => verifyAccessToken(invalidToken)).toThrow('Invalid or expired access token');
      });

      it('should throw error for token with wrong secret', () => {
        const token = jwt.sign(mockPayload, 'wrong-secret');

        expect(() => verifyAccessToken(token)).toThrow('Invalid or expired access token');
      });
    });

    describe('verifyRefreshToken', () => {
      it('should verify valid refresh token', () => {
        const token = generateRefreshToken();
        const decoded = verifyRefreshToken(token);

        expect(decoded).toBeDefined();
        expect(decoded.tokenId).toBeDefined();
      });

      it('should throw error for invalid refresh token', () => {
        const invalidToken = 'invalid.refresh.token';

        expect(() => verifyRefreshToken(invalidToken)).toThrow('Invalid or expired refresh token');
      });
    });
  });

  describe('Token Generation for User', () => {
    const mockUser = {
      id: 'user-123',
      username: 'testuser',
      email: 'test@example.com',
      role: UserRole.STAFF,
      location_id: 'location-123'
    } as User;

    describe('generateTokens', () => {
      it('should generate tokens and store session', async () => {
        MockUserSession.create = jest.fn().mockResolvedValue({});

        const tokens = await generateTokens(mockUser);

        expect(tokens).toHaveProperty('accessToken');
        expect(tokens).toHaveProperty('refreshToken');
        expect(tokens).toHaveProperty('expiresIn');
        expect(tokens.expiresIn).toBe(config.jwt.expiresIn);

        expect(MockUserSession.create).toHaveBeenCalledWith({
          user_id: mockUser.id,
          refresh_token: tokens.refreshToken,
          expires_at: expect.any(Date)
        });
      });

      it('should create session with correct expiry date', async () => {
        MockUserSession.create = jest.fn().mockResolvedValue({});

        await generateTokens(mockUser);

        const createCall = MockUserSession.create.mock.calls[0]?.[0];
        expect(createCall).toBeDefined();
        
        if (createCall) {
          const expiresAt = createCall.expires_at;
          const expectedExpiry = new Date();
          expectedExpiry.setDate(expectedExpiry.getDate() + 7);

          expect(expiresAt.getTime()).toBeCloseTo(expectedExpiry.getTime(), -10000); // Within 10 seconds
        }
      });
    });
  });

  describe('Token Refresh', () => {
    const mockUser = {
      id: 'user-123',
      username: 'testuser',
      email: 'test@example.com',
      role: UserRole.STAFF,
      location_id: 'location-123',
      is_active: true
    } as User;

    const mockSession = {
      user_id: 'user-123',
      refresh_token: 'valid-refresh-token',
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
      destroy: jest.fn()
    };

    describe('refreshAccessToken', () => {
      it('should refresh token successfully', async () => {
        const refreshToken = generateRefreshToken();
        
        MockUserSession.findOne = jest.fn().mockResolvedValue(mockSession);
        MockUser.findByPk = jest.fn().mockResolvedValue(mockUser);
        MockUserSession.create = jest.fn().mockResolvedValue({});

        const tokens = await refreshAccessToken(refreshToken);

        expect(tokens).toHaveProperty('accessToken');
        expect(tokens).toHaveProperty('refreshToken');
        expect(tokens).toHaveProperty('expiresIn');
        expect(mockSession.destroy).toHaveBeenCalled();
      });

      it('should throw error for non-existent session', async () => {
        const refreshToken = generateRefreshToken();
        
        MockUserSession.findOne = jest.fn().mockResolvedValue(null);

        await expect(refreshAccessToken(refreshToken)).rejects.toThrow('Invalid refresh token');
      });

      it('should throw error for expired session', async () => {
        const refreshToken = generateRefreshToken();
        const expiredSession = {
          ...mockSession,
          expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        };
        
        MockUserSession.findOne = jest.fn().mockResolvedValue(expiredSession);

        await expect(refreshAccessToken(refreshToken)).rejects.toThrow('Refresh token expired');
        expect(expiredSession.destroy).toHaveBeenCalled();
      });

      it('should throw error for inactive user', async () => {
        const refreshToken = generateRefreshToken();
        const inactiveUser = { ...mockUser, is_active: false };
        
        MockUserSession.findOne = jest.fn().mockResolvedValue(mockSession);
        MockUser.findByPk = jest.fn().mockResolvedValue(inactiveUser);

        await expect(refreshAccessToken(refreshToken)).rejects.toThrow('User not found or inactive');
        expect(mockSession.destroy).toHaveBeenCalled();
      });

      it('should throw error for invalid refresh token format', async () => {
        const invalidToken = 'invalid.token';

        await expect(refreshAccessToken(invalidToken)).rejects.toThrow('Invalid or expired refresh token');
      });
    });
  });

  describe('Token Revocation', () => {
    describe('revokeRefreshToken', () => {
      it('should revoke existing refresh token', async () => {
        const mockSession = {
          destroy: jest.fn()
        };
        
        MockUserSession.findOne = jest.fn().mockResolvedValue(mockSession);

        await revokeRefreshToken('valid-refresh-token');

        expect(MockUserSession.findOne).toHaveBeenCalledWith({
          where: { refresh_token: 'valid-refresh-token' }
        });
        expect(mockSession.destroy).toHaveBeenCalled();
      });

      it('should handle non-existent refresh token gracefully', async () => {
        MockUserSession.findOne = jest.fn().mockResolvedValue(null);

        await expect(revokeRefreshToken('non-existent-token')).resolves.not.toThrow();
      });
    });

    describe('revokeAllUserSessions', () => {
      it('should revoke all sessions for user', async () => {
        MockUserSession.destroy = jest.fn().mockResolvedValue(3);

        await revokeAllUserSessions('user-123');

        expect(MockUserSession.destroy).toHaveBeenCalledWith({
          where: { user_id: 'user-123' }
        });
      });
    });
  });

  describe('Session Cleanup', () => {
    describe('cleanupExpiredSessions', () => {
      it('should clean up expired sessions', async () => {
        MockUserSession.destroy = jest.fn().mockResolvedValue(5);

        const result = await cleanupExpiredSessions();

        expect(result).toBe(5);
        expect(MockUserSession.destroy).toHaveBeenCalledWith({
          where: {
            expires_at: {
              [Op.lt]: expect.any(Date)
            }
          }
        });
      });

      it('should return 0 when no expired sessions', async () => {
        MockUserSession.destroy = jest.fn().mockResolvedValue(0);

        const result = await cleanupExpiredSessions();

        expect(result).toBe(0);
      });
    });
  });
});