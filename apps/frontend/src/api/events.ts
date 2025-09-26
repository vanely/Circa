import axios from '@/services/api';
import { Event, EventList, EventFilters, RsvpRequest, RsvpResponse } from '@/types/event';

export const eventsApi = {
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
    return eventsApi.getEvents({ lat, lng, radius });
  },

  // // Get events by venue
  // getEventsByVenue: async (venueId: string): Promise<EventList> => {
  //   return eventsApi.getEvents({ venueId });
  // },

  // Get events by user
  getEventsByUser: async (userId: string): Promise<EventList> => {
    return eventsApi.getEvents({ userId });
  },

  // NOTE: we'll want this in the future, but not now.
  // // Get featured events
  // getFeaturedEvents: async (): Promise<EventList> => {
  //   return eventsApi.getEvents({ featured: true });
  // }
};
