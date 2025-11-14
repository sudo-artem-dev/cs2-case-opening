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
      <Tabs
        screenOptions={{
          header: () => (
            <View style={{ backgroundColor: "#111015" }}>

              {/* Safe area pour éviter Dynamic Island */}
              <View style={{ height: 45 }} />

              {/* NAVBAR */}
              <View
                style={{
                  paddingVertical: 10,
                  borderBottomColor: "#efeff5",
                  borderBottomWidth: 2,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Bouton retour */}
                <View style={{ position: "absolute", left: 15 }}>
                  <BackButton />
                </View>

                {/* Titre */}
                <Text style={{ textAlign: "center" }}>
                  <Text style={{ fontSize: 18, fontWeight: "bold", color: "#efeff5" }}>
                    {pseudo}
                  </Text>
                  {user?.role === "admin" && (
                    <Text style={{ fontSize: 14, color: "#aaa" }}>{"\n"}Admin</Text>
                  )}
                </Text>

                {/* Logout */}
                <View style={{ position: "absolute", right: 15 }}>
                  <TouchableOpacity onPress={handleLogout}>
                    <Image
                      source={require("../../assets/images/logout.png")}
                      style={{ width: 24, height: 24, tintColor: "#efeff5" }}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* MESSAGES RESEAU SOUS LA NAVBAR */}
              {isOffline && (
                <View
                  style={{
                    width: "100%",
                    backgroundColor: "#b00020",
                    paddingVertical: 12,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff", textAlign: "center" }}>
                    Vous êtes hors ligne.{"\n"}
                    Les données ne sont pas synchronisées.
                  </Text>

                  {(lastSyncUp || lastSyncDown) && (
                    <Text style={{ color: "#fff", marginTop: 5 }}>
                      Dernière synchronisation : {lastSyncUp || lastSyncDown}
                    </Text>
                  )}
                </View>
              )}

              {!isOffline && showSyncUp && lastSyncUp && (
                <View
                  style={{
                    width: "100%",
                    backgroundColor: "#1e88e5",
                    paddingVertical: 12,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff", textAlign: "center" }}>
                    Données locales synchronisées vers le serveur{"\n"}
                    Dernière synchronisation : {lastSyncUp}
                  </Text>
                </View>
              )}

              {!isOffline && showSyncDown && lastSyncDown && (
                <View
                  style={{
                    width: "100%",
                    backgroundColor: "#2e7d32",
                    paddingVertical: 12,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff", textAlign: "center" }}>
                    Données mises à jour depuis le serveur{"\n"}
                    Dernière synchronisation : {lastSyncDown}
                  </Text>
                </View>
              )}

            </View>
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
            height: 100,
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
