/**
 * API Routes Setup
 */

import { Application } from 'express';
import devicesRouter from './devices';
import patientsRouter from './patients';
import readingsRouter from './readings';
import alertsRouter from './alerts';
import sessionsRouter from './sessions';
import { notFoundHandler } from '../middleware/errorHandler';

export function setupRoutes(app: Application): void {
  const apiPrefix = '/api/v1';

  // Register route handlers
  app.use(`${apiPrefix}/devices`, devicesRouter);
  app.use(`${apiPrefix}/patients`, patientsRouter);
  app.use(`${apiPrefix}/readings`, readingsRouter);
  app.use(`${apiPrefix}/alerts`, alertsRouter);
  app.use(`${apiPrefix}/sessions`, sessionsRouter);

  // 404 handler
  app.use(notFoundHandler);
}
