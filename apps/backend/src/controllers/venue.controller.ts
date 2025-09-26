import { FastifyReply, FastifyRequest } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

// Zod schemas for request validation
const createVenueSchema = z.object({
  label: z.string().optional(),
  address: z.string().optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  visibility: z.enum(['public', 'fuzzy', 'private_until_rsvp']).default('public'),
});

export class VenueController {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new venue
   */
  async createVenue(request: FastifyRequest, reply: FastifyReply) {
    try {
      const venueData = createVenueSchema.parse(request.body);
      
      // Convert location to JSON for storage
      const locationJson = venueData.location 
        ? JSON.stringify(venueData.location) as any
        : null;
      
      const venue = await this.prisma.venue.create({
        data: {
          label: venueData.label,
          address: venueData.address,
          location: locationJson,
          visibility: venueData.visibility,
        },
      });
      
      return reply.status(201).send(venue);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Invalid input data', errors: error.errors });
      }
      
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to create venue' });
    }
  }

  /**
   * Get venues near a location
   */
  async getNearbyVenues(
    request: FastifyRequest<{
      Querystring: {
        lat: number;
        lng: number;
        radius?: number;
        limit?: number;
      }
    }>, 
    reply: FastifyReply
  ) {
    try {
      const { lat, lng, radius = 25, limit = 20 } = request.query;
      
      // In a real implementation, this would use PostGIS for geo queries
      // For now, we'll simulate with a basic query
      // ST_DWithin(venue.location, ST_MakePoint(lng, lat)::geography, radius * 1000)
      
      // This is a simplified placeholder approach
      const venues = await this.prisma.venue.findMany({
        where: {
          visibility: 'public', // Only show public venues
          // In real implementation, would have a geo query here
        },
        take: limit,
      });
      
      // For demo purposes, we'll filter venues with mock distance
      const filteredVenues = venues
        .filter(venue => {
          if (!venue.location) return false;
          
          // Parse location from JSON
          const location = JSON.parse(venue.location as string);
          
          // Calculate rough distance (not accurate, just for demo)
          const latDiff = location.lat - lat;
          const lngDiff = location.lng - lng;
          const roughDistance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // ~111km per degree
          
          return roughDistance <= radius;
        })
        .map(venue => {
          const location = venue.location 
            ? JSON.parse(venue.location as string) 
            : null;
          
          return {
            ...venue,
            location,
          };
        });
      
      return {
        venues: filteredVenues,
        meta: {
          total: filteredVenues.length,
        },
      };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to retrieve venues' });
    }
  }

  /**
   * Get venue by ID
   */
  async getVenueById(
    request: FastifyRequest<{ Params: { id: string } }>, 
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      
      const venue = await this.prisma.venue.findUnique({
        where: { id },
        include: {
          events: {
            where: {
              visibility: 'public',
              startAt: {
                gte: new Date(),
              },
            },
            select: {
              id: true,
              title: true,
              startAt: true,
              endAt: true,
              coverMediaId: true,
            },
            orderBy: {
              startAt: 'asc',
            },
            take: 5,
          },
        },
      });
      
      if (!venue) {
        return reply.status(404).send({ message: 'Venue not found' });
      }
      
      // Parse location from JSON if exists
      const location = venue.location 
        ? JSON.parse(venue.location as string) 
        : null;
      
      return {
        ...venue,
        location,
      };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to retrieve venue' });
    }
  }

  /**
   * Update venue
   */
  async updateVenue(
    request: FastifyRequest<{
      Params: { id: string },
      Body: any
    }>, 
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const updates = createVenueSchema.partial().parse(request.body);
      
      // In a real application, would need to verify that the user has permission to update this venue
      // This would typically involve checking if they are the creator of any events using this venue
      
      // Convert location to JSON for storage if provided
      const locationJson = updates.location 
        ? JSON.stringify(updates.location) as any
        : undefined;
      
      const venue = await this.prisma.venue.update({
        where: { id },
        data: {
          label: updates.label,
          address: updates.address,
          location: locationJson,
          visibility: updates.visibility,
        },
      });
      
      // Parse location from JSON if exists
      const location = venue.location 
        ? JSON.parse(venue.location as string) 
        : null;
      
      return {
        ...venue,
        location,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Invalid input data', errors: error.errors });
      }
      
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to update venue' });
    }
  }
}
