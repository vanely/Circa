import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import { User } from '@/types/user';
import { authApi } from '@/api/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
}

interface AuthActions {
  login: (email: string) => Promise<void>;
  verifyMagicLink: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isLoading: true,
      isAuthenticated: false,
      token: null,

      // Actions
      setLoading: (loading: boolean) => set({ isLoading: loading }),

      initializeAuth: async () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
          set({ isLoading: false, isAuthenticated: false, user: null });
          return;
        }

        try {
          const decodedToken = jwtDecode<{ exp: number }>(token);
          const currentTime = Math.floor(Date.now() / 1000);
          
          if (decodedToken.exp > currentTime) {
            set({ token, isAuthenticated: true });
            await get().refreshUserData();
          } else {
            // Token is expired
            localStorage.removeItem('token');
            set({ token: null, user: null, isAuthenticated: false, isLoading: false });
          }
        } catch (error) {
          // Invalid token
          localStorage.removeItem('token');
          set({ token: null, user: null, isAuthenticated: false, isLoading: false });
        }
      },

      login: async (email: string) => {
        set({ isLoading: true });
        try {
          await authApi.login(email);
        } finally {
          set({ isLoading: false });
        }
      },

      verifyMagicLink: async (token: string) => {
        set({ isLoading: true });
        try {
          const response = await authApi.verifyMagicLink(token);
          localStorage.setItem('token', response.token);
          set({ 
            token: response.token, 
            user: response.user, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          // Ignore logout errors, still clear local state
        } finally {
          localStorage.removeItem('token');
          set({ 
            token: null, 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      },

      refreshUserData: async () => {
        try {
          set({ isLoading: true });
          const userData = await authApi.getCurrentUser();
          set({ user: userData, isAuthenticated: true, isLoading: false });
        } catch (error) {
          console.error('Error fetching user data:', error);
          // If fetching user data fails, clear token
          localStorage.removeItem('token');
          set({ 
            token: null, 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
