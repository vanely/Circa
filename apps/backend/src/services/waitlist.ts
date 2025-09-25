import { PrismaClient } from '@prisma/client';
import { WebSocketController } from '../controllers/websocket.controller';
import { emailService } from './email';

export class WaitlistService {
  constructor(
    private prisma: PrismaClient,
    private wsController: WebSocketController
  ) {}

  /**
   * Process promotions from waitlist for an event
   * Called when a spot opens up (attendee cancels or capacity increases)
   */
  async processWaitlistPromotions(eventId: string): Promise<void> {
    // Get the event with its capacity
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        capacity: true,
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
      throw new Error(`Event not found: ${eventId}`);
    }

    // Calculate available spots
    const currentAttendees = event._count.tickets;
    const availableSpots = event.capacity ? event.capacity - currentAttendees : 1; // If no capacity set, promote 1

    if (availableSpots <= 0) {
      return; // No spots available
    }

    // Get users on the waitlist ordered by priority
    const waitlistEntries = await this.prisma.waitlist.findMany({
      where: {
        eventId,
        ticket: {
          status: 'waitlist',
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
        ticket: true,
      },
      orderBy: {
        priority: 'asc', // Lower number = higher priority
      },
      take: availableSpots,
    });

    // Promote each user from the waitlist
    for (const entry of waitlistEntries) {
      await this.prisma.$transaction(async (tx) => {
        // Update the ticket status to 'going'
        await tx.ticket.update({
          where: { id: entry.ticket.id },
          data: { status: 'going' },
        });

        // Remove from waitlist
        await tx.waitlist.delete({
          where: {
            eventId_userId: {
              eventId,
              userId: entry.userId,
            },
          },
        });
      });

      // Notify the user via WebSocket
      this.wsController.notifyWaitlistPromotion(eventId, entry.userId, entry.priority);

      // Send email notification
      try {
        // Get the event details for the email
        const eventDetails = await this.prisma.event.findUnique({
          where: { id: eventId },
          include: {
            organizer: {
              include: {
                user: {
                  select: { displayName: true },
                },
              },
            },
          },
        });

        if (eventDetails) {
          const eventDate = new Date(eventDetails.startAt).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          await emailService.sendEventInvitation(
            entry.user.email,
            eventDetails.title,
            eventDetails.organizer.user.displayName,
            eventDate,
            `https://circa.app/events/${eventId}`,
            'https://circa.app'
          );
        }
      } catch (error) {
        console.error('Failed to send waitlist promotion email:', error);
        // Continue even if email fails
      }
    }
  }

  /**
   * Handle event capacity change
   * Called when an event's capacity is updated
   */
  async handleCapacityChange(eventId: string, oldCapacity: number, newCapacity: number): Promise<void> {
    // Only process if capacity increased
    if (newCapacity > oldCapacity) {
      const additionalSpots = newCapacity - oldCapacity;
      
      // Get current attendee count
      const attendeeCount = await this.prisma.ticket.count({
        where: {
          eventId,
          status: 'going',
        },
      });
      
      // Check if we have room to promote from waitlist
      const availableSpots = newCapacity - attendeeCount;
      
      if (availableSpots > 0) {
        await this.processWaitlistPromotions(eventId);
      }
    }
  }

  /**
   * Handle RSVP cancellation
   * Called when a user cancels their RSVP
   */
  async handleRsvpCancellation(eventId: string): Promise<void> {
    // Check if the event has a waitlist
    const waitlistCount = await this.prisma.waitlist.count({
      where: { eventId },
    });
    
    if (waitlistCount > 0) {
      // Process waitlist promotions
      await this.processWaitlistPromotions(eventId);
    }
  }
}
