import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth';
import PredictiveAnalyticsService from '../services/PredictiveAnalyticsService';

const router = Router();
const predictiveService = new PredictiveAnalyticsService();

router.post('/calculate', authenticateJWT, async (req, res) => {
  try {
    const { patientId, inputData } = req.body;

    const riskScores = await predictiveService.calculateRiskScores(
      patientId,
      inputData,
      {}
    );

    res.json({
      success: true,
      data: {
        patientId,
        riskScores,
        calculatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'RISK_CALCULATION_FAILED',
        message: 'Failed to calculate risk scores'
      }
    });
  }
});

export default router;
