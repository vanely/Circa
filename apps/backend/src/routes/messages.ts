import { FastifyPluginAsync } from 'fastify';
import { MessageController } from '../controllers';

export const messageRoutes: FastifyPluginAsync = async (fastify) => {
  // Get controller from fastify instance
  const messageController = fastify.controllers.message;
  
  // Get event messages
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
          channel: { type: 'string', default: 'general' },
          beforeId: { type: 'string', format: 'uuid' },
          limit: { type: 'integer', default: 50 },
        },
      },
    },
  }, (request, reply) => messageController.getEventMessages(request as any, reply));

  // Create a new message
  fastify.post('/', {
    onRequest: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['eventId', 'body'],
        properties: {
          eventId: { type: 'string', format: 'uuid' },
          channel: { type: 'string' },
          body: { type: 'string' },
          attachments: { type: 'array', items: { type: 'string', format: 'uuid' } },
        },
      },
    },
  }, (request, reply) => messageController.createMessage(request as any, reply));

  // Delete a message
  fastify.delete('/:id', {
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
  }, (request, reply) => messageController.deleteMessage(request as any, reply));

  // Report a message
  fastify.post('/:id/report', {
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
        required: ['reason'],
        properties: {
          reason: { type: 'string' },
        },
      },
    },
  }, (request, reply) => messageController.reportMessage(request as any, reply));
};
