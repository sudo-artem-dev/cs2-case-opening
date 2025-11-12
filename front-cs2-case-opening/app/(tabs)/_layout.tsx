import { Tabs, useRouter, usePathname } from "expo-router";
import { Image, TouchableOpacity, Text, View } from "react-native";
import { useAuth } from "@/context/AuthContext";

function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/cases") return null;

  return (
    <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 15 }}>
      <Image
        source={require("../../assets/images/back.png")}
        style={{ width: 24, height: 24, tintColor: "#efeff5" }}
      />
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const router = useRouter();
  const { user, logout, isOffline, lastSyncUp, lastSyncDown, showSyncUp, showSyncDown } = useAuth();
  const pseudo = user?.pseudo || "Invité";

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <View style={{ flex: 1 }}>
      {/* 🔴 Hors ligne */}
      {isOffline && (
        <View
          style={{
            backgroundColor: "#b00020",
            padding: 10,
            borderRadius: 5,
            margin: 10,
          }}
        >
          <Text style={{ color: "#fff", textAlign: "center" }}>
            Vous êtes hors ligne.{"\n"}
            Les données ne sont pas synchronisées.
          </Text>

          {/* 🕒 Dernière synchro */}
          {(lastSyncUp || lastSyncDown) && (
            <Text style={{ color: "#fff", textAlign: "center", marginTop: 5 }}>
              Dernière synchronistation : {lastSyncUp || lastSyncDown}
            </Text>
          )}
        </View>
      )}

      {/* 🟢 Synchro offline → serveur */}
      {!isOffline && showSyncUp && lastSyncUp && (
        <View
          style={{
            backgroundColor: "#1e88e5",
            padding: 10,
            borderRadius: 5,
            margin: 10,
          }}
        >
          <Text style={{ color: "#fff", textAlign: "center" }}>
            Données locales synchronisées vers le serveur{"\n"}
            Dernière synchronisation : {lastSyncUp}
          </Text>
        </View>
      )}

      {/* 🟢 Synchro serveur → mobile */}
      {!isOffline && showSyncDown && lastSyncDown && (
        <View
          style={{
            backgroundColor: "#2e7d32",
            padding: 10,
            borderRadius: 5,
            margin: 10,
          }}
        >
          <Text style={{ color: "#fff", textAlign: "center" }}>
            Données mises à jour depuis le serveur{"\n"}
            Dernière synchronisation : {lastSyncDown}
          </Text>
        </View>
      )}

      {/* ✅ Navigation Tabs */}
      <Tabs
        screenOptions={{
          headerStyle: {
            backgroundColor: "#111015",
            borderBottomColor: "#efeff5",
            borderBottomWidth: 2,
          },
          headerTitleAlign: "center",
          headerTintColor: "#efeff5",
          headerTitle: () => (
            <Text style={{ textAlign: "center" }}>
              <Text
                style={{ fontSize: 18, fontWeight: "bold", color: "#efeff5" }}
              >
                {pseudo}
              </Text>
              {user?.role === "admin" && (
                <Text style={{ fontSize: 14, color: "#aaa", marginTop: 2 }}>
                  {"\n"}Admin
                </Text>
              )}
            </Text>
          ),
          headerLeft: () => <BackButton />,
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
              <Image
                source={require("../../assets/images/logout.png")}
                style={{ width: 24, height: 24, tintColor: "#efeff5" }}
              />
            </TouchableOpacity>
          ),
          headerShadowVisible: false,
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 12,
            marginTop: 15,
          },
          tabBarActiveTintColor: "#efeff5",
          tabBarInactiveTintColor: "#888",
          tabBarStyle: {
            backgroundColor: "#111015",
            borderTopColor: "#efeff5",
            borderTopWidth: 2,
            height: 80,
            paddingTop: 10,
          },
        }}
      >
        {/* Onglet Caisses */}
        <Tabs.Screen
          name="cases/index"
          options={{
            title: "Caisses",
            tabBarIcon: () => (
              <Image
                source={require("../../assets/images/box.png")}
                style={{ width: 50, height: 50 }}
              />
            ),
          }}
        />

        {/* Onglet Utilisateurs (admin uniquement) */}
        {user?.role === "admin" ? (
          <Tabs.Screen
            name="users/index"
            options={{
              title: "Utilisateurs",
              tabBarIcon: () => (
                <Image
                  source={require("../../assets/images/radar.png")}
                  style={{ width: 50, height: 50 }}
                />
              ),
            }}
          />
        ) : (
          <Tabs.Screen name="users/index" options={{ href: null }} />
        )}

        {/* Onglet Inventaire */}
        <Tabs.Screen
          name="inventory/index"
          options={{
            title: "Inventaire",
            tabBarIcon: () => (
              <Image
                source={require("../../assets/images/gun.png")}
                style={{ width: 50, height: 50 }}
              />
            ),
          }}
        />

        {/* Détail d’une caisse → non affiché dans la barre */}
        <Tabs.Screen name="cases/[id]" options={{ href: null }} />
      </Tabs>
    </View>
  );
}
