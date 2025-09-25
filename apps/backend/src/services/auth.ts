import { PrismaClient, User } from '@prisma/client';
import { FastifyReply, FastifyRequest } from 'fastify';
import crypto from 'crypto';
import { emailService } from './email';

// Store for temporary magic link tokens
interface MagicLinkToken {
  email: string;
  token: string;
  expires: Date;
}

class AuthService {
  private tokenStore: Map<string, MagicLinkToken> = new Map();
  private tokenExpiry = 15 * 60 * 1000; // 15 minutes in milliseconds

  constructor(private prisma: PrismaClient) {}

  /**
   * Create and send a magic link to the user's email
   */
  async sendMagicLink(email: string, origin: string): Promise<void> {
    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + this.tokenExpiry);
    
    // Store the token with email and expiry
    this.tokenStore.set(token, {
      email: email.toLowerCase(),
      token,
      expires,
    });
    
    // Send email with magic link
    await emailService.sendMagicLink(email, token, origin);
  }

  /**
   * Verify a magic link token and authenticate the user
   */
  async verifyMagicLink(token: string): Promise<User | null> {
    // Check if token exists and is valid
    const storedToken = this.tokenStore.get(token);
    if (!storedToken) {
      return null;
    }
    
    // Check if token is expired
    if (storedToken.expires < new Date()) {
      this.tokenStore.delete(token);
      return null;
    }
    
    // Remove token from store to prevent reuse
    this.tokenStore.delete(token);
    
    // Find or create user
    const user = await this.findOrCreateUser(storedToken.email);
    return user;
  }

  /**
   * Find a user by email or create a new one if they don't exist
   */
  private async findOrCreateUser(email: string): Promise<User> {
    const normalizedEmail = email.toLowerCase();
    
    // Try to find existing user
    let user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    
    // Create new user if not found
    if (!user) {
      // Generate a default display name from email
      const displayName = normalizedEmail.split('@')[0];
      
      user = await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          displayName,
        },
      });
    }
    
    return user;
  }

  /**
   * Generate a JWT token for an authenticated user
   */
  generateToken(request: FastifyRequest, user: User): string {
    return request.server.jwt.sign(
      {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      }, 
      { expiresIn: '7d' }
    );
  }

  /**
   * Authenticate a request using JWT
   */
  async authenticate(request: FastifyRequest, reply: FastifyReply): Promise<User | null> {
    try {
      await request.jwtVerify();
      const userId = (request.user as { id: string }).id;
      
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      
      if (!user) {
        reply.status(401).send({ message: 'User not found' });
        return null;
      }
      
      return user;
    } catch (err) {
      reply.status(401).send({ message: 'Unauthorized' });
      return null;
    }
  }

  /**
   * Clean up expired tokens
   */
  cleanupExpiredTokens(): void {
    const now = new Date();
    for (const [key, value] of this.tokenStore.entries()) {
      if (value.expires < now) {
        this.tokenStore.delete(key);
      }
    }
  }
}

export { AuthService };
