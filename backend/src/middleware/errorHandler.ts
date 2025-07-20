import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'sequelize';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any[];
}

export class CustomError extends Error implements ApiError {
  statusCode: number;
  code: string;
  details?: any[];

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_SERVER_ERROR', details?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    if (details) {
      this.details = details;
    }
    this.name = 'CustomError';
  }
}

// Error response format
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any[];
  };
  timestamp: string;
}

// Global error handler middleware
export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let message = err.message || 'เกิดข้อผิดพลาดภายในระบบ';
  let details = err.details;

  // Handle Sequelize validation errors
  if (err instanceof ValidationError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'ข้อมูลไม่ถูกต้อง';
    details = err.errors.map(error => ({
      field: error.path,
      message: error.message,
      value: error.value
    }));
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'AUTH_TOKEN_INVALID';
    message = 'Token ไม่ถูกต้อง';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'AUTH_TOKEN_EXPIRED';
    message = 'Token หมดอายุ';
  }

  // Handle Sequelize unique constraint errors
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    code = 'DUPLICATE_ENTRY';
    message = 'ข้อมูลซ้ำกับที่มีอยู่แล้ว';
  }

  // Handle Sequelize foreign key constraint errors
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    code = 'FOREIGN_KEY_CONSTRAINT';
    message = 'ข้อมูลอ้างอิงไม่ถูกต้อง';
  }

  // Handle Sequelize database connection errors
  if (err.name === 'SequelizeConnectionError') {
    statusCode = 503;
    code = 'DATABASE_CONNECTION_ERROR';
    message = 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้';
  }

  // Log error for debugging (in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Details:', {
      message: err.message,
      stack: err.stack,
      statusCode,
      code,
      url: req.url,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query
    });
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'เกิดข้อผิดพลาดภายในระบบ';
    details = undefined;
  }

  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details })
    },
    timestamp: new Date().toISOString()
  };

  res.status(statusCode).json(errorResponse);
};

// 404 Not Found handler
export const notFoundHandler = (req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `ไม่พบ API endpoint: ${req.method} ${req.path}`
    },
    timestamp: new Date().toISOString()
  };

  res.status(404).json(errorResponse);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Common error creators
export const createError = {
  badRequest: (message: string, details?: any[]) => 
    new CustomError(message, 400, 'BAD_REQUEST', details),
  
  unauthorized: (message: string = 'ไม่ได้รับอนุญาต') => 
    new CustomError(message, 401, 'UNAUTHORIZED'),
  
  forbidden: (message: string = 'ไม่มีสิทธิ์เข้าถึง') => 
    new CustomError(message, 403, 'FORBIDDEN'),
  
  notFound: (message: string = 'ไม่พบข้อมูล') => 
    new CustomError(message, 404, 'NOT_FOUND'),
  
  conflict: (message: string = 'ข้อมูลขัดแย้ง') => 
    new CustomError(message, 409, 'CONFLICT'),
  
  unprocessableEntity: (message: string, details?: any[]) => 
    new CustomError(message, 422, 'UNPROCESSABLE_ENTITY', details),
  
  internalServer: (message: string = 'เกิดข้อผิดพลาดภายในระบบ') => 
    new CustomError(message, 500, 'INTERNAL_SERVER_ERROR')
};