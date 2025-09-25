import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    // Handle specific error cases
    if (response) {
      switch (response.status) {
        case 401:
          // Unauthorized - Clear token and redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
          toast.error('Your session has expired. Please log in again.');
          break;
          
        case 403:
          // Forbidden
          toast.error('You don\'t have permission to perform this action');
          break;
          
        case 404:
          // Not found
          toast.error('Resource not found');
          break;
          
        case 422:
          // Validation error
          if (response.data?.errors) {
            const firstError = Object.values(response.data.errors)[0];
            toast.error(Array.isArray(firstError) ? firstError[0] : String(firstError));
          } else {
            toast.error('Validation error');
          }
          break;
          
        case 429:
          // Rate limited
          toast.error('Too many requests. Please try again later.');
          break;
          
        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors
          toast.error('Server error. Please try again later.');
          break;
          
        default:
          // Other errors
          toast.error(response.data?.message || 'Something went wrong');
      }
    } else {
      // Network error or server unreachable
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

export default api;