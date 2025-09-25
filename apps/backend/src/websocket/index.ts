import { FastifyInstance } from 'fastify';
import { WebSocket } from 'ws';
import { verify } from 'jsonwebtoken';
import config from '../config';

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

export default function setupWebsockets(fastify: FastifyInstance) {
  const clients = new Map<string, WebSocketClient>();
  
  // Register WebSocket handler
  fastify.get('/ws', { websocket: true }, (connection, req) => {
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
            sendError(socket, 'Authentication required');
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
            clients.set(decoded.id, client);
            
            // Send successful auth response
            send(socket, { 
              type: 'auth:success', 
              data: { userId: decoded.id } 
            });
          } catch (error) {
            sendError(socket, 'Invalid authentication token');
          }
          return;
        }
        
        // Require authentication for other message types
        if (!client) {
          sendError(socket, 'Authentication required');
          return;
        }
        
        // Handle joining an event room
        if (msg.type === 'join' && msg.eventId) {
          // Check if event exists and user has access
          const event = await fastify.prisma.event.findUnique({
            where: { id: msg.eventId },
          });
          
          if (!event) {
            sendError(socket, 'Event not found');
            return;
          }
          
          // For private events, check if user has RSVP'd
          if (event.visibility === 'invite_only' || event.visibility === 'approval_only') {
            const ticket = await fastify.prisma.ticket.findUnique({
              where: {
                eventId_userId: {
                  eventId: msg.eventId,
                  userId: client.userId,
                },
              },
            });
            
            if (!ticket || ticket.status !== 'going') {
              sendError(socket, 'You must RSVP to join this event chat');
              return;
            }
          }
          
          // Add client to room
          client.rooms.add(msg.eventId);
          
          // Send success response
          send(socket, {
            type: 'join:success',
            eventId: msg.eventId,
          });
          
          // Send recent messages for this event
          const messages = await fastify.prisma.message.findMany({
            where: {
              eventId: msg.eventId,
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
              url: `https://${fastify.config.cloudflare.r2Bucket}.r2.dev/${att.media.r2Key}`,
            })),
          }));
          
          // Send recent messages
          send(socket, {
            type: 'messages:history',
            eventId: msg.eventId,
            data: { messages: formattedMessages },
          });
          
          return;
        }
        
        // Handle leaving an event room
        if (msg.type === 'leave' && msg.eventId) {
          if (client.rooms.has(msg.eventId)) {
            client.rooms.delete(msg.eventId);
            
            send(socket, {
              type: 'leave:success',
              eventId: msg.eventId,
            });
          }
          return;
        }
        
        // Handle custom messages
        // Would implement other message types like typing indicators here
      } catch (error) {
        fastify.log.error('WebSocket message error:', error);
        sendError(socket, 'Invalid message format');
      }
    });
    
    // Handle disconnection
    socket.on('close', () => {
      if (client) {
        clients.delete(client.userId);
      }
    });
  });
  
  // Helper to broadcast a message to all clients in a room
  function broadcastToRoom(eventId: string, message: any) {
    for (const client of clients.values()) {
      if (client.rooms.has(eventId)) {
        send(client.socket, message);
      }
    }
  }
  
  // Helper to send a message to a specific client
  function send(socket: WebSocket, message: any) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }
  
  // Helper to send an error message
  function sendError(socket: WebSocket, message: string) {
    send(socket, {
      type: 'error',
      data: { message },
    });
  }
  
  // Expose broadcast method
  return {
    broadcastToRoom,
  };
}
