import { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Animated,
  Platform,
  Easing,
  Dimensions,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/hooks/useApi";
import { useFocusEffect } from "@react-navigation/native";
import { saveCaseDetailLocal, getCaseDetailLocal, saveSkinLocal, getSkinLocal } from "@/services/caseService";
import { savePendingSkin } from "@/services/syncService";
import { saveInventoryLocal, getInventoryLocal } from "@/services/inventoryService";

type Skin = {
  _id: string;
  name: string;
  rarity: string;
  imageUrl: string;
  cost?: number;
};

type CaseDetail = {
  _id: string;
  name: string;
  imageUrl: string;
  rarityProbabilities: { rarity: string; probability: number | string }[];
  skins: Skin[];
};

const { width: SCREEN_W } = Dimensions.get("window");

// -- Mesures roulette --
const ITEM_W = 130;
const ITEM_H = 120;
const ITEM_SPACING = 10;
const CELL_W = ITEM_W + ITEM_SPACING;
const CENTER_PAD = (SCREEN_W - ITEM_W) / 2;
const ROULETTE_H = 260;
const MARKER_EXTRA = 20;
const MARKER_W = 3;
const MARKER_SHIFT_UP = 35;

// ---------- utils aléatoires pondérés ----------
const toFrac = (v: number | string) => {
  const n = Number(v);
  if (!isFinite(n)) return 0;
  return n > 1 ? n / 100 : n; // accepte 12 ou 0.12
};
const buildRarityWeights = (
  probs: { rarity: string; probability: number | string }[] = []
) => {
  const map: Record<string, number> = {};
  for (const p of probs) map[p.rarity] = toFrac(p.probability);
  return map;
};
const pickRarity = (weights: Record<string, number>, allowed: Set<string>) => {
  let total = 0;
  for (const [r, w] of Object.entries(weights)) if (allowed.has(r)) total += w;
  if (total <= 0) {
    const arr = Array.from(allowed);
    return arr[Math.floor(Math.random() * arr.length)];
  }
  const rnd = Math.random() * total;
  let acc = 0;
  for (const [r, w] of Object.entries(weights)) {
    if (!allowed.has(r)) continue;
    acc += w;
    if (rnd <= acc) return r;
  }
  return Array.from(allowed)[0];
};
const pickRandom = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export default function CaseDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user, loading } = useAuth();
  const router = useRouter();
  const { apiFetch } = useApi();

  const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
  const [loadingCase, setLoadingCase] = useState(true);
  const [selectedSkin, setSelectedSkin] = useState<Skin | null>(null);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedProbabilities, setEditedProbabilities] = useState<
    { rarity: string; probability: number | string }[]
  >([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [reelSkins, setReelSkins] = useState<Skin[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rollingFinished, setRollingFinished] = useState(false);
  const [wonSkinInline, setWonSkinInline] = useState<Skin | null>(null);
  const canUseNativeDriver = Platform.OS !== "web";

  // Animation
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const wonAppear = useRef(new Animated.Value(0)).current;
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const sub = scrollX.addListener(({ value }) => {
      scrollRef.current?.scrollTo({ x: value, animated: false });
    });
    return () => scrollX.removeListener(sub);
  }, [scrollX]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  const rarityColors: Record<string, string> = {
    "Mil-Spec": "#4b69ff",
    "Restricted": "#8847ff",
    "Classified": "#d32ce6",
    "Covert": "#eb4b4b",
    "Spécial Or": "#ffd700",
  };

  useEffect(() => {
    const fetchCase = async () => {
      setLoadingCase(true);
      setCaseDetail(null);
  
      try {
        const res = await apiFetch(`${API_URL}/cases/${id}`);
        if (!res) throw new Error("NETWORK_OFFLINE");
        const data = await res.json();
        setEditedProbabilities(data.rarityProbabilities || []);
        setCaseDetail(data);
        await saveCaseDetailLocal(data);
      } catch (err) {
        console.error("Erreur fetch case:", err);
  
        const localCase = await getCaseDetailLocal(id as string);
        if (localCase) {
          setCaseDetail(localCase);
          setEditedProbabilities(localCase.rarityProbabilities || []);
        } else {
          setCaseDetail(null);
        }
      } finally {
        setLoadingCase(false);
      }
    };
    if (id && user) fetchCase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  // --- RESET propre de l'UI
  const resetUI = useCallback(() => {
    setIsOpening(false);
    setRollingFinished(false);
    setWonSkinInline(null);
    setReelSkins([]);
    setSelectedSkin(null);
  }, []);

  useFocusEffect(
    useCallback(() => {
      resetUI();
      return () => {
        resetUI();
      };
    }, [resetUI])
  );

  // ---- Ouvrir la caisse : roulette
  const openCase = async () => {
    setTimeout(() => setErrorMessage(null), 3000);
    if (!caseDetail) return;

    const BASE = caseDetail.skins;
    const REEL_LEN = 120;
    const weights = buildRarityWeights(caseDetail.rarityProbabilities);

    const byRarity: Record<string, Skin[]> = {};
    for (const s of BASE) (byRarity[s.rarity] ||= []).push(s);

    const allowedRarities = new Set(BASE.map((s) => s.rarity));
    const targetIndex = REEL_LEN - 10;

    setIsOpening(true);
    setSelectedSkin(null);
    setRollingFinished(false);
    setWonSkinInline(null);

    try {
      // ----------- MODE ONLINE -----------
      const res = await apiFetch(`${API_URL}/cases/${caseDetail._id}/open`, {
        method: "POST",
      });

      if (!res) {
        throw new Error("NETWORK_OFFLINE");
      }

      if (!res.ok) {
        const txt = await res.text();
        let body: any = null;
        try { body = JSON.parse(txt); } catch {}
        const msg = body?.message || `${res.status} ${res.statusText}`;
        throw new Error(`LOGIC_ERROR:${msg}`);
      }

      // Succès online
      const data = await res.json();
      const wonSkinId: string = data.skin.skinId;
      const wonSkin = BASE.find((s) => s._id === wonSkinId) || BASE[0];

      await runRoulette(wonSkin, BASE, byRarity, weights, allowedRarities, targetIndex, true);
    } catch (err: any) {
      console.warn("❌ Erreur ouverture caisse:", err.message);

      if (err.message.startsWith("LOGIC_ERROR:")) {
        // Cas 422 / 500 côté serveur → bloquer
        setErrorMessage(err.message.replace("LOGIC_ERROR:", ""));
        setIsOpening(false);
        return;
      }

      // Cas offline → bascule locale
      const offlineErrors = [
        "NETWORK_OFFLINE",
        "Failed to fetch",
        "fetch failed",
        "Network request failed",
        "ERR_ADDRESS_UNREACHABLE",
      ];

      if (offlineErrors.some((m) => err.message.includes(m))) {
        console.warn("⚠️ Mode offline activé");

        const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
        if (totalWeight <= 0) {
          setErrorMessage("Impossible d’ouvrir : probabilités invalides");
          setIsOpening(false);
          return;
        }

        const rarity = pickRarity(weights, allowedRarities);
        const pool = byRarity[rarity]?.length ? byRarity[rarity] : BASE;
        const wonSkin = pickRandom(pool);

        // Sauvegarde locale + inventaire
        await saveSkinLocal(wonSkin);
        const localInv = await getInventoryLocal();
        const newInv = localInv
          ? {
              ...localInv,
              totalSkins: localInv.totalSkins + 1,
              totalValue: localInv.totalValue + (wonSkin.cost || 0),
              skins: [
                ...localInv.skins,
                {
                  skinId: wonSkin._id,
                  name: wonSkin.name,
                  rarity: wonSkin.rarity,
                  imageUrl: wonSkin.imageUrl,
                  cost: wonSkin.cost || 0,
                  case_id: caseDetail._id,
                },
              ],
            }
          : {
              _id: user!._id,
              totalSkins: 1,
              totalValue: wonSkin.cost || 0,
              skins: [
                {
                  skinId: wonSkin._id,
                  name: wonSkin.name,
                  rarity: wonSkin.rarity,
                  imageUrl: wonSkin.imageUrl,
                  cost: wonSkin.cost || 0,
                  case_id: caseDetail._id,
                },
              ],
            };
        await saveInventoryLocal(newInv);

        if (user?._id) {
          await savePendingSkin(wonSkin, caseDetail._id, user._id);
        }

        await runRoulette(wonSkin, BASE, byRarity, weights, allowedRarities, targetIndex, false);
      } else {
        // autre erreur inconnue
        setErrorMessage("Erreur inattendue: " + err.message);
        setIsOpening(false);
      }
    }
  };

  /**
   * Factorise l’animation roulette
   */
  async function runRoulette(
    wonSkin: Skin,
    BASE: Skin[],
    byRarity: Record<string, Skin[]>,
    weights: any,
    allowedRarities: Set<string>,
    targetIndex: number,
    online: boolean
  ) {
    const REEL_LEN = 120;

    const reel: Skin[] = new Array(REEL_LEN);
    for (let i = 0; i < REEL_LEN; i++) {
      if (i === targetIndex) continue;
      const rarity = pickRarity(weights, allowedRarities);
      const pool = byRarity[rarity]?.length ? byRarity[rarity] : BASE;
      reel[i] = pickRandom(pool);
    }
    reel[targetIndex] = wonSkin;
    setReelSkins(reel);

    requestAnimationFrame(() => {
      const finalOffset = targetIndex * CELL_W;
      scrollX.setValue(0);
      Animated.timing(scrollX, {
        toValue: finalOffset,
        duration: 10000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start(async () => {
        if (online) {
          try {
            const skinRes = await apiFetch(`${API_URL}/skins/${wonSkin._id}`);
            if (skinRes) {
              const skinData = await skinRes.json();
              setWonSkinInline(skinData);
            } else {
              setWonSkinInline(wonSkin);
            }
          } catch {
            setWonSkinInline(wonSkin);
          }
        } else {
          setWonSkinInline(wonSkin);
        }

        setRollingFinished(true);
        wonAppear.setValue(0);
        Animated.sequence([
          Animated.delay(180),
          Animated.timing(wonAppear, {
            toValue: 1,
            duration: 1000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: canUseNativeDriver,
          }),
        ]).start();
      });
    });
  }

  if (loadingCase) return <ActivityIndicator size="large" color="#fff" />;
  if (!caseDetail) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "white", fontSize: 20, fontWeight: "600", textAlign: "center" }}>
          Caisse introuvable
        </Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.caseTitle}>Caisse {caseDetail.name}</Text>

      {successMessage && (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      )}
      {errorMessage && (
        <View style={{ backgroundColor: "#b00020", padding: 10, borderRadius: 5, marginBottom: 10 }}>
          <Text style={{ color: "#fff", textAlign: "center" }}>{errorMessage}</Text>
        </View>
      )}

      {!isOpening && (
        <View style={styles.caseHeader}>
          <View style={{ alignItems: "center", flex: 1 }}>
            <Image source={{ uri: caseDetail.imageUrl }} style={styles.caseImage} />
            <TouchableOpacity style={styles.openButton} disabled={isOpening} onPress={openCase}>
              <Text style={styles.openButtonText}>Ouvrir</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.probabilities}>
            {user?.role === "admin" && (
              <TouchableOpacity onPress={() => setEditModalVisible(true)}>
                <Image
                  source={require("../../../assets/images/edit.png")}
                  style={{ width: 24, height: 24, alignSelf: "flex-end", marginBottom: 10 }}
                  tintColor="white"
                />
              </TouchableOpacity>
            )}

            {caseDetail.rarityProbabilities?.map((p, i) => (
              <View key={i} style={styles.probaRow}>
                <View
                  style={[
                    styles.probaColor,
                    { backgroundColor: rarityColors[p.rarity] || "#fff" },
                  ]}
                />
                <Text style={styles.probaText}>
                  {p.rarity} :{" "}
                  {Number(p.probability) <= 1
                    ? (Number(p.probability) * 100).toFixed(1)
                    : Number(p.probability).toFixed(1)}
                  %
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Roulette */}
      {isOpening && (
        <View style={[styles.rouletteWrap, { height: ROULETTE_H }]}>
          <View
            style={[
              styles.centerMarker,
              {
                pointerEvents: "none",
                top: (ROULETTE_H - (ITEM_H + MARKER_EXTRA)) / 2 - MARKER_SHIFT_UP,
                height: ITEM_H + MARKER_EXTRA,
                width: MARKER_W,
                left: SCREEN_W / 2 - MARKER_W / 2,
              },
            ]}
          />
          <Animated.ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            contentContainerStyle={{ paddingHorizontal: CENTER_PAD }}
            style={{ width: "100%" }}
          >
            {reelSkins.map((item, idx) => (
              <View key={`${item._id}-${idx}`} style={styles.rollingCard}>
                <Image source={{ uri: item.imageUrl }} style={styles.rollingImage} resizeMode="contain" />
                <View
                  style={[
                    styles.rollingRarityBar,
                    { backgroundColor: rarityColors[item.rarity] || "#fff" },
                  ]}
                >
                  <Text style={styles.rollingText}>
                    {item.rarity === "Spécial Or" ? "★ " : ""}
                    {item.name}
                  </Text>
                </View>
              </View>
            ))}
          </Animated.ScrollView>

          {!rollingFinished ? (
            <Text style={styles.scrollingText}>défilement...</Text>
          ) : (
            wonSkinInline && (
              <>
                <Animated.View
                  style={[
                    styles.wonInlineBox,
                    {
                      opacity: wonAppear,
                      transform: [
                        {
                          translateY: wonAppear.interpolate({
                            inputRange: [0, 1],
                            outputRange: [100, 0], 
                          }),
                        },
                        {
                          scale: wonAppear.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.98, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.wonTitle}>Nouveau skin obtenu !</Text>

                  <Image source={{ uri: wonSkinInline.imageUrl }} style={styles.wonImage} resizeMode="contain" />

                  {typeof wonSkinInline.cost === "number" && (
                    <Text style={styles.wonPrice}>{wonSkinInline.cost.toFixed(2)} €</Text>
                  )}

                  <View
                    style={[
                      styles.wonRarityBar,
                      { backgroundColor: rarityColors[wonSkinInline.rarity] || "#444" },
                    ]}
                  >
                    <Text style={styles.wonName}>
                      {wonSkinInline.rarity === "Spécial Or" ? "★ " : ""}
                      {wonSkinInline.name}
                    </Text>
                  </View>
                </Animated.View>
                {/* Bouton sous le carré */}
                <TouchableOpacity
                  style={styles.inventoryBtnBelow}
                  onPress={() => {
                    resetUI();
                    router.push("/inventory");
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 16 }}>Voir l’inventaire</Text>
                </TouchableOpacity>
              </>
            )
          )}
        </View>
      )}

      {/* Grille des skins (hors ouverture) */}
      {!isOpening && (
        <FlatList
          data={caseDetail.skins}
          numColumns={3}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.skinCard}
              onPress={async () => {
                try {
                  const res = await apiFetch(`${API_URL}/skins/${item._id}`);
                  if (!res) return;
                  const text = await res.text();
                  let data: any = null;
                  try { data = JSON.parse(text); } catch {}
                  if (!res.ok) {
                    const msg = data?.message || `${res.status} ${res.statusText}`;
                    throw new Error(msg);
                  }
                  setSelectedSkin(data);
                } catch (err) {
                  console.error("Erreur fetch skin:", err);

                  // fallback offline
                  const localSkin = await getSkinLocal(item._id);
                  if (localSkin) {
                    setSelectedSkin(localSkin);
                  }
                }
              }}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.skinImage} resizeMode="contain"/>
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

      {/* Modales */}
      <Modal visible={!!selectedSkin} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          {selectedSkin && (
            <View style={styles.modalSkinCard}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedSkin(null)}
              >
                <Text style={{ color: "#fff", fontSize: 20 }}>✕</Text>
              </TouchableOpacity>

              <Image source={{ uri: selectedSkin.imageUrl }} style={styles.modalSkinImage} resizeMode="contain"/>

              <Text style={styles.modalPriceText}>{selectedSkin.cost?.toFixed(2)} €</Text>

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
            </View>
          )}
        </View>
      </Modal>

      <Modal visible={editModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.editModalBox}>
            <Text style={styles.editTitle}>Modifier les probabilités</Text>

            {editedProbabilities.map((p, i) => (
              <View key={i} style={styles.editRow}>
                <View
                  style={[
                    styles.probaColor,
                    { backgroundColor: rarityColors[p.rarity] || "#fff" },
                  ]}
                />
                <Text style={{ color: "#fff", flex: 1 }}>{p.rarity}</Text>
                <TextInput
                  style={styles.input}
                  value={String(p.probability)}
                  onChangeText={(val) => {
                    const newProbas = [...editedProbabilities];
                    newProbas[i].probability = val;
                    setEditedProbabilities(newProbas);
                  }}
                  keyboardType="decimal-pad"
                />
                <Text style={{ color: "#fff" }}>%</Text>
              </View>
            ))}

            <TouchableOpacity
              style={styles.saveButton}
              onPress={async () => {
                try {
                  const sanitized = editedProbabilities.map((p) => ({
                    rarity: p.rarity,
                    probability: parseFloat(String(p.probability).replace(",", ".")) || 0,
                  }));

                  const res = await apiFetch(`${API_URL}/cases/${caseDetail!._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ rarityProbabilities: sanitized }),
                  });
                  if (!res) return;

                  const txt = await res.text();
                  let body: any = null;
                  try { body = txt ? JSON.parse(txt) : null; } catch {}

                  if (!res.ok) {
                    console.error("Erreur API:", body ?? txt);
                    setErrorMessage(body?.message || `${res.status} ${res.statusText}`);
                    return;
                  }

                  setCaseDetail({ ...caseDetail!, rarityProbabilities: sanitized });

                  setEditModalVisible(false);
                  setSuccessMessage("Probabilités mises à jour !");
                  setTimeout(() => setSuccessMessage(null), 3000);
                } catch (error) {
                  console.error("Erreur PUT:", error);
                }
              }}
            >
              <Text style={styles.saveText}>Sauvegarder</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={{ color: "#fff", fontSize: 20 }}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111015", padding: 15 },
  caseTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginVertical: 10,
  },
  caseImage: { width: 150, height: 120, alignSelf: "center", marginVertical: 10 },
  openButton: {
    backgroundColor: "#1f1e24",
    padding: 9,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 20,
    width: "70%",
    alignSelf: "center",
  },
  openButtonText: { color: "#fff", fontSize: 16 },

  probabilities: { marginLeft: 20 },
  probaRow: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  probaColor: { width: 15, height: 15, marginRight: 8, borderRadius: 3 },
  probaText: { color: "#fff", fontSize: 14 },

  caseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  successBox: {
    backgroundColor: "#2d6a4f",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  successText: { color: "#fff", textAlign: "center" },

  // Grille
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
  skinImage: { width: "100%", height: "70%" },
  rarityBar: {
    width: "100%",
    height: "30%",
    alignItems: "center",
    justifyContent: "center",
  },
  skinName: { fontSize: 12, color: "#fff", textAlign: "center" },

  // Roulette
  rouletteWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  centerMarker: {
    position: "absolute",
    backgroundColor: "#fff",
    opacity: 0.95,
    borderRadius: 2,
    zIndex: 5,
    boxShadow: "0px 1px 2px rgba(0,0,0,0.25)",
  },
  rollingCard: {
    width: ITEM_W,
    height: ITEM_H,
    marginHorizontal: ITEM_SPACING / 2,
    backgroundColor: "#1a1920",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 35,
  },
  rollingImage: { width: "100%", height: "70%" },
  rollingRarityBar: { width: "100%", height: "30%", alignItems: "center", justifyContent: "center" },
  rollingText: { fontSize: 12, color: "#fff", textAlign: "center" },
  rollingPrice: { fontSize: 11, color: "#ccc", marginTop: 2 },
  scrollingText: {
    position: "absolute",
    color: "#fff",
    fontWeight: "600",
    bottom: "40%",
    textAlign: "center",
    fontSize: 20,
  },

  // Modale skin gagné
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalSkinCard: {
    backgroundColor: "#1f1e24",
    borderRadius: 0,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "space-between",
    width: "70%",
    aspectRatio: 1,
    maxWidth: 350,
    padding: 0,
  },
  modalSkinImage: { width: "100%", height: "70%"},
  modalPriceText: { fontSize: 18, fontWeight: "bold", color: "#fff", marginVertical: 5 },
  modalRarityBar: { width: "100%", height: 40, alignItems: "center", justifyContent: "center" },
  modalSkinName: { fontSize: 16, color: "#fff", textAlign: "center" },
  closeButton: { position: "absolute", top: 10, right: 10, zIndex: 10 },
  inventoryBtn: {
    marginTop: 12,
    backgroundColor: "#1f1e24",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },

  // Modale édition
  editModalBox: { backgroundColor: "#1a1a1e", padding: 20, borderRadius: 8, width: "80%" },
  editTitle: { color: "#fff", fontSize: 18, marginBottom: 15, textAlign: "center" },
  editRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  input: {
    backgroundColor: "#1f1e24",
    color: "#fff",
    paddingHorizontal: 8,
    borderRadius: 5,
    width: 60,
    marginRight: 5,
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: "#1f1e24",
    padding: 10,
    borderRadius: 20,
    marginTop: 15,
    alignItems: "center",
  },
  saveText: { color: "#fff" },

  // Résultat inline
  wonInlineBox: {
    position: "absolute",
    bottom: "19%",
    alignItems: "center",
    backgroundColor: "#1f1e24",
    paddingTop: 12,
    paddingBottom: 0,
    width: "70%",
    maxWidth: 380,
    boxShadow: "0px 3px 6px rgba(0,0,0,0.3)",
  },
  wonTitle: { color: "#fff", fontWeight: "700", marginBottom: 8, fontSize: 20 },
  wonImage: { width: "100%", height: 160 },
  wonPrice: { color: "#fff", fontWeight: "700", marginVertical: 6, fontSize: 16 },
  wonRarityBar: { width: "100%", height: 38, alignItems: "center", justifyContent: "center", marginTop: 4 },
  wonName: { color: "#fff", fontSize: 18, textAlign: "center", paddingHorizontal: 6 },

  // Bouton sous le carré
  inventoryBtnBelow: {
    position: "absolute",
    bottom: "7%",
    alignSelf: "center",
    backgroundColor: "#1a1a1e",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    zIndex: 6,
  },
});
