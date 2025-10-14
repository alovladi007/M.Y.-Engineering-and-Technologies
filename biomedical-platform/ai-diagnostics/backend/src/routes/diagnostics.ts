/**
 * Diagnostics Routes
 * API endpoints for AI-powered diagnostic analysis
 */

import { Router } from 'express';
import DiagnosticsController from '../controllers/DiagnosticsController';
import { validateDiagnosticRequest } from '../middleware/validators';
import { authenticateJWT } from '../middleware/auth';

const router = Router();
const controller = new DiagnosticsController();

/**
 * POST /api/v1/diagnostics/analyze
 * Run comprehensive diagnostic analysis
 */
router.post(
  '/analyze',
  authenticateJWT,
  validateDiagnosticRequest,
  controller.analyzeDiagnostic.bind(controller)
);

/**
 * GET /api/v1/diagnostics/:id
 * Get diagnostic result by ID
 */
router.get(
  '/:id',
  authenticateJWT,
  controller.getDiagnostic.bind(controller)
);

/**
 * GET /api/v1/diagnostics/patient/:patientId
 * Get all diagnostics for a patient
 */
router.get(
  '/patient/:patientId',
  authenticateJWT,
  controller.getPatientDiagnostics.bind(controller)
);

/**
 * GET /api/v1/diagnostics/patient/:patientId/history
 * Get diagnostic history with trends
 */
router.get(
  '/patient/:patientId/history',
  authenticateJWT,
  controller.getPatientHistory.bind(controller)
);

/**
 * POST /api/v1/diagnostics/:id/export
 * Export diagnostic report
 */
router.post(
  '/:id/export',
  authenticateJWT,
  controller.exportDiagnostic.bind(controller)
);

export default router;
