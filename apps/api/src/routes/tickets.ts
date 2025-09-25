import { FastifyPluginAsync } from 'fastify';
import { TicketController } from '../controllers';

export const ticketRoutes: FastifyPluginAsync = async (fastify) => {
  // Get controller from fastify instance
  const ticketController = fastify.controllers.ticket;
  
  // Get my tickets (current user)
  fastify.get('/me', {
    onRequest: [fastify.authenticate],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['going', 'maybe', 'waitlist', 'not_going'] },
          upcoming: { type: 'boolean', default: true },
          limit: { type: 'integer', default: 10 },
          offset: { type: 'integer', default: 0 },
        },
      },
    },
  }, (request, reply) => ticketController.getMyTickets(request, reply));

  // Create ticket type for an event
  fastify.post('/types', {
    onRequest: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['eventId', 'name', 'kind'],
        properties: {
          eventId: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          kind: { type: 'string', enum: ['free', 'paid', 'donation', 'approval'] },
          priceCents: { type: 'integer' },
          capacity: { type: 'integer' },
          section: { type: 'string' },
          salesStart: { type: 'string', format: 'date-time' },
          salesEnd: { type: 'string', format: 'date-time' },
        },
      },
    },
  }, (request, reply) => ticketController.createTicketType(request, reply));

  // Update a ticket type
  fastify.patch('/types/:id', {
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
  }, (request, reply) => ticketController.updateTicketType(request, reply));

  // Delete a ticket type
  fastify.delete('/types/:id', {
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
  }, (request, reply) => ticketController.deleteTicketType(request, reply));

  // Check in an attendee
  fastify.post('/check-in/:ticketId', {
    onRequest: [fastify.authenticate],
    schema: {
      params: {
        type: 'object',
        required: ['ticketId'],
        properties: {
          ticketId: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        properties: {
          method: { type: 'string', enum: ['qr', 'manual', 'import'] },
        },
      },
    },
  }, (request, reply) => ticketController.checkInAttendee(request, reply));

  // Get check-ins for an event
  fastify.get('/check-ins/:eventId', {
    onRequest: [fastify.authenticate],
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
          limit: { type: 'integer', default: 50 },
          offset: { type: 'integer', default: 0 },
        },
      },
    },
  }, (request, reply) => ticketController.getEventCheckIns(request, reply));
};
