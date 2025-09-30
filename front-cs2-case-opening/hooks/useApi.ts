import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useCallback } from "react";

export function useApi() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const apiFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${user?.token}`,
      };

      const response = await fetch(url, { ...options, headers });

      if (response.status === 401) {
        // Token expiré ou invalide → logout + redirection login
        await logout();
        router.replace("/");
        return null;
      }

      return response;
    },
    [user?.token, logout, router] // ne change que si le token/logout/router changent
  );

  return { apiFetch };
}
