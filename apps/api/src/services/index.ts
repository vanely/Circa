import { PrismaClient } from '@prisma/client';
import { WebSocketController } from '../controllers/websocket.controller';
import { emailService } from './email';
import { WaitlistService } from './waitlist';
import { AuthService } from './auth';

// Service registry type
export interface ServiceRegistry {
  auth: AuthService;
  waitlist: WaitlistService;
  email: typeof emailService;
}

/**
 * Factory function to create and initialize all services
 */
export function createServices(
  prisma: PrismaClient,
  wsController: WebSocketController
): ServiceRegistry {
  // Create and initialize all services
  const services: ServiceRegistry = {
    auth: new AuthService(prisma),
    waitlist: new WaitlistService(prisma, wsController),
    email: emailService,
  };
  
  return services;
}

// Export service types
export type { 
  AuthService,
  WaitlistService,
};

export { emailService };
