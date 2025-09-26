import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketsApi } from '@/api/tickets';
import { queryKeys } from '../queryKeys';

// Hook to get all tickets with filters
export const useTickets = (filters: Record<string, any> = {}) => {
  return useQuery({
    queryKey: queryKeys.tickets.list(filters),
    queryFn: () => ticketsApi.getTickets(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to get a single ticket by ID
export const useTicket = (ticketId: string) => {
  return useQuery({
    queryKey: queryKeys.tickets.detail(ticketId),
    queryFn: () => ticketsApi.getTicketById(ticketId),
    enabled: !!ticketId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get tickets by user
export const useTicketsByUser = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.tickets.byUser(userId),
    queryFn: () => ticketsApi.getTicketsByUser(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to get tickets by event
export const useTicketsByEvent = (eventId: string) => {
  return useQuery({
    queryKey: queryKeys.tickets.byEvent(eventId),
    queryFn: () => ticketsApi.getTicketsByEvent(eventId),
    enabled: !!eventId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to create a new ticket
export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ticketData: any) => ticketsApi.createTicket(ticketData),
    onSuccess: (data) => {
      // Invalidate tickets list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.lists() });
      // Invalidate user and event specific ticket queries
      if (data.userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tickets.byUser(data.userId) });
      }
      if (data.eventId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tickets.byEvent(data.eventId) });
      }
    },
  });
};

// Hook to update a ticket
export const useUpdateTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ ticketId, ticketData }: { ticketId: string; ticketData: any }) => 
      ticketsApi.updateTicket(ticketId, ticketData),
    onSuccess: (data, variables) => {
      // Update the specific ticket in cache
      queryClient.setQueryData(
        queryKeys.tickets.detail(variables.ticketId),
        data
      );
      // Invalidate tickets list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.lists() });
      // Invalidate user and event specific ticket queries
      if (data.userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tickets.byUser(data.userId) });
      }
      if (data.eventId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tickets.byEvent(data.eventId) });
      }
    },
  });
};

// Hook to delete a ticket
export const useDeleteTicket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ticketId: string) => ticketsApi.deleteTicket(ticketId),
    onSuccess: (_, ticketId) => {
      // Remove the ticket from cache
      queryClient.removeQueries({ queryKey: queryKeys.tickets.detail(ticketId) });
      // Invalidate tickets list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.lists() });
    },
  });
};
