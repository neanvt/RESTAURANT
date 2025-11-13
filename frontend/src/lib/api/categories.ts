import axios from "axios";
import { getAccessToken } from "@/lib/auth-token";
import {
  Category,
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from "@/types/category";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";

// Create axios instance with auth token
const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  console.log("[Categories API] Token check:", {
    hasToken: !!token,
    tokenLength: token?.length,
    tokenPreview: token ? `${token.substring(0, 20)}...` : "NONE",
  });
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.error(
      "[Categories API] No token found! Check auth-storage in localStorage"
    );
  }
  return config;
});

export const categoriesApi = {
  // Get all categories for current outlet
  getAll: async (): Promise<Category[]> => {
    const response = await api.get("/categories");
    return response.data.data;
  },

  // Create new category
  create: async (data: CreateCategoryDTO): Promise<Category> => {
    const response = await api.post("/categories", data);
    return response.data.data;
  },

  // Update category
  update: async (id: string, data: UpdateCategoryDTO): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data.data;
  },

  // Delete category
  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },

  // Reorder categories
  reorder: async (categoryIds: string[]): Promise<Category[]> => {
    const response = await api.put("/categories/reorder", { categoryIds });
    return response.data.data;
  },
};
