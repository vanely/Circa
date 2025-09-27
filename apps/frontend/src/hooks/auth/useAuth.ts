import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
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
    retry: (failureCount, error: any) => {
      // Don't retry on 401/403 errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
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
    onSuccess: () => {
      toast.success('Magic link sent! Check your email.');
    },
    onError: (error: any) => {
      console.error('Login error:', error);
      
      // Handle different error types
      if (error?.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment before trying again.');
      } else if (error?.response?.status === 400) {
        toast.error('Invalid email address. Please check and try again.');
      } else if (error?.response?.status >= 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error('Failed to send magic link. Please try again.');
      }
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
      toast.success('Successfully signed in! Welcome to Circa.');
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser() });
    },
    onError: (error: any) => {
      console.error('Verification error:', error);
      
      // Handle different error types
      if (error?.response?.status === 400) {
        toast.error('Invalid or expired magic link. Please request a new one.');
      } else if (error?.response?.status === 401) {
        toast.error('Magic link has expired. Please request a new one.');
      } else if (error?.response?.status >= 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error('Failed to verify magic link. Please try again.');
      }
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
      toast.success('Successfully signed out.');
      // Clear all queries on logout
      queryClient.clear();
    },
    onError: (error: any) => {
      console.error('Logout error:', error);
      // Even if logout fails on server, clear local state
      queryClient.clear();
      toast.error('Signed out locally. Please refresh the page.');
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
    onError: (error: any) => {
      console.error('Failed to refresh user data:', error);
      toast.error('Failed to refresh user data. Please try again.');
    },
  });
};

// Hook for checking authentication status
export const useAuthStatus = () => {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  
  return {
    isAuthenticated,
    isLoading,
    user,
    isLoggedIn: isAuthenticated && !!user,
  };
};