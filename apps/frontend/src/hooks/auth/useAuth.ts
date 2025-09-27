import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/auth';
import { queryKeys } from '../queryKeys';

// Hook to get current user data
export const useCurrentUser = () => {
  const { user, isAuthenticated, token } = useAuthStore();
  
  return useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: authApi.getCurrentUser,
    enabled: isAuthenticated && !!token,
    initialData: user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for login mutation
export const useLogin = () => {
  const { setLoading } = useAuthStore();
  
  return useMutation({
    mutationFn: (email: string) => authApi.login(email),
    onMutate: () => {
      setLoading(true);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

// Hook for magic link verification mutation
export const useVerifyMagicLink = () => {
  const { setLoading } = useAuthStore();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (token: string) => authApi.verifyMagicLink(token),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser() });
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

// Hook for logout
export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear all queries on logout
      queryClient.clear();
    },
  });
};

// Hook for refreshing user data
export const useRefreshUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authApi.getCurrentUser,
    onSuccess: () => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser() });
    },
  });
};
