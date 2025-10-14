import { query } from '../../../../shared/config/database';
import { uploadToS3, s3Buckets } from '../../../../shared/config/aws';

export default class FeatureStoreService {
  async extractFeatures(inputData: any): Promise<Record<string, number>> {
    const features: Record<string, number> = {};

    if (inputData.labResults) {
      inputData.labResults.forEach((lab: any) => {
        const key = `lab_${lab.testName.toLowerCase().replace(/\s/g, '_')}`;
        features[key] = parseFloat(lab.value) || 0;
      });
    }

    if (inputData.vitalSigns) {
      features.heart_rate = inputData.vitalSigns.heartRate || 72;
      features.systolic_bp = inputData.vitalSigns.bloodPressure?.systolic || 120;
      features.diastolic_bp = inputData.vitalSigns.bloodPressure?.diastolic || 80;
      features.temperature = inputData.vitalSigns.temperature || 37;
      features.oxygen_saturation = inputData.vitalSigns.oxygenSaturation || 98;
      features.bmi = inputData.vitalSigns.bmi || 25;
    }

    if (inputData.demographics) {
      const age = this.calculateAge(inputData.demographics.dateOfBirth);
      features.age = age;
      features.sex_male = inputData.demographics.sex === 'male' ? 1 : 0;
    }

    return this.normalizeFeatures(features);
  }

  async storeFeatures(diagnosticId: string, features: Record<string, number>): Promise<void> {
    try {
      await query(
        `INSERT INTO feature_vectors (diagnostic_id, features, timestamp)
         VALUES ($1, $2, NOW())
         ON CONFLICT (diagnostic_id) DO UPDATE SET features = $2, timestamp = NOW()`,
        [diagnosticId, JSON.stringify(features)]
      );

      await uploadToS3(
        s3Buckets.features,
        `diagnostics/${diagnosticId}/features.json`,
        JSON.stringify(features, null, 2)
      );
    } catch (error) {
      console.error('Failed to store features:', error);
    }
  }

  private calculateAge(dateOfBirth: Date | string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  private normalizeFeatures(features: Record<string, number>): Record<string, number> {
    const normalized: Record<string, number> = {};
    for (const [key, value] of Object.entries(features)) {
      normalized[key] = value;
    }
    return normalized;
  }
}
