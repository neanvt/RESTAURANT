import axios from "axios";
import { getAccessToken } from "@/lib/auth-token";
import { Item, CreateItemDTO, UpdateItemDTO, ItemFilters } from "@/types/item";

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

export const itemsApi = {
  // Get all items with optional filters
  getAll: async (filters?: ItemFilters): Promise<Item[]> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.isFavourite !== undefined)
      params.append("isFavourite", String(filters.isFavourite));
    if (filters?.isAvailable !== undefined)
      params.append("isAvailable", String(filters.isAvailable));
    if (filters?.search) params.append("search", filters.search);

    const response = await api.get(`/items?${params.toString()}`);
    return response.data.data;
  },

  // Get all items sorted by popularity (order frequency)
  getAllWithPopularity: async (filters?: ItemFilters): Promise<Item[]> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.isFavourite !== undefined)
      params.append("isFavourite", String(filters.isFavourite));
    if (filters?.isAvailable !== undefined)
      params.append("isAvailable", String(filters.isAvailable));
    if (filters?.search) params.append("search", filters.search);

    const response = await api.get(
      `/items/with-popularity?${params.toString()}`
    );
    return response.data.data;
  },

  // Get item by ID
  getById: async (id: string): Promise<Item> => {
    const response = await api.get(`/items/${id}`);
    return response.data.data;
  },

  // Create new item
  create: async (data: CreateItemDTO): Promise<Item> => {
    const response = await api.post("/items", data);
    return response.data.data;
  },

  // Update item
  update: async (id: string, data: UpdateItemDTO): Promise<Item> => {
    const response = await api.put(`/items/${id}`, data);
    return response.data.data;
  },

  // Delete item
  delete: async (id: string): Promise<void> => {
    await api.delete(`/items/${id}`);
  },

  // Upload item image
  uploadImage: async (id: string, file: File): Promise<Item> => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await api.post(`/items/${id}/image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },

  // Generate AI image
  generateImage: async (
    id: string,
    prompt?: string,
    async?: boolean
  ): Promise<Item> => {
    const response = await api.post(`/items/${id}/generate-image`, {
      prompt,
      async: async || false,
    });
    return response.data.data;
  },

  // Toggle favourite status
  toggleFavourite: async (id: string): Promise<Item> => {
    const response = await api.put(`/items/${id}/toggle-favourite`);
    return response.data.data;
  },

  // Toggle availability status
  toggleAvailability: async (id: string): Promise<Item> => {
    const response = await api.put(`/items/${id}/toggle-availability`);
    return response.data.data;
  },

  // Update stock
  updateStock: async (id: string, quantity: number): Promise<Item> => {
    const response = await api.put(`/items/${id}/stock`, { quantity });
    return response.data.data;
  },

  // Get low stock items
  getLowStock: async (): Promise<Item[]> => {
    const response = await api.get("/items/low-stock");
    return response.data.data;
  },
};
