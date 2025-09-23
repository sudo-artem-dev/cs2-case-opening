import { useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const [pseudo, setPseudo] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!pseudo || !password) {
      setErrorMessage("Veuillez remplir tous les champs.");
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pseudo, password }),
      });
      if (!response.ok) throw new Error("Identifiants invalides");

      const data = await response.json();
      await login({
        _id: data._id,
        pseudo: data.pseudo,
        role: data.role,
        token: data.token,
      });

      setErrorMessage("");
      router.replace("/(tabs)/cases");
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message || "Connexion échouée");
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("../assets/images/cs2case.png")} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>CS2 Case Opening</Text>
      <View style={styles.card}>
        <Text style={styles.heading}>Se connecter</Text>

        <Text style={styles.label}>Pseudo</Text>
        <TextInput
          style={styles.input}
          placeholder="Entrez votre pseudo"
          placeholderTextColor="#aaa"
          value={pseudo}
          onChangeText={setPseudo}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Mot de passe</Text>
        <TextInput
          style={styles.input}
          placeholder="Entrez votre mot de passe"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Connexion</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a1e", alignItems: "center", padding: 20 },
  logo: { width: 180, height: 180, marginBottom: 5 },
  title: { fontSize: 22, fontWeight: "bold", color: "#efeff5", marginBottom: 40 },
  card: { backgroundColor: "#1f1e24", borderRadius: 15, padding: 40, width: "100%", alignItems: "center" },
  heading: { fontSize: 30, fontWeight: "bold", color: "#efeff5", marginBottom: 20 },
  label: { alignSelf: "center", fontSize: 14, color: "#ccc", marginBottom: 5, marginTop: 10 },
  input: { width: "100%", backgroundColor: "#ffffff", borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, fontSize: 16 },
  errorMessage: { color: "red", marginTop: 10, fontSize: 14, textAlign: "center" },
  button: { marginTop: 30, backgroundColor: "#1a1a1e", paddingVertical: 12, paddingHorizontal: 70, borderRadius: 25 },
  buttonText: { color: "#efeff5", fontSize: 16, fontWeight: "bold" },
});
