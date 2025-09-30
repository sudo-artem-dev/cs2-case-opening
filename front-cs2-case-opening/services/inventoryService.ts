import AsyncStorage from "@react-native-async-storage/async-storage";

export type Skin = {
  skinId: string;
  name: string;
  rarity: string;
  imageUrl: string;
  cost: number;
  case_id: string;
};

export type InventoryResponse = {
  _id: string;
  totalSkins: number;
  totalValue: number;
  skins: Skin[];
};

// Sauvegarder l'inventaire complet
export const saveInventoryLocal = async (inventory: InventoryResponse) => {
  try {
    await AsyncStorage.setItem("inventory", JSON.stringify(inventory));
  } catch (err) {
    console.error("Erreur de sauvegarde inventory:", err);
  }
};

// Charger l'inventaire depuis le local
export const getInventoryLocal = async (): Promise<InventoryResponse | null> => {
  try {
    const stored = await AsyncStorage.getItem("inventory");
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    console.error("Erreur de lecture inventory:", err);
    return null;
  }
};
export const mergeInventoryLocal = async (newData: InventoryResponse) => {
  try {
    const oldData = await getInventoryLocal();

    if (!oldData) {
      // Rien en local → on sauvegarde tout
      await saveInventoryLocal(newData);
      return;
    }

    // 🔄 Supprimer les doublons envoyés par le serveur (basé sur skinId)
    const uniqueNewSkins: Skin[] = Array.from(
      new Map(newData.skins.map((s) => [s.skinId, s])).values()
    );

    const updatedSkins: Skin[] = [];
    const oldMap = new Map(oldData.skins.map((s) => [s.skinId, s]));

    const added: Skin[] = [];
    const updated: Skin[] = [];
    const removed: Skin[] = [];

    // Ajouts & mises à jour
    for (const skin of uniqueNewSkins) {
      const existing = oldMap.get(skin.skinId);
      if (!existing) {
        added.push(skin);
        updatedSkins.push(skin);
      } else if (JSON.stringify(existing) !== JSON.stringify(skin)) {
        updated.push(skin);
        updatedSkins.push(skin);
      } else {
        updatedSkins.push(existing); // inchangé
      }
      oldMap.delete(skin.skinId);
    }

    // Les skins restants dans oldMap = supprimés côté serveur
    removed.push(...oldMap.values());

    // 🔎 DEBUG LOG
    console.log(
      "Ajouts:",
      added.map((s) => `${s.name} (${s.skinId})`)
    );
    console.log(
      "Mises à jour:",
      updated.map((s) => `${s.name} (${s.skinId})`)
    );
    console.log(
      "Supprimés:",
      removed.map((s) => `${s.name} (${s.skinId})`)
    );

    // Construire inventaire fusionné
    const merged: InventoryResponse = {
      ...newData,
      skins: updatedSkins,
    };

    await saveInventoryLocal(merged);
  } catch (err) {
    console.error("Erreur mergeInventoryLocal:", err);
  }
};

