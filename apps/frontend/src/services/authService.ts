import axios from '@/services/api';
import { User, LoginResponse, MagicLinkResponse } from '@/types/user';

export const authService = {
  // Send a magic link to the user's email
  login: async (email: string): Promise<MagicLinkResponse> => {
    const response = await axios.post<MagicLinkResponse>('/api/auth/login', { email });
    return response.data;
  },

  // Verify the magic link token
  verifyMagicLink: async (token: string): Promise<LoginResponse> => {
    const response = await axios.post<LoginResponse>('/api/auth/verify', { token });
    return response.data;
  },

  // Get the current logged-in user
  getCurrentUser: async (): Promise<User> => {
    const response = await axios.get<User>('/api/auth/me');
    return response.data;
  }
};
