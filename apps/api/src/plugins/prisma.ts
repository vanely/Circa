import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';

// Declare the Prisma client in the Fastify instance
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export const prismaPlugin: FastifyPluginAsync = fp(async (fastify) => {
  const prisma = new PrismaClient();

  await prisma.$connect();

  // Add Prisma to Fastify instance
  fastify.decorate('prisma', prisma);

  // Close Prisma when Fastify closes
  fastify.addHook('onClose', async (instance) => {
    await instance.prisma.$disconnect();
  });
});
