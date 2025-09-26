import axios from '@/services/api';

export const venuesApi = {
  // Get all venues with filters
  getVenues: async (filters: Record<string, any> = {}): Promise<{ venues: any[]; total: number }> => {
    const response = await axios.get('/api/venues', { params: filters });
    return response.data;
  },

  // Get a single venue by ID
  getVenueById: async (venueId: string): Promise<any> => {
    const response = await axios.get(`/api/venues/${venueId}`);
    return response.data;
  },

  // Get venues nearby a location
  getVenuesNearby: async (lat: number, lng: number, radius = 25, limit = 20): Promise<{ venues: any[] }> => {
    const response = await axios.get('/api/venues/near', { 
      params: { lat, lng, radius, limit } 
    });
    return response.data;
  },

  // Search venues
  searchVenues: async (query: string): Promise<{ venues: any[] }> => {
    const response = await axios.get('/api/venues/search', { 
      params: { q: query } 
    });
    return response.data;
  },

  // Create a new venue
  createVenue: async (venueData: any): Promise<any> => {
    const response = await axios.post('/api/venues', venueData);
    return response.data;
  },

  // Update a venue
  updateVenue: async (venueId: string, venueData: any): Promise<any> => {
    const response = await axios.patch(`/api/venues/${venueId}`, venueData);
    return response.data;
  },

  // Delete a venue
  deleteVenue: async (venueId: string): Promise<void> => {
    await axios.delete(`/api/venues/${venueId}`);
  }
};
