/**
 * Audit Service - HIPAA-compliant audit logging
 * Tracks all access to PHI and system operations
 */

import { Request } from 'express';
import prisma from '../db/prisma';
import logger from '../utils/logger';

export interface AuditLogEntry {
  userId?: string;
  userName?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  requestMethod?: string;
  requestPath?: string;
  statusCode?: number;
  success?: boolean;
  errorMessage?: string;
  sessionId?: string;
  phi_accessed?: boolean;
  complianceFlags?: any;
}

export type AuditAction =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'ACCESS_DENIED'
  | 'EXPORT'
  | 'PRINT'
  | 'DOWNLOAD'
  | 'SHARE'
  | 'ENCRYPT'
  | 'DECRYPT'
  | 'KEY_ROTATION'
  | 'PASSWORD_CHANGE'
  | 'MFA_ENABLED'
  | 'MFA_DISABLED'
  | 'ROLE_CHANGE'
  | 'PERMISSION_CHANGE'
  | 'BREACH_REPORTED'
  | 'BACKUP_CREATED'
  | 'RESTORE_PERFORMED';

export class AuditService {
  /**
   * Log an audit entry
   */
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: entry.userId,
          userName: entry.userName,
          action: entry.action,
          resource: entry.resource,
          resourceId: entry.resourceId,
          details: entry.details || {},
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          requestMethod: entry.requestMethod,
          requestPath: entry.requestPath,
          statusCode: entry.statusCode,
          success: entry.success ?? true,
          errorMessage: entry.errorMessage,
          sessionId: entry.sessionId,
          phi_accessed: entry.phi_accessed ?? false,
          complianceFlags: entry.complianceFlags || {},
        },
      });

      // Also log to Winston for real-time monitoring
      logger.info('Audit log entry created', {
        action: entry.action,
        resource: entry.resource,
        userId: entry.userId,
        phi_accessed: entry.phi_accessed,
      });
    } catch (error) {
      // Critical: Audit logging failure
      logger.error('CRITICAL: Failed to create audit log', {
        error,
        entry,
      });

      // In production, this should trigger alerts
      throw new Error('Audit logging failed - operation cannot proceed');
    }
  }

  /**
   * Log from Express request
   */
  async logFromRequest(
    req: Request,
    action: AuditAction,
    resource: string,
    options: {
      resourceId?: string;
      details?: any;
      success?: boolean;
      errorMessage?: string;
      phi_accessed?: boolean;
    } = {}
  ): Promise<void> {
    const userId = (req as any).user?.id || (req as any).userId;
    const userName = (req as any).user?.name || (req as any).userName;
    const sessionId = (req as any).sessionId;

    await this.log({
      userId,
      userName,
      action,
      resource,
      resourceId: options.resourceId,
      details: options.details,
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent'),
      requestMethod: req.method,
      requestPath: req.path,
      success: options.success,
      errorMessage: options.errorMessage,
      sessionId,
      phi_accessed: options.phi_accessed,
    });
  }

  /**
   * Log PHI access (Protected Health Information)
   */
  async logPHIAccess(
    userId: string,
    userName: string,
    patientId: string,
    action: AuditAction,
    details?: any
  ): Promise<void> {
    await this.log({
      userId,
      userName,
      action,
      resource: 'PHI',
      resourceId: patientId,
      details,
      phi_accessed: true,
      complianceFlags: {
        hipaa_relevant: true,
        requires_justification: true,
      },
    });

    logger.warn('PHI accessed', {
      userId,
      userName,
      patientId,
      action,
    });
  }

  /**
   * Log authentication events
   */
  async logAuthentication(
    userId: string,
    userName: string,
    action: 'LOGIN' | 'LOGOUT' | 'ACCESS_DENIED',
    details: {
      ipAddress?: string;
      userAgent?: string;
      success?: boolean;
      errorMessage?: string;
      mfaUsed?: boolean;
    }
  ): Promise<void> {
    await this.log({
      userId,
      userName,
      action,
      resource: 'authentication',
      details: {
        ...details,
        timestamp: new Date().toISOString(),
      },
      ipAddress: details.ipAddress,
      userAgent: details.userAgent,
      success: details.success ?? true,
      errorMessage: details.errorMessage,
      complianceFlags: {
        security_event: true,
        mfa_used: details.mfaUsed ?? false,
      },
    });
  }

  /**
   * Log data export/download
   */
  async logDataExport(
    userId: string,
    userName: string,
    resource: string,
    recordCount: number,
    format: string,
    phi_included: boolean
  ): Promise<void> {
    await this.log({
      userId,
      userName,
      action: 'EXPORT',
      resource,
      details: {
        recordCount,
        format,
        phi_included,
        timestamp: new Date().toISOString(),
      },
      phi_accessed: phi_included,
      complianceFlags: {
        data_export: true,
        requires_approval: phi_included,
        retention_period: '7_years',
      },
    });

    if (phi_included) {
      logger.warn('PHI data exported', {
        userId,
        userName,
        resource,
        recordCount,
      });
    }
  }

  /**
   * Log encryption/decryption operations
   */
  async logCryptoOperation(
    userId: string,
    action: 'ENCRYPT' | 'DECRYPT' | 'KEY_ROTATION',
    details: {
      dataType?: string;
      keyId?: string;
      recordCount?: number;
      success?: boolean;
      errorMessage?: string;
    }
  ): Promise<void> {
    await this.log({
      userId,
      action,
      resource: 'encryption',
      details,
      success: details.success ?? true,
      errorMessage: details.errorMessage,
      complianceFlags: {
        security_operation: true,
        hipaa_relevant: true,
      },
    });
  }

  /**
   * Log security breach
   */
  async logSecurityBreach(
    incidentNumber: string,
    severity: string,
    details: any
  ): Promise<void> {
    await this.log({
      action: 'BREACH_REPORTED',
      resource: 'security',
      resourceId: incidentNumber,
      details: {
        ...details,
        severity,
        timestamp: new Date().toISOString(),
      },
      success: false,
      complianceFlags: {
        critical_security_event: true,
        requires_notification: true,
        regulatory_reporting: severity === 'HIGH' || severity === 'CRITICAL',
      },
    });

    logger.error('Security breach logged', {
      incidentNumber,
      severity,
    });
  }

  /**
   * Get audit logs with filtering
   */
  async queryLogs(filters: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    phi_accessed?: boolean;
    page?: number;
    pageSize?: number;
  }) {
    const {
      userId,
      action,
      resource,
      startDate,
      endDate,
      phi_accessed,
      page = 1,
      pageSize = 100,
    } = filters;

    const where: any = {};

    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (resource) where.resource = resource;
    if (phi_accessed !== undefined) where.phi_accessed = phi_accessed;

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const skip = (page - 1) * pageSize;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { timestamp: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get PHI access summary for a user
   */
  async getUserPHIAccessSummary(
    userId: string,
    days: number = 30
  ): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await prisma.auditLog.findMany({
      where: {
        userId,
        phi_accessed: true,
        timestamp: { gte: startDate },
      },
      orderBy: { timestamp: 'desc' },
    });

    // Group by resource (patient)
    const accessByPatient = logs.reduce((acc: any, log) => {
      const patientId = log.resourceId || 'unknown';
      if (!acc[patientId]) {
        acc[patientId] = {
          patientId,
          accessCount: 0,
          actions: [],
          firstAccess: log.timestamp,
          lastAccess: log.timestamp,
        };
      }

      acc[patientId].accessCount++;
      acc[patientId].actions.push({
        action: log.action,
        timestamp: log.timestamp,
      });

      if (log.timestamp > acc[patientId].lastAccess) {
        acc[patientId].lastAccess = log.timestamp;
      }

      return acc;
    }, {});

    return {
      userId,
      period: `${days} days`,
      totalPHIAccess: logs.length,
      uniquePatients: Object.keys(accessByPatient).length,
      accessByPatient: Object.values(accessByPatient),
    };
  }

  /**
   * Get compliance statistics
   */
  async getComplianceStats(days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [
      totalLogs,
      phiAccessCount,
      failedAccessCount,
      exportCount,
      uniqueUsers,
    ] = await Promise.all([
      prisma.auditLog.count({
        where: { timestamp: { gte: startDate } },
      }),
      prisma.auditLog.count({
        where: {
          phi_accessed: true,
          timestamp: { gte: startDate },
        },
      }),
      prisma.auditLog.count({
        where: {
          success: false,
          timestamp: { gte: startDate },
        },
      }),
      prisma.auditLog.count({
        where: {
          action: 'EXPORT',
          timestamp: { gte: startDate },
        },
      }),
      prisma.auditLog.findMany({
        where: { timestamp: { gte: startDate } },
        distinct: ['userId'],
        select: { userId: true },
      }),
    ]);

    return {
      period: `${days} days`,
      totalLogs,
      phiAccessCount,
      failedAccessCount,
      exportCount,
      uniqueUsers: uniqueUsers.length,
      complianceRate: totalLogs > 0 ? ((totalLogs - failedAccessCount) / totalLogs) * 100 : 100,
    };
  }

  /**
   * Generate audit report
   */
  async generateReport(
    startDate: Date,
    endDate: Date,
    reportType: 'AUDIT' | 'PHI_ACCESS' | 'SECURITY'
  ): Promise<any> {
    const logs = await prisma.auditLog.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
        ...(reportType === 'PHI_ACCESS' && { phi_accessed: true }),
        ...(reportType === 'SECURITY' && {
          action: {
            in: ['ACCESS_DENIED', 'BREACH_REPORTED', 'LOGIN', 'LOGOUT'],
          },
        }),
      },
      orderBy: { timestamp: 'desc' },
    });

    // Aggregate statistics
    const stats = {
      totalEvents: logs.length,
      byAction: this.groupBy(logs, 'action'),
      byResource: this.groupBy(logs, 'resource'),
      byUser: this.groupBy(logs, 'userId'),
      successRate:
        logs.length > 0
          ? (logs.filter((l) => l.success).length / logs.length) * 100
          : 100,
    };

    return {
      reportType,
      period: {
        start: startDate,
        end: endDate,
      },
      statistics: stats,
      logs,
      generatedAt: new Date(),
    };
  }

  /**
   * Helper: Group logs by field
   */
  private groupBy(logs: any[], field: string): any {
    return logs.reduce((acc: any, log) => {
      const key = log[field] || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }
}

// Export singleton instance
let auditServiceInstance: AuditService | null = null;

export function getAuditService(): AuditService {
  if (!auditServiceInstance) {
    auditServiceInstance = new AuditService();
  }
  return auditServiceInstance;
}
