export interface User {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  role: "owner" | "manager" | "staff";
  outlets: string[];
  currentOutlet?: string;
  isActive?: boolean;
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
