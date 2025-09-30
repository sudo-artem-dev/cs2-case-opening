import AsyncStorage from "@react-native-async-storage/async-storage";

export type CaseType = {
  _id: string;
  name: string;
  imageUrl: string;
};

export type CaseDetailType = {
  _id: string;
  name: string;
  imageUrl: string;
  rarityProbabilities: { rarity: string; probability: number | string }[];
  skins: Skin[];
};

export type Skin = {
  _id: string;
  name: string;
  rarity: string;
  imageUrl: string;
  cost?: number;
};

// Sauvegarde toutes les caisses (liste)
export const saveCasesLocal = async (cases: CaseType[]) => {
  try {
    await AsyncStorage.setItem("cases", JSON.stringify(cases));
  } catch (error) {
    console.error("Erreur de sauvegarde des cases:", error);
  }
};

export const getCasesLocal = async (): Promise<CaseType[]> => {
  try {
    const stored = await AsyncStorage.getItem("cases");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Erreur de lecture des cases:", error);
    return [];
  }
};

// Sauvegarde le détail d’une caisse
export const saveCaseDetailLocal = async (caseDetail: CaseDetailType) => {
  try {
    await AsyncStorage.setItem(`case_${caseDetail._id}`, JSON.stringify(caseDetail));

    // Sauvegarde aussi tous les skins de la caisse d’un coup
    if (caseDetail.skins?.length) {
      await saveAllSkinsLocal(caseDetail.skins);
    }
  } catch (error) {
    console.error("Erreur de sauvegarde case detail:", error);
  }
};

export const getCaseDetailLocal = async (id: string): Promise<CaseDetailType | null> => {
  try {
    const stored = await AsyncStorage.getItem(`case_${id}`);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Erreur de lecture case detail:", error);
    return null;
  }
};

// Sauvegarde un seul skin
export const saveSkinLocal = async (skin: Skin) => {
  try {
    await AsyncStorage.setItem(`skin_${skin._id}`, JSON.stringify(skin));
  } catch (error) {
    console.error("Erreur de sauvegarde skin:", error);
  }
};

// Sauvegarde tous les skins d’une caisse
export const saveAllSkinsLocal = async (skins: Skin[]) => {
  try {
    const entries: [string, string][] = skins.map((s) => [
      `skin_${s._id}`,
      JSON.stringify(s),
    ]);
    await AsyncStorage.multiSet(entries);
  } catch (error) {
    console.error("Erreur de sauvegarde multi-skins:", error);
  }
};

export const getSkinLocal = async (id: string): Promise<Skin | null> => {
  try {
    const stored = await AsyncStorage.getItem(`skin_${id}`);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Erreur de lecture skin:", error);
    return null;
  }
};
