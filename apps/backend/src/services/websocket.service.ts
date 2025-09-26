import { FastifyInstance } from 'fastify';
import { WebSocket } from 'ws';
import { verify } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import config from '../config';
import { SerializedError } from 'pino';

interface WebSocketClient {
  socket: WebSocket;
  userId: string;
  rooms: Set<string>;
}

interface WebSocketMessage {
  type: string;
  eventId?: string;
  data?: any;
}

export class WebSocketService {
  private clients = new Map<string, WebSocketClient>();
  private eventSubscribers = new Map<string, Set<string>>();
  
  constructor(private fastify: FastifyInstance, private prisma: PrismaClient) {
    this.setupWebSocketHandler();
  }

  /**
   * Set up the WebSocket handler
   */
  private setupWebSocketHandler() {
    this.fastify.get('/ws', { websocket: true }, (connection, req) => {
      const { socket } = connection;
      let client: WebSocketClient | null = null;
      
      // Handle connection
      socket.on('message', async (message: string) => {
        try {
          const msg = JSON.parse(message) as WebSocketMessage;
          
          // Handle authentication
          if (msg.type === 'auth') {
            const token = msg.data?.token;
            if (!token) {
              this.sendError(socket, 'Authentication required');
              return;
            }
            
            try {
              // Verify JWT token
              const decoded = verify(token, config.jwt.secret) as { id: string };
              
              // Create client entry
              client = {
                socket,
                userId: decoded.id,
                rooms: new Set(),
              };
              
              // Store client
              this.clients.set(decoded.id, client);
              
              // Send successful auth response
              this.send(socket, { 
                type: 'auth:success', 
                data: { userId: decoded.id } 
              });
            } catch (error) {
              this.sendError(socket, 'Invalid authentication token');
            }
            return;
          }
          
          // Require authentication for other message types
          if (!client) {
            this.sendError(socket, 'Authentication required');
            return;
          }
          
          // Handle joining an event room
          if (msg.type === 'join' && msg.eventId) {
            await this.handleJoinRoom(client, msg.eventId);
            return;
          }
          
          // Handle leaving an event room
          if (msg.type === 'leave' && msg.eventId) {
            this.handleLeaveRoom(client, msg.eventId);
            return;
          }
          
          // Handle custom messages (e.g., typing indicators)
          if (msg.type === 'typing' && msg.eventId) {
            this.broadcastToRoom(msg.eventId, {
              type: 'user:typing',
              eventId: msg.eventId,
              data: {
                userId: client.userId,
                isTyping: msg.data?.isTyping === true,
              },
            }, client.userId);
            return;
          }
        } catch (error: unknown) {
          this.fastify.log.error('WebSocket message error:');
          this.sendError(socket, 'Invalid message format');
        }
      });
      
      // Handle disconnection
      socket.on('close', () => {
        if (client) {
          // Remove client from all rooms
          for (const roomId of client.rooms) {
            const subscribers = this.eventSubscribers.get(roomId);
            if (subscribers) {
              subscribers.delete(client.userId);
              
              // Clean up empty rooms
              if (subscribers.size === 0) {
                this.eventSubscribers.delete(roomId);
              }
            }
          }
          
          // Remove client from clients map
          this.clients.delete(client.userId);
        }
      });
    });
  }

