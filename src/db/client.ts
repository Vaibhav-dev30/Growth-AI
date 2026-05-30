import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

declare var process: any;


export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

process.on('beforeExit', async () => {
  logger.info('Disconnecting Prisma Client');
  await prisma.$disconnect();
});


