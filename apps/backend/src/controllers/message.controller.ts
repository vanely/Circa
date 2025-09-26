import { FastifyReply, FastifyRequest } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { WebSocketController } from './websocket.controller';
import config from '../config';

// Zod schemas for request validation
const createMessageSchema = z.object({
  eventId: z.string().uuid(),
  channel: z.string().default('general'),
  body: z.string().min(1).max(2000),
  attachments: z.array(z.string().uuid()).optional(),
});

const reportMessageSchema = z.object({
  reason: z.string().min(1).max(500),
});

export class MessageController {
  constructor(
    private prisma: PrismaClient,
    private wsController: WebSocketController
  ) {}

  /**
   * Get messages for an event
   */
  async getEventMessages(
    request: FastifyRequest<{
      Params: { eventId: string },
      Querystring: {
        channel?: string;
        beforeId?: string;
        limit?: number;
      }
    }>, 
    reply: FastifyReply
  ) {
    try {
      const { eventId } = request.params;
      const { channel = 'general', beforeId, limit = 50 } = request.query;
      
      // Verify event exists and is visible
      const event = await this.prisma.event.findFirst({
        where: {
          id: eventId,
          visibility: { in: ['public', 'unlisted'] }, // Only fetch messages for public/unlisted events
        },
      });
      
      if (!event) {
        return reply.status(404).send({ message: 'Event not found' });
      }
      
      // Check if user has RSVP'd for private events
      if (event.visibility === 'invite_only' || event.visibility === 'approval_only') {
        try {
          // Check if user is authenticated
          if (request.headers.authorization) {
            await request.jwtVerify();
            const userId = (request.user as { id: string }).id;
            
            const ticket = await this.prisma.ticket.findUnique({
              where: {
                eventId_userId: {
                  eventId,
                  userId,
                },
              },
            });
            
            if (!ticket || ticket.status !== 'going') {
              return reply.status(403).send({ message: 'You must RSVP to view messages' });
            }
          } else {
            return reply.status(403).send({ message: 'You must RSVP to view messages' });
          }
        } catch (err) {
          return reply.status(403).send({ message: 'You must RSVP to view messages' });
        }
      }
      
      // Build where clause for pagination
      const where: any = {
        eventId,
        channel,
      };
      
      if (beforeId) {
        // Get the message for its timestamp
        const refMessage = await this.prisma.message.findUnique({
          where: { id: beforeId },
          select: { createdAt: true },
        });
        
        if (refMessage) {
          where.createdAt = { lt: refMessage.createdAt };
        }
      }
      
      // Get messages
      const messages = await this.prisma.message.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              avatarMediaId: true,
            },
          },
          attachments: {
            include: {
              media: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      });
      
      // Format messages
      const formattedMessages = messages.map(message => ({
        id: message.id,
        eventId: message.eventId,
        channel: message.channel,
        body: message.body,
        createdAt: message.createdAt,
        user: message.user ? {
          id: message.user.id,
          displayName: message.user.displayName,
          avatarMediaId: message.user.avatarMediaId,
        } : null,
        attachments: message.attachments.map(att => ({
          id: att.mediaId,
          mimeType: att.media.mimeType,
          width: att.media.width,
          height: att.media.height,
          blurhash: att.media.blurhash,
          url: `https://${config.cloudflare.r2Bucket}.r2.dev/${att.media.r2Key}`,
        })),
      }));
      
