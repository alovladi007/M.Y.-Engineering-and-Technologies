import { RiskScore } from '../../../../shared/types';

export default class PredictiveAnalyticsService {
  async calculateRiskScores(patientId: string, inputData: any, predictions: any): Promise<RiskScore[]> {
    const riskScores: RiskScore[] = [];

    // Cardiovascular risk
    const cvdRisk = this.calculateCVDRisk(inputData);
    riskScores.push({
      condition: 'Cardiovascular Disease',
      score: cvdRisk,
      timeframe: '10 years',
      category: this.getRiskCategory(cvdRisk),
      modifiableFactors: [
        { factor: 'Smoking', impact: 'risk', magnitude: 0.8, modifiable: true },
        { factor: 'Physical Activity', impact: 'protective', magnitude: 0.6, modifiable: true },
        { factor: 'Diet', impact: 'protective', magnitude: 0.5, modifiable: true }
      ]
    });

    // Diabetes risk
    const diabetesRisk = this.calculateDiabetesRisk(inputData);
    riskScores.push({
      condition: 'Type 2 Diabetes',
      score: diabetesRisk,
      timeframe: '5 years',
      category: this.getRiskCategory(diabetesRisk),
      modifiableFactors: [
        { factor: 'Weight', impact: 'risk', magnitude: 0.7, modifiable: true },
        { factor: 'Exercise', impact: 'protective', magnitude: 0.65, modifiable: true }
      ]
    });

    return riskScores;
  }

  async analyzeTrends(history: any[]): Promise<any> {
    if (!history || history.length === 0) {
      return { trends: [], insights: [] };
    }

    return {
      trends: [
        {
          metric: 'glucose_level',
          direction: 'increasing',
          change: 5.2,
          significance: 'moderate'
        }
      ],
      insights: [
        'Glucose levels trending upward over past 6 months',
        'Recommend dietary consultation'
      ]
    };
  }

  private calculateCVDRisk(inputData: any): number {
    let risk = 0;

    if (inputData.vitalSigns) {
      const systolic = inputData.vitalSigns.bloodPressure?.systolic || 120;
      if (systolic > 140) risk += 20;
      else if (systolic > 130) risk += 10;
    }

    if (inputData.demographics) {
      const age = new Date().getFullYear() - new Date(inputData.demographics.dateOfBirth).getFullYear();
      if (age > 65) risk += 15;
      else if (age > 55) risk += 10;
    }

    return Math.min(risk, 100);
  }

  private calculateDiabetesRisk(inputData: any): number {
    let risk = 0;

    if (inputData.vitalSigns?.bmi) {
      const bmi = inputData.vitalSigns.bmi;
      if (bmi > 30) risk += 25;
      else if (bmi > 25) risk += 15;
    }

    if (inputData.labResults) {
      const glucose = inputData.labResults.find((l: any) => l.testName.toLowerCase().includes('glucose'));
      if (glucose && parseFloat(glucose.value) > 100) {
        risk += 20;
      }
    }

    return Math.min(risk, 100);
  }

  private getRiskCategory(score: number): 'low' | 'moderate' | 'high' | 'very_high' {
    if (score < 25) return 'low';
    if (score < 50) return 'moderate';
    if (score < 75) return 'high';
    return 'very_high';
  }
}
