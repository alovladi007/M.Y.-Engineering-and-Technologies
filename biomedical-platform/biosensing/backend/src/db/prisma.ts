/**
 * Prisma Client instance
 */

import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'error' },
          { emit: 'event', level: 'warn' },
        ]
      : [{ emit: 'event', level: 'error' }],
});

// Log queries in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query' as never, (e: any) => {
    logger.debug('Prisma Query', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    });
  });
}

// Log errors
prisma.$on('error' as never, (e: any) => {
  logger.error('Prisma Error', { error: e });
});

// Log warnings
prisma.$on('warn' as never, (e: any) => {
  logger.warn('Prisma Warning', { warning: e });
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('Prisma client disconnected');
});

export default prisma;
