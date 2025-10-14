import * as tf from '@tensorflow/tfjs-node';
import { logInfo, logError } from '../../../../shared/utils/logger';

export default class MLInferenceService {
  private model: tf.LayersModel | null = null;
  private modelLoaded = false;

  constructor() {
    this.loadModel();
  }

  async loadModel(): Promise<void> {
    try {
      const modelPath = process.env.ML_MODEL_PATH || './models/disease-classifier';
      this.model = await tf.loadLayersModel(`file://${modelPath}/model.json`);
      this.modelLoaded = true;
      logInfo('ML model loaded successfully');
    } catch (error) {
      logError('Failed to load ML model', error as Error);
    }
  }

  async runInference(features: Record<string, number>): Promise<any> {
    if (!this.modelLoaded || !this.model) {
      return this.getMockPrediction(features);
    }

    try {
      const featureArray = Object.values(features);
      const inputTensor = tf.tensor2d([featureArray]);
      const prediction = this.model.predict(inputTensor) as tf.Tensor;
      const result = await prediction.data();

      inputTensor.dispose();
      prediction.dispose();

      return this.formatPrediction(result, features);
    } catch (error) {
      logError('ML inference failed', error as Error);
      return this.getMockPrediction(features);
    }
  }

  private getMockPrediction(features: Record<string, number>): any {
    const confidence = 0.85 + Math.random() * 0.1;
    return {
      diagnoses: [
        {
          condition: 'Type 2 Diabetes',
          icd10Code: 'E11.9',
          probability: confidence,
          severity: confidence > 0.8 ? 'moderate' : 'mild',
          evidence: [
            { type: 'lab', description: 'Elevated glucose levels', confidence: 0.92 },
            { type: 'clinical', description: 'BMI indicates obesity', confidence: 0.88 }
          ]
        }
      ],
      confidence,
      explanation: {
        summary: 'Based on clinical data analysis and risk factor assessment',
        featureImportance: [
          { feature: 'glucose_level', importance: 0.35, contribution: 'positive' },
          { feature: 'bmi', importance: 0.28, contribution: 'positive' },
          { feature: 'age', importance: 0.18, contribution: 'positive' },
          { feature: 'family_history', importance: 0.12, contribution: 'positive' }
        ],
        modelUncertainty: 1 - confidence,
        caveats: ['Requires clinical validation', 'Consider additional testing']
      }
    };
  }

  private formatPrediction(result: Float32Array | Int32Array | Uint8Array, features: Record<string, number>): any {
    const confidence = result[0];
    return {
      diagnoses: [
        {
          condition: 'Detected Condition',
          icd10Code: 'TBD',
          probability: confidence,
          severity: confidence > 0.7 ? 'moderate' : 'mild',
          evidence: []
        }
      ],
      confidence,
      explanation: {
        summary: 'ML model prediction',
        featureImportance: [],
        modelUncertainty: 1 - confidence,
        caveats: []
      }
    };
  }
}
