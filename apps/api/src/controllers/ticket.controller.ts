import { FastifyReply, FastifyRequest } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { WebSocketController } from './websocket.controller';

// Zod schemas for request validation
const createTicketTypeSchema = z.object({
  eventId: z.string().uuid(),
  name: z.string().min(1).max(100),
  kind: z.enum(['free', 'paid', 'donation', 'approval']),
  priceCents: z.number().int().optional(),
  capacity: z.number().int().positive().optional(),
  section: z.string().optional(),
  salesStart: z.string().transform(val => new Date(val)).optional(),
  salesEnd: z.string().transform(val => new Date(val)).optional(),
});

const checkInSchema = z.object({
  method: z.enum(['qr', 'manual', 'import']).default('manual'),
});

export class TicketController {
  constructor(
    private prisma: PrismaClient,
    private wsController: WebSocketController
  ) {}

  /**
   * Get my tickets (current user)
   */
  async getMyTickets(
    request: FastifyRequest<{
      Querystring: {
        status?: 'going' | 'maybe' | 'waitlist' | 'not_going';
        upcoming?: boolean;
        limit?: number;
        offset?: number;
      }
    }>, 
    reply: FastifyReply
  ) {
    try {
      const userId = (request.user as { id: string }).id;
      const { 
        status, 
        upcoming = true, 
        limit = 10, 
        offset = 0 
      } = request.query;
      
      // Build where clause
      const where: any = { userId };
      
      // Filter by status if provided
      if (status) {
        where.status = status;
      } else {
        where.status = { in: ['going', 'maybe', 'waitlist'] };
      }
      
      // Get tickets with event info
      const tickets = await this.prisma.ticket.findMany({
        where,
        include: {
          event: {
            include: {
              venue: true,
              coverMedia: true,
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
          ticketType: true,
        },
        skip: offset,
        take: limit,
        orderBy: [
          {
            event: {
              startAt: 'asc',
            },
          },
        ],
      });
      
      // Filter for upcoming events if requested
      const now = new Date();
      const filteredTickets = upcoming
        ? tickets.filter(ticket => ticket.event.startAt >= now)
        : tickets;
      
      // Format response
      const formattedTickets = filteredTickets.map(ticket => ({
        id: ticket.id,
        status: ticket.status,
        plusOnes: ticket.plusOnes,
        createdAt: ticket.createdAt,
        ticketType: ticket.ticketType,
        event: {
          id: ticket.event.id,
          title: ticket.event.title,
          startAt: ticket.event.startAt,
          endAt: ticket.event.endAt,
          timezone: ticket.event.timezone,
          venue: ticket.event.venue,
          coverMedia: ticket.event.coverMedia,
          organizer: {
            id: ticket.event.organizer.id,
            brandName: ticket.event.organizer.brandName,
            displayName: ticket.event.organizer.user.displayName,
          },
        },
      }));
      
      // Get total count
      const total = await this.prisma.ticket.count({ where });
      
      return {
        tickets: formattedTickets,
        meta: {
          total,
          limit,
          offset,
        },
      };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to retrieve tickets' });
    }
  }

  /**
   * Create ticket type for an event
   */
  async createTicketType(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as { id: string }).id;
      const ticketTypeData = createTicketTypeSchema.parse(request.body);
      
      // Check if event exists
      const event = await this.prisma.event.findUnique({
        where: { id: ticketTypeData.eventId },
        include: {
          organizer: true,
        },
      });
      
      if (!event) {
        return reply.status(404).send({ message: 'Event not found' });
      }
      
      // Check if user is the organizer
      const organizerProfile = await this.prisma.organizerProfile.findUnique({
        where: { userId },
      });
      
      if (!organizerProfile || organizerProfile.id !== event.organizerId) {
        return reply.status(403).send({ 
          message: 'You do not have permission to create ticket types for this event'
        });
      }
      
      // Validate paid ticket type has a price
      if (ticketTypeData.kind === 'paid' && !ticketTypeData.priceCents) {
        return reply.status(400).send({ 
          message: 'Paid tickets must have a price' 
        });
      }
      
      // Create ticket type
      const ticketType = await this.prisma.ticketType.create({
        data: {
          eventId: ticketTypeData.eventId,
          name: ticketTypeData.name,
          kind: ticketTypeData.kind,
          priceCents: ticketTypeData.priceCents,
          capacity: ticketTypeData.capacity,
          section: ticketTypeData.section,
          salesStart: ticketTypeData.salesStart,
          salesEnd: ticketTypeData.salesEnd,
        },
      });
      
      // Update event price range if this is a paid ticket
      if (ticketTypeData.kind === 'paid' && ticketTypeData.priceCents) {
        const priceCents = ticketTypeData.priceCents;
        
        // Get current min/max price
        const currentPrices = await this.prisma.ticketType.findMany({
          where: {
            eventId: ticketTypeData.eventId,
            kind: 'paid',
            priceCents: { not: null },
          },
          select: {
            priceCents: true,
          },
        });
        
        const prices = currentPrices
          .map(t => t.priceCents as number)
          .filter(price => price > 0);
        
        if (prices.length > 0) {
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          
          await this.prisma.event.update({
            where: { id: ticketTypeData.eventId },
            data: {
              priceMinCents: minPrice,
              priceMaxCents: maxPrice !== minPrice ? maxPrice : undefined,
            },
          });
        }
      }
      
      return reply.status(201).send(ticketType);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Invalid input data', errors: error.errors });
      }
      
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to create ticket type' });
    }
  }

  /**
   * Update a ticket type
   */
  async updateTicketType(
    request: FastifyRequest<{
      Params: { id: string },
      Body: any
    }>, 
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const userId = (request.user as { id: string }).id;
      const updates = createTicketTypeSchema.partial().parse(request.body);
      
      // Get ticket type with event
      const ticketType = await this.prisma.ticketType.findUnique({
        where: { id },
        include: {
          event: {
            include: {
              organizer: true,
            },
          },
        },
      });
      
      if (!ticketType) {
        return reply.status(404).send({ message: 'Ticket type not found' });
      }
      
      // Check if user is the organizer
      const organizerProfile = await this.prisma.organizerProfile.findUnique({
        where: { userId },
      });
      
      if (!organizerProfile || organizerProfile.id !== ticketType.event.organizerId) {
        return reply.status(403).send({ 
          message: 'You do not have permission to update this ticket type'
        });
      }
      
      // Update ticket type
      const updatedTicketType = await this.prisma.ticketType.update({
        where: { id },
        data: updates,
      });
      
      // Update event price range if this is a paid ticket and price was updated
      if (updates.priceCents && (ticketType.kind === 'paid' || updates.kind === 'paid')) {
        const eventId = ticketType.eventId;
        
        // Get current min/max price
        const currentPrices = await this.prisma.ticketType.findMany({
          where: {
            eventId,
            kind: 'paid',
            priceCents: { not: null },
          },
          select: {
            priceCents: true,
          },
        });
        
        const prices = currentPrices
          .map(t => t.priceCents as number)
          .filter(price => price > 0);
        
        if (prices.length > 0) {
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          
          await this.prisma.event.update({
            where: { id: eventId },
            data: {
              priceMinCents: minPrice,
              priceMaxCents: maxPrice !== minPrice ? maxPrice : undefined,
            },
          });
        } else {
          // No more paid tickets
          await this.prisma.event.update({
            where: { id: eventId },
            data: {
              priceMinCents: null,
              priceMaxCents: null,
            },
          });
        }
      }
      
      return updatedTicketType;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Invalid input data', errors: error.errors });
      }
      
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to update ticket type' });
    }
  }

  /**
   * Delete a ticket type
   */
  async deleteTicketType(
    request: FastifyRequest<{ Params: { id: string } }>, 
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const userId = (request.user as { id: string }).id;
      
      // Get ticket type with event
      const ticketType = await this.prisma.ticketType.findUnique({
        where: { id },
        include: {
          event: {
            include: {
              organizer: true,
            },
          },
        },
      });
      
      if (!ticketType) {
        return reply.status(404).send({ message: 'Ticket type not found' });
      }
      
      // Check if user is the organizer
      const organizerProfile = await this.prisma.organizerProfile.findUnique({
        where: { userId },
      });
      
      if (!organizerProfile || organizerProfile.id !== ticketType.event.organizerId) {
        return reply.status(403).send({ 
          message: 'You do not have permission to delete this ticket type'
        });
      }
      
      // Check if this is the only ticket type for the event
      const ticketTypeCount = await this.prisma.ticketType.count({
        where: { eventId: ticketType.eventId },
      });
      
      if (ticketTypeCount <= 1) {
        return reply.status(400).send({ 
          message: 'Cannot delete the only ticket type for an event'
        });
      }
      
      // Delete ticket type
      await this.prisma.ticketType.delete({
        where: { id },
      });
      
      // Update event price range if this was a paid ticket
      if (ticketType.kind === 'paid' && ticketType.priceCents) {
        const eventId = ticketType.eventId;
        
        // Get current min/max price
        const currentPrices = await this.prisma.ticketType.findMany({
          where: {
            eventId,
            kind: 'paid',
            priceCents: { not: null },
          },
          select: {
            priceCents: true,
          },
        });
        
        const prices = currentPrices
          .map(t => t.priceCents as number)
          .filter(price => price > 0);
        
        if (prices.length > 0) {
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          
          await this.prisma.event.update({
            where: { id: eventId },
            data: {
              priceMinCents: minPrice,
              priceMaxCents: maxPrice !== minPrice ? maxPrice : undefined,
            },
          });
        } else {
          // No more paid tickets
          await this.prisma.event.update({
            where: { id: eventId },
            data: {
              priceMinCents: null,
              priceMaxCents: null,
            },
          });
        }
      }
      
      return reply.status(204).send();
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to delete ticket type' });
    }
  }

  /**
   * Check in an attendee
   */
  async checkInAttendee(
    request: FastifyRequest<{
      Params: { ticketId: string },
      Body: any
    }>, 
    reply: FastifyReply
  ) {
    try {
      const { ticketId } = request.params;
      const authUserId = (request.user as { id: string }).id;
      const { method = 'manual' } = checkInSchema.parse(request.body);
      
      // Get ticket with event and user info
      const ticket = await this.prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
          event: {
            include: {
              organizer: true,
            },
          },
          user: true,
        },
      });
      
      if (!ticket) {
        return reply.status(404).send({ message: 'Ticket not found' });
      }
      
      // Check if ticket status is 'going'
      if (ticket.status !== 'going') {
        return reply.status(400).send({ message: 'Cannot check in a non-going ticket' });
      }
      
      // Check if user has permission to check in attendees for this event
      // For now, only organizer can check in attendees
      const organizerProfile = await this.prisma.organizerProfile.findUnique({
        where: { userId: authUserId },
      });
      
      if (!organizerProfile || organizerProfile.id !== ticket.event.organizerId) {
        return reply.status(403).send({ 
          message: 'You do not have permission to check in attendees for this event'
        });
      }
      
      // Check if already checked in
      const existingCheckin = await this.prisma.checkin.findFirst({
        where: {
          eventId: ticket.eventId,
          userId: ticket.userId,
        },
      });
      
      if (existingCheckin) {
        return reply.status(409).send({ 
          message: 'Attendee already checked in',
          checkin: existingCheckin,
        });
      }
      
      // Create check-in record
      const checkin = await this.prisma.checkin.create({
        data: {
          eventId: ticket.eventId,
          userId: ticket.userId,
          method,
        },
        include: {
          user: {
            select: {
              displayName: true,
              avatarMediaId: true,
            },
          },
        },
      });
      
      // Notify via WebSocket
      this.wsController.notifyCheckIn(ticket.eventId, ticket.userId, checkin.at);
      
      return {
        checkin,
        user: {
          id: ticket.user.id,
          displayName: ticket.user.displayName,
          avatarMediaId: ticket.user.avatarMediaId,
        },
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Invalid input data', errors: error.errors });
      }
      
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to check in attendee' });
    }
  }

  /**
   * Get check-ins for an event
   */
  async getEventCheckIns(
    request: FastifyRequest<{
      Params: { eventId: string },
      Querystring: {
        limit?: number;
        offset?: number;
      }
    }>, 
    reply: FastifyReply
  ) {
    try {
      const { eventId } = request.params;
      const userId = (request.user as { id: string }).id;
      const { limit = 50, offset = 0 } = request.query;
      
      // Verify user has permission to view check-ins
      const organizerProfile = await this.prisma.organizerProfile.findUnique({
        where: { userId },
      });
      
      if (!organizerProfile) {
        return reply.status(403).send({ 
          message: 'Only event organizers can view check-ins'
        });
      }
      
      // Check if this user is the organizer for this event
      const event = await this.prisma.event.findFirst({
        where: {
          id: eventId,
          organizerId: organizerProfile.id,
        },
      });
      
      if (!event) {
        return reply.status(403).send({ 
          message: 'You do not have permission to view check-ins for this event'
        });
      }
      
      // Get check-ins
      const checkins = await this.prisma.checkin.findMany({
        where: { eventId },
        include: {
          user: {
            select: {
              displayName: true,
              email: true,
              avatarMediaId: true,
            },
          },
        },
        orderBy: {
          at: 'desc',
        },
        skip: offset,
        take: limit,
      });
      
      // Get total count
      const total = await this.prisma.checkin.count({ 
        where: { eventId } 
      });
      
      // Get expected attendee count
      const expectedCount = await this.prisma.ticket.count({
        where: {
          eventId,
          status: 'going',
        },
      });
      
      return {
        checkins,
        meta: {
          total,
          limit,
          offset,
          expectedCount,
          checkInRate: expectedCount > 0 ? total / expectedCount : 0,
        },
      };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to retrieve check-ins' });
    }
  }
}
