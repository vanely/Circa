import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi } from '@/api/events';
import { queryKeys } from '../queryKeys';
import { Event, EventList, EventFilters, RsvpRequest, RsvpResponse } from '@/types/event';

// Hook to get all events with filters
export const useEvents = (filters: EventFilters = {}) => {
  return useQuery({
    queryKey: queryKeys.events.list(filters),
    queryFn: () => eventsApi.getEvents(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to get a single event by ID
export const useEvent = (eventId: string) => {
  return useQuery({
    queryKey: queryKeys.events.detail(eventId),
    queryFn: () => eventsApi.getEventById(eventId),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get events nearby a location
export const useEventsNearby = (lat: number, lng: number, radius = 25) => {
  return useQuery({
    queryKey: queryKeys.events.nearby(lat, lng, radius),
    queryFn: () => eventsApi.getEventsNearby(lat, lng, radius),
    enabled: !!lat && !!lng,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to get events by venue
export const useEventsByVenue = (venueId: string) => {
  return useQuery({
    queryKey: queryKeys.events.byVenue(venueId),
    queryFn: () => eventsApi.getEventsByVenue(venueId),
    enabled: !!venueId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get events by user
export const useEventsByUser = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.events.byUser(userId),
    queryFn: () => eventsApi.getEventsByUser(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to create a new event
export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (eventData: any) => eventsApi.createEvent(eventData),
    onSuccess: () => {
      // Invalidate events list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.events.lists() });
    },
  });
};

// Hook to update an event
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ eventId, eventData }: { eventId: string; eventData: any }) => 
      eventsApi.updateEvent(eventId, eventData),
    onSuccess: (data, variables) => {
      // Update the specific event in cache
      queryClient.setQueryData(
        queryKeys.events.detail(variables.eventId),
        data
      );
      // Invalidate events list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.events.lists() });
    },
  });
};

// Hook to delete an event
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (eventId: string) => eventsApi.deleteEvent(eventId),
    onSuccess: (_, eventId) => {
      // Remove the event from cache
      queryClient.removeQueries({ queryKey: queryKeys.events.detail(eventId) });
      // Invalidate events list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.events.lists() });
    },
  });
};

// Hook to RSVP to an event
export const useRsvpToEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ eventId, rsvpData }: { eventId: string; rsvpData: RsvpRequest }) => 
      eventsApi.rsvpToEvent(eventId, rsvpData),
    onSuccess: (data, variables) => {
      // Invalidate the specific event query to refetch updated data
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(variables.eventId) });
      // Invalidate events list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.events.lists() });
    },
  });
};
