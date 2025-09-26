import { FastifyReply, FastifyRequest } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

// Zod schemas for request validation
const createEventSchema = z.object({
  title: z.string().min(3).max(100),
  summary: z.string().max(250).optional(),
  description: z.string().optional(),
  coverMediaId: z.string().uuid().optional(),
  startAt: z.string().transform(val => new Date(val)),
  endAt: z.string().transform(val => new Date(val)),
  timezone: z.string(),
  venue: z.object({
    label: z.string().optional(),
    address: z.string().optional(),
    location: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
    visibility: z.enum(['public', 'fuzzy', 'private_until_rsvp']).default('public'),
  }).optional(),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  capacity: z.number().int().positive().optional(),
  visibility: z.enum(['public', 'unlisted', 'invite_only', 'approval_only']).default('public'),
  modules: z.record(z.any()).default({}),
  theme: z.record(z.any()).default({}),
  ticketTypes: z.array(z.object({
    name: z.string(),
    kind: z.enum(['free', 'paid', 'donation', 'approval']),
    priceCents: z.number().int().optional(),
    capacity: z.number().int().positive().optional(),
    section: z.string().optional(),
    salesStart: z.string().transform(val => new Date(val)).optional(),
    salesEnd: z.string().transform(val => new Date(val)).optional(),
  })).optional(),
});

const updateEventSchema = createEventSchema.partial();

const rsvpSchema = z.object({
  status: z.enum(['going', 'maybe', 'waitlist', 'not_going']),
  ticketTypeId: z.string().uuid().optional(),
  plusOnes: z.number().int().min(0).max(10).default(0),
});

