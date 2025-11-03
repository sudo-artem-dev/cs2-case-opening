import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export function useApi() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const apiFetch = async (url: string, options: RequestInit = {}) => {
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
  };

  return { apiFetch };
}
