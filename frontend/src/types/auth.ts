export interface User {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  role: "primary_admin" | "secondary_admin" | "staff" | "waiter" | "kitchen";
  outlets: string[];
  currentOutlet?: string;
  isActive?: boolean;
  requirePasswordChange?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface SendOTPRequest {
  phone: string;
}

export interface SendOTPResponse {
  success: boolean;
  message?: string;
  data?: {
    phone: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface VerifyOTPRequest {
  idToken: string;
  name?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
  };
  error?: {
    code: string;
    message: string;
  };
}
