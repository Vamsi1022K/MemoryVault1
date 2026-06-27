import { useAuth } from "@clerk/clerk-react";
import { useCallback } from "react";

export function useApi() {
  const { getToken } = useAuth();

  const apiFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    try {
      const token = await getToken();
      console.log("🔑 Clerk Token fetched:", token ? "YES (populated)" : "NO (null/empty)");
      
      const headers: Record<string, string> = {
        ...((options.headers as Record<string, string>) || {}),
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // If sending JSON, ensure Content-Type is set
      if (options.body && typeof options.body === "string" && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }

      return fetch(url, {
        ...options,
        headers,
      });
    } catch (error) {
      console.error("API Fetch Error:", error);
      throw error;
    }
  }, [getToken]);

  return apiFetch;
}

