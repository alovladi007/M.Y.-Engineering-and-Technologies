import MLInferenceService from '../../services/MLInferenceService';

describe('MLInferenceService', () => {
  let service: MLInferenceService;

  beforeEach(() => {
    service = new MLInferenceService();
  });

  describe('runInference', () => {
    it('should return predictions for valid features', async () => {
      const features = {
        age: 45,
        bmi: 28.5,
        glucose_level: 110,
        blood_pressure_systolic: 130
      };

      const result = await service.runInference(features);

      expect(result).toHaveProperty('diagnoses');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('explanation');
      expect(result.diagnoses).toBeInstanceOf(Array);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should handle empty features gracefully', async () => {
      const features = {};

      const result = await service.runInference(features);

      expect(result).toHaveProperty('diagnoses');
      expect(result).toHaveProperty('confidence');
    });
  });
});
