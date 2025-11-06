import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from "react-native";
import Colors from "../constants/Colors";
import Layout from "../constants/Layout";
import Button from "../components/ui/Button";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { TextStyles } from "../constants/Fonts";

export default function WelcomeScreen() {
  const { isAuthenticated, loading, user } = useAuth();

  React.useEffect(() => {
    // Rediriger vers le dashboard si déjà authentifié
    if (isAuthenticated && !loading) {
      if (user?.role === "admin") {
        router.replace("/admin/dashboard" as any);
      } else {
        router.replace("/user/dashboard" as any);
      }
    }
  }, [isAuthenticated, loading, user]);

  // Si en cours de chargement, on peut afficher un indicateur
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.brandBlue[0]} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleRegister = () => {
    router.push("/register/step1_profile" as any);
  };

  const handleLogin = () => {
    router.push("/auth/login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.contentArea}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.brandingContainer}>
            <Text style={styles.title}>
              Healthy<Text style={styles.titleAccent}>Core</Text>
            </Text>
            <Text style={styles.subtitle}>Le cœur de votre santé</Text>
          </View>
        </View>

        <View style={styles.bottomArea}>
          <Button
            text="Créer un compte"
            onPress={handleRegister}
            fullWidth
            size="lg"
            style={styles.registerButton}
          />

          <Button
            text="Se connecter"
            onPress={handleLogin}
            variant="outline"
            fullWidth
            size="lg"
            style={styles.loginButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: "space-between",
    alignItems: "center",
    padding: Layout.spacing.lg,
  },
  contentArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: Layout.spacing.xl,
  },
  brandingContainer: {
    alignItems: "center",
  },
  title: {
    ...TextStyles.h1,
    fontSize: 45,
    fontWeight: "800",
  },
  titleAccent: {
    color: Colors.brandBlue[0],
  },
  subtitle: {
    ...TextStyles.bodyLarge,
    fontSize: 20,
    color: Colors.gray.dark,
    marginTop: Layout.spacing.xs,
  },
  bottomArea: {
    width: "100%",
    marginTop: Layout.spacing.xl,
  },
  registerButton: {
    marginBottom: Layout.spacing.md,
  },
  loginButton: {},
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.gray.dark,
    marginTop: Layout.spacing.md,
  },
});
