import { FastifyReply, FastifyRequest } from 'fastify';
import { PrismaClient } from '@prisma/client';
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

export class UserController {
  constructor(private prisma: PrismaClient) {}

  /**
   * Update user profile
   */
  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as { id: string }).id;
      const updates = updateUserSchema.parse(request.body);
      
      const updatedUser = await this.prisma.user.update({
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
      
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to update profile' });
    }
  }

  /**
   * Get public user profile by ID
   */
  async getUserById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      
      const user = await this.prisma.user.findUnique({
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
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to retrieve user data' });
    }
  }

  /**
   * Create organizer profile for current user
   */
  async createOrganizerProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as { id: string }).id;
      const { brandName } = createOrganizerProfileSchema.parse(request.body);
      
      // Check if user already has an organizer profile
      const existingProfile = await this.prisma.organizerProfile.findUnique({
        where: { userId },
      });
      
      if (existingProfile) {
        return reply.status(409).send({ message: 'Organizer profile already exists' });
      }
      
      // Create new organizer profile
      const organizerProfile = await this.prisma.organizerProfile.create({
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
      
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to create organizer profile' });
    }
  }

  /**
   * Get events the user is attending
   */
  async getAttendingEvents(
    request: FastifyRequest<{
      Querystring: {
        status?: 'going' | 'maybe' | 'waitlist',
        limit?: number,
        offset?: number
      }
    }>, 
    reply: FastifyReply
  ) {
    try {
      const userId = (request.user as { id: string }).id;
      const { status, limit = 10, offset = 0 } = request.query;
      
      const statusFilter = status ? { status } : { status: { in: ['going', 'maybe', 'waitlist'] } };
      
      const tickets = await this.prisma.ticket.findMany({
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
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to retrieve events' });
    }
  }

  /**
   * Get events the user is organizing
   */
  async getOrganizingEvents(
    request: FastifyRequest<{
      Querystring: {
        limit?: number,
        offset?: number
      }
    }>, 
    reply: FastifyReply
  ) {
    try {
      const userId = (request.user as { id: string }).id;
      const { limit = 10, offset = 0 } = request.query;
      
      // First, find the user's organizer profile
      const organizerProfile = await this.prisma.organizerProfile.findUnique({
        where: { userId },
      });
      
      if (!organizerProfile) {
        return reply.status(404).send({ message: 'Organizer profile not found' });
      }
      
      // Get events organized by this profile
      const events = await this.prisma.event.findMany({
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
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to retrieve events' });
    }
  }
}
