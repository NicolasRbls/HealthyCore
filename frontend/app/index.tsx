import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import Colors from "../constants/Colors";
import Button from "@/components/Button";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

export default function WelcomeScreen() {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Rediriger vers le dashboard si déjà authentifié
    if (isAuthenticated && !loading) {
      router.replace("/dashboard" as any);
    }
  }, [isAuthenticated, loading]);

  // Si en cours de chargement, on peut afficher un indicateur
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={Colors.brandBlue[0]} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handlePress = () => {
    router.push("/auth/register");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.contentArea}>
          <View style={styles.brandingContainer}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Healthy</Text>
              <Text style={styles.titleGradient}>Core</Text>
            </View>
            <Text style={styles.subtitle}>Le cœur de votre santé</Text>
          </View>
        </View>

        <View style={styles.bottomArea}>
          <Button text="Démarrer" onPress={handlePress} />
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
  },
  contentArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 70,
  },
  brandingContainer: {
    alignItems: "center",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 45,
    fontWeight: "800",
    color: Colors.black,
  },
  titleGradient: {
    fontSize: 45,
    fontWeight: "800",
    color: Colors.brandBlue[0],
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "400",
    color: Colors.gray.dark,
  },
  bottomArea: {
    width: "100%",
    paddingHorizontal: 20,
    paddingBottom: 70,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.gray.dark,
  },
});
