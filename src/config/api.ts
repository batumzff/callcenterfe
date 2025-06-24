import { authService } from '@/services/auth';

export const API_BASE_URL = '/api';

export const API_ENDPOINTS = {
  // Add your API endpoints here
  // Example:
  // users: `${API_BASE_URL}/users`,
  // auth: `${API_BASE_URL}/auth`,
};

export const apiConfig = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const getHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}; 