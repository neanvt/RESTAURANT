/**
 * Centralized authentication token management
 * Handles token retrieval from Zustand's persisted storage
 */

/**
 * Get the access token from localStorage
 * Zustand persists the auth state under "auth-storage" key as JSON
 */
export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) {
      return null;
    }

    const parsed = JSON.parse(authStorage);
    return parsed.state?.accessToken || null;
  } catch (error) {
    console.error("Error reading auth token:", error);
    return null;
  }
};

/**
 * Get the refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) {
      return null;
    }

    const parsed = JSON.parse(authStorage);
    return parsed.state?.refreshToken || null;
  } catch (error) {
    console.error("Error reading refresh token:", error);
    return null;
  }
};

/**
 * Clear all auth tokens from localStorage
 */
export const clearAuthTokens = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem("auth-storage");
    localStorage.removeItem("token"); // Legacy cleanup
    localStorage.removeItem("accessToken"); // Legacy cleanup
    localStorage.removeItem("user"); // Legacy cleanup
  } catch (error) {
    console.error("Error clearing auth tokens:", error);
  }
};
