import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/auth';
import { UserRole } from '../models/User';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Authentication middleware - verifies JWT token
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_TOKEN_MISSING',
          message: 'ไม่พบ token การยืนยันตัวตน'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_TOKEN_MISSING',
          message: 'ไม่พบ token การยืนยันตัวตน'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_TOKEN_INVALID',
        message: 'Token ไม่ถูกต้องหรือหมดอายุ'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Authorization middleware - checks user roles
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
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

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'สิทธิ์ไม่เพียงพอสำหรับการดำเนินการนี้'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    next();
  };
};

/**
 * Location access middleware - checks if user can access specific location
 */
export const authorizeLocation = (req: Request, res: Response, next: NextFunction): void => {
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

  const { locationId } = req.params;
  const user = req.user;

  // Admin and area managers can access all locations
  if (user.role === UserRole.ADMIN || user.role === UserRole.AREA_MANAGER) {
    next();
    return;
  }

  // Other users can only access their assigned location
  if (user.locationId && user.locationId === locationId) {
    next();
    return;
  }

  res.status(403).json({
    success: false,
    error: {
      code: 'LOCATION_NOT_ACCESSIBLE',
      message: 'ไม่สามารถเข้าถึงสาขานี้ได้'
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * Optional authentication middleware - doesn't fail if no token
 */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : authHeader;

      if (token) {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};