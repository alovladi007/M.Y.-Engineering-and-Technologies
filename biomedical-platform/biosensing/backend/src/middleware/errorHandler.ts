/**
 * Global error handling middleware
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export interface ApiError extends Error {
  statusCode?: number;
  errors?: any[];
  isOperational?: boolean;
}

/**
 * Create API error
 */
export class AppError extends Error implements ApiError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error
  logger.error('Error occurred', {
    error: message,
    stack: err.stack,
    statusCode,
    method: req.method,
    url: req.url,
    ip: req.ip,
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      errors: err.errors,
    }),
    timestamp: new Date().toISOString(),
  });
};

/**
 * Not found error handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
