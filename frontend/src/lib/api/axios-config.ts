import axios from "axios";
import { getAccessToken, clearAuthTokens } from "@/lib/auth-token";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";

// Create axios instance with auth token
export const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Add auth token and outlet ID to requests
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add outlet ID header for multi-tenant data filtering
  const getPersistedOutletId = () => {
    if (typeof window === "undefined") return null;
    const direct = localStorage.getItem("selectedOutletId");
    if (direct) return direct;

    // zustand persist key used in outletStore
    const persisted = localStorage.getItem("outlet-storage");
    if (persisted) {
      try {
        const parsed = JSON.parse(persisted);
        // Persist saves a partial state object: { currentOutlet: {...} }
        return parsed?.currentOutlet?._id || null;
      } catch (e) {
        return null;
      }
    }

    return null;
  };

  const outletId = getPersistedOutletId();

  // If there is no auth token but an outlet is stored, clear it to avoid stale/outdated outlet usage
  if (!token && outletId) {
    try {
      localStorage.removeItem("selectedOutletId");
      localStorage.removeItem("outlet-storage");
    } catch (e) {
      // ignore
    }
  }

  // If this is a reports request but we don't have auth or outlet context, skip the request to avoid backend 400s
  const isReportsRequest = config.url?.includes("/reports");
  if (isReportsRequest && (!token || !outletId)) {
    // Create a clear error so callers can handle it (special-case)
    const err: any = new Error("SKIP_REPORTS_NO_CONTEXT");
    err.code = "SKIP_REPORTS_NO_CONTEXT";
    return Promise.reject(err);
  }

  // Validate persisted outlet exists (cached per outlet id)
  if (outletId && token) {
    // simple in-memory cache on window to avoid repeated validation
    const win: any = typeof window !== "undefined" ? window : {};
    win.__validatedOutletId = win.__validatedOutletId || null;

    if (win.__validatedOutletId !== outletId) {
      // perform a lightweight validation request synchronously by returning a Promise
      return axios
        .get(`${API_URL}/api/outlets/${outletId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          win.__validatedOutletId = outletId;
          if (outletId) config.headers["x-outlet-id"] = outletId;
          return config;
        })
        .catch((err) => {
          // If outlet not found (404) or other error, clear persisted outlet and reject with special code
          try {
            localStorage.removeItem("selectedOutletId");
            localStorage.removeItem("outlet-storage");
          } catch (e) {
            // ignore
          }
          const e: any = new Error("SKIP_INVALID_OUTLET");
          e.code = "SKIP_INVALID_OUTLET";
          return Promise.reject(e);
        });
    }
  }

  if (outletId) {
    config.headers["x-outlet-id"] = outletId;
  }

  return config;
});

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear all auth tokens
      clearAuthTokens();

      // Also clear persisted outlet details to avoid stale outlet when session expired
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem("selectedOutletId");
          localStorage.removeItem("outlet-storage");
        }
      } catch (e) {
        // ignore
      }

      // Only redirect if not already on login page
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        // Show error toast before redirecting
        toast.error("Session expired. Please login again.", {
          duration: 3000,
        });

        // Redirect to login after a short delay so user sees the message
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      }
    }
    return Promise.reject(error);
  }
);

// Create public API instance without authentication
export const publicApi = axios.create({
  baseURL: `${API_URL}/api`,
});

export default api;
