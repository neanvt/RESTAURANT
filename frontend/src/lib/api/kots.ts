import axios from "axios";
import { getAccessToken } from "@/lib/auth-token";
import { KOT, KOTFilters } from "@/types/kot";

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

export const kotsApi = {
  // Get all KOTs with optional filters
  getAll: async (filters?: KOTFilters): Promise<KOT[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const response = await api.get(`/kots?${params.toString()}`);
    return response.data.data;
  },

  // Get KOT by ID
  getById: async (id: string): Promise<KOT> => {
    const response = await api.get(`/kots/${id}`);
    return response.data.data;
  },

  // Update KOT status
  updateStatus: async (id: string, status: string): Promise<KOT> => {
    const response = await api.put(`/kots/${id}/status`, { status });
    return response.data.data;
  },

  // Update KOT item status
  updateItemStatus: async (
    id: string,
    itemId: string,
    status: string
  ): Promise<KOT> => {
    const response = await api.put(`/kots/${id}/items/${itemId}/status`, {
      itemId,
      status,
    });
    return response.data.data;
  },

  // Get KOTs by order
  getByOrder: async (orderId: string): Promise<KOT[]> => {
    const response = await api.get(`/kots/order/${orderId}`);
    return response.data.data;
  },
};
