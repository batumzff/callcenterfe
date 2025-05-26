export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

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