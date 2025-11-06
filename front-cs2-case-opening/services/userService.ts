// services/userService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserData = {
  _id: string;
  pseudo: string;
  skinsCount: number;
  inventoryValue: number;
};

// Sauvegarde tous les utilisateurs
export const saveUsersLocal = async (users: UserData[]) => {
  try {
    await AsyncStorage.setItem("users", JSON.stringify(users));
  } catch (error) {
    console.error("Erreur de sauvegarde des users:", error);
  }
};

// Récupère les utilisateurs depuis AsyncStorage
export const getUsersLocal = async (): Promise<UserData[]> => {
  try {
    const stored = await AsyncStorage.getItem("users");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Erreur de lecture des users:", error);
    return [];
  }
};
