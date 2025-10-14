/**
 * Centralized Logging System with HIPAA Compliance
 * Handles audit trails, PHI logging, and CloudWatch integration
 */

import winston from 'winston';
import { uploadToS3, s3Buckets } from '../config/aws';

export interface LogContext {
  userId?: string;
  patientId?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  phi_accessed?: boolean;
  requestId?: string;
}

// Custom log levels for healthcare
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    audit: 3,
    debug: 4,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    audit: 'blue',
    debug: 'gray',
  },
};

// Winston logger configuration
const logger = winston.createLogger({
  levels: customLevels.levels,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'biomedical-platform',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}]: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
          }`;
        })
      ),
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10485760,
      maxFiles: 30,
    }),
    // Separate file for audit logs (HIPAA requirement)
    new winston.transports.File({
      filename: 'logs/audit.log',
      level: 'audit',
      maxsize: 10485760,
      maxFiles: 365, // Keep audit logs for 1 year locally
    }),
  ],
});

winston.addColors(customLevels.colors);

/**
 * Log helper functions
 */
export function logInfo(message: string, context?: LogContext): void {
  logger.info(message, context);
}

export function logError(message: string, error?: Error, context?: LogContext): void {
  logger.error(message, {
    ...context,
    error: error?.message,
    stack: error?.stack,
  });
}

export function logWarn(message: string, context?: LogContext): void {
  logger.warn(message, context);
}

export function logDebug(message: string, context?: LogContext): void {
  logger.debug(message, context);
}

/**
 * Audit log function for HIPAA compliance
 * Logs all PHI access and critical actions
 */
export function logAudit(
  action: string,
  resourceType: string,
  resourceId: string,
  context: LogContext
): void {
  const auditEntry = {
    timestamp: new Date().toISOString(),
    action,
    resourceType,
    resourceId,
    ...context,
    level: 'audit',
  };

  logger.log('audit', 'AUDIT_TRAIL', auditEntry);

  // Also write to database for long-term retention
  writeAuditToDatabase(auditEntry).catch((error) => {
    logger.error('Failed to write audit log to database', { error: error.message });
  });

  // Upload to S3 for immutable storage (HIPAA requirement)
  if (process.env.NODE_ENV === 'production') {
    uploadAuditLogToS3(auditEntry).catch((error) => {
      logger.error('Failed to upload audit log to S3', { error: error.message });
    });
  }
}

/**
 * Write audit log to TimescaleDB
 */
async function writeAuditToDatabase(auditEntry: any): Promise<void> {
  const { query } = require('../config/database');

  await query(
    `INSERT INTO audit_logs (
      timestamp, user_id, patient_id, action, resource_type, resource_id,
      ip_address, user_agent, phi_accessed, request_id, details
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      auditEntry.timestamp,
      auditEntry.userId || null,
      auditEntry.patientId || null,
      auditEntry.action,
      auditEntry.resourceType,
      auditEntry.resourceId,
      auditEntry.ipAddress || null,
      auditEntry.userAgent || null,
      auditEntry.phi_accessed || false,
      auditEntry.requestId || null,
      JSON.stringify(auditEntry),
    ]
  );
}

/**
 * Upload audit log to S3 for immutable storage
 */
async function uploadAuditLogToS3(auditEntry: any): Promise<void> {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');

  const key = `audit-logs/${year}/${month}/${day}/${hour}/${auditEntry.requestId || Date.now()}.json`;

  await uploadToS3(
    s3Buckets.auditLogs,
    key,
    JSON.stringify(auditEntry, null, 2)
  );
}

/**
 * Sanitize sensitive data before logging
 */
export function sanitizeForLogging(data: any): any {
  const sensitiveFields = [
    'password',
    'token',
    'apiKey',
    'secret',
    'ssn',
    'creditCard',
    'medicalRecordNumber',
  ];

  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sanitized = { ...data };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '***REDACTED***';
    }
  }

  // Recursively sanitize nested objects
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeForLogging(sanitized[key]);
    }
  }

  return sanitized;
}

/**
 * Performance monitoring helper
 */
export function logPerformance(
  operation: string,
  startTime: number,
  context?: LogContext
): void {
  const duration = Date.now() - startTime;
  logger.info(`Performance: ${operation}`, {
    ...context,
    duration_ms: duration,
    operation,
  });

  // Alert if operation takes too long
  if (duration > 5000) {
    logger.warn(`Slow operation detected: ${operation}`, {
      ...context,
      duration_ms: duration,
    });
  }
}

/**
 * Request logging middleware
 */
export function requestLogger(req: any, res: any, next: any): void {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  req.requestId = requestId;
  req.startTime = startTime;

  // Log incoming request
  logInfo('Incoming request', {
    requestId,
    method: req.method,
    url: req.url,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id,
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    logInfo('Request completed', {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration_ms: duration,
      userId: req.user?.id,
    });

    // If PHI was accessed, create audit log
    if (req.phi_accessed) {
      logAudit(
        `${req.method} ${req.url}`,
        req.resourceType || 'unknown',
        req.resourceId || 'unknown',
        {
          requestId,
          userId: req.user?.id,
          patientId: req.patientId,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          phi_accessed: true,
        }
      );
    }
  });

  next();
}

/**
 * Error logging helper for Express error handlers
 */
export function logExpressError(err: Error, req: any): void {
  logError('Express error', err, {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    userId: req.user?.id,
    ipAddress: req.ip,
  });
}

export default {
  logInfo,
  logError,
  logWarn,
  logDebug,
  logAudit,
  sanitizeForLogging,
  logPerformance,
  requestLogger,
  logExpressError,
};
