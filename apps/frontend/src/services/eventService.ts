import axios from '@/services/api';
import { Event, EventList, EventFilters, RsvpRequest, RsvpResponse } from '@/types/event';

export const eventService = {
  // Get all events with optional filters
  getEvents: async (filters: EventFilters = {}): Promise<EventList> => {
    const response = await axios.get<EventList>('/api/events', { params: filters });
    return response.data;
  },

  // Get a single event by ID
  getEventById: async (eventId: string): Promise<Event> => {
    const response = await axios.get<Event>(`/api/events/${eventId}`);
    return response.data;
  },

  // Create a new event
  createEvent: async (eventData: any): Promise<Event> => {
    const response = await axios.post<Event>('/api/events', eventData);
    return response.data;
  },

  // Update an existing event
  updateEvent: async (eventId: string, eventData: any): Promise<Event> => {
    const response = await axios.patch<Event>(`/api/events/${eventId}`, eventData);
    return response.data;
  },

  // Delete an event
  deleteEvent: async (eventId: string): Promise<void> => {
    await axios.delete(`/api/events/${eventId}`);
  },

  // RSVP to an event
  rsvpToEvent: async (eventId: string, rsvpData: RsvpRequest): Promise<RsvpResponse> => {
    const response = await axios.post<RsvpResponse>(
      `/api/events/${eventId}/rsvp`,
      rsvpData
    );
    return response.data;
  },

  // Get events within a geographic area
  getEventsNearby: async (lat: number, lng: number, radius = 25): Promise<EventList> => {
    return eventService.getEvents({ lat, lng, radius });
  }
};
