import axios from "axios";
import { getAccessToken } from "@/lib/auth-token";
import type {
  Outlet,
  CreateOutletInput,
  UpdateOutletInput,
  OutletStats,
} from "@/types/outlet";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";
const API_BASE = API_URL;

// API Response type
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

/**
 * Get authorization headers
 */
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${getAccessToken() || ""}`,
  },
});

/**
 * Get all outlets for authenticated user
 */
export const getAllOutlets = async (): Promise<Outlet[]> => {
  const response = await axios.get<ApiResponse<Outlet[]>>(
    `${API_BASE}/outlets`,
    getAuthHeaders()
  );
  return response.data.data;
};

/**
 * Create a new outlet
 */
export const createOutlet = async (
  data: CreateOutletInput
): Promise<Outlet> => {
  const response = await axios.post<ApiResponse<Outlet>>(
    `${API_BASE}/outlets`,
    data,
    getAuthHeaders()
  );
  return response.data.data;
};

/**
 * Get current outlet
 */
export const getCurrentOutlet = async (): Promise<Outlet> => {
  const response = await axios.get<ApiResponse<Outlet>>(
    `${API_BASE}/outlets/current`,
    getAuthHeaders()
  );
  return response.data.data;
};

/**
 * Get outlet by ID
 */
export const getOutletById = async (id: string): Promise<Outlet> => {
  const response = await axios.get<ApiResponse<Outlet>>(
    `${API_BASE}/outlets/${id}`,
    getAuthHeaders()
  );
  return response.data.data;
};

/**
 * Update outlet
 */
export const updateOutlet = async (
  id: string,
  data: UpdateOutletInput
): Promise<Outlet> => {
  const response = await axios.put<ApiResponse<Outlet>>(
    `${API_BASE}/outlets/${id}`,
    data,
    getAuthHeaders()
  );
  return response.data.data;
};

/**
 * Delete outlet
 */
export const deleteOutlet = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE}/outlets/${id}`, getAuthHeaders());
};

/**
 * Select outlet as current
 */
export const selectOutlet = async (id: string): Promise<Outlet> => {
  const response = await axios.post<ApiResponse<Outlet>>(
    `${API_BASE}/outlets/${id}/select`,
    {},
    getAuthHeaders()
  );
  return response.data.data;
};

/**
 * Upload outlet logo
 */
export const uploadOutletLogo = async (
  id: string,
  file: File
): Promise<Outlet> => {
  const formData = new FormData();
  formData.append("logo", file);

  const response = await axios.put<ApiResponse<Outlet>>(
    `${API_BASE}/outlets/${id}/logo`,
    formData,
    {
      ...getAuthHeaders(),
      headers: {
        ...getAuthHeaders().headers,
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data.data;
};

/**
 * Delete outlet logo
 */
export const deleteOutletLogo = async (id: string): Promise<Outlet> => {
  const response = await axios.delete<ApiResponse<Outlet>>(
    `${API_BASE}/outlets/${id}/logo`,
    getAuthHeaders()
  );
  return response.data.data;
};

/**
 * Get outlet statistics
 */
export const getOutletStats = async (id: string): Promise<OutletStats> => {
  const response = await axios.get<ApiResponse<OutletStats>>(
    `${API_BASE}/outlets/${id}/stats`,
    getAuthHeaders()
  );
  return response.data.data;
};
