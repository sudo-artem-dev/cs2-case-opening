import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, TouchableOpacity, Modal } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { saveInventoryLocal, getInventoryLocal } from "@/services/inventoryService";

type Skin = {
  skinId: string;
  name: string;
  rarity: string;
  imageUrl: string;
  cost: number;
  case_id: string;
};

type InventoryResponse = {
  _id: string;
  totalSkins: number;
  totalValue: number;
  skins: Skin[];
};

export default function InventoryScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { apiFetch } = useApi();

  const [inventory, setInventory] = useState<InventoryResponse | null>(null);
  const [loadingInv, setLoadingInv] = useState(true);
  const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null);
  const [selectedCaseName, setSelectedCaseName] = useState<string>("");

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const rarityColors: Record<string, string> = {
    "Mil-Spec": "#4b69ff",
    "Restricted": "#8847ff",
    "Classified": "#d32ce6",
    "Covert": "#eb4b4b",
    "Spécial Or": "#ffd700",
  };

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      (async () => {
        try {
          setLoadingInv(true);
          const res = await apiFetch(`${API_URL}/users/${user?._id}/inventory`);
          if (!res || cancelled) return;

          const data = await res.json();
          if (!cancelled) {
            setInventory(data);
            await saveInventoryLocal(data);
          }
        } catch (err) {
          console.error("Erreur fetch inventory:", err);

          // 🔄 fallback offline
          const localInv = await getInventoryLocal();
          if (localInv) setInventory(localInv);
        } finally {
          if (!cancelled) setLoadingInv(false);
        }
      })();

      return () => {
        cancelled = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?._id, apiFetch])
  );


  if (loading || loadingInv) {
    return <ActivityIndicator size="large" color="#fff" style={{ flex: 1 }} />;
  }

  if (!inventory) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorMessage}>Inventaire introuvable</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Titre */}
      <Text style={styles.title}>Inventaire</Text>

      {/* Résumé */}
      <View style={styles.summaryRow}>
        <Text style={styles.summaryBox}>
          {inventory.totalSkins} skin{inventory.totalSkins > 1 ? "s" : ""}
        </Text>
        <Text style={styles.summaryBox}>
          {inventory.totalValue.toFixed(2)} €
        </Text>
      </View>

    {/* Liste ou état vide */}
    {inventory.totalSkins === 0 ? (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyTitle}>Inventaire vide</Text>
        <Text style={styles.emptySubtitle}>
          Ouvre des caisses pour obtenir tes premiers skins.
        </Text>

        <TouchableOpacity
          style={styles.openCasesBtn}
          onPress={() => router.push("/cases")}
          accessibilityRole="button"
          accessibilityLabel="Ouvrir les caisses"
        >
          <Text style={styles.openCasesBtnText}>Ouvrir des caisses</Text>
        </TouchableOpacity>
      </View>
    ) : (
      <FlatList
        data={inventory.skins}
        numColumns={3}
        keyExtractor={(item, index) => `${item.skinId}-${index}`}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.skinCard}
            onPress={async () => {
              try {
                setSelectedSkin(item);
                setSelectedCaseName("");

                const res1 = await apiFetch(`${API_URL}/skins/${item.skinId}`);
                if (!res1) return;
                const skinDet: Skin = await res1.json();

                if (skinDet.case_id) {
                  const res2 = await apiFetch(`${API_URL}/cases/${skinDet.case_id}`);
                  if (res2 && res2.ok) {
                    const caseData = await res2.json();
                    setSelectedCaseName(caseData.name || "");
                  }
                }
              } catch (e) {
                console.error("Erreur chargement détails skin/caisse:", e);
              }
            }}
          >
            <Image
              source={{ uri: item.imageUrl }} 
              style={styles.skinImage}
              resizeMode="contain"
            />
            <View
              style={[
                styles.rarityBar,
                { backgroundColor: rarityColors[item.rarity] || "#fff" },
              ]}
            >
              <Text style={styles.skinName}>
                {item.rarity === "Spécial Or" ? "★ " : ""}
                {item.name}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    )}

      {/* Modal skin agrandi */}
      <Modal visible={!!selectedSkin} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {selectedSkin && (
              <>
                {/* Croix */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedSkin(null)}
                  accessibilityLabel="Fermer"
                >
                  <Text style={{ color: "#fff", fontSize: 20 }}>✕</Text>
                </TouchableOpacity>

                {/* Titre centré */}
                <Text style={styles.modalTitle}>
                  {selectedCaseName || "Galerie"}
                </Text>

                <Image
                  source={{ uri: selectedSkin.imageUrl }}
                  style={styles.largeImage}
                  resizeMode="contain"
                />

                <Text style={styles.priceText}>{selectedSkin.cost.toFixed(2)} €</Text>

                <View
                  style={[
                    styles.modalRarityBar,
                    { backgroundColor: rarityColors[selectedSkin.rarity] || "#444" },
                  ]}
                >
                  <Text style={styles.modalSkinName}>
                    {selectedSkin.rarity === "Spécial Or" ? "★ " : ""}
                    {selectedSkin.name}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111015", padding: 15 },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 15,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  summaryBox: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#1f1e24",
    color: "#fff",
    paddingVertical: 10,
    borderRadius: 8,
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },

  skinCard: {
    flex: 1,
    margin: 5,
    backgroundColor: "#1a1920",
    borderRadius: 0,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "space-between",
    aspectRatio: 1, 
    maxWidth: "30%",
  },
  skinImage: { width: "100%", height: "70%"},
  rarityBar: {
    width: "100%",
    height: "30%",
    alignItems: "center",
    justifyContent: "center",
  },
  skinName: { fontSize: 12, color: "#fff", textAlign: "center" },

  errorMessage: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: 300,
    backgroundColor: "#1a1920",
    alignItems: "center",
    borderRadius: 0,
    overflow: "hidden",
    paddingBottom: 0,
  },
  closeButton: {
    position: "absolute",
    top: 12,         // un peu plus bas si tu veux
    right: 12,
    zIndex: 10,
  },
  modalTitle: {
    width: "100%",
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 14,    
    marginBottom: 10,
  },
  largeImage: {
    width: "100%",
    height: 200,
    marginTop: 0,   
  },
  priceText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginVertical: 10,
  },
  modalRarityBar: {
    width: "100%",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSkinName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    color: "#cfcfd6",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 18,
  },
  openCasesBtn: {
    backgroundColor: "#1f1e24",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  openCasesBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },  
});
