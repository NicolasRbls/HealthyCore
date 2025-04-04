import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../../constants/Colors";
import Layout from "../../../constants/Layout";
import { TextStyles } from "../../../constants/Fonts";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import { useAuth } from "../../../context/AuthContext";
import Header from "../../../components/layout/Header";
import authService from "../../../services/auth.service";
import userService from "../../../services/user.service";

// Import données d'exemple pour le développement
import tempData from "../../../assets/temp.json";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Charger les données du profil
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        // Cette route devrait fournir toutes les informations nécessaires en un seul appel
        const profileData = await userService.getUserProfile();

        setUserData({
          prenom: profileData.user.firstName,
          nom: profileData.user.lastName,
          email: profileData.user.email,
          sexe: profileData.user.gender,
          date_de_naissance: profileData.user.birthDate,
          age: profileData.user.age,
          currentWeight: profileData.metrics?.currentWeight || 0,
          currentHeight: profileData.metrics?.currentHeight || 0,
          bmi: profileData.metrics?.bmi || 0,
          preferences: {
            objectif_poids: profileData.metrics?.targetWeight || 0,
            calories_quotidiennes: profileData.metrics?.dailyCalories || 0,
            seances_par_semaines: profileData.metrics?.sessionsPerWeek || 0,
          },
        });

        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error);
        // Fallback sur les données mockées
        fallbackToMockData();
      }
    };

    loadProfileData();
  }, []);

  // Fonction de fallback vers les données mockées
  const fallbackToMockData = () => {
    // Votre code existant avec tempData
    const exampleUser = tempData.user_exemple;
    const exampleEvolutions = tempData.evolutions_exemple;

    // Calculer l'âge exactement
    const birthDate = new Date(exampleUser.date_de_naissance);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Obtenir les dernières données d'évolution
    const latestEvolution = exampleEvolutions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];

    setUserData({
      ...exampleUser,
      age: age, // Âge exact calculé
      currentWeight: latestEvolution.poids,
      currentHeight: latestEvolution.taille,
      bmi: (
        latestEvolution.poids /
        ((latestEvolution.taille / 100) * (latestEvolution.taille / 100))
      ).toFixed(1),
    });

    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      // Appeler le service d'authentification pour se déconnecter
      await authService.logout();
      // Puis utiliser la fonction de déconnexion du contexte pour nettoyer l'état local
      await logout();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors de la déconnexion. Veuillez réessayer."
      );
    }
  };

  const navigateToProgress = () => {
    router.push("/user/profile/progress" as any);
  };

  const navigateToBadges = () => {
    router.push("/user/dashboard/badge-monitoring" as any);
  };

  const handleEditPreferences = () => {
    Alert.alert(
      "Fonctionnalité à venir",
      "La modification des préférences sera disponible prochainement.",
      [{ text: "OK" }]
    );
  };

  // Déterminer le type d'objectif
  const getWeightGoalType = () => {
    if (!userData) return "";
    const currentWeight = userData.currentWeight;
    const targetWeight = userData.preferences.objectif_poids;

    if (targetWeight < currentWeight) return "Perte de poids";
    if (targetWeight > currentWeight) return "Prise de poids";
    return "Maintien de poids";
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Profil" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement du profil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Profil" style={{ marginTop: Layout.spacing.md }} />

      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          {/* Section Profile Avatar et Infos Principales */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {userData.prenom[0]}
                  {userData.nom[0]}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>
                  {userData.prenom} {userData.nom}
                </Text>
                <Text style={styles.userGoal}>{getWeightGoalType()}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditPreferences}
            >
              <Text style={styles.editButtonText}>Modifier</Text>
            </TouchableOpacity>
          </View>

          {/* Métriques principales */}
          <View style={styles.metricsContainer}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{userData.currentHeight}cm</Text>
              <Text style={styles.metricLabel}>Taille</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{userData.currentWeight}kg</Text>
              <Text style={styles.metricLabel}>Poids</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{userData.age} ans</Text>
              <Text style={styles.metricLabel}>Âge</Text>
            </View>
          </View>

          {/* Informations du compte */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Compte</Text>
            <View style={styles.accountItem}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={Colors.gray.dark}
              />
              <Text style={styles.accountValue}>{userData.email}</Text>
            </View>
            <View style={styles.accountItem}>
              <Ionicons
                name="person-outline"
                size={20}
                color={Colors.gray.dark}
              />
              <Text style={styles.accountValue}>
                {userData.sexe === "H"
                  ? "Homme"
                  : userData.sexe === "F"
                  ? "Femme"
                  : "Non spécifié"}
              </Text>
            </View>
            <View style={styles.accountItem}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={Colors.gray.dark}
              />
              <Text style={styles.accountValue}>
                {new Date(userData.date_de_naissance).toLocaleDateString(
                  "fr-FR",
                  {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                  }
                )}
              </Text>
            </View>
          </Card>

          {/* Section Objectifs */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Objectifs et préférences</Text>
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Poids cible</Text>
              <Text style={styles.goalValue}>
                {userData.preferences.objectif_poids} kg
              </Text>
            </View>
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Calories quotidiennes</Text>
              <Text style={styles.goalValue}>
                {userData.preferences.calories_quotidiennes} kcal
              </Text>
            </View>
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>IMC actuel</Text>
              <Text style={styles.goalValue}>{userData.bmi}</Text>
            </View>
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Séances par semaine</Text>
              <Text style={styles.goalValue}>
                {userData.preferences.seances_par_semaines}
              </Text>
            </View>
          </Card>

          {/* Liens vers d'autres sections */}
          <View style={styles.buttonContainer}>
            <Button
              text="Voir ma progression"
              onPress={navigateToProgress}
              leftIcon="trending-up-outline"
              style={styles.button}
            />
            <Button
              text="Mes badges"
              onPress={navigateToBadges}
              leftIcon="ribbon-outline"
              variant="outline"
              style={styles.button}
            />
            <Button
              text="Se déconnecter"
              onPress={handleLogout}
              leftIcon="log-out-outline"
              variant="ghost"
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.gray.dark,
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Layout.spacing.md,
  },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.brandBlue[1],
    justifyContent: "center",
    alignItems: "center",
    marginRight: Layout.spacing.md,
  },
  avatarText: {
    ...TextStyles.h2,
    color: Colors.white,
  },
  profileInfo: {
    flexDirection: "column",
  },
  userName: {
    ...TextStyles.h3,
    marginBottom: 2,
  },
  userGoal: {
    ...TextStyles.body,
    color: Colors.gray.dark,
  },
  editButton: {
    backgroundColor: Colors.brandBlue[0],
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.pill,
  },
  editButtonText: {
    ...TextStyles.buttonText,
    fontSize: 14,
    color: Colors.white,
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
    ...Layout.elevation.sm,
  },
  metricItem: {
    alignItems: "center",
    flex: 1,
  },
  metricValue: {
    ...TextStyles.h4,
    color: Colors.brandBlue[0],
  },
  metricLabel: {
    ...TextStyles.bodySmall,
    color: Colors.gray.dark,
    marginTop: 2,
  },
  sectionCard: {
    marginBottom: Layout.spacing.lg,
  },
  sectionTitle: {
    ...TextStyles.h4,
    marginBottom: Layout.spacing.md,
  },
  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.ultraLight,
  },
  accountValue: {
    ...TextStyles.body,
    marginLeft: Layout.spacing.md,
  },
  goalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.ultraLight,
  },
  goalLabel: {
    ...TextStyles.body,
    color: Colors.gray.dark,
  },
  goalValue: {
    ...TextStyles.body,
    fontWeight: "600",
  },
  buttonContainer: {
    marginTop: Layout.spacing.md,
  },
  button: {
    marginBottom: Layout.spacing.md,
  },
});
