import axios from "axios";
import { getAccessToken } from "@/lib/auth-token";
import {
  Staff,
  StaffActivity,
  InviteStaffData,
  UpdateStaffData,
} from "@/types/staff";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";

// Create axios instance with auth token
const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const staffApi = {
  // Get all staff members for current outlet
  getAll: async (): Promise<Staff[]> => {
    const response = await api.get("/staff");
    return response.data.data;
  },

  // Get staff member by ID
  getById: async (id: string): Promise<Staff> => {
    const response = await api.get(`/staff/${id}`);
    return response.data.data;
  },

  // Invite new staff member
  invite: async (data: InviteStaffData): Promise<Staff> => {
    const response = await api.post("/staff/invite", data);
    return response.data.data;
  },

  // Update staff member
  update: async (id: string, data: UpdateStaffData): Promise<Staff> => {
    const response = await api.put(`/staff/${id}`, data);
    return response.data.data;
  },

  // Remove staff member from outlet
  remove: async (id: string): Promise<void> => {
    await api.delete(`/staff/${id}`);
  },

  // Get staff activity log
  getActivity: async (filters?: {
    userId?: string;
    actionType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<StaffActivity[]> => {
    const params = new URLSearchParams();

    if (filters?.userId) params.append("userId", filters.userId);
    if (filters?.actionType) params.append("actionType", filters.actionType);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const response = await api.get(`/staff/activity?${params.toString()}`);
    return response.data.data;
  },

  // Get specific staff member's activity
  getMemberActivity: async (
    id: string,
    filters?: {
      startDate?: string;
      endDate?: string;
      limit?: number;
    }
  ): Promise<StaffActivity[]> => {
    const params = new URLSearchParams();

    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const response = await api.get(
      `/staff/${id}/activity?${params.toString()}`
    );
    return response.data.data;
  },
};
