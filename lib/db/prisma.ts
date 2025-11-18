import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Helper function to handle Prisma disconnect
export async function disconnectPrisma() {
  await prisma.$disconnect();
}

// Middleware for soft deletes (if needed)
prisma.$use(async (params, next) => {
  // Add any custom middleware logic here
  return next(params);
});

export default prisma;
