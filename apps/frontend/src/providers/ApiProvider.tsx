import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ReactNode, createContext, useContext } from 'react';
import { toast } from 'react-hot-toast';

// Constants
const API_URL = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'token';

// Create a base axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    const { response } = error;
    
    // Handle token expiration
    if (response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      
      // Only redirect to login if we're not already on login page
      if (!window.location.pathname.includes('login')) {
        window.location.href = '/login';
        toast.error('Your session has expired. Please log in again.');
      }
    }
    
    // Handle other error cases
    if (response) {
      switch (response.status) {
        case 403:
          toast.error('You don\'t have permission to perform this action');
          break;
        case 404:
          toast.error('Resource not found');
          break;
        case 422:
          if ((response.data as any)?.errors) {
            const firstError = Object.values((response.data as any).errors)[0];
            toast.error(Array.isArray(firstError) ? firstError[0] : String(firstError));
          } else {
            toast.error('Validation error');
          }
          break;
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error((response.data as any)?.message || 'Something went wrong');
      }
    } else {
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// Generic request function
const request = async <T,>(config: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<{ success: boolean; data: T; message?: string; errors?: string[] }> = await apiClient(config);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as any;
      if (errorData.message) {
        throw new Error(errorData.message);
      } else if (errorData.errors && errorData.errors.length) {
        throw new Error(errorData.errors.join(', '));
      }
    }
    throw error;
  }
};

// API helper methods
export const api = {
  get: <T,>(url: string, config?: AxiosRequestConfig) => 
    request<T>({ ...config, method: 'GET', url }),
  
  post: <T,>(url: string, data?: any, config?: AxiosRequestConfig) => 
    request<T>({ ...config, method: 'POST', url, data }),
  
  put: <T,>(url: string, data?: any, config?: AxiosRequestConfig) => 
    request<T>({ ...config, method: 'PUT', url, data }),
  
  delete: <T,>(url: string, config?: AxiosRequestConfig) => 
    request<T>({ ...config, method: 'DELETE', url }),
};

// Create context for API client
interface ApiContextType {
  api: typeof api;
  apiClient: typeof apiClient;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

// Hook to use the API context
export const useApi = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

// Provider component
interface ApiProviderProps {
  children: ReactNode;
}

export const ApiProvider = ({ children }: ApiProviderProps) => {
  const value = {
    api,
    apiClient,
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};

// Export the default apiClient for backward compatibility
export default apiClient;
