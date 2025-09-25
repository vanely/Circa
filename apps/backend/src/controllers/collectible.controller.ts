import { FastifyReply, FastifyRequest } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import config from '../config';

// Zod schemas for request validation
const createCollectibleSchema = z.object({
  eventId: z.string().uuid(),
  type: z.enum(['avatar', 'banner', 'badge']),
  mediaId: z.string().uuid(),
  rarity: z.string().optional(),
});

const awardCollectibleSchema = z.object({
  userId: z.string().uuid(),
});

export class CollectibleController {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new collectible
   */
  async createCollectible(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = (request.user as { id: string }).id;
      const collectibleData = createCollectibleSchema.parse(request.body);
      
      // Check if event exists and user is the organizer
      const event = await this.prisma.event.findUnique({
        where: { id: collectibleData.eventId },
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
          message: 'Only the event organizer can create collectibles' 
        });
      }
      
      // Check if media exists
      const media = await this.prisma.media.findUnique({
        where: { id: collectibleData.mediaId },
      });
      
      if (!media) {
        return reply.status(404).send({ message: 'Media not found' });
      }
      
      // Create collectible
      const collectible = await this.prisma.collectible.create({
        data: {
          eventId: collectibleData.eventId,
          type: collectibleData.type,
          mediaId: collectibleData.mediaId,
          rarity: collectibleData.rarity,
        },
        include: {
          media: true,
        },
      });
      
