import AsyncStorage from "@react-native-async-storage/async-storage";
import { Skin } from "./caseService";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Sauvegarde skin obtenu offline (avec pendingSync)
export const savePendingSkin = async (skin: Skin, caseId: string, userId: string) => {
  try {
    const pending = {
      ...skin,
      pendingSync: true,
      caseId,
      userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const key = `pending_${skin._id}_${Date.now()}`;
    await AsyncStorage.setItem(key, JSON.stringify(pending));
  } catch (e) {
    console.error("Erreur savePendingSkin:", e);
  }
};

// Récupère tous les skins en attente de synchro
export const getPendingSkins = async (): Promise<any[]> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const pendingKeys = keys.filter((k) => k.startsWith("pending_"));
    const values = await AsyncStorage.multiGet(pendingKeys);
    return values
      .map(([key, v]) => (v ? { key, ...JSON.parse(v) } : null))
      .filter(Boolean);
  } catch (e) {
    console.error("Erreur getPendingSkins:", e);
    return [];
  }
};

// Supprime après synchro réussie
export const removePendingSkin = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error("Erreur removePendingSkin:", e);
  }
};

// Lance la synchro avec le backend (apiFetch est injecté depuis le hook)
export const syncPendingSkins = async (
    apiFetch: (url: string, options?: RequestInit) => Promise<Response | null>
  ): Promise<boolean> => {
    try {
      const pending = await getPendingSkins();
      if (!pending.length) return false; // rien à synchroniser
  
      let synced = false;
  
      for (const item of pending) {
        try {
          const res = await apiFetch(`${API_URL}/cases/${item.caseId}/sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: item.userId,
              skinId: item._id,
              name: item.name,
              rarity: item.rarity,
              imageUrl: item.imageUrl,
              cost: item.cost,
              createdAt: item.createdAt || Date.now(),
              updatedAt: item.updatedAt || Date.now(),
            }),
          });
  
          if (res && res.ok) {
            await removePendingSkin(item.key); // synchro réussie → suppression
            synced = true; // au moins un skin synchronisé
          } else {
            console.warn("Échec synchro skin:", item._id);
          }
        } catch (err) {
          console.error("Erreur synchro skin:", err);
        }
      }
  
      return synced;
    } catch (e) {
      console.error("Erreur syncPendingSkins:", e);
      return false;
    }
  };