  /**
   * Handle a client joining an event room
   */
  private async handleJoinRoom(client: WebSocketClient, eventId: string) {
    try {
      // Check if event exists and user has access
      const event = await this.prisma.event.findUnique({
        where: { id: eventId },
      });
      
      if (!event) {
        this.sendError(client.socket, 'Event not found');
        return;
      }
      
      // For private events, check if user has RSVP'd
      if (event.visibility === 'invite_only' || event.visibility === 'approval_only') {
        const ticket = await this.prisma.ticket.findUnique({
          where: {
            eventId_userId: {
              eventId,
              userId: client.userId,
            },
          },
        });
        
        if (!ticket || ticket.status !== 'going') {
          this.sendError(client.socket, 'You must RSVP to join this event chat');
          return;
        }
      }
      
      // Add client to room
      client.rooms.add(eventId);
      
      // Add client to event subscribers
      let subscribers = this.eventSubscribers.get(eventId);
      if (!subscribers) {
        subscribers = new Set<string>();
        this.eventSubscribers.set(eventId, subscribers);
      }
      subscribers.add(client.userId);
      
      // Send success response
      this.send(client.socket, {
        type: 'join:success',
        eventId,
      });
      
      // Send recent messages for this event
      const messages = await this.prisma.message.findMany({
        where: {
          eventId,
          channel: 'general',
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
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
      });
      
      // Format and reverse messages for chronological order
      const formattedMessages = messages.reverse().map(message => ({
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
      
      // Send recent messages
      this.send(client.socket, {
        type: 'messages:history',
        eventId,
        data: { messages: formattedMessages },
      });
      
      // Notify other users in the room that this user joined
      this.broadcastToRoom(eventId, {
        type: 'user:join',
        eventId,
        data: { userId: client.userId },
      }, client.userId);
    } catch (error: any) {
      this.fastify.log.error(`Error joining room ${eventId}:`);
      this.sendError(client.socket, 'Failed to join event room');
    }
  }

  /**
   * Handle a client leaving an event room
   */
  private handleLeaveRoom(client: WebSocketClient, eventId: string) {
    if (client.rooms.has(eventId)) {
      // Remove client from room
      client.rooms.delete(eventId);
      
      // Remove client from event subscribers
      const subscribers = this.eventSubscribers.get(eventId);
      if (subscribers) {
        subscribers.delete(client.userId);
        
        // Clean up empty rooms
        if (subscribers.size === 0) {
          this.eventSubscribers.delete(eventId);
        }
      }
      
      // Send success response
      this.send(client.socket, {
        type: 'leave:success',
        eventId,
      });
      
      // Notify other users in the room that this user left
      this.broadcastToRoom(eventId, {
        type: 'user:leave',
        eventId,
        data: { userId: client.userId },
      }, client.userId);
    }
  }

  /**
   * Broadcast a message to all clients in a room
   * @param eventId The event room ID
   * @param message The message to send
   * @param excludeUserId Optional user ID to exclude from the broadcast
   */
  public broadcastToRoom(eventId: string, message: any, excludeUserId?: string) {
    const subscribers = this.eventSubscribers.get(eventId);
    if (subscribers) {
      for (const userId of subscribers) {
        // Skip excluded user
        if (excludeUserId && userId === excludeUserId) {
          continue;
        }
        
        const client = this.clients.get(userId);
        if (client) {
          this.send(client.socket, message);
        }
      }
    }
  }

  /**
   * Send a message to a specific client
   */
  private send(socket: any, message: any): void {
    if ((socket as WebSocket).readyState === 1) { // WebSocket.OPEN = 1
      (socket as WebSocket).send(JSON.stringify(message));
    }
  }

  /**
   * Send an error message to a client
   */
  private sendError(socket: any, message: string): void {
    this.send(socket, {
      type: 'error',
      data: { message },
    });
  }

  /**
   * Notify event subscribers about a new message
   */
  public notifyNewMessage(message: any) {
    this.broadcastToRoom(message.eventId, {
      type: 'message:new',
      eventId: message.eventId,
      data: message,
    });
  }

  /**
   * Notify event subscribers about a deleted message
   */
  public notifyDeletedMessage(eventId: string, messageId: string) {
    this.broadcastToRoom(eventId, {
      type: 'message:delete',
      eventId,
      data: { messageId },
    });
  }

  /**
   * Notify event subscribers about an RSVP update
   */
  public notifyRsvpUpdate(eventId: string, userId: string, status: string) {
    this.broadcastToRoom(eventId, {
      type: 'rsvp:update',
      eventId,
      data: { userId, status },
    });
  }

  /**
   * Notify event subscribers about a waitlist promotion
   */
  public notifyWaitlistPromotion(eventId: string, userId: string, position: number) {
    this.broadcastToRoom(eventId, {
      type: 'waitlist:promoted',
      eventId,
      data: { userId, from: position },
    });
  }

  /**
   * Notify event subscribers about a new check-in
   */
  public notifyCheckIn(eventId: string, userId: string, at: Date) {
    this.broadcastToRoom(eventId, {
      type: 'checkin:new',
      eventId,
      data: { userId, at },
    });
  }

  /**
   * Notify event subscribers about a new announcement
   */
  public notifyAnnouncement(eventId: string, announcement: any) {
    this.broadcastToRoom(eventId, {
      type: 'announcement',
      eventId,
      data: announcement,
    });
  }
}
