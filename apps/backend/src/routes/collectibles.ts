import { FastifyPluginAsync } from 'fastify';
import { CollectibleController } from '../controllers';

export const collectibleRoutes: FastifyPluginAsync = async (fastify) => {
  // Get controller from fastify instance
  const collectibleController = fastify.controllers.collectible;
  
  // Create a new collectible
  fastify.post('/', {
    onRequest: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['eventId', 'type', 'mediaId'],
        properties: {
          eventId: { type: 'string', format: 'uuid' },
          type: { type: 'string', enum: ['avatar', 'banner', 'badge'] },
          mediaId: { type: 'string', format: 'uuid' },
          rarity: { type: 'string' },
        },
      },
    },
  }, (request, reply) => collectibleController.createCollectible(request, reply));

  // Get collectibles for an event
  fastify.get('/event/:eventId', {
    schema: {
      params: {
        type: 'object',
        required: ['eventId'],
        properties: {
          eventId: { type: 'string', format: 'uuid' },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['avatar', 'banner', 'badge'] },
        },
      },
    },
  }, (request, reply) => collectibleController.getEventCollectibles(request as any, reply));

  // Award collectible to user
  fastify.post('/:id/award', {
    onRequest: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, (request, reply) => collectibleController.awardCollectible(request as any, reply));

  // Claim a collectible
  fastify.post('/:id/claim', {
    onRequest: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, (request, reply) => collectibleController.claimCollectible(request as any, reply));

  // Get user's collectibles
  fastify.get('/user/:userId', {
    schema: {
      params: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string', format: 'uuid' },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['avatar', 'banner', 'badge'] },
        },
      },
    },
  }, (request, reply) => collectibleController.getUserCollectibles(request as any, reply));
};
