import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { syncPendingSkins } from "@/services/syncService";
import {
  getInventoryLocal,
  mergeInventoryLocal,
} from "@/services/inventoryService";

type User = {
  _id: string;
  pseudo: string;
  role: string;
  token: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isOffline: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  lastSyncUp: string | null;
  lastSyncDown: string | null;
  showSyncUp: boolean;
  showSyncDown: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [lastSyncUp, setLastSyncUp] = useState<string | null>(null);
  const [lastSyncDown, setLastSyncDown] = useState<string | null>(null);
  const [showSyncUp, setShowSyncUp] = useState(false);
  const [showSyncDown, setShowSyncDown] = useState(false);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  // Synchro offline → serveur
  const syncUp = useCallback(async () => {
    if (!user) return;
    const synced = await syncPendingSkins(
      async (url: string, options?: RequestInit): Promise<Response | null> => {
        try {
          return await fetch(url, {
            ...options,
            headers: {
              ...(options?.headers || {}),
              Authorization: `Bearer ${user.token}`,
            },
          });
        } catch {
          return null;
        }
      }
    );
    if (synced) {
      const now = new Date().toLocaleString();
      setLastSyncUp(now);
      setShowSyncUp(true);
      setTimeout(() => setShowSyncUp(false), 5000);
    }
  }, [user]);

  // Synchro serveur → mobile (uniquement si inventaire a changé)
  const syncDown = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/users/${user._id}/inventory`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (res.ok) {
        const newData = await res.json();
        const oldData = await getInventoryLocal();

        // comparer ancien inventaire avec le nouveau
        if (JSON.stringify(newData) !== JSON.stringify(oldData)) {
          // maintenant on fusionne au lieu d’écraser
          await mergeInventoryLocal(newData);

          const now = new Date().toLocaleString();
          setLastSyncDown(now);
          setShowSyncDown(true);
          setTimeout(() => setShowSyncDown(false), 5000);
        }
      }
    } catch (e) {
      console.warn("Erreur syncDown:", e);
    }
  }, [API_URL, user]);

  // Vérification connexion + lancement synchros
  const checkConnection = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/cases/ping`, {
        method: "GET",
        cache: "no-cache",
      });
  
      if (res.ok) {
        if (isOffline) {
          // ⚡ On vient juste de repasser online
          setIsOffline(false);
  
          await syncUp();
          await syncDown();
        } else {
          // déjà online → pas de synchro répétée
          setIsOffline(false);
        }
      } else {
        if (!isOffline) setIsOffline(true);
      }
    } catch {
      if (!isOffline) setIsOffline(true);
    }
  }, [API_URL, isOffline, syncUp, syncDown]);  

  // 🔑 Chargement utilisateur au démarrage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // 📡 Lancement auto des vérifs toutes les 20s
  useEffect(() => {
    if (!user) return;

    checkConnection(); // première vérif

    const updateStatus = () => checkConnection();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    const interval = setInterval(checkConnection, 5000);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
      clearInterval(interval);
    };
  }, [user, checkConnection]);

  const login = async (userData: User) => {
    setUser(userData);
    await AsyncStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isOffline,
        login,
        logout,
        lastSyncUp,
        lastSyncDown,
        showSyncUp,
        showSyncDown,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