      return {
        messages: formattedMessages.reverse(), // Reverse to get chronological order
        meta: {
          hasMore: messages.length === limit,
          nextCursor: messages.length > 0 ? messages[messages.length - 1].id : null,
        },
      };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to retrieve messages' });
    }
  }

  /**
   * Create a new message
   */
  async createMessage(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as { id: string }).id;
      const { eventId, channel = 'general', body, attachments = [] } = createMessageSchema.parse(request.body);
      
      // Check if event exists and chat is enabled
      const event = await this.prisma.event.findUnique({
        where: { id: eventId },
        select: {
          id: true,
          modules: true,
          visibility: true,
        },
      });
      
      if (!event) {
        return reply.status(404).send({ message: 'Event not found' });
      }
      
      // Check if chat module is enabled
      const modules = event.modules as Record<string, any>;
      if (!modules.chat) {
        return reply.status(403).send({ message: 'Chat is not enabled for this event' });
      }
      
      // For private events, check if user has RSVP'd
      if (event.visibility === 'invite_only' || event.visibility === 'approval_only') {
        const ticket = await this.prisma.ticket.findUnique({
          where: {
            eventId_userId: {
              eventId,
              userId,
            },
          },
        });
        
        if (!ticket || ticket.status !== 'going') {
          return reply.status(403).send({ message: 'You must RSVP to send messages' });
        }
      }
      
      // Validate attachments
      if (attachments.length > 0) {
        // Check if all attachments exist and belong to user
        const validAttachments = await this.prisma.media.findMany({
          where: {
            id: { in: attachments },
            createdById: userId,
          },
        });
        
        if (validAttachments.length !== attachments.length) {
          return reply.status(400).send({ 
            message: 'One or more attachments not found or do not belong to you' 
          });
        }
      }
      
      // Create message with attachments
      const message = await this.prisma.message.create({
        data: {
          eventId,
          userId,
          channel,
          body,
          attachments: {
            create: attachments.map(mediaId => ({
              media: { connect: { id: mediaId } },
            })),
          },
        },
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              avatarMediaId: true,
            },
          },
          attachments: {
            include: {
              media: true,
            },
          },
        },
      });
      
      // Format message with attachment URLs
      const formattedMessage = {
        id: message.id,
        eventId: message.eventId,
        channel: message.channel,
        body: message.body,
        createdAt: message.createdAt,
        user: message.user ? {
          id: message.user.id,
          displayName: message.user.displayName,
          avatarMediaId: message.user.avatarMediaId,
        } : null,
        attachments: message.attachments.map(att => ({
          id: att.mediaId,
          mimeType: att.media.mimeType,
          width: att.media.width,
          height: att.media.height,
          blurhash: att.media.blurhash,
          url: `https://${config.cloudflare.r2Bucket}.r2.dev/${att.media.r2Key}`,
        })),
      };
      
      // Notify WebSocket clients
      this.wsController.notifyNewMessage(formattedMessage);
      
      return reply.status(201).send(formattedMessage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Invalid input data', errors: error.errors });
      }
      
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to create message' });
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(
    request: FastifyRequest<{ Params: { id: string } }>, 
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const userId = (request.user as { id: string }).id;
      
      // Get the message
      const message = await this.prisma.message.findUnique({
        where: { id },
        include: {
          event: {
            include: {
              organizer: true,
            },
          },
        },
      });
      
      if (!message) {
        return reply.status(404).send({ message: 'Message not found' });
      }
      
      // Check if user is the message author or event organizer
      const isAuthor = message.userId === userId;
      
      let isOrganizer = false;
      if (!isAuthor) {
        const organizerProfile = await this.prisma.organizerProfile.findUnique({
          where: { userId },
        });
        
        isOrganizer = organizerProfile?.id === message.event.organizerId;
      }
      
      if (!isAuthor && !isOrganizer) {
        return reply.status(403).send({ 
          message: 'You do not have permission to delete this message' 
        });
      }
      
      // Delete message
      await this.prisma.message.delete({
        where: { id },
      });
      
      // Notify WebSocket clients
      this.wsController.notifyDeletedMessage(message.eventId, id);
      
      return reply.status(204).send();
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to delete message' });
    }
  }

  /**
   * Report a message
   */
  async reportMessage(
    request: FastifyRequest<{
      Params: { id: string },
      Body: any
    }>, 
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const { reason } = reportMessageSchema.parse(request.body);
      
      // Check if message exists
      const message = await this.prisma.message.findUnique({
        where: { id },
      });
      
      if (!message) {
        return reply.status(404).send({ message: 'Message not found' });
      }
      
      // Mark message as reported
      await this.prisma.message.update({
        where: { id },
        data: { reported: true },
      });
      
      // In a real app, would store report details and notify admins
      
      return {
        message: 'Message reported successfully. Our team will review it.',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Invalid input data', errors: error.errors });
      }
      
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to report message' });
    }
  }
}
