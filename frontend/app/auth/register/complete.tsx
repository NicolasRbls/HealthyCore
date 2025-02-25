import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import Colors from "@/constants/Colors";
import Button from "@/components/Button";
import { useRegistration } from "@/context/RegistrationContext";
import { router } from "expo-router";

export default function CompleteScreen() {
  const { completeRegistration, data, loading, error } = useRegistration();

  useEffect(() => {
    // Si l'utilisateur arrive directement sur cet écran sans avoir complété les étapes précédentes
    if (!data.firstName || !data.targetWeight || !data.activities) {
      Alert.alert(
        "Erreur",
        "Vous devez compléter toutes les étapes d'inscription",
        [{ text: "OK", onPress: () => router.replace("/auth/register") }]
      );
    }
  }, []);

  const handleCompleteRegistration = async () => {
    try {
      await completeRegistration();
      // La redirection est gérée dans le AuthContext
    } catch (err) {
      console.error("Erreur lors de la finalisation de l'inscription:", err);
      if (error) {
        Alert.alert("Erreur", error);
      } else {
        Alert.alert(
          "Erreur",
          "Une erreur est survenue lors de la finalisation de l'inscription"
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.content}>
            <Image
              source={require("@/assets/images/registration-complete.png")}
              style={styles.image}
              resizeMode="contain"
            />

            <Text style={styles.title}>Bienvenue, {data.firstName}</Text>

            <Text style={styles.description}>
              Tout est prêt, atteignons vos objectifs ensemble !
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              text={loading ? "Finalisation..." : "Accéder au Dashboard"}
              onPress={handleCompleteRegistration}
              style={styles.button}
            />
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.brandBlue[0]} />
            </View>
          )}
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
    justifyContent: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: Colors.black,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    color: Colors.gray.dark,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: "100%",
    marginTop: 32,
  },
  button: {
    width: "100%",
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
});
