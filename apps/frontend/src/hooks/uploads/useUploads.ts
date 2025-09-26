import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadsApi } from '@/api/uploads';
import { queryKeys } from '../queryKeys';

// Hook to get all uploads with filters
export const useUploads = (filters: Record<string, any> = {}) => {
  return useQuery({
    queryKey: queryKeys.uploads.list(filters),
    queryFn: () => uploadsApi.getUploads(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get a single upload by ID
export const useUpload = (uploadId: string) => {
  return useQuery({
    queryKey: queryKeys.uploads.detail(uploadId),
    queryFn: () => uploadsApi.getUploadById(uploadId),
    enabled: !!uploadId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get uploads by user
export const useUploadsByUser = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.uploads.byUser(userId),
    queryFn: () => uploadsApi.getUserUploads(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to upload a file
export const useUploadFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (formData: FormData) => uploadsApi.uploadFile(formData),
    onSuccess: (data) => {
      // Invalidate uploads list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.uploads.lists() });
      // Invalidate user specific upload queries
      if (data.userId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.uploads.byUser(data.userId) });
      }
    },
  });
};

// Hook to delete an upload
export const useDeleteUpload = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (uploadId: string) => uploadsApi.deleteUpload(uploadId),
    onSuccess: (_, uploadId) => {
      // Remove the upload from cache
      queryClient.removeQueries({ queryKey: queryKeys.uploads.detail(uploadId) });
      // Invalidate uploads list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.uploads.lists() });
    },
  });
};