export class EventController {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get events with filtering
   */
  async getEvents(
    request: FastifyRequest<{
      Querystring: {
        q?: string;
        categories?: string[];
        tags?: string[];
        lat?: number;
        lng?: number;
        radius?: number;
        startAtFrom?: string;
        startAtTo?: string;
        visibility?: 'public' | 'unlisted' | 'invite_only' | 'approval_only';
        limit?: number;
        offset?: number;
      }
    }>, 
    reply: FastifyReply
  ) {
    try {
      const { 
        q, 
        categories, 
        tags,
        lat,
        lng,
        radius = 25,
        startAtFrom,
        startAtTo,
        visibility,
        limit = 20, 
        offset = 0 
      } = request.query;
      
      // Build the where clause
      const where: any = {
        // Only show public events by default
        visibility: visibility || 'public',
      };
      
      // Text search
      if (q) {
        // Note: In a real implementation, we would use Postgres full-text search
        where.OR = [
          { title: { contains: q, mode: 'insensitive' } },
          { summary: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ];
      }
      
      // Categories filter
      if (categories && Array.isArray(categories) && categories.length > 0) {
        where.categories = {
          hasSome: categories,
        };
      }
      
      // Tags filter
      if (tags && Array.isArray(tags) && tags.length > 0) {
        where.tags = {
          hasSome: tags,
        };
      }
      
      // Date range filter
      if (startAtFrom || startAtTo) {
        where.startAt = {};
        if (startAtFrom) {
          where.startAt.gte = new Date(startAtFrom);
        }
        if (startAtTo) {
          where.startAt.lte = new Date(startAtTo);
        }
      }
      
      // Geo filter (would use PostGIS in real implementation)
      if (lat && lng && radius) {
        // For now, just placeholder
        // In real implementation, use ST_DWithin from PostGIS
        // where: { venue: { location: { near: { lat, lng }, within: radius } } }
      }
      
      // Get events
      const events = await this.prisma.event.findMany({
        where,
        include: {
          venue: true,
          coverMedia: true,
          organizer: {
            include: {
              user: {
                select: {
                  displayName: true,
                  avatarMediaId: true,
                },
              },
            },
          },
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
          startAt: 'asc',
        },
      });
      
      // Format events
      const formattedEvents = events.map(event => ({
        id: event.id,
        title: event.title,
        summary: event.summary,
        startAt: event.startAt,
        endAt: event.endAt,
        timezone: event.timezone,
        venue: event.venue,
        coverMedia: event.coverMedia,
        categories: event.categories,
        tags: event.tags,
        visibility: event.visibility,
        attendeeCount: event._count.tickets,
        organizer: {
          id: event.organizer.id,
          brandName: event.organizer.brandName,
          displayName: event.organizer.user.displayName,
          avatarMediaId: event.organizer.user.avatarMediaId,
        },
      }));
      
      // Get total count for pagination
      const total = await this.prisma.event.count({ where });
      
      return {
        events: formattedEvents,
        meta: {
          total,
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
   * Create a new event
   */
  async createEvent(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as { id: string }).id;
      const eventData = createEventSchema.parse(request.body);
      
      // Check if user has an organizer profile
      const organizerProfile = await this.prisma.organizerProfile.findUnique({
        where: { userId },
      });
      
      if (!organizerProfile) {
        return reply.status(403).send({ 
          message: 'You must create an organizer profile before creating events',
          code: 'ORGANIZER_PROFILE_REQUIRED'
        });
      }
      
      // Handle venue creation if needed
      let venueId = null;
      if (eventData.venue) {
        const venue = await this.prisma.venue.create({
          data: {
            label: eventData.venue.label,
            address: eventData.venue.address,
            location: eventData.venue.location 
              ? JSON.stringify(eventData.venue.location) as any
              : null,
            visibility: eventData.venue.visibility,
          },
        });
        venueId = venue.id;
      }
      
      // Prepare ticket types data if provided
      const ticketTypes = eventData.ticketTypes || [];
      
      // Create the event with nested ticket types
      const event = await this.prisma.event.create({
        data: {
          organizerId: organizerProfile.id,
          title: eventData.title,
          summary: eventData.summary,
          description: eventData.description,
          coverMediaId: eventData.coverMediaId,
          startAt: eventData.startAt,
          endAt: eventData.endAt,
          timezone: eventData.timezone,
          venueId,
          categories: eventData.categories,
          tags: eventData.tags,
          capacity: eventData.capacity,
          visibility: eventData.visibility,
          modules: eventData.modules,
          theme: eventData.theme,
          ticketTypes: {
            create: ticketTypes.map(tt => ({
              name: tt.name,
              kind: tt.kind,
              priceCents: tt.priceCents,
              capacity: tt.capacity,
              section: tt.section,
              salesStart: tt.salesStart,
              salesEnd: tt.salesEnd,
            })),
          },
        },
        include: {
          venue: true,
          ticketTypes: true,
        },
      });
      
      // Auto-create a 'general' ticket type if none specified
      if (ticketTypes.length === 0) {
        await this.prisma.ticketType.create({
          data: {
            eventId: event.id,
            name: 'General Admission',
            kind: 'free',
          },
        });
      }
      
      return reply.status(201).send(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Invalid input data', errors: error.errors });
      }
      
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to create event' });
    }
  }

  /**
   * Get a single event by ID
   */
  async getEventById(
    request: FastifyRequest<{ Params: { id: string } }>, 
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      
      const event = await this.prisma.event.findUnique({
        where: { id },
        include: {
          venue: true,
          coverMedia: true,
          organizer: {
            include: {
              user: {
                select: {
                  displayName: true,
                  avatarMediaId: true,
                },
              },
            },
          },
          ticketTypes: true,
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
      });
      
      if (!event) {
        return reply.status(404).send({ message: 'Event not found' });
      }
      
      // Check user's RSVP status if authenticated
      let userTicket = null;
      if (request.headers.authorization) {
        try {
          await request.jwtVerify();
          const userId = (request.user as { id: string }).id;
          
          userTicket = await this.prisma.ticket.findUnique({
            where: {
              eventId_userId: {
                eventId: id,
                userId,
              },
            },
          });
        } catch (err) {
          // Ignore auth errors, just don't include user ticket info
        }
      }
      
      // Format the event with attendee count and user ticket info
      const formattedEvent = {
        ...event,
        attendeeCount: event._count.tickets,
        userRsvpStatus: userTicket?.status || null,
        _count: undefined,
        organizer: {
          id: event.organizer.id,
          brandName: event.organizer.brandName,
          displayName: event.organizer.user.displayName,
          avatarMediaId: event.organizer.user.avatarMediaId,
        },
      };
      
      return formattedEvent;
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to retrieve event' });
    }
  }

  /**
   * Update an event
   */
  async updateEvent(
    request: FastifyRequest<{
      Params: { id: string },
      Body: any
    }>, 
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const userId = (request.user as { id: string }).id;
      const updateData = updateEventSchema.parse(request.body);
      
      // Verify the user is the organizer of this event
      const event = await this.prisma.event.findUnique({
        where: { id },
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
        return reply.status(403).send({ message: 'You do not have permission to update this event' });
      }
      
      // Handle venue updates if needed
      let venueId = event.venueId;
      if (updateData.venue) {
        // If event has a venue, update it
        if (venueId) {
          await this.prisma.venue.update({
            where: { id: venueId },
            data: {
              label: updateData.venue.label,
              address: updateData.venue.address,
              location: updateData.venue.location
                ? JSON.stringify(updateData.venue.location) as any
                : undefined,
              visibility: updateData.venue.visibility,
            },
          });
        } 
        // If event doesn't have a venue, create one
        else {
          const venue = await this.prisma.venue.create({
            data: {
              label: updateData.venue.label,
              address: updateData.venue.address,
              location: updateData.venue.location
                ? JSON.stringify(updateData.venue.location) as any
                : null,
              visibility: updateData.venue.visibility,
            },
          });
          venueId = venue.id;
        }
      }
      
      // Remove venue from update data since it's handled separately
      const { venue, ticketTypes, ...eventUpdateData } = updateData;
      
      // Update the event
      const updatedEvent = await this.prisma.event.update({
        where: { id },
        data: {
          ...eventUpdateData,
          venueId,
        },
        include: {
          venue: true,
          ticketTypes: true,
        },
      });
      
      // Handle ticket type updates if provided (would be more complex in real implementation)
      if (ticketTypes && ticketTypes.length > 0) {
        // This is simplified; a real implementation would handle updates to existing ticket types
        // and would need to manage capacity changes appropriately
      }
      
      return updatedEvent;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Invalid input data', errors: error.errors });
      }
      
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to update event' });
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(
    request: FastifyRequest<{ Params: { id: string } }>, 
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const userId = (request.user as { id: string }).id;
      
      // Verify the user is the organizer of this event
      const event = await this.prisma.event.findUnique({
        where: { id },
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
        return reply.status(403).send({ message: 'You do not have permission to delete this event' });
      }
      
      // Delete the event (Prisma will cascade delete related records)
      await this.prisma.event.delete({
        where: { id },
      });
      
      return reply.status(204).send();
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to delete event' });
    }
  }

  /**
   * RSVP to an event
   */
  async rsvpToEvent(
    request: FastifyRequest<{
      Params: { id: string },
      Body: any
    }>, 
    reply: FastifyReply
  ) {
    try {
      const { id: eventId } = request.params;
      const userId = (request.user as { id: string }).id;
      const { status, ticketTypeId, plusOnes = 0 } = rsvpSchema.parse(request.body);
      
      // Get the event
      const event = await this.prisma.event.findUnique({
        where: { id: eventId },
        include: {
          ticketTypes: true,
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
      });
      
      if (!event) {
        return reply.status(404).send({ message: 'Event not found' });
      }
      
      // Check if event is at capacity
      if (event.capacity && status === 'going') {
        const currentAttendees = event._count.tickets;
        if (currentAttendees >= event.capacity) {
          // Automatically set to waitlist if capacity reached
          return reply.status(409).send({ 
            message: 'Event is at capacity',
            code: 'EVENT_AT_CAPACITY'
          });
        }
      }
      
      // Check ticket type if provided
      if (ticketTypeId) {
        const ticketType = event.ticketTypes.find(tt => tt.id === ticketTypeId);
        if (!ticketType) {
          return reply.status(400).send({ message: 'Invalid ticket type' });
        }
        
        // Check if ticket type requires approval
        if (ticketType.kind === 'approval' && status === 'going') {
          // Set status to waitlist if approval required
          return reply.status(409).send({ 
            message: 'This ticket requires approval',
            code: 'TICKET_REQUIRES_APPROVAL'
          });
        }
        
        // Check if ticket type is at capacity
        if (ticketType.capacity && status === 'going') {
          const ticketCount = await this.prisma.ticket.count({
            where: {
              eventId,
              ticketTypeId,
              status: 'going',
            },
          });
          
          if (ticketCount >= ticketType.capacity) {
            return reply.status(409).send({ 
              message: 'This ticket type is at capacity',
              code: 'TICKET_TYPE_AT_CAPACITY'
            });
          }
        }
      }
      
      // Check for existing ticket
      const existingTicket = await this.prisma.ticket.findUnique({
        where: {
          eventId_userId: {
            eventId,
            userId,
          },
        },
      });
      
      let ticket;
      
      if (existingTicket) {
        // Update existing ticket
        ticket = await this.prisma.ticket.update({
          where: {
            id: existingTicket.id,
          },
          data: {
            status,
            ticketTypeId,
            plusOnes,
          },
        });
      } else {
        // Create new ticket
        ticket = await this.prisma.ticket.create({
          data: {
            eventId,
            userId,
            status,
            ticketTypeId,
            plusOnes,
          },
        });
      }
      
      // For going or waitlist, check if we need to add to waitlist
      if (status === 'waitlist') {
        // Check for existing waitlist entry
        const existingWaitlist = await this.prisma.waitlist.findUnique({
          where: {
            eventId_userId: {
              eventId,
              userId,
            },
          },
        });
        
        if (!existingWaitlist) {
          // Get highest priority for this event
          const highestPriority = await this.prisma.waitlist.findFirst({
            where: { eventId },
            orderBy: { priority: 'desc' },
          });
          
          // Create waitlist entry with incremented priority
          await this.prisma.waitlist.create({
            data: {
              eventId,
              userId,
              priority: highestPriority ? highestPriority.priority + 1 : 1,
            },
          });
        }
      } else if (existingTicket?.status === 'waitlist' && (status as string) !== 'waitlist') {
        // Remove from waitlist if status changed from waitlist to something else
        await this.prisma.waitlist.delete({
          where: {
            eventId_userId: {
              eventId,
              userId,
            },
          },
        });
      }
      
      return {
        ticket,
        message: status === 'waitlist' 
          ? 'Added to waitlist' 
          : status === 'going'
            ? 'RSVP confirmed'
            : 'RSVP updated',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Invalid input data', errors: error.errors });
      }
      
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to RSVP' });
    }
  }

  /**
   * Get event attendees
   */
  async getEventAttendees(
    request: FastifyRequest<{
      Params: { id: string },
      Querystring: {
        status?: 'going' | 'maybe' | 'waitlist';
        limit?: number;
        offset?: number;
      }
    }>, 
    reply: FastifyReply
  ) {
    try {
      const { id: eventId } = request.params;
      const { status, limit = 20, offset = 0 } = request.query;
      
      // Check if event exists
      const event = await this.prisma.event.findUnique({
        where: { id: eventId },
      });
      
      if (!event) {
        return reply.status(404).send({ message: 'Event not found' });
      }
      
      // Filter by status if provided
      const statusFilter = status ? { status } : { status: { in: ['going', 'maybe'] } };
      
      // Get tickets with user info
      const tickets = await this.prisma.ticket.findMany({
        where: {
          eventId,
          ...statusFilter,
        },
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              avatarMediaId: true,
            },
          },
        },
        skip: offset,
        take: limit,
      });
      
      // Get total count
      const total = await this.prisma.ticket.count({
        where: {
          eventId,
          ...statusFilter,
        },
      });
      
      // Format response
      const attendees = tickets.map(ticket => ({
        id: ticket.user.id,
        displayName: ticket.user.displayName,
        avatarMediaId: ticket.user.avatarMediaId,
        status: ticket.status,
        plusOnes: ticket.plusOnes,
      }));
      
      return {
        attendees,
        meta: {
          total,
          limit,
          offset,
        },
      };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to retrieve attendees' });
    }
  }
}
