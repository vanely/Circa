import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesApi } from '@/api/messages';
import { queryKeys } from '../queryKeys';

// Hook to get all messages with filters
export const useMessages = (filters: Record<string, any> = {}) => {
  return useQuery({
    queryKey: queryKeys.messages.list(filters),
    queryFn: () => messagesApi.getMessages(filters),
    staleTime: 30 * 1000, // 30 seconds (messages are more dynamic)
  });
};

// Hook to get a single message by ID
export const useMessage = (messageId: string) => {
  return useQuery({
    queryKey: queryKeys.messages.detail(messageId),
    queryFn: () => messagesApi.getMessageById(messageId),
    enabled: !!messageId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Hook to get messages by event
export const useMessagesByEvent = (eventId: string) => {
  return useQuery({
    queryKey: queryKeys.messages.byEvent(eventId),
    queryFn: () => messagesApi.getEventMessages(eventId),
    enabled: !!eventId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Hook to get messages by user
export const useMessagesByUser = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.messages.byUser(userId),
    queryFn: () => messagesApi.getUserMessages(userId),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Hook to create a new message
export const useCreateMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (messageData: any) => messagesApi.createMessage(messageData),
    onSuccess: (data) => {
      // Invalidate messages list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.lists() });
      // Invalidate event and user specific message queries
      if (data.eventId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.messages.byEvent(data.eventId) });
      }
      if (data.userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.messages.byUser(data.userId) });
      }
    },
  });
};

// Hook to update a message
export const useUpdateMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ messageId, messageData }: { messageId: string; messageData: any }) => 
      messagesApi.updateMessage(messageId, messageData),
    onSuccess: (data, variables) => {
      // Update the specific message in cache
      queryClient.setQueryData(
        queryKeys.messages.detail(variables.messageId),
        data
      );
      // Invalidate messages list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.lists() });
      // Invalidate event and user specific message queries
      if (data.eventId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.messages.byEvent(data.eventId) });
      }
      if (data.userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.messages.byUser(data.userId) });
      }
    },
  });
};

// Hook to delete a message
export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (messageId: string) => messagesApi.deleteMessage(messageId),
    onSuccess: (_, messageId) => {
      // Remove the message from cache
      queryClient.removeQueries({ queryKey: queryKeys.messages.detail(messageId) });
      // Invalidate messages list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.lists() });
    },
  });
};
