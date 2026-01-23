// API Configuration
// In development, uses localhost. In production, uses the environment variable.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function to construct API endpoints
export const getApiUrl = (endpoint) => `${API_URL}${endpoint}`;
