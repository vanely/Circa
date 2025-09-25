import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

// Zod schemas for request validation
const updateUserSchema = z.object({
  displayName: z.string().min(2).optional(),
  bio: z.string().optional(),
  avatarMediaId: z.string().uuid().optional(),
});

const createOrganizerProfileSchema = z.object({
  brandName: z.string().min(2),
});

export const userRoutes: FastifyPluginAsync = async (fastify) => {
  // Update user profile
  fastify.patch('/me', {
    onRequest: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        properties: {
          displayName: { type: 'string' },
          bio: { type: 'string' },
          avatarMediaId: { type: 'string', format: 'uuid' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const userId = (request.user as { id: string }).id;
      const updates = updateUserSchema.parse(request.body);
      
      const updatedUser = await fastify.prisma.user.update({
        where: { id: userId },
        data: updates,
        select: {
          id: true,
          email: true,
          displayName: true,
          bio: true,
          avatarMediaId: true,
          createdAt: true,
        },
      });
      
      return updatedUser;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Invalid input data', errors: error.errors });
      }
      
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Failed to update profile' });
    }
  });

  // Get user by ID (public profile)
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
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      
      const user = await fastify.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          displayName: true,
          bio: true,
          avatarMediaId: true,
          organizer: {
            select: {
              id: true,
              brandName: true,
              verificationStatus: true,
            },
          },
        },
      });
      
      if (!user) {
        return reply.status(404).send({ message: 'User not found' });
      }
      
      return user;
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Failed to retrieve user data' });
    }
  });

  // Create organizer profile
  fastify.post('/me/organizer', {
    onRequest: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['brandName'],
        properties: {
          brandName: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const userId = (request.user as { id: string }).id;
      const { brandName } = createOrganizerProfileSchema.parse(request.body);
      
      // Check if user already has an organizer profile
      const existingProfile = await fastify.prisma.organizerProfile.findUnique({
        where: { userId },
      });
      
      if (existingProfile) {
        return reply.status(409).send({ message: 'Organizer profile already exists' });
      }
      
      // Create new organizer profile
      const organizerProfile = await fastify.prisma.organizerProfile.create({
        data: {
          userId,
          brandName,
          verificationStatus: 'unverified',
        },
      });
      
      return organizerProfile;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Invalid input data', errors: error.errors });
      }
      
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Failed to create organizer profile' });
    }
  });

  // Get my events (attending)
  fastify.get('/me/events/attending', {
    onRequest: [fastify.authenticate],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['going', 'maybe', 'waitlist'] },
          limit: { type: 'integer', default: 10 },
          offset: { type: 'integer', default: 0 },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const userId = (request.user as { id: string }).id;
      const { status, limit = 10, offset = 0 } = request.query as { 
        status?: 'going' | 'maybe' | 'waitlist',
        limit?: number,
        offset?: number
      };
      
      const statusFilter = status ? { status } : { status: { in: ['going', 'maybe', 'waitlist'] } };
      
      const tickets = await fastify.prisma.ticket.findMany({
        where: {
          userId,
          ...statusFilter,
        },
        include: {
          event: {
            include: {
              venue: true,
              organizer: {
                include: {
                  user: {
                    select: {
                      displayName: true,
                    },
                  },
                },
              },
            },
          },
        },
        skip: offset,
        take: limit,
        orderBy: {
          event: {
            startAt: 'asc',
          },
        },
      });
      
      const events = tickets.map(ticket => ({
        ...ticket.event,
        ticketStatus: ticket.status,
      }));
      
      return {
        events,
        meta: {
          total: tickets.length,
          limit,
          offset,
        },
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Failed to retrieve events' });
    }
  });

  // Get my events (organizing)
  fastify.get('/me/events/organizing', {
    onRequest: [fastify.authenticate],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', default: 10 },
          offset: { type: 'integer', default: 0 },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const userId = (request.user as { id: string }).id;
      const { limit = 10, offset = 0 } = request.query as { limit?: number, offset?: number };
      
      // First, find the user's organizer profile
      const organizerProfile = await fastify.prisma.organizerProfile.findUnique({
        where: { userId },
      });
      
      if (!organizerProfile) {
        return reply.status(404).send({ message: 'Organizer profile not found' });
      }
      
      // Get events organized by this profile
      const events = await fastify.prisma.event.findMany({
        where: {
          organizerId: organizerProfile.id,
        },
        include: {
          venue: true,
          _count: {
            select: {
              tickets: {
                where: {
                  status: 'going',
                },
              },
            },
          },
        },
        skip: offset,
        take: limit,
        orderBy: {
          startAt: 'desc',
        },
      });
      
      // Format the events with attendee count
      const formattedEvents = events.map(event => ({
        ...event,
        attendeeCount: event._count.tickets,
        _count: undefined,
      }));
      
      return {
        events: formattedEvents,
        meta: {
          total: events.length,
          limit,
          offset,
        },
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Failed to retrieve events' });
    }
  });
};
