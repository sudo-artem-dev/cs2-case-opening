import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { Platform } from "react-native";
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
      const now = new Date().toISOString();
      setLastSyncUp(new Date(now).toLocaleString());
      await AsyncStorage.setItem("lastSyncUp", now);
      setShowSyncUp(true);
      setTimeout(() => setShowSyncUp(false), 5000);
      return true;
    }
    return false;
  }, [user]);

  // Synchro serveur → mobile (uniquement si inventaire a changé)
  const syncDown = useCallback(async () => {
    if (!user) return;
    try {
      // Récupérer la dernière date de synchro locale (stockée en ISO)
      const lastSyncStr = await AsyncStorage.getItem("lastSyncDown");
      const lastSyncDate = lastSyncStr ? new Date(lastSyncStr) : null;

      // Construire l’URL avec ou sans le paramètre ?since=
      const url = lastSyncDate
        ? `${API_URL}/users/${user._id}/inventory?since=${encodeURIComponent(
            lastSyncDate.toISOString()
          )}`
        : `${API_URL}/users/${user._id}/inventory`;
      console.log("📡 syncDown URL appelée :", url);

      // Appel au serveur
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (!res.ok) return;

      const serverData = await res.json();
      const localData = await getInventoryLocal();

      let updated = false;

      // Si pas encore de synchro → première synchro complète
      if (!lastSyncDate || !localData) {
        await mergeInventoryLocal(serverData);
        updated = true;
      } else {
        // Si le serveur renvoie des skins récents, on les fusionne
        if (serverData.skins && serverData.skins.length > 0) {
          await mergeInventoryLocal({
            ...localData,
            skins: [...localData.skins, ...serverData.skins],
          });
          updated = true;
        }
      }

      if (updated) {
        const now = new Date().toISOString();
        await AsyncStorage.setItem("lastSyncDown", now);
        setLastSyncDown(new Date(now).toLocaleString());
        setShowSyncDown(true);
        setTimeout(() => setShowSyncDown(false), 5000);
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
  
          const syncedUp = await syncUp();
          if (!syncedUp) {
            await syncDown();
          }
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
  
        // Charger les dates de synchro sauvegardées
        const [lastUp, lastDown] = await Promise.all([
          AsyncStorage.getItem("lastSyncUp"),
          AsyncStorage.getItem("lastSyncDown"),
        ]);
  
        if (lastUp) setLastSyncUp(new Date(lastUp).toLocaleString());
        if (lastDown) setLastSyncDown(new Date(lastDown).toLocaleString());
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // 📡 Lancement auto des vérifs toutes les 20s
  useEffect(() => {
    if (!user) return;
  
    checkConnection(); // première vérif immédiate
  
    // --- MOBILE (Android/iOS via Expo) ---
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      const offline = !state.isConnected;
      setIsOffline(offline);
  
      // si on redevient online → relancer les synchros
      if (!offline) {
        checkConnection();
      }
    });
  
    // --- WEB (seulement sur navigateur) ---
    let cleanupBrowserListeners = () => {};
  
    if (Platform.OS === "web") {
      const updateStatus = () => checkConnection();
  
      window.addEventListener("online", updateStatus);
      window.addEventListener("offline", updateStatus);
  
      cleanupBrowserListeners = () => {
        window.removeEventListener("online", updateStatus);
        window.removeEventListener("offline", updateStatus);
      };
    }
  
    // --- Vérifs régulières toutes les 5 secondes ---
    const interval = setInterval(checkConnection, 5000);
  
    return () => {
      unsubscribeNetInfo();   // mobile
      cleanupBrowserListeners(); // web
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
