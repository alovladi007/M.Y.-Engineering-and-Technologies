/**
 * Alerts API Routes
 */

import express, { Request, Response } from 'express';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import prisma from '../db/prisma';
import { AlertQueryParams, ApiResponse, PaginatedResponse } from '../types';
import logger from '../utils/logger';

const router = express.Router();

/**
 * GET /api/v1/alerts
 * List all alerts with filtering
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const {
      page = 1,
      page_size = 50,
      device_id,
      patient_id,
      level,
      acknowledged,
      start_date,
      end_date,
      sort_by = 'createdAt',
      sort_order = 'desc',
    } = req.query as any as AlertQueryParams;

    const skip = (Number(page) - 1) * Number(page_size);
    const take = Number(page_size);

    // Build where clause
    const where: any = {};
    if (device_id) where.deviceId = device_id;
    if (patient_id) where.patientId = patient_id;
    if (level) where.level = level;
    if (acknowledged !== undefined) where.acknowledged = acknowledged === 'true';

    if (start_date || end_date) {
      where.createdAt = {};
      if (start_date) where.createdAt.gte = new Date(start_date);
      if (end_date) where.createdAt.lte = new Date(end_date);
    }

    // Get alerts and total count
    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        skip,
        take,
        orderBy: { [sort_by]: sort_order },
        include: {
          device: {
            select: {
              id: true,
              deviceType: true,
              manufacturer: true,
              model: true,
              serialNumber: true,
            },
          },
          patient: {
            select: {
              id: true,
              mrn: true,
              firstName: true,
              lastName: true,
            },
          },
          reading: {
            select: {
              id: true,
              sensorType: true,
              value: true,
              unit: true,
              timestamp: true,
            },
          },
        },
      }),
      prisma.alert.count({ where }),
    ]);

    const response: PaginatedResponse = {
      success: true,
      data: alerts,
      pagination: {
        total,
        page: Number(page),
        page_size: Number(page_size),
        total_pages: Math.ceil(total / Number(page_size)),
      },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * GET /api/v1/alerts/:id
 * Get alert by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const alert = await prisma.alert.findUnique({
      where: { id },
      include: {
        device: true,
        patient: true,
        reading: true,
      },
    });

    if (!alert) {
      throw new AppError('Alert not found', 404);
    }

    const response: ApiResponse = {
      success: true,
      data: alert,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * POST /api/v1/alerts/:id/acknowledge
 * Acknowledge an alert
 */
router.post(
  '/:id/acknowledge',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { acknowledged_by } = req.body;

    if (!acknowledged_by) {
      throw new AppError('acknowledged_by is required', 400);
    }

    const alert = await prisma.alert.findUnique({ where: { id } });

    if (!alert) {
      throw new AppError('Alert not found', 404);
    }

    if (alert.acknowledged) {
      throw new AppError('Alert already acknowledged', 400);
    }

    // Acknowledge alert
    const updated = await prisma.alert.update({
      where: { id },
      data: {
        acknowledged: true,
        acknowledgedBy: acknowledged_by,
        acknowledgedAt: new Date(),
      },
      include: {
        device: {
          select: {
            id: true,
            deviceType: true,
            manufacturer: true,
            model: true,
          },
        },
        patient: {
          select: {
            id: true,
            mrn: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    logger.info('Alert acknowledged', {
      alertId: id,
      acknowledgedBy: acknowledged_by,
    });

    const response: ApiResponse = {
      success: true,
      data: updated,
      message: 'Alert acknowledged successfully',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * POST /api/v1/alerts/acknowledge-batch
 * Acknowledge multiple alerts
 */
router.post(
  '/acknowledge-batch',
  asyncHandler(async (req: Request, res: Response) => {
    const { alert_ids, acknowledged_by } = req.body;

    if (!alert_ids || !Array.isArray(alert_ids) || alert_ids.length === 0) {
      throw new AppError('alert_ids array is required', 400);
    }

    if (!acknowledged_by) {
      throw new AppError('acknowledged_by is required', 400);
    }

    // Acknowledge all alerts
    const result = await prisma.alert.updateMany({
      where: {
        id: { in: alert_ids },
        acknowledged: false,
      },
      data: {
        acknowledged: true,
        acknowledgedBy: acknowledged_by,
        acknowledgedAt: new Date(),
      },
    });

    logger.info('Batch alerts acknowledged', {
      count: result.count,
      acknowledgedBy: acknowledged_by,
    });

    const response: ApiResponse = {
      success: true,
      data: { acknowledged_count: result.count },
      message: `${result.count} alerts acknowledged successfully`,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * GET /api/v1/alerts/statistics
 * Get alert statistics
 */
router.get(
  '/statistics',
  asyncHandler(async (req: Request, res: Response) => {
    const {
      device_id,
      patient_id,
      start_date,
      end_date,
    } = req.query as any;

    // Build where clause
    const where: any = {};
    if (device_id) where.deviceId = device_id;
    if (patient_id) where.patientId = patient_id;

    if (start_date || end_date) {
      where.createdAt = {};
      if (start_date) where.createdAt.gte = new Date(start_date);
      if (end_date) where.createdAt.lte = new Date(end_date);
    }

    // Get statistics
    const [
      totalAlerts,
      acknowledgedCount,
      criticalCount,
      warningCount,
      infoCount,
    ] = await Promise.all([
      prisma.alert.count({ where }),
      prisma.alert.count({ where: { ...where, acknowledged: true } }),
      prisma.alert.count({ where: { ...where, level: 'critical' } }),
      prisma.alert.count({ where: { ...where, level: 'warning' } }),
      prisma.alert.count({ where: { ...where, level: 'info' } }),
    ]);

    // Get alerts by device
    const deviceStats = await prisma.alert.groupBy({
      by: ['deviceId'],
      where,
      _count: true,
    });

    const response: ApiResponse = {
      success: true,
      data: {
        total_alerts: totalAlerts,
        acknowledged_count: acknowledgedCount,
        unacknowledged_count: totalAlerts - acknowledgedCount,
        by_level: {
          critical: criticalCount,
          warning: warningCount,
          info: infoCount,
        },
        by_device: deviceStats.map((stat) => ({
          device_id: stat.deviceId,
          count: stat._count,
        })),
      },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * DELETE /api/v1/alerts/:id
 * Delete alert
 */
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const alert = await prisma.alert.findUnique({ where: { id } });

    if (!alert) {
      throw new AppError('Alert not found', 404);
    }

    await prisma.alert.delete({ where: { id } });

    logger.info('Alert deleted', { alertId: id });

    const response: ApiResponse = {
      success: true,
      message: 'Alert deleted successfully',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

export default router;
