import axios from '@/services/api';
import { User } from '@/types/user';

export const usersApi = {
  // Get all users with filters
  getUsers: async (filters: Record<string, any> = {}): Promise<{ users: User[]; total: number }> => {
    const response = await axios.get('/api/users', { params: filters });
    return response.data;
  },

  // Get a single user by ID
  getUserById: async (userId: string): Promise<User> => {
    const response = await axios.get<User>(`/api/users/${userId}`);
    return response.data;
  },

  // Get user profile
  getUserProfile: async (userId: string): Promise<User> => {
    const response = await axios.get<User>(`/api/users/${userId}/profile`);
    return response.data;
  },

  // Update current user profile
  updateCurrentUser: async (userData: any): Promise<User> => {
    const response = await axios.patch<User>('/api/users/me', userData);
    return response.data;
  },

  // Create organizer profile
  createOrganizerProfile: async (organizerData: any): Promise<User> => {
    const response = await axios.post<User>('/api/users/me/organizer', organizerData);
    return response.data;
  },

  // Get user's attending events
  getUserAttendingEvents: async (): Promise<{ events: any[] }> => {
    const response = await axios.get('/api/users/me/events/attending');
    return response.data;
  },

  // Get user's organizing events
  getUserOrganizingEvents: async (): Promise<{ events: any[] }> => {
    const response = await axios.get('/api/users/me/events/organizing');
    return response.data;
  },

  // Get user's collectibles
  getUserCollectibles: async (): Promise<{ collectibles: any[] }> => {
    const response = await axios.get('/api/users/me/collectibles');
    return response.data;
  },

  // Create a new user (admin only)
  createUser: async (userData: any): Promise<User> => {
    const response = await axios.post<User>('/api/users', userData);
    return response.data;
  },

  // Update a user (admin only)
  updateUser: async (userId: string, userData: any): Promise<User> => {
    const response = await axios.patch<User>(`/api/users/${userId}`, userData);
    return response.data;
  },

  // Delete a user (admin only)
  deleteUser: async (userId: string): Promise<void> => {
    await axios.delete(`/api/users/${userId}`);
  }
};
