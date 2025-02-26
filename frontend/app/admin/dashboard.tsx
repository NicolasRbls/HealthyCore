import React from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import Colors from "../../constants/Colors";
import Layout from "../../constants/Layout";
import { TextStyles } from "../../constants/Fonts";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/layout/Header";

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
      <Header
        title="Administration"
        rightIconName="log-out-outline"
        onRightIconPress={handleLogout}
      />

      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Bienvenue, {user?.firstName}</Text>
            <Text style={styles.roleText}>Rôle: Administrateur</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.infoText}>
              Vous êtes connecté en tant qu'administrateur. Cette interface vous
              permet de gérer l'application.
            </Text>

            {/* Contenu supplémentaire du dashboard admin à implémenter */}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              text="Se déconnecter"
              variant="outline"
              onPress={handleLogout}
              leftIcon="log-out-outline"
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
    padding: Layout.spacing.lg,
  },
  header: {
    marginBottom: Layout.spacing.xl,
  },
  welcomeText: {
    ...TextStyles.h3,
    marginBottom: Layout.spacing.xs,
  },
  roleText: {
    ...TextStyles.bodyLarge,
    color: Colors.brandBlue[0],
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  infoText: {
    ...TextStyles.body,
    color: Colors.gray.dark,
    marginBottom: Layout.spacing.md,
  },
  buttonContainer: {
    marginTop: Layout.spacing.lg,
  },
  button: {
    width: "100%",
  },
});
