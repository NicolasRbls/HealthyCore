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
import Colors from "../../constants/Colors";
import Layout from "../../constants/Layout";
import { TextStyles } from "../../constants/Fonts";
import Button from "../../components/ui/Button";
import { useRegistration } from "../../context/RegistrationContext";
import ErrorMessage from "../../components/ui/ErrorMessage";
import { router } from "expo-router";

export default function CompleteScreen() {
  const { completeRegistration, data, loading, error } = useRegistration();

  useEffect(() => {
    // Si l'utilisateur arrive directement sur cet écran sans avoir complété les étapes précédentes
    if (!data.firstName || !data.targetWeight || !data.activities) {
      Alert.alert(
        "Erreur",
        "Vous devez compléter toutes les étapes d'inscription",
        [
          {
            text: "OK",
            onPress: () => router.replace("/register/step1_profile" as any),
          },
        ]
      );
    }

    // console.log("Données complètes pour l'inscription:", data);
  }, []);

  const handleCompleteRegistration = async () => {
    try {
      await completeRegistration();
      // La redirection est gérée dans le AuthContext
    } catch (err) {
      console.error("Erreur lors de la finalisation de l'inscription:", err);
    }
  };

  // Formatage des nombres pour l'affichage
  const formatNumber = (value: number | undefined): string => {
    if (value === undefined || isNaN(value)) return "-";
    return Math.round(value).toString();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.content}>
            <Image
              source={require("../../assets/images/registration-complete.png")}
              style={styles.image}
              resizeMode="contain"
            />

            <Text style={styles.title}>Bienvenue, {data.firstName}</Text>

            <Text style={styles.description}>
              Votre profil est prêt ! Ensemble, nous allons atteindre vos
              objectifs de santé et de forme.
            </Text>

            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>
                Vos données sont sauvegardées
              </Text>
              <Text style={styles.infoText}>
                • Objectif de poids : {data.targetWeight} kg{"\n"}• Calories
                quotidiennes : {formatNumber(data.dailyCalories)} kcal{"\n"}•
                Séances par semaine : {data.sessionsPerWeek}
                {data.weightChangeType !== "maintain" &&
                data.caloricDeficitSurplus
                  ? `\n• ${
                      data.weightChangeType === "loss" ? "Déficit" : "Surplus"
                    } calorique : ${Math.abs(
                      Math.round(data.caloricDeficitSurplus)
                    )} kcal/jour`
                  : ""}
              </Text>
            </View>

            {error && (
              <ErrorMessage errors={[error]} style={styles.errorContainer} />
            )}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              text={loading ? "Finalisation..." : "C'est parti !"}
              onPress={handleCompleteRegistration}
              size="lg"
              fullWidth
              style={styles.button}
              loading={loading}
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
    padding: Layout.spacing.lg,
    justifyContent: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 260,
    height: 260,
    marginBottom: Layout.spacing.xl,
  },
  title: {
    ...TextStyles.h2,
    textAlign: "center",
    marginBottom: Layout.spacing.md,
  },
  description: {
    ...TextStyles.body,
    textAlign: "center",
    marginBottom: Layout.spacing.xl,
    color: Colors.gray.dark,
    paddingHorizontal: Layout.spacing.xl,
  },
  infoContainer: {
    backgroundColor: Colors.gray.ultraLight,
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.md,
    width: "100%",
    marginBottom: Layout.spacing.xl,
  },
  infoTitle: {
    ...TextStyles.bodyLarge,
    fontWeight: "600",
    marginBottom: Layout.spacing.sm,
    color: Colors.brandBlue[0],
  },
  infoText: {
    ...TextStyles.body,
    lineHeight: 24,
  },
  errorContainer: {
    width: "100%",
    marginBottom: Layout.spacing.md,
  },
  buttonContainer: {
    width: "100%",
    marginBottom: Layout.spacing.lg,
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
