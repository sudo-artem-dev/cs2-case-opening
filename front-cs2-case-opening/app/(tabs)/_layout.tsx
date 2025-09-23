import { Tabs, useRouter, usePathname } from "expo-router";
import { Image, TouchableOpacity, Text } from "react-native";
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
  const { user, logout } = useAuth();
  const pseudo = user?.pseudo || "Invité";

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  return (
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
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#efeff5" }}>
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
  );
}
