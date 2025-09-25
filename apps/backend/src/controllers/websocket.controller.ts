import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { WebSocketService } from '../services/websocket.service';

export class WebSocketController {
  private webSocketService: WebSocketService;
  
  constructor(private fastify: FastifyInstance, private prisma: PrismaClient) {
    this.webSocketService = new WebSocketService(fastify, prisma);
  }

  /**
   * Get the WebSocket service instance
   */
  public getWebSocketService(): WebSocketService {
    return this.webSocketService;
  }

  /**
   * Broadcast a message to all clients in an event room
   */
  public broadcastToRoom(eventId: string, message: any, excludeUserId?: string) {
    this.webSocketService.broadcastToRoom(eventId, message, excludeUserId);
  }

  /**
   * Notify event subscribers about a new message
   */
  public notifyNewMessage(message: any) {
    this.webSocketService.notifyNewMessage(message);
  }

  /**
   * Notify event subscribers about a deleted message
   */
  public notifyDeletedMessage(eventId: string, messageId: string) {
    this.webSocketService.notifyDeletedMessage(eventId, messageId);
  }

  /**
   * Notify event subscribers about an RSVP update
   */
  public notifyRsvpUpdate(eventId: string, userId: string, status: string) {
    this.webSocketService.notifyRsvpUpdate(eventId, userId, status);
  }

  /**
   * Notify event subscribers about a waitlist promotion
   */
  public notifyWaitlistPromotion(eventId: string, userId: string, position: number) {
    this.webSocketService.notifyWaitlistPromotion(eventId, userId, position);
  }

  /**
   * Notify event subscribers about a new check-in
   */
  public notifyCheckIn(eventId: string, userId: string, at: Date) {
    this.webSocketService.notifyCheckIn(eventId, userId, at);
  }

  /**
   * Notify event subscribers about a new announcement
   */
  public notifyAnnouncement(eventId: string, announcement: any) {
    this.webSocketService.notifyAnnouncement(eventId, announcement);
  }
}
