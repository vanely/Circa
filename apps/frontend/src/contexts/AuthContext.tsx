import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types/user';
import { authService } from '@/services/authService';

interface AuthContextProps {
  user: User | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  verifyMagicLink: (token: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Check if token exists and is not expired
    if (token) {
      try {
        const decodedToken = jwtDecode<{ exp: number }>(token);
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (decodedToken.exp > currentTime) {
          setIsAuthenticated(true);
          fetchUserData();
        } else {
          // Token is expired
          localStorage.removeItem('token');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        // Invalid token
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      }
    }
    
    setIsLoading(false);
  }, []);
  
  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // If fetching user data fails, clear token
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  const login = async (email: string) => {
    setIsLoading(true);
    try {
      await authService.login(email);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const verifyMagicLink = async (token: string) => {
    setIsLoading(true);
    try {
      const response = await authService.verifyMagicLink(token);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      setIsAuthenticated(true);
      navigate('/');
    } catch (error) {
      console.error('Error verifying magic link:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };
  
  const refreshUserData = async () => {
    return fetchUserData();
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        verifyMagicLink,
        logout,
        isAuthenticated,
        refreshUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};