/**
 * Biosensing Technology Backend
 * Real-time biosensor data processing with AWS IoT Core integration
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import dotenv from 'dotenv';
import logger from './utils/logger';
import { IoTDeviceManager } from './services/IoTDeviceManager';
import { BiosensorDataProcessor } from './services/BiosensorDataProcessor';
import { setupRoutes } from './routes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app: Application = express();
const httpServer = createServer(app);

// Socket.IO server for real-time communication
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });
  next();
});

// Initialize IoT Device Manager
const iotDeviceManager = new IoTDeviceManager(io);
const biosensorProcessor = new BiosensorDataProcessor(io);

// Store in app context
app.locals.iotDeviceManager = iotDeviceManager;
app.locals.biosensorProcessor = biosensorProcessor;

// Connect IoT Device Manager events to Biosensor Processor
iotDeviceManager.on('biosensor:data', async (event: any) => {
  await biosensorProcessor.processReading(
    event.deviceId,
    event.patientId,
    event.data
  );
});

// Handle processed readings - store in database
biosensorProcessor.on('biosensor:processed', async (event: any) => {
  try {
    const prisma = (await import('./db/prisma')).default;

    await prisma.biosensorReading.create({
      data: {
        deviceId: event.deviceId,
        patientId: event.patientId,
        sensorType: event.reading.sensor_type,
        value: event.reading.value,
        unit: event.reading.unit,
        timestamp: new Date(event.reading.timestamp),
        qualityScore: event.reading.quality_score,
        isAnomaly: event.reading.is_anomaly,
        anomalyScore: event.reading.anomaly_score,
        metadata: event.reading.metadata,
      },
    });
  } catch (error) {
    logger.error('Failed to store biosensor reading', { error });
  }
});

// Handle alerts - store in database
biosensorProcessor.on('biosensor:alerts', async (event: any) => {
  try {
    const prisma = (await import('./db/prisma')).default;

    for (const alert of event.alerts) {
      await prisma.alert.create({
        data: {
          deviceId: event.deviceId,
          patientId: event.patientId,
          level: alert.level,
          message: alert.message,
          thresholdType: alert.threshold_type,
        },
      });
    }

    logger.warn('Alerts generated', {
      deviceId: event.deviceId,
      patientId: event.patientId,
      alertCount: event.alerts.length,
    });
  } catch (error) {
    logger.error('Failed to store alerts', { error });
  }
});

// Setup routes
setupRoutes(app);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'biosensing-backend',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'Biosensing Technology Backend',
    version: process.env.npm_package_version || '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/v1',
      docs: '/api/docs',
    },
  });
});

// Error handling
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info('WebSocket client connected', { socketId: socket.id });

  // Join device room
  socket.on('subscribe:device', (deviceId: string) => {
    socket.join(`device:${deviceId}`);
    logger.info('Client subscribed to device', { socketId: socket.id, deviceId });
  });

  // Join patient room
  socket.on('subscribe:patient', (patientId: string) => {
    socket.join(`patient:${patientId}`);
    logger.info('Client subscribed to patient', { socketId: socket.id, patientId });
  });

  // Unsubscribe
  socket.on('unsubscribe', (room: string) => {
    socket.leave(room);
    logger.info('Client unsubscribed', { socketId: socket.id, room });
  });

  // Disconnect
  socket.on('disconnect', () => {
    logger.info('WebSocket client disconnected', { socketId: socket.id });
  });

  // Handle errors
  socket.on('error', (error) => {
    logger.error('WebSocket error', { socketId: socket.id, error });
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');

  // Close Socket.IO connections
  io.close(() => {
    logger.info('Socket.IO server closed');
  });

  // Disconnect IoT devices
  await iotDeviceManager.disconnectAll();

  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');

  io.close(() => {
    logger.info('Socket.IO server closed');
  });

  await iotDeviceManager.disconnectAll();

  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 5003;

httpServer.listen(PORT, () => {
  logger.info(`🚀 Biosensing Backend started on port ${PORT}`);
  logger.info(`📡 WebSocket server ready for real-time data streaming`);
  logger.info(`☁️  AWS IoT Core integration enabled`);
});

export { app, io, iotDeviceManager, biosensorProcessor };
