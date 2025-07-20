import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import config from '../config';
import User, { UserRole } from '../models/User';
import UserSession from '../models/UserSession';

export interface TokenPayload {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  locationId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

/**
 * Hash password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hash
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate JWT access token
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload as object, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
    issuer: 'restaurant-inventory-api',
    audience: 'restaurant-inventory-client'
  } as any);
};

/**
 * Generate JWT refresh token
 */
export const generateRefreshToken = (): string => {
  return jwt.sign(
    { tokenId: uuidv4() } as object,
    config.jwt.refreshSecret,
    {
      expiresIn: config.jwt.refreshExpiresIn,
      issuer: 'restaurant-inventory-api',
      audience: 'restaurant-inventory-client'
    } as any
  );
};

/**
 * Verify JWT access token
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret, {
      issuer: 'restaurant-inventory-api',
      audience: 'restaurant-inventory-client'
    }) as TokenPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

/**
 * Verify JWT refresh token
 */
export const verifyRefreshToken = (token: string): any => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret, {
      issuer: 'restaurant-inventory-api',
      audience: 'restaurant-inventory-client'
    });
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Generate both access and refresh tokens for a user
 */
export const generateTokens = async (user: User): Promise<AuthTokens> => {
  const payload: TokenPayload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    ...(user.location_id && { locationId: user.location_id })
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken();

  // Store refresh token in database
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  await UserSession.create({
    user_id: user.id,
    refresh_token: refreshToken,
    expires_at: expiresAt
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: config.jwt.expiresIn
  };
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (refreshToken: string): Promise<AuthTokens> => {
  // Verify refresh token
  verifyRefreshToken(refreshToken);

  // Find session in database
  const session = await UserSession.findOne({
    where: { refresh_token: refreshToken }
  });

  if (!session) {
    throw new Error('Invalid refresh token');
  }

  // Check if session is expired
  if (session.expires_at < new Date()) {
    await session.destroy();
    throw new Error('Refresh token expired');
  }

  // Get user from session
  const user = await User.findByPk(session.user_id);
  if (!user || !user.is_active) {
    await session.destroy();
    throw new Error('User not found or inactive');
  }

  // Generate new tokens
  const newTokens = await generateTokens(user);

  // Remove old session
  await session.destroy();

  return newTokens;
};

/**
 * Revoke refresh token (logout)
 */
export const revokeRefreshToken = async (refreshToken: string): Promise<void> => {
  const session = await UserSession.findOne({
    where: { refresh_token: refreshToken }
  });

  if (session) {
    await session.destroy();
  }
};

/**
 * Revoke all user sessions (logout from all devices)
 */
export const revokeAllUserSessions = async (userId: string): Promise<void> => {
  await UserSession.destroy({
    where: { user_id: userId }
  });
};

/**
 * Clean up expired sessions
 */
export const cleanupExpiredSessions = async (): Promise<number> => {
  const result = await UserSession.destroy({
    where: {
      expires_at: {
        [Op.lt]: new Date()
      }
    }
  });
  return result;
};