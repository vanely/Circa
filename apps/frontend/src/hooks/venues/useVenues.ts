import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { venuesApi } from '@/api/venues';
import { queryKeys } from '../queryKeys';

// Hook to get all venues with filters
export const useVenues = (filters: Record<string, any> = {}) => {
  return useQuery({
    queryKey: queryKeys.venues.list(filters),
    queryFn: () => venuesApi.getVenues(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get a single venue by ID
export const useVenue = (venueId: string) => {
  return useQuery({
    queryKey: queryKeys.venues.detail(venueId),
    queryFn: () => venuesApi.getVenueById(venueId),
    enabled: !!venueId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get venues nearby a location
export const useVenuesNearby = (lat: number, lng: number, radius = 25) => {
  return useQuery({
    queryKey: queryKeys.venues.nearby(lat, lng, radius),
    queryFn: () => venuesApi.getVenuesNearby(lat, lng, radius),
    enabled: !!lat && !!lng,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to search venues
export const useSearchVenues = (query: string) => {
  return useQuery({
    queryKey: queryKeys.venues.search(query),
    queryFn: () => venuesApi.searchVenues(query),
    enabled: !!query && query.length > 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to create a new venue
export const useCreateVenue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (venueData: any) => venuesApi.createVenue(venueData),
    onSuccess: () => {
      // Invalidate venues list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.venues.lists() });
    },
  });
};

// Hook to update a venue
export const useUpdateVenue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ venueId, venueData }: { venueId: string; venueData: any }) => 
      venuesApi.updateVenue(venueId, venueData),
    onSuccess: (data, variables) => {
      // Update the specific venue in cache
      queryClient.setQueryData(
        queryKeys.venues.detail(variables.venueId),
        data
      );
      // Invalidate venues list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.venues.lists() });
    },
  });
};

// Hook to delete a venue
export const useDeleteVenue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (venueId: string) => venuesApi.deleteVenue(venueId),
    onSuccess: (_, venueId) => {
      // Remove the venue from cache
      queryClient.removeQueries({ queryKey: queryKeys.venues.detail(venueId) });
      // Invalidate venues list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.venues.lists() });
    },
  });
};
