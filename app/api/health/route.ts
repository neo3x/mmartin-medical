import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import redis from '@/lib/cache/redis';

export async function GET() {
  const checks = {
    database: false,
    cache: false,
    timestamp: new Date().toISOString(),
  };

  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  try {
    // Check Redis
    await redis.ping();
    checks.cache = true;
  } catch (error) {
    console.error('Redis health check failed:', error);
  }

  const isHealthy = checks.database && checks.cache;
  const status = isHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'unhealthy',
      checks,
    },
    { status }
  );
}
