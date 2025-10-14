import { TreatmentRecommendation, ClinicalDecisionSupport, ClinicalAlert, GuidelineRecommendation } from '../../../../shared/types';

export default class ClinicalDecisionSupportService {
  async generateRecommendations(predictions: any, riskScores: any[], inputData: any): Promise<ClinicalDecisionSupport> {
    const treatmentRecommendations = this.generateTreatmentRecommendations(predictions, riskScores);
    const alerts = this.generateAlerts(predictions, riskScores);
    const guidelines = this.getRelevantGuidelines(predictions);
    const drugInteractions = this.checkDrugInteractions(inputData);
    const patientEducation = this.getPatientEducation(predictions);

    return {
      alerts,
      guidelines,
      drugInteractions,
      patientEducation
    };
  }

  private generateTreatmentRecommendations(predictions: any, riskScores: any[]): TreatmentRecommendation[] {
    const recommendations: TreatmentRecommendation[] = [];

    if (predictions.diagnoses && predictions.diagnoses.length > 0) {
      recommendations.push({
        type: 'medication',
        description: 'Consider metformin for blood glucose management',
        rationale: 'First-line therapy for Type 2 Diabetes with good safety profile',
        priority: 'recommended',
        alternatives: ['Lifestyle modifications', 'Other oral hypoglycemics'],
        contraindications: ['Severe renal impairment', 'Acute heart failure'],
        expectedOutcome: 'HbA1c reduction of 1-2%'
      });

      recommendations.push({
        type: 'lifestyle',
        description: 'Implement structured diet and exercise program',
        rationale: 'Proven efficacy in diabetes management and prevention',
        priority: 'essential',
        expectedOutcome: 'Weight loss of 5-7% body weight'
      });

      recommendations.push({
        type: 'monitoring',
        description: 'Regular HbA1c monitoring every 3 months',
        rationale: 'Track disease progression and treatment efficacy',
        priority: 'essential'
      });
    }

    return recommendations;
  }

  private generateAlerts(predictions: any, riskScores: any[]): ClinicalAlert[] {
    const alerts: ClinicalAlert[] = [];

    const highRiskConditions = riskScores.filter(r => r.category === 'high' || r.category === 'very_high');

    if (highRiskConditions.length > 0) {
      alerts.push({
        severity: 'warning',
        message: `High risk detected for: ${highRiskConditions.map(r => r.condition).join(', ')}`,
        actionRequired: true,
        dismissible: false
      });
    }

    if (predictions.confidence < 0.7) {
      alerts.push({
        severity: 'info',
        message: 'AI prediction confidence is moderate. Consider additional diagnostic tests.',
        actionRequired: false,
        dismissible: true
      });
    }

    return alerts;
  }

  private getRelevantGuidelines(predictions: any): GuidelineRecommendation[] {
    return [
      {
        guideline: 'ADA Standards of Medical Care in Diabetes',
        source: 'American Diabetes Association',
        recommendation: 'Screen for prediabetes and diabetes in adults with BMI ≥25 kg/m²',
        evidenceLevel: 'Grade A'
      },
      {
        guideline: 'ACC/AHA Cardiovascular Risk Assessment',
        source: 'American College of Cardiology',
        recommendation: 'Calculate 10-year ASCVD risk for adults 40-79 years',
        evidenceLevel: 'Grade B'
      }
    ];
  }

  private checkDrugInteractions(inputData: any): any[] {
    const interactions: any[] = [];

    if (inputData.medications && inputData.medications.length > 1) {
      // Mock interaction checking
      interactions.push({
        drug1: 'Metformin',
        drug2: 'Contrast dye',
        severity: 'major',
        description: 'Risk of lactic acidosis',
        recommendation: 'Discontinue metformin 48 hours before contrast procedures'
      });
    }

    return interactions;
  }

  private getPatientEducation(predictions: any): string[] {
    return [
      'Understanding your diagnosis and treatment plan',
      'Importance of medication adherence',
      'Dietary recommendations for diabetes management',
      'Exercise guidelines and physical activity goals',
      'Blood glucose monitoring techniques',
      'Recognition of hypoglycemia and hyperglycemia symptoms',
      'Foot care and complication prevention'
    ];
  }
}
