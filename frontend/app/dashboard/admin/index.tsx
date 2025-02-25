import React from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import Colors from "@/constants/Colors";
import Button from "@/components/Button";
import { useAuth } from "@/context/AuthContext";

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Bienvenue, {user?.firstName}</Text>
            <Text style={styles.roleText}>Rôle: Administrateur</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.infoText}>
              Vous êtes connecté en tant qu'administrateur.
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              text="Se déconnecter"
              onPress={handleLogout}
              style={styles.button}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: 8,
  },
  roleText: {
    fontSize: 18,
    color: Colors.brandBlue[0],
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  infoText: {
    fontSize: 16,
    color: Colors.gray.dark,
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 24,
  },
  button: {
    width: "100%",
  },
});