      return reply.status(201).send(collectible);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Invalid input data', errors: error.errors });
      }
      
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to create collectible' });
    }
  }

  /**
   * Get collectibles for an event
   */
  async getEventCollectibles(
    request: FastifyRequest<{
      Params: { eventId: string },
      Querystring: { type?: 'avatar' | 'banner' | 'badge' }
    }>, 
    reply: FastifyReply
  ) {
    try {
      const { eventId } = request.params;
      const { type } = request.query;
      
      // Check if event exists
      const event = await this.prisma.event.findUnique({
        where: { id: eventId },
      });
      
      if (!event) {
        return reply.status(404).send({ message: 'Event not found' });
      }
      
      // Get collectibles
      const where: any = { eventId };
      if (type) {
        where.type = type;
      }
      
      const collectibles = await this.prisma.collectible.findMany({
        where,
        include: {
          media: true,
          _count: {
            select: {
              userCollectibles: true,
            },
          },
        },
      });
      
      // Format collectibles with media URLs
      const formattedCollectibles = collectibles.map(collectible => ({
        id: collectible.id,
        eventId: collectible.eventId,
        type: collectible.type,
        rarity: collectible.rarity,
        media: {
          id: collectible.media.id,
          mimeType: collectible.media.mimeType,
          width: collectible.media.width,
          height: collectible.media.height,
          blurhash: collectible.media.blurhash,
          url: `https://${config.cloudflare.r2Bucket}.r2.dev/${collectible.media.r2Key}`,
        },
        userCount: collectible._count.userCollectibles,
      }));
      
      return { collectibles: formattedCollectibles };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to retrieve collectibles' });
    }
  }

  /**
   * Award collectible to user
   */
  async awardCollectible(
    request: FastifyRequest<{
      Params: { id: string },
      Body: { userId: string }
    }>, 
    reply: FastifyReply
  ) {
    try {
      const { id: collectibleId } = request.params;
      const { userId: targetUserId } = awardCollectibleSchema.parse(request.body);
      const authUserId = (request.user as { id: string }).id;
      
      // Check if collectible exists
      const collectible = await this.prisma.collectible.findUnique({
        where: { id: collectibleId },
        include: {
          event: {
            include: {
              organizer: true,
            },
          },
        },
      });
      
      if (!collectible) {
        return reply.status(404).send({ message: 'Collectible not found' });
      }
      
      // Check if user is the organizer
      const organizerProfile = await this.prisma.organizerProfile.findUnique({
        where: { userId: authUserId },
      });
      
      if (!organizerProfile || organizerProfile.id !== collectible.event.organizerId) {
        return reply.status(403).send({ 
          message: 'Only the event organizer can award collectibles' 
        });
      }
      
      // Check if target user exists
      const targetUser = await this.prisma.user.findUnique({
        where: { id: targetUserId },
      });
      
      if (!targetUser) {
        return reply.status(404).send({ message: 'User not found' });
      }
      
      // Check if user already has this collectible
      const existing = await this.prisma.userCollectible.findUnique({
        where: {
          userId_collectibleId: {
            userId: targetUserId,
            collectibleId,
          },
        },
      });
      
      if (existing) {
        return reply.status(409).send({ message: 'User already has this collectible' });
      }
      
      // Award collectible
      await this.prisma.userCollectible.create({
        data: {
          userId: targetUserId,
          collectibleId,
        },
      });
      
      return {
        message: 'Collectible awarded successfully',
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Invalid input data', errors: error.errors });
      }
      
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to award collectible' });
    }
  }

  /**
   * Claim a collectible
   */
  async claimCollectible(
    request: FastifyRequest<{ Params: { id: string } }>, 
    reply: FastifyReply
  ) {
    try {
      const { id: collectibleId } = request.params;
      const userId = (request.user as { id: string }).id;
      
      // Check if collectible exists
      const collectible = await this.prisma.collectible.findUnique({
        where: { id: collectibleId },
        include: {
          event: true,
        },
      });
      
      if (!collectible) {
        return reply.status(404).send({ message: 'Collectible not found' });
      }
      
      // Check if user has RSVP'd to the event
      const ticket = await this.prisma.ticket.findUnique({
        where: {
          eventId_userId: {
            eventId: collectible.eventId,
            userId,
          },
        },
      });
      
      if (!ticket || ticket.status !== 'going') {
        return reply.status(403).send({ 
          message: 'You must RSVP to this event to claim collectibles' 
        });
      }
      
      // Check if user already has this collectible
      const existing = await this.prisma.userCollectible.findUnique({
        where: {
          userId_collectibleId: {
            userId,
            collectibleId,
          },
        },
      });
      
      if (existing) {
        return reply.status(409).send({ message: 'You already have this collectible' });
      }
      
      // Award collectible
      await this.prisma.userCollectible.create({
        data: {
          userId,
          collectibleId,
        },
      });
      
      return {
        message: 'Collectible claimed successfully',
      };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to claim collectible' });
    }
  }

  /**
   * Get user's collectibles
   */
  async getUserCollectibles(
    request: FastifyRequest<{
      Params: { userId: string },
      Querystring: { type?: 'avatar' | 'banner' | 'badge' }
    }>, 
    reply: FastifyReply
  ) {
    try {
      const { userId } = request.params;
      const { type } = request.query;
      
      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      
      if (!user) {
        return reply.status(404).send({ message: 'User not found' });
      }
      
      // Get collectibles
      const userCollectibles = await this.prisma.userCollectible.findMany({
        where: { userId },
        include: {
          collectible: {
            include: {
              media: true,
              event: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
        orderBy: {
          acquiredAt: 'desc',
        },
      });
      
      // Filter by type if requested
      const filteredCollectibles = type 
        ? userCollectibles.filter(uc => uc.collectible.type === type) 
        : userCollectibles;
      
      // Format collectibles with media URLs
      const formattedCollectibles = filteredCollectibles.map(uc => ({
        id: uc.collectible.id,
        type: uc.collectible.type,
        rarity: uc.collectible.rarity,
        acquiredAt: uc.acquiredAt,
        media: {
          id: uc.collectible.media.id,
          mimeType: uc.collectible.media.mimeType,
          width: uc.collectible.media.width,
          height: uc.collectible.media.height,
          blurhash: uc.collectible.media.blurhash,
          url: `https://${config.cloudflare.r2Bucket}.r2.dev/${uc.collectible.media.r2Key}`,
        },
        event: {
          id: uc.collectible.event.id,
          title: uc.collectible.event.title,
        },
      }));
      
      return { collectibles: formattedCollectibles };
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to retrieve collectibles' });
    }
  }
}
