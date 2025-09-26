import { FastifyPluginAsync } from 'fastify';
import { AuthController } from '../controllers';

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Get controller from fastify instance
  const authController = fastify.controllers.auth;
  
  // Request a magic link
  fastify.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
        },
      },
    },
  }, (request, reply) => authController.sendMagicLink(request as any, reply));

  // Verify a magic link token
  fastify.post('/verify', {
    schema: {
      body: {
        type: 'object',
        required: ['token'],
        properties: {
          token: { type: 'string' },
        },
      },
    },
  }, (request, reply) => authController.verifyMagicLink(request as any, reply));

  // Get current user
  fastify.get('/me', {
    onRequest: [fastify.authenticate],
  }, (request, reply) => authController.getCurrentUser(request as any, reply));

  // Logout (client-side only, but we'll add an endpoint for symmetry)
  fastify.post('/logout', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    // JWT tokens can't be invalidated, but we'll return a success message
    return reply.status(200).send({ message: 'Logged out successfully' });
  });
};
