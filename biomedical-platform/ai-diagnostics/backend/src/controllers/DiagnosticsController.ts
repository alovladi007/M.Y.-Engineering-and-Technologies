/**
 * Diagnostics Controller
 * Handles all diagnostic analysis requests
 */

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logInfo, logAudit } from '../../../../shared/utils/logger';
import { DiagnosticRequest, DiagnosticResult } from '../../../../shared/types';
import MLInferenceService from '../services/MLInferenceService';
import FeatureStoreService from '../services/FeatureStoreService';
import PredictiveAnalyticsService from '../services/PredictiveAnalyticsService';
import ClinicalDecisionSupportService from '../services/ClinicalDecisionSupportService';
import DiagnosticsRepository from '../repositories/DiagnosticsRepository';

export default class DiagnosticsController {
  private mlService: MLInferenceService;
  private featureStore: FeatureStoreService;
  private predictiveService: PredictiveAnalyticsService;
  private cdsService: ClinicalDecisionSupportService;
  private repository: DiagnosticsRepository;

  constructor() {
    this.mlService = new MLInferenceService();
    this.featureStore = new FeatureStoreService();
    this.predictiveService = new PredictiveAnalyticsService();
    this.cdsService = new ClinicalDecisionSupportService();
    this.repository = new DiagnosticsRepository();
  }

  /**
   * POST /api/v1/diagnostics/analyze
   * Run comprehensive diagnostic analysis
   */
  async analyzeDiagnostic(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const diagnosticId = uuidv4();

    try {
      const { patientId, inputData, urgency = 'routine' } = req.body;
      const userId = (req as any).user.id;

      logInfo('Starting diagnostic analysis', {
        diagnosticId,
        patientId,
        userId,
        urgency,
      });

      // Log PHI access
      logAudit('DIAGNOSTIC_ANALYSIS_START', 'diagnostic', diagnosticId, {
        userId,
        patientId,
        ipAddress: req.ip,
        phi_accessed: true,
      });

      // Create diagnostic request record
      const diagnosticRequest: Partial<DiagnosticRequest> = {
        id: diagnosticId,
        patientId,
        requestType: 'disease_detection',
        inputData,
        urgency: urgency as 'routine' | 'urgent' | 'emergency',
        requestedBy: userId,
        status: 'processing',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.repository.createDiagnosticRequest(diagnosticRequest);

      // Extract features
      logInfo('Extracting features', { diagnosticId });
      const features = await this.featureStore.extractFeatures(inputData);

      // Run ML inference
      logInfo('Running ML inference', { diagnosticId });
      const predictions = await this.mlService.runInference(features);

      // Calculate risk scores
      logInfo('Calculating risk scores', { diagnosticId });
      const riskScores = await this.predictiveService.calculateRiskScores(
        patientId,
        inputData,
        predictions
      );

      // Generate clinical decision support
      logInfo('Generating clinical decision support', { diagnosticId });
      const clinicalSupport = await this.cdsService.generateRecommendations(
        predictions,
        riskScores,
        inputData
      );

      // Compile diagnostic result
      const result: Partial<DiagnosticResult> = {
        diagnoses: predictions.diagnoses,
        riskScores,
        treatmentRecommendations: clinicalSupport.treatmentRecommendations,
        prognosticEstimate: predictions.prognosticEstimate,
        confidence: predictions.confidence,
        explanation: predictions.explanation,
        clinicalDecisionSupport: clinicalSupport,
        timestamp: new Date(),
      };

      // Update diagnostic request with result
      await this.repository.updateDiagnosticResult(diagnosticId, result);

      // Store features for future use
      await this.featureStore.storeFeatures(diagnosticId, features);

      const processingTime = Date.now() - startTime;

      logInfo('Diagnostic analysis completed', {
        diagnosticId,
        processingTime,
        confidence: result.confidence,
      });

      logAudit('DIAGNOSTIC_ANALYSIS_COMPLETE', 'diagnostic', diagnosticId, {
        userId,
        patientId,
        ipAddress: req.ip,
        phi_accessed: true,
      });

      res.json({
        success: true,
        data: {
          diagnosticId,
          result,
          processingTime,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: (req as any).requestId,
        },
      });
    } catch (error) {
      logInfo('Diagnostic analysis failed', {
        diagnosticId,
        error: (error as Error).message,
      });

      await this.repository.updateDiagnosticStatus(diagnosticId, 'failed');

      res.status(500).json({
        success: false,
        error: {
          code: 'DIAGNOSTIC_ANALYSIS_FAILED',
          message: 'Failed to complete diagnostic analysis',
          details: process.env.NODE_ENV !== 'production' ? (error as Error).message : undefined,
        },
      });
    }
  }

  /**
   * GET /api/v1/diagnostics/:id
   * Get diagnostic result by ID
   */
  async getDiagnostic(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      logAudit('VIEW_DIAGNOSTIC', 'diagnostic', id, {
        userId,
        ipAddress: req.ip,
        phi_accessed: true,
      });

      const diagnostic = await this.repository.getDiagnosticById(id);

      if (!diagnostic) {
        res.status(404).json({
          success: false,
          error: {
            code: 'DIAGNOSTIC_NOT_FOUND',
            message: 'Diagnostic not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: diagnostic,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_DIAGNOSTIC_FAILED',
          message: 'Failed to retrieve diagnostic',
        },
      });
    }
  }

  /**
   * GET /api/v1/diagnostics/patient/:patientId
   * Get all diagnostics for a patient
   */
  async getPatientDiagnostics(req: Request, res: Response): Promise<void> {
    try {
      const { patientId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const userId = (req as any).user.id;

      logAudit('VIEW_PATIENT_DIAGNOSTICS', 'patient', patientId, {
        userId,
        ipAddress: req.ip,
        phi_accessed: true,
      });

      const diagnostics = await this.repository.getDiagnosticsByPatient(
        patientId,
        parseInt(page as string),
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: diagnostics,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_PATIENT_DIAGNOSTICS_FAILED',
          message: 'Failed to retrieve patient diagnostics',
        },
      });
    }
  }

