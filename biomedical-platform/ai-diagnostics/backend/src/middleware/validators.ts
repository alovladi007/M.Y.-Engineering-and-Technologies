import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const diagnosticRequestSchema = Joi.object({
  patientId: Joi.string().uuid().required(),
  inputData: Joi.object({
    images: Joi.array().items(Joi.string()),
    labResults: Joi.array().items(Joi.object({
      testName: Joi.string().required(),
      value: Joi.alternatives().try(Joi.number(), Joi.string()).required(),
      unit: Joi.string().required(),
      testDate: Joi.date().required()
    })),
    vitalSigns: Joi.object({
      heartRate: Joi.number().min(30).max(250),
      bloodPressure: Joi.object({
        systolic: Joi.number().min(60).max(250),
        diastolic: Joi.number().min(40).max(200)
      }),
      temperature: Joi.number().min(35).max(42),
      oxygenSaturation: Joi.number().min(70).max(100),
      bmi: Joi.number().min(10).max(80)
    }),
    clinicalNotes: Joi.string(),
    symptoms: Joi.array().items(Joi.object({
      description: Joi.string().required(),
      severity: Joi.number().min(1).max(10).required(),
      onset: Joi.date().required()
    })),
    medications: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      dosage: Joi.string().required(),
      frequency: Joi.string().required()
    }))
  }).required(),
  urgency: Joi.string().valid('routine', 'urgent', 'emergency')
});

export function validateDiagnosticRequest(req: Request, res: Response, next: NextFunction): void {
  const { error } = diagnosticRequestSchema.validate(req.body, { abortEarly: false });

  if (error) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message
        }))
      }
    });
    return;
  }

  next();
}
