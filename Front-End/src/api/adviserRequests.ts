// E-Defense — Adviser Requests API Service
import apiClient from './client';
import { ApiResponse } from '../types';

export interface AdviserRequestPayload {
  research_title: string;
  research_area: string;
  research_objectives?: string;
  group_members?: string;
  adviser_name: string;
  adviser_email: string;
  expected_defense_date?: string;
  document_url?: string;
}

export interface StatusUpdatePayload {
  status: 'approved' | 'rejected';
  rejection_reason?: string;
}

export const adviserRequestApi = {
  /** Get all adviser acceptance requests (filtered by role on backend) */
  getAll: async (): Promise<{ success: boolean; data: any[]; meta?: any }> => {
    const response = await apiClient.get('/adviser-requests');
    return response.data;
  },

  /** Get a single adviser request by ID */
  getById: async (id: number): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/adviser-requests/${id}`);
    return response.data;
  },

  /** Create a new adviser acceptance request */
  create: async (data: AdviserRequestPayload): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/adviser-requests', data);
    return response.data;
  },

  /** Update the status of an adviser request (approve/reject) */
  updateStatus: async (id: number, data: StatusUpdatePayload): Promise<ApiResponse<any>> => {
    const response = await apiClient.patch(`/adviser-requests/${id}/status`, data);
    return response.data;
  },

  /** Reset a request status back to pending (undo approve/reject) */
  resetStatus: async (id: number): Promise<ApiResponse<any>> => {
    const response = await apiClient.patch(`/adviser-requests/${id}/reset`);
    return response.data;
  },

  /** Get list of available advisers for the dropdown picker */
  getAdvisers: async (): Promise<{ success: boolean; data: any[] }> => {
    const response = await apiClient.get('/advisers');
    return response.data;
  },
};
