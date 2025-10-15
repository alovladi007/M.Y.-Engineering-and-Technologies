/**
 * Patients API Routes
 */

import express, { Request, Response } from 'express';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import prisma from '../db/prisma';
import { QueryParams, ApiResponse, PaginatedResponse } from '../types';
import logger from '../utils/logger';

const router = express.Router();

/**
 * GET /api/v1/patients
 * List all patients
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const {
      page = 1,
      page_size = 20,
      search,
      sort_by = 'createdAt',
      sort_order = 'desc',
    } = req.query as any as QueryParams;

    const skip = (Number(page) - 1) * Number(page_size);
    const take = Number(page_size);

    // Build where clause
    const where: any = {};
    if (search) {
      where.OR = [
        { mrn: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { contactEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get patients and total count
    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        skip,
        take,
        orderBy: { [sort_by]: sort_order },
        include: {
          _count: {
            select: {
              devices: true,
              readings: true,
              alerts: true,
              sessions: true,
            },
          },
        },
      }),
      prisma.patient.count({ where }),
    ]);

    const response: PaginatedResponse = {
      success: true,
      data: patients,
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
 * GET /api/v1/patients/:id
 * Get patient by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        devices: {
          select: {
            id: true,
            deviceType: true,
            manufacturer: true,
            model: true,
            serialNumber: true,
            status: true,
            lastSeen: true,
          },
        },
        sessions: {
          where: { status: 'active' },
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
        },
        _count: {
          select: {
            readings: true,
            alerts: true,
          },
        },
      },
    });

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    const response: ApiResponse = {
      success: true,
      data: patient,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * POST /api/v1/patients
 * Create new patient
 */
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const {
      mrn,
      first_name,
      last_name,
      date_of_birth,
      gender,
      contact_email,
      contact_phone,
      emergency_contact,
      medical_history,
      allergies,
      medications,
    } = req.body;

    // Validate required fields
    if (!mrn || !first_name || !last_name || !date_of_birth) {
      throw new AppError(
        'Missing required fields: mrn, first_name, last_name, date_of_birth',
        400
      );
    }

    // Check if patient already exists
    const existing = await prisma.patient.findUnique({
      where: { mrn },
    });

    if (existing) {
      throw new AppError('Patient with this MRN already exists', 409);
    }

    // Create patient
    const patient = await prisma.patient.create({
      data: {
        mrn,
        firstName: first_name,
        lastName: last_name,
        dateOfBirth: new Date(date_of_birth),
        gender,
        contactEmail: contact_email,
        contactPhone: contact_phone,
        emergencyContact: emergency_contact,
        medicalHistory: medical_history || [],
        allergies: allergies || [],
        medications: medications || [],
      },
    });

    logger.info('Patient created', { patientId: patient.id, mrn });

    const response: ApiResponse = {
      success: true,
      data: patient,
      message: 'Patient created successfully',
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  })
);

/**
 * PATCH /api/v1/patients/:id
 * Update patient
 */
router.patch(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      gender,
      contact_email,
      contact_phone,
      emergency_contact,
      medical_history,
      allergies,
      medications,
    } = req.body;

    const patient = await prisma.patient.findUnique({ where: { id } });

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    // Update patient
    const updated = await prisma.patient.update({
      where: { id },
      data: {
        ...(first_name && { firstName: first_name }),
        ...(last_name && { lastName: last_name }),
        ...(gender !== undefined && { gender }),
        ...(contact_email !== undefined && { contactEmail: contact_email }),
        ...(contact_phone !== undefined && { contactPhone: contact_phone }),
        ...(emergency_contact !== undefined && { emergencyContact: emergency_contact }),
        ...(medical_history && { medicalHistory: medical_history }),
        ...(allergies && { allergies }),
        ...(medications && { medications }),
      },
    });

    logger.info('Patient updated', { patientId: id });

    const response: ApiResponse = {
      success: true,
      data: updated,
      message: 'Patient updated successfully',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * DELETE /api/v1/patients/:id
 * Delete patient
 */
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const patient = await prisma.patient.findUnique({ where: { id } });

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    await prisma.patient.delete({ where: { id } });

    logger.info('Patient deleted', { patientId: id });

    const response: ApiResponse = {
      success: true,
      message: 'Patient deleted successfully',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * GET /api/v1/patients/:id/devices
 * Get all devices for a patient
 */
router.get(
  '/:id/devices',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    const devices = await prisma.device.findMany({
      where: { assignedPatientId: id },
      orderBy: { lastSeen: 'desc' },
    });

    const response: ApiResponse = {
      success: true,
      data: devices,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

/**
 * GET /api/v1/patients/:id/alerts
 * Get all alerts for a patient
 */
router.get(
  '/:id/alerts',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      page = 1,
      page_size = 50,
      level,
      acknowledged,
    } = req.query as any;

    const patient = await prisma.patient.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!patient) {
      throw new AppError('Patient not found', 404);
    }

    const skip = (Number(page) - 1) * Number(page_size);
    const take = Number(page_size);

    const where: any = { patientId: id };
    if (level) where.level = level;
    if (acknowledged !== undefined) where.acknowledged = acknowledged === 'true';

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        skip,
        take,
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
        },
        orderBy: { createdAt: 'desc' },
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

export default router;
