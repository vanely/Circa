import axios from '@/services/api';

export const messagesApi = {
  // Get all messages with filters
  getMessages: async (filters: Record<string, any> = {}): Promise<{ messages: any[]; total: number }> => {
    const response = await axios.get('/api/messages', { params: filters });
    return response.data;
  },

  // Get a single message by ID
  getMessageById: async (messageId: string): Promise<any> => {
    const response = await axios.get(`/api/messages/${messageId}`);
    return response.data;
  },

  // Get event messages
  getEventMessages: async (eventId: string, filters: Record<string, any> = {}): Promise<{ messages: any[] }> => {
    const response = await axios.get(`/api/messages/event/${eventId}`, { params: filters });
    return response.data;
  },

  // Get messages by user
  getUserMessages: async (userId: string): Promise<{ messages: any[] }> => {
    const response = await axios.get(`/api/messages/user/${userId}`);
    return response.data;
  },

  // Create a new message
  createMessage: async (messageData: any): Promise<any> => {
    const response = await axios.post('/api/messages', messageData);
    return response.data;
  },

  // Update a message
  updateMessage: async (messageId: string, messageData: any): Promise<any> => {
    const response = await axios.patch(`/api/messages/${messageId}`, messageData);
    return response.data;
  },

  // Delete a message
  deleteMessage: async (messageId: string): Promise<void> => {
    await axios.delete(`/api/messages/${messageId}`);
  },

  // React to a message
  reactToMessage: async (messageId: string, reaction: string): Promise<any> => {
    const response = await axios.post(`/api/messages/${messageId}/react`, { reaction });
    return response.data;
  },

  // Remove reaction from a message
  removeReaction: async (messageId: string, reaction: string): Promise<any> => {
    const response = await axios.delete(`/api/messages/${messageId}/react`, { 
      params: { reaction } 
    });
    return response.data;
  }
};
