/**
 * Biosensor Readings API Routes
 */

import express, { Request, Response } from 'express';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import prisma from '../db/prisma';
import { ReadingQueryParams, ApiResponse, PaginatedResponse } from '../types';
import logger from '../utils/logger';

const router = express.Router();

/**
 * GET /api/v1/readings
 * List biosensor readings with filtering
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const {
      page = 1,
      page_size = 100,
      device_id,
      patient_id,
      sensor_type,
      start_date,
      end_date,
      sort_by = 'timestamp',
      sort_order = 'desc',
    } = req.query as any as ReadingQueryParams;

    const skip = (Number(page) - 1) * Number(page_size);
    const take = Number(page_size);

    // Build where clause
    const where: any = {};
    if (device_id) where.deviceId = device_id;
    if (patient_id) where.patientId = patient_id;
    if (sensor_type) where.sensorType = sensor_type;

    if (start_date || end_date) {
      where.timestamp = {};
      if (start_date) where.timestamp.gte = new Date(start_date);
      if (end_date) where.timestamp.lte = new Date(end_date);
    }

    // Get readings and total count
    const [readings, total] = await Promise.all([
      prisma.biosensorReading.findMany({
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
        },
      }),
      prisma.biosensorReading.count({ where }),
    ]);

    const response: PaginatedResponse = {
      success: true,
      data: readings,
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
 * GET /api/v1/readings/:id
 * Get reading by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const reading = await prisma.biosensorReading.findUnique({
      where: { id },
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
        alerts: true,
      },
    });

    if (!reading) {
      throw new AppError('Reading not found', 404);
    }

    const response: ApiResponse = {
      success: true,
      data: reading,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * POST /api/v1/readings
 * Create new biosensor reading (manual entry)
 */
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const {
      device_id,
      patient_id,
      sensor_type,
      value,
      unit,
      timestamp,
      metadata,
    } = req.body;

    // Validate required fields
    if (!device_id || !sensor_type || value === undefined || !unit) {
      throw new AppError(
        'Missing required fields: device_id, sensor_type, value, unit',
        400
      );
    }

    // Verify device exists
    const device = await prisma.device.findUnique({
      where: { id: device_id },
    });

    if (!device) {
      throw new AppError('Device not found', 404);
    }

    // Verify patient if provided
    if (patient_id) {
      const patient = await prisma.patient.findUnique({
        where: { id: patient_id },
      });

      if (!patient) {
        throw new AppError('Patient not found', 404);
      }
    }

    // Create reading
    const reading = await prisma.biosensorReading.create({
      data: {
        deviceId: device_id,
        patientId: patient_id,
        sensorType: sensor_type,
        value: Number(value),
        unit,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        metadata: metadata || {},
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
      },
    });

    logger.info('Biosensor reading created', {
      readingId: reading.id,
      deviceId: device_id,
      sensorType: sensor_type,
    });

    const response: ApiResponse = {
      success: true,
      data: reading,
      message: 'Reading created successfully',
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  })
);

/**
 * GET /api/v1/readings/device/:deviceId/latest
 * Get latest readings for a device (by sensor type)
 */
router.get(
  '/device/:deviceId/latest',
  asyncHandler(async (req: Request, res: Response) => {
    const { deviceId } = req.params;

    // Verify device exists
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      throw new AppError('Device not found', 404);
    }

    // Get distinct sensor types for this device
    const sensorTypes = await prisma.biosensorReading.findMany({
      where: { deviceId },
      select: { sensorType: true },
      distinct: ['sensorType'],
    });

    // Get latest reading for each sensor type
    const latestReadings = await Promise.all(
      sensorTypes.map(({ sensorType }) =>
        prisma.biosensorReading.findFirst({
          where: {
            deviceId,
            sensorType,
          },
          orderBy: { timestamp: 'desc' },
        })
      )
    );

    const response: ApiResponse = {
      success: true,
      data: latestReadings.filter(Boolean),
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * GET /api/v1/readings/patient/:patientId/latest
 * Get latest readings for a patient (all devices)
 */
router.get(
  '/patient/:patientId/latest',
  asyncHandler(async (req: Request, res: Response) => {
    const { patientId } = req.params;

    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    // Get latest readings grouped by device and sensor type
    const readings = await prisma.$queryRaw`
      SELECT DISTINCT ON (device_id, sensor_type) *
      FROM biosensor_readings
      WHERE patient_id = ${patientId}
      ORDER BY device_id, sensor_type, timestamp DESC
      LIMIT 50
    `;

    const response: ApiResponse = {
      success: true,
      data: readings,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * GET /api/v1/readings/statistics
 * Get statistics for biosensor readings
 */
router.get(
  '/statistics',
  asyncHandler(async (req: Request, res: Response) => {
    const {
      device_id,
      patient_id,
      sensor_type,
      start_date,
      end_date,
    } = req.query as any;

    // Build where clause
    const where: any = {};
    if (device_id) where.deviceId = device_id;
    if (patient_id) where.patientId = patient_id;
    if (sensor_type) where.sensorType = sensor_type;

    if (start_date || end_date) {
      where.timestamp = {};
      if (start_date) where.timestamp.gte = new Date(start_date);
      if (end_date) where.timestamp.lte = new Date(end_date);
    }

    // Get statistics
    const [totalReadings, anomaliesCount, avgQuality] = await Promise.all([
      prisma.biosensorReading.count({ where }),
      prisma.biosensorReading.count({ where: { ...where, isAnomaly: true } }),
      prisma.biosensorReading.aggregate({
        where,
        _avg: { qualityScore: true, anomalyScore: true },
      }),
    ]);

    // Get readings by sensor type
    const sensorTypeStats = await prisma.biosensorReading.groupBy({
      by: ['sensorType'],
      where,
      _count: true,
      _avg: { value: true, qualityScore: true },
      _min: { value: true },
      _max: { value: true },
    });

    const response: ApiResponse = {
      success: true,
      data: {
        total_readings: totalReadings,
        anomalies_count: anomaliesCount,
        anomaly_rate: totalReadings > 0 ? (anomaliesCount / totalReadings) * 100 : 0,
        average_quality_score: avgQuality._avg.qualityScore || 0,
        average_anomaly_score: avgQuality._avg.anomalyScore || 0,
        by_sensor_type: sensorTypeStats.map((stat) => ({
          sensor_type: stat.sensorType,
          count: stat._count,
          avg_value: stat._avg.value,
          min_value: stat._min.value,
          max_value: stat._max.value,
          avg_quality: stat._avg.qualityScore,
        })),
      },
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * DELETE /api/v1/readings/:id
 * Delete reading
 */
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const reading = await prisma.biosensorReading.findUnique({
      where: { id },
    });

    if (!reading) {
      throw new AppError('Reading not found', 404);
    }

    await prisma.biosensorReading.delete({ where: { id } });

    logger.info('Reading deleted', { readingId: id });

    const response: ApiResponse = {
      success: true,
      message: 'Reading deleted successfully',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

export default router;
