import { Request, Response, NextFunction } from 'express';

export interface RequestLog {
  method: string;
  url: string;
  statusCode?: number;
  responseTime?: number;
  userAgent?: string | undefined;
  ip: string;
  timestamp: string;
}

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  // Log request
  const requestInfo = {
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent') || undefined,
    timestamp
  };

  // Only log in development or if LOG_LEVEL is debug
  if (process.env.NODE_ENV === 'development' || process.env.LOG_LEVEL === 'debug') {
    console.log(`📝 ${requestInfo.method} ${requestInfo.url} - ${requestInfo.ip}`);
  }

  // Override res.end to capture response details
  const originalEnd = res.end.bind(res);
  res.end = function(chunk?: any, encoding?: any, cb?: any) {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Log response
    const responseInfo: RequestLog = {
      method: requestInfo.method,
      url: requestInfo.url,
      ip: requestInfo.ip,
      userAgent: requestInfo.userAgent,
      timestamp: requestInfo.timestamp,
      statusCode,
      responseTime
    };

    // Log based on status code
    if (process.env.NODE_ENV === 'development' || process.env.LOG_LEVEL === 'debug') {
      const statusEmoji = statusCode >= 400 ? '❌' : statusCode >= 300 ? '⚠️' : '✅';
      console.log(`${statusEmoji} ${responseInfo.method} ${responseInfo.url} - ${statusCode} - ${responseTime}ms`);
    }

    // Log errors to console in all environments
    if (statusCode >= 400) {
      console.error(`🚨 Error Response: ${responseInfo.method} ${responseInfo.url} - ${statusCode} - ${responseTime}ms`);
    }

    // Call original end method
    return originalEnd(chunk, encoding, cb);
  };

  next();
};