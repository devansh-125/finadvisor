import axios from 'axios';
import { API_URL } from '../config';

// Create a configured axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - always add token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log for debugging on mobile
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log(`🔑 Token present: ${!!token}`);
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`);
    
    if (error.response?.status === 401) {
      console.log('🔒 Unauthorized - token may be invalid or missing');
      
      // Only redirect if not already on auth pages
      const path = window.location.pathname;
      if (!path.includes('/login') && 
          !path.includes('/auth/callback') &&
          !path.includes('/register')) {
        // Clear the invalid token
        localStorage.removeItem('authToken');
        // Redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