  /**
   * GET /api/v1/diagnostics/patient/:patientId/history
   * Get diagnostic history with trends
   */
  async getPatientHistory(req: Request, res: Response): Promise<void> {
    try {
      const { patientId } = req.params;
      const userId = (req as any).user.id;

      logAudit('VIEW_PATIENT_HISTORY', 'patient', patientId, {
        userId,
        ipAddress: req.ip,
        phi_accessed: true,
      });

      const history = await this.repository.getPatientHistory(patientId);
      const trends = await this.predictiveService.analyzeTrends(history);

      res.json({
        success: true,
        data: {
          history,
          trends,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_PATIENT_HISTORY_FAILED',
          message: 'Failed to retrieve patient history',
        },
      });
    }
  }

  /**
   * POST /api/v1/diagnostics/:id/export
   * Export diagnostic report
   */
  async exportDiagnostic(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { format = 'pdf' } = req.body;
      const userId = (req as any).user.id;

      logAudit('EXPORT_DIAGNOSTIC', 'diagnostic', id, {
        userId,
        ipAddress: req.ip,
        phi_accessed: true,
      });

      const diagnostic = await this.repository.getDiagnosticById(id);

      if (!diagnostic) {
        res.status(404).json({
          success: false,
          error: {
            code: 'DIAGNOSTIC_NOT_FOUND',
            message: 'Diagnostic not found',
          },
        });
        return;
      }

      // Generate export (implementation depends on format)
      // For now, return JSON
      res.json({
        success: true,
        data: {
          format,
          diagnostic,
          exportedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'EXPORT_DIAGNOSTIC_FAILED',
          message: 'Failed to export diagnostic',
        },
      });
    }
  }
}
