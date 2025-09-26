import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collectiblesApi } from '@/api/collectibles';
import { queryKeys } from '../queryKeys';

// Hook to get all collectibles with filters
export const useCollectibles = (filters: Record<string, any> = {}) => {
  return useQuery({
    queryKey: queryKeys.collectibles.list(filters),
    queryFn: () => collectiblesApi.getCollectibles(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get a single collectible by ID
export const useCollectible = (collectibleId: string) => {
  return useQuery({
    queryKey: queryKeys.collectibles.detail(collectibleId),
    queryFn: () => collectiblesApi.getCollectibleById(collectibleId),
    enabled: !!collectibleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get collectibles by user
export const useCollectiblesByUser = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.collectibles.byUser(userId),
    queryFn: () => collectiblesApi.getUserCollectibles(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get collectibles by event
export const useCollectiblesByEvent = (eventId: string) => {
  return useQuery({
    queryKey: queryKeys.collectibles.byEvent(eventId),
    queryFn: () => collectiblesApi.getEventCollectibles(eventId),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to create a new collectible
export const useCreateCollectible = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (collectibleData: any) => collectiblesApi.createCollectible(collectibleData),
    onSuccess: (data) => {
      // Invalidate collectibles list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.collectibles.lists() });
      // Invalidate user and event specific collectible queries
      if (data.userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.collectibles.byUser(data.userId) });
      }
      if (data.eventId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.collectibles.byEvent(data.eventId) });
      }
    },
  });
};

// Hook to update a collectible
export const useUpdateCollectible = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ collectibleId, collectibleData }: { collectibleId: string; collectibleData: any }) => 
      collectiblesApi.updateCollectible(collectibleId, collectibleData),
    onSuccess: (data, variables) => {
      // Update the specific collectible in cache
      queryClient.setQueryData(
        queryKeys.collectibles.detail(variables.collectibleId),
        data
      );
      // Invalidate collectibles list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.collectibles.lists() });
      // Invalidate user and event specific collectible queries
      if (data.userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.collectibles.byUser(data.userId) });
      }
      if (data.eventId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.collectibles.byEvent(data.eventId) });
      }
    },
  });
};

// Hook to delete a collectible
export const useDeleteCollectible = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (collectibleId: string) => collectiblesApi.deleteCollectible(collectibleId),
    onSuccess: (_, collectibleId) => {
      // Remove the collectible from cache
      queryClient.removeQueries({ queryKey: queryKeys.collectibles.detail(collectibleId) });
      // Invalidate collectibles list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.collectibles.lists() });
    },
  });
};
