import axios from "axios";
import type {
  AuthResponse,
  SendOTPRequest,
  SendOTPResponse,
  VerifyOTPRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";
const API_BASE = API_URL;

/**
 * Send OTP to phone number
 */
export const sendOTP = async (
  data: SendOTPRequest
): Promise<SendOTPResponse> => {
  const response = await axios.post(`${API_BASE}/auth/send-otp`, data);
  return response.data;
};

/**
 * Verify OTP and login/register
 */
export const verifyOTP = async (
  data: VerifyOTPRequest
): Promise<AuthResponse> => {
  const response = await axios.post(`${API_BASE}/auth/verify-otp`, data);
  return response.data;
};

/**
 * Register user (signup)
 */
export const register = async (data: {
  phone: string;
  name?: string;
  email?: string;
  password?: string;
}) => {
  const response = await axios.post(`${API_BASE}/auth/register`, data);
  return response.data;
};

/**
 * Login with identifier and password
 */
export const login = async (data: { identifier: string; password: string }) => {
  const response = await axios.post(`${API_BASE}/auth/login`, data);
  return response.data;
};

/**
 * Set password after verifying OTP (idToken)
 */
export const setPassword = async (data: {
  idToken: string;
  password: string;
}) => {
  const response = await axios.post(`${API_BASE}/auth/set-password`, data);
  return response.data;
};

/**
 * Refresh access token
 */
export const refreshToken = async (
  data: RefreshTokenRequest
): Promise<RefreshTokenResponse> => {
  const response = await axios.post(`${API_BASE}/auth/refresh`, data);
  return response.data;
};

/**
 * Logout user
 */
export const logout = async (
  token: string
): Promise<{ success: boolean; message: string }> => {
  const response = await axios.post(
    `${API_BASE}/auth/logout`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

/**
 * Get current user details
 */
export const getCurrentUser = async (token: string): Promise<AuthResponse> => {
  const response = await axios.get(`${API_BASE}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
