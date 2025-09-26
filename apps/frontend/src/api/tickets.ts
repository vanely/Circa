import axios from '@/services/api';

export const ticketsApi = {
  // Get all tickets with filters
  getTickets: async (filters: Record<string, any> = {}): Promise<{ tickets: any[]; total: number }> => {
    const response = await axios.get('/api/tickets', { params: filters });
    return response.data;
  },

  // Get a single ticket by ID
  getTicketById: async (ticketId: string): Promise<any> => {
    const response = await axios.get(`/api/tickets/${ticketId}`);
    return response.data;
  },

  // Get my tickets (current user)
  getMyTickets: async (filters: Record<string, any> = {}): Promise<{ tickets: any[] }> => {
    const response = await axios.get('/api/tickets/me', { params: filters });
    return response.data;
  },

  // Get tickets by user
  getTicketsByUser: async (userId: string): Promise<{ tickets: any[] }> => {
    const response = await axios.get(`/api/tickets/user/${userId}`);
    return response.data;
  },

  // Get tickets by event
  getTicketsByEvent: async (eventId: string): Promise<{ tickets: any[] }> => {
    const response = await axios.get(`/api/tickets/event/${eventId}`);
    return response.data;
  },

  // Create a new ticket
  createTicket: async (ticketData: any): Promise<any> => {
    const response = await axios.post('/api/tickets', ticketData);
    return response.data;
  },

  // Create ticket type for an event
  createTicketType: async (ticketTypeData: any): Promise<any> => {
    const response = await axios.post('/api/tickets/types', ticketTypeData);
    return response.data;
  },

  // Update a ticket type
  updateTicketType: async (ticketTypeId: string, ticketTypeData: any): Promise<any> => {
    const response = await axios.patch(`/api/tickets/types/${ticketTypeId}`, ticketTypeData);
    return response.data;
  },

  // Delete a ticket type
  deleteTicketType: async (ticketTypeId: string): Promise<void> => {
    await axios.delete(`/api/tickets/types/${ticketTypeId}`);
  },

  // Update a ticket
  updateTicket: async (ticketId: string, ticketData: any): Promise<any> => {
    const response = await axios.patch(`/api/tickets/${ticketId}`, ticketData);
    return response.data;
  },

  // Delete a ticket
  deleteTicket: async (ticketId: string): Promise<void> => {
    await axios.delete(`/api/tickets/${ticketId}`);
  }
};
