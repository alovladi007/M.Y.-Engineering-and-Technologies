/**
 * Monitoring Sessions API Routes
 */

import express, { Request, Response } from 'express';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import prisma from '../db/prisma';
import { QueryParams, ApiResponse, PaginatedResponse } from '../types';
import logger from '../utils/logger';

const router = express.Router();

/**
 * GET /api/v1/sessions
 * List monitoring sessions
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const {
      page = 1,
      page_size = 20,
      patient_id,
      device_id,
      status,
      sort_by = 'startedAt',
      sort_order = 'desc',
    } = req.query as any as QueryParams;

    const skip = (Number(page) - 1) * Number(page_size);
    const take = Number(page_size);

    // Build where clause
    const where: any = {};
    if (patient_id) where.patientId = patient_id;
    if (device_id) where.deviceId = device_id;
    if (status) where.status = status;

    // Get sessions and total count
    const [sessions, total] = await Promise.all([
      prisma.monitoringSession.findMany({
        where,
        skip,
        take,
        orderBy: { [sort_by]: sort_order },
        include: {
          patient: {
            select: {
              id: true,
              mrn: true,
              firstName: true,
              lastName: true,
            },
          },
          device: {
            select: {
              id: true,
              deviceType: true,
              manufacturer: true,
              model: true,
              serialNumber: true,
            },
          },
        },
      }),
      prisma.monitoringSession.count({ where }),
    ]);

    const response: PaginatedResponse = {
      success: true,
      data: sessions,
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
 * GET /api/v1/sessions/:id
 * Get session by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const session = await prisma.monitoringSession.findUnique({
      where: { id },
      include: {
        patient: true,
        device: true,
      },
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    const response: ApiResponse = {
      success: true,
      data: session,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * POST /api/v1/sessions
 * Start new monitoring session
 */
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { patient_id, device_id, notes } = req.body;

    // Validate required fields
    if (!patient_id || !device_id) {
      throw new AppError(
        'Missing required fields: patient_id, device_id',
        400
      );
    }

    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patient_id },
    });

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    // Verify device exists
    const device = await prisma.device.findUnique({
      where: { id: device_id },
    });

    if (!device) {
      throw new AppError('Device not found', 404);
    }

    // Check if there's already an active session for this patient-device pair
    const existingSession = await prisma.monitoringSession.findFirst({
      where: {
        patientId: patient_id,
        deviceId: device_id,
        status: 'active',
      },
    });

    if (existingSession) {
      throw new AppError(
        'An active monitoring session already exists for this patient-device pair',
        409
      );
    }

    // Create session
    const session = await prisma.monitoringSession.create({
      data: {
        patientId: patient_id,
        deviceId: device_id,
        notes: notes || null,
      },
      include: {
        patient: {
          select: {
            id: true,
            mrn: true,
            firstName: true,
            lastName: true,
          },
        },
        device: {
          select: {
            id: true,
            deviceType: true,
            manufacturer: true,
            model: true,
          },
        },
      },
    });

    logger.info('Monitoring session started', {
      sessionId: session.id,
      patientId: patient_id,
      deviceId: device_id,
    });

    const response: ApiResponse = {
      success: true,
      data: session,
      message: 'Monitoring session started successfully',
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  })
);

/**
 * PATCH /api/v1/sessions/:id
 * Update monitoring session
 */
router.patch(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { notes } = req.body;

    const session = await prisma.monitoringSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    // Update session
    const updated = await prisma.monitoringSession.update({
      where: { id },
      data: {
        ...(notes !== undefined && { notes }),
      },
      include: {
        patient: {
          select: {
            id: true,
            mrn: true,
            firstName: true,
            lastName: true,
          },
        },
        device: {
          select: {
            id: true,
            deviceType: true,
            manufacturer: true,
            model: true,
          },
        },
      },
    });

    logger.info('Monitoring session updated', { sessionId: id });

    const response: ApiResponse = {
      success: true,
      data: updated,
      message: 'Session updated successfully',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * POST /api/v1/sessions/:id/end
 * End monitoring session
 */
router.post(
  '/:id/end',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { notes } = req.body;

    const session = await prisma.monitoringSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    if (session.status !== 'active') {
      throw new AppError('Session is not active', 400);
    }

    // Get session statistics
    const [readingsCount, alertsCount] = await Promise.all([
      prisma.biosensorReading.count({
        where: {
          patientId: session.patientId,
          deviceId: session.deviceId,
          timestamp: {
            gte: session.startedAt,
          },
        },
      }),
      prisma.alert.count({
        where: {
          patientId: session.patientId,
          deviceId: session.deviceId,
          createdAt: {
            gte: session.startedAt,
          },
        },
      }),
    ]);

    // End session
    const updated = await prisma.monitoringSession.update({
      where: { id },
      data: {
        status: 'completed',
        endedAt: new Date(),
        totalReadings: readingsCount,
        alertsGenerated: alertsCount,
        ...(notes && { notes }),
      },
      include: {
        patient: {
          select: {
            id: true,
            mrn: true,
            firstName: true,
            lastName: true,
          },
        },
        device: {
          select: {
            id: true,
            deviceType: true,
            manufacturer: true,
            model: true,
          },
        },
      },
    });

    logger.info('Monitoring session ended', {
      sessionId: id,
      readingsCount,
      alertsCount,
    });

    const response: ApiResponse = {
      success: true,
      data: updated,
      message: 'Session ended successfully',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * POST /api/v1/sessions/:id/abort
 * Abort monitoring session
 */
router.post(
  '/:id/abort',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { notes } = req.body;

    const session = await prisma.monitoringSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    if (session.status !== 'active') {
      throw new AppError('Session is not active', 400);
    }

    // Abort session
    const updated = await prisma.monitoringSession.update({
      where: { id },
      data: {
        status: 'aborted',
        endedAt: new Date(),
        ...(notes && { notes }),
      },
    });

    logger.info('Monitoring session aborted', { sessionId: id });

    const response: ApiResponse = {
      success: true,
      data: updated,
      message: 'Session aborted',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * DELETE /api/v1/sessions/:id
 * Delete session
 */
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const session = await prisma.monitoringSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    await prisma.monitoringSession.delete({ where: { id } });

    logger.info('Session deleted', { sessionId: id });

    const response: ApiResponse = {
      success: true,
      message: 'Session deleted successfully',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

export default router;
