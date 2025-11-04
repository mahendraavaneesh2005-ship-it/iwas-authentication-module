import axios from 'axios';
import { RegisterRequest, LoginRequest, AuthResponse } from '@/types/auth';

const API_BASE_URL = '/api/auth';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('iwas_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    // Mock API call - replace with actual backend endpoint
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate validation
        if (data.password !== data.confirmPassword) {
          reject(new Error('Passwords do not match'));
          return;
        }

        if (data.password.length < 8) {
          reject(new Error('Password must be at least 8 characters'));
          return;
        }

        // Simulate successful registration
        const response: AuthResponse = {
          user: {
            id: `user_${Date.now()}`,
            name: data.name,
            email: data.email,
            role: 'user',
            createdAt: new Date().toISOString(),
          },
          token: `mock_jwt_token_${Date.now()}`,
        };
        resolve(response);
      }, 1000);
    });
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    // Mock API call - replace with actual backend endpoint
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate successful login
        const response: AuthResponse = {
          user: {
            id: `user_${Date.now()}`,
            name: 'John Doe',
            email: data.email,
            role: 'user',
            createdAt: new Date().toISOString(),
          },
          token: `mock_jwt_token_${Date.now()}`,
        };
        resolve(response);
      }, 1000);
    });
  },

  logout: async (): Promise<void> => {
    // Mock API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
  },
};
