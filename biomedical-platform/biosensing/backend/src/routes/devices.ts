/**
 * Devices API Routes
 */

import express, { Request, Response } from 'express';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import prisma from '../db/prisma';
import { DeviceQueryParams, ApiResponse, PaginatedResponse } from '../types';
import logger from '../utils/logger';

const router = express.Router();

/**
 * GET /api/v1/devices
 * List all devices with optional filtering
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const {
      page = 1,
      page_size = 20,
      status,
      patient_id,
      device_type,
      search,
    } = req.query as any as DeviceQueryParams;

    const skip = (Number(page) - 1) * Number(page_size);
    const take = Number(page_size);

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (patient_id) where.assignedPatientId = patient_id;
    if (device_type) where.deviceType = device_type;
    if (search) {
      where.OR = [
        { serialNumber: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get devices and total count
    const [devices, total] = await Promise.all([
      prisma.device.findMany({
        where,
        skip,
        take,
        include: {
          assignedPatient: {
            select: {
              id: true,
              mrn: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { registeredAt: 'desc' },
      }),
      prisma.device.count({ where }),
    ]);

    const response: PaginatedResponse = {
      success: true,
      data: devices,
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
 * GET /api/v1/devices/:id
 * Get device by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const device = await prisma.device.findUnique({
      where: { id },
      include: {
        assignedPatient: {
          select: {
            id: true,
            mrn: true,
            firstName: true,
            lastName: true,
            contactEmail: true,
            contactPhone: true,
          },
        },
        _count: {
          select: {
            readings: true,
            alerts: true,
            sessions: true,
          },
        },
      },
    });

    if (!device) {
      throw new AppError('Device not found', 404);
    }

    const response: ApiResponse = {
      success: true,
      data: device,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * POST /api/v1/devices
 * Register new device
 */
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const {
      device_type,
      manufacturer,
      model,
      serial_number,
      firmware_version,
      config,
    } = req.body;

    // Validate required fields
    if (!device_type || !manufacturer || !model || !serial_number) {
      throw new AppError(
        'Missing required fields: device_type, manufacturer, model, serial_number',
        400
      );
    }

    // Check if device already exists
    const existing = await prisma.device.findUnique({
      where: { serialNumber: serial_number },
    });

    if (existing) {
      throw new AppError('Device with this serial number already exists', 409);
    }

    // Create device
    const device = await prisma.device.create({
      data: {
        deviceType: device_type,
        manufacturer,
        model,
        serialNumber: serial_number,
        firmwareVersion: firmware_version,
        config: config || {},
      },
    });

    logger.info('Device registered', { deviceId: device.id, serialNumber: serial_number });

    const response: ApiResponse = {
      success: true,
      data: device,
      message: 'Device registered successfully',
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  })
);

/**
 * PATCH /api/v1/devices/:id
 * Update device
 */
router.patch(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      firmware_version,
      assigned_patient_id,
      status,
      config,
    } = req.body;

    const device = await prisma.device.findUnique({ where: { id } });

    if (!device) {
      throw new AppError('Device not found', 404);
    }

    // Update device
    const updated = await prisma.device.update({
      where: { id },
      data: {
        ...(firmware_version && { firmwareVersion: firmware_version }),
        ...(assigned_patient_id !== undefined && {
          assignedPatientId: assigned_patient_id,
        }),
        ...(status && { status }),
        ...(config && { config }),
      },
      include: {
        assignedPatient: {
          select: {
            id: true,
            mrn: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    logger.info('Device updated', { deviceId: id });

    const response: ApiResponse = {
      success: true,
      data: updated,
      message: 'Device updated successfully',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * DELETE /api/v1/devices/:id
 * Delete device
 */
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const device = await prisma.device.findUnique({ where: { id } });

    if (!device) {
      throw new AppError('Device not found', 404);
    }

    await prisma.device.delete({ where: { id } });

    logger.info('Device deleted', { deviceId: id });

    const response: ApiResponse = {
      success: true,
      message: 'Device deleted successfully',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * POST /api/v1/devices/:id/connect
 * Connect device to IoT Core
 */
router.post(
  '/:id/connect',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { config } = req.body;

    const device = await prisma.device.findUnique({
      where: { id },
      include: { assignedPatient: true },
    });

    if (!device) {
      throw new AppError('Device not found', 404);
    }

    // Get IoT Device Manager from app locals
    const iotDeviceManager = req.app.locals.iotDeviceManager;

    if (!iotDeviceManager) {
      throw new AppError('IoT Device Manager not initialized', 500);
    }

    // Connect device
    await iotDeviceManager.connectDevice(
      id,
      device.assignedPatientId || undefined,
      config || device.config
    );

    // Update device status
    await prisma.device.update({
      where: { id },
      data: { status: 'connecting', lastSeen: new Date() },
    });

    logger.info('Device connection initiated', { deviceId: id });

    const response: ApiResponse = {
      success: true,
      message: 'Device connection initiated',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * POST /api/v1/devices/:id/disconnect
 * Disconnect device from IoT Core
 */
router.post(
  '/:id/disconnect',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const device = await prisma.device.findUnique({ where: { id } });

    if (!device) {
      throw new AppError('Device not found', 404);
    }

    // Get IoT Device Manager
    const iotDeviceManager = req.app.locals.iotDeviceManager;

    if (!iotDeviceManager) {
      throw new AppError('IoT Device Manager not initialized', 500);
    }

    // Disconnect device
    await iotDeviceManager.disconnectDevice(id);

    // Update device status
    await prisma.device.update({
      where: { id },
      data: { status: 'offline', lastSeen: new Date() },
    });

    logger.info('Device disconnected', { deviceId: id });

    const response: ApiResponse = {
      success: true,
      message: 'Device disconnected successfully',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * POST /api/v1/devices/:id/command
 * Send command to device
 */
router.post(
  '/:id/command',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { command, params } = req.body;

    if (!command) {
      throw new AppError('Command is required', 400);
    }

    const device = await prisma.device.findUnique({ where: { id } });

    if (!device) {
      throw new AppError('Device not found', 404);
    }

    // Get IoT Device Manager
    const iotDeviceManager = req.app.locals.iotDeviceManager;

    if (!iotDeviceManager) {
      throw new AppError('IoT Device Manager not initialized', 500);
    }

    // Send command
    await iotDeviceManager.publishCommand(id, command, params || {});

    logger.info('Command sent to device', { deviceId: id, command });

    const response: ApiResponse = {
      success: true,
      message: 'Command sent successfully',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

export default router;
