import { FastifyReply, FastifyRequest } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '../services/auth';
import { z } from 'zod';

// Zod schemas for request validation
const magicLinkRequestSchema = z.object({
  email: z.string().email(),
});

const magicLinkVerifySchema = z.object({
  token: z.string(),
});

export class AuthController {
  private authService: AuthService;
  
  constructor(private prisma: PrismaClient) {
    this.authService = new AuthService(prisma);
    
    // Setup a cleanup interval for expired tokens
    setInterval(() => {
      this.authService.cleanupExpiredTokens();
    }, 15 * 60 * 1000); // Run every 15 minutes
  }

  /**
   * Send a magic link to the user's email
   */
  async sendMagicLink(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email } = magicLinkRequestSchema.parse(request.body);
      
      // Get the origin from request headers or use a default
      const origin = request.headers.origin || 'http://localhost:3333';
      
      // Send magic link
      await this.authService.sendMagicLink(email, origin);
      
      return reply.status(200).send({ 
        message: 'Magic link sent successfully',
        email: email
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Invalid email format' });
      }
      
      request.log.error(error);
      return reply.status(500).send({ message: 'Failed to send magic link' });
    }
  }

  /**
   * Verify a magic link token and log the user in
   */
  async verifyMagicLink(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { token } = magicLinkVerifySchema.parse(request.body);
      
      // Verify token and get user
      const user = await this.authService.verifyMagicLink(token);
      
      if (!user) {
        return reply.status(400).send({ message: 'Invalid or expired token' });
      }
      
      // Generate JWT
      const jwt = this.authService.generateToken(request, user);
      
      return reply.status(200).send({
        message: 'Authentication successful',
        token: jwt,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          avatarMediaId: user.avatarMediaId,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: 'Invalid token format' });
      }
      
      request.log.error(error);
      return reply.status(500).send({ message: 'Authentication failed' });
    }
  }

  /**
   * Get current user information
   */
  async getCurrentUser(request: FastifyRequest, reply: FastifyReply) {
    // User is already authenticated by the hook
    const userId = (request.user as { id: string }).id;
    
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          displayName: true,
          bio: true,
          avatarMediaId: true,
          createdAt: true,
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
}
