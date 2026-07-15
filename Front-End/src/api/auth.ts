// E-Defense — Auth API Service
import apiClient from './client';
import { LoginCredentials, RegisterData, AuthResponse, User, ApiResponse } from '../types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data.data;
  },
  
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>('/auth/profile', data);
    return response.data.data;
  },
};
