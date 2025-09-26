import { FastifyPluginAsync } from 'fastify';
import { VenueController } from '../controllers';

export const venueRoutes: FastifyPluginAsync = async (fastify) => {
  // Get controller from fastify instance
  const venueController = fastify.controllers.venue;
  
  // Create a new venue
  fastify.post('/', {
    onRequest: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          address: { type: 'string' },
          location: {
            type: 'object',
            properties: {
              lat: { type: 'number' },
              lng: { type: 'number' },
            },
            required: ['lat', 'lng'],
          },
          visibility: { 
            type: 'string', 
            enum: ['public', 'fuzzy', 'private_until_rsvp'] 
          },
        },
      },
    },
  }, (request, reply) => venueController.createVenue(request as any, reply));

  // Get venues near a location
  fastify.get('/near', {
    schema: {
      querystring: {
        type: 'object',
        required: ['lat', 'lng'],
        properties: {
          lat: { type: 'number' },
          lng: { type: 'number' },
          radius: { type: 'number', default: 25 }, // km
          limit: { type: 'integer', default: 20 },
        },
      },
    },
  }, (request, reply) => venueController.getNearbyVenues(request as any, reply));

  // Get venue by ID
  fastify.get('/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, (request, reply) => venueController.getVenueById(request as any, reply));

  // Update venue
  fastify.patch('/:id', {
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
  }, (request, reply) => venueController.updateVenue(request as any, reply));
};
