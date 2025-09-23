import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, TouchableOpacity } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";

type CaseType = {
  _id: string;
  name: string;
  imageUrl: string;
};

export default function HomeScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { apiFetch } = useApi();

  const [cases, setCases] = useState<CaseType[]>([]);
  const [loadingCases, setLoadingCases] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  useEffect(() => {
    const fetchCases = async () => {
      if (!user) return;
      try {
        setLoadingCases(true);
        const response = await apiFetch("http://localhost:3000/cases");
        if (!response) return;
        const data = await response.json();
        setCases(data);
      } catch (error) {
        console.error("Erreur de récupération des caisses:", error);
      } finally {
        setLoadingCases(false);
      }
    };

    fetchCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) {
    return null;
  }

  if (!user) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Caisses</Text>

      {loadingCases ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <FlatList
          data={cases}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.caseCard}
              onPress={() => router.push(`/cases/${item._id}`)}
            >
              <View style={styles.divider} />
              <Image source={{ uri: item.imageUrl }} style={styles.caseImage} resizeMode="contain" />
              <Text style={styles.caseName}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111015",
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginVertical: 15,
  },
  caseCard: {
    backgroundColor: "#1a1920",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    marginBottom: 15,
    width: "48%",
  },
  caseImage: {
    width: 100,
    height: 80,
    marginBottom: 8,
  },
  caseName: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  divider: {
    width: "80%",
    height: 3,
    backgroundColor: "#b4c2d7",
    marginBottom: 8,
    borderRadius: 2,
  },
});
