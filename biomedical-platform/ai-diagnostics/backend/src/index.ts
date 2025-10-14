/**
 * AI-Powered Diagnostics Backend Server
 * Main entry point for the AI diagnostics microservice
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';
import { config } from 'dotenv';
import { testDatabaseConnection } from '../../../shared/config/database';
import { logInfo, logError, requestLogger } from '../../../shared/utils/logger';

// Import routes
import diagnosticsRouter from './routes/diagnostics';
import drugDiscoveryRouter from './routes/drug-discovery';
import riskAssessmentRouter from './routes/risk-assessment';
import healthRouter from './routes/health';

// Load environment variables
config();

// Initialize Express app
const app: Application = express();
const PORT = process.env.PORT || 5001;
const API_VERSION = process.env.API_VERSION || 'v1';

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS configuration
const corsOptions = {
  origin: (process.env.CORS_ORIGINS || 'http://localhost:3001').split(','),
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Request logging
app.use(requestLogger);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(`/api/${API_VERSION}`, limiter);

// ============================================================================
// ROUTES
// ============================================================================

// Health check (no rate limiting)
app.use('/health', healthRouter);
app.use('/ping', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use(`/api/${API_VERSION}/diagnostics`, diagnosticsRouter);
app.use(`/api/${API_VERSION}/drug-discovery`, drugDiscoveryRouter);
app.use(`/api/${API_VERSION}/risk-assessment`, riskAssessmentRouter);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'AI-Powered Diagnostics',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      diagnostics: `/api/${API_VERSION}/diagnostics`,
      drugDiscovery: `/api/${API_VERSION}/drug-discovery`,
      riskAssessment: `/api/${API_VERSION}/risk-assessment`,
    },
    documentation: '/api/docs',
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.path}`,
    },
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logError('Unhandled error', err, {
    requestId: (req as any).requestId,
    method: req.method,
    url: req.url,
    userId: (req as any).user?.id,
  });

  const statusCode = (err as any).statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(statusCode).json({
    success: false,
    error: {
      code: (err as any).code || 'INTERNAL_ERROR',
      message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

async function startServer() {
  try {
    // Test database connection
    logInfo('Testing database connection...');
    const dbConnected = await testDatabaseConnection();

    if (!dbConnected) {
      throw new Error('Database connection failed');
    }

    // Initialize ML models (placeholder for now)
    logInfo('Loading ML models...');
    // TODO: Load TensorFlow models here

    // Start server
    app.listen(PORT, () => {
      logInfo(`🚀 AI Diagnostics service started successfully`, {
        port: PORT,
        environment: process.env.NODE_ENV,
        apiVersion: API_VERSION,
      });
      logInfo(`📊 Health check: http://localhost:${PORT}/health`);
      logInfo(`📚 API docs: http://localhost:${PORT}/api/docs`);
    });
  } catch (error) {
    logError('Failed to start server', error as Error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logInfo('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logInfo('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

export default app;
