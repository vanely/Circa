import axios from '@/services/api';

export const collectiblesApi = {
  // Get all collectibles with filters
  getCollectibles: async (filters: Record<string, any> = {}): Promise<{ collectibles: any[]; total: number }> => {
    const response = await axios.get('/api/collectibles', { params: filters });
    return response.data;
  },

  // Get a single collectible by ID
  getCollectibleById: async (collectibleId: string): Promise<any> => {
    const response = await axios.get(`/api/collectibles/${collectibleId}`);
    return response.data;
  },

  // Get collectibles for an event
  getEventCollectibles: async (eventId: string): Promise<{ collectibles: any[] }> => {
    const response = await axios.get(`/api/collectibles/event/${eventId}`);
    return response.data;
  },

  // Get collectibles by user
  getUserCollectibles: async (userId: string): Promise<{ collectibles: any[] }> => {
    const response = await axios.get(`/api/collectibles/user/${userId}`);
    return response.data;
  },

  // Get my collectibles (current user)
  getMyCollectibles: async (): Promise<{ collectibles: any[] }> => {
    const response = await axios.get('/api/collectibles/me');
    return response.data;
  },

  // Create a new collectible
  createCollectible: async (collectibleData: any): Promise<any> => {
    const response = await axios.post('/api/collectibles', collectibleData);
    return response.data;
  },

  // Update a collectible
  updateCollectible: async (collectibleId: string, collectibleData: any): Promise<any> => {
    const response = await axios.patch(`/api/collectibles/${collectibleId}`, collectibleData);
    return response.data;
  },

  // Delete a collectible
  deleteCollectible: async (collectibleId: string): Promise<void> => {
    await axios.delete(`/api/collectibles/${collectibleId}`);
  },

  // Claim a collectible
  claimCollectible: async (collectibleId: string): Promise<any> => {
    const response = await axios.post(`/api/collectibles/${collectibleId}/claim`);
    return response.data;
  },

  // Transfer a collectible
  transferCollectible: async (collectibleId: string, toUserId: string): Promise<any> => {
    const response = await axios.post(`/api/collectibles/${collectibleId}/transfer`, { toUserId });
    return response.data;
  }
};
