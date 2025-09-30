import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import { useFocusEffect } from "@react-navigation/native";
import { saveUsersLocal, getUsersLocal, UserData } from "@/services/userService";

export default function UserScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const { apiFetch } = useApi();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    if (!loading) {
      if (user?.role !== "admin") {
        router.replace("/cases");
      }
    }
  }, [loading, user, router]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await apiFetch(`${API_URL}/users`);
      if (!res) {
        // fallback → données locales
        const localUsers = await getUsersLocal();
        setUsers(localUsers);
        return;
      }
  
      const data: UserData[] = await res.json();
      setUsers(data);
  
      // Sauvegarde locale
      await saveUsersLocal(data);
    } catch (err) {
      console.error("Erreur fetch users:", err);
  
      // fallback → offline
      const localUsers = await getUsersLocal();
      setUsers(localUsers);
    } finally {
      setLoadingUsers(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (user?.role === "admin") {
        fetchUsers();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])
  );


  if (loading || loadingUsers) {
    return <ActivityIndicator size="large" color="#fff" style={{ flex: 1 }} />;
  }

  if (user?.role !== "admin") return null;

  return (
    <View style={styles.container}>
      {/* Titre principal */}
      <Text style={styles.title}>Utilisateurs</Text>
      <Text style={styles.count}>{users.length}</Text>

      {/* Liste des utilisateurs */}
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <Text style={styles.pseudo}>
              Pseudo : <Text style={{ fontWeight: "bold" }}>{item.pseudo}</Text>
            </Text>
            <Text style={styles.info}>
              Nombre de skins obtenus :{" "}
              <Text style={{ fontWeight: "bold" }}>{item.skinsCount}</Text>
            </Text>
            <Text style={styles.info}>
              Valeur totale de ces skins :{" "}
              <Text style={{ fontWeight: "bold" }}>
                {item.inventoryValue.toFixed(2)} €
              </Text>
            </Text>
          </View>
        )}
      />
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
    marginTop: 10,
  },
  count: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  userCard: {
    backgroundColor: "#1a1920",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  pseudo: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 5,
  },
  info: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 3,
  },
});
