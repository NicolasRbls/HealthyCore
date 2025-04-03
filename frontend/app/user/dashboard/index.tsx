import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../context/AuthContext";
import Colors from "../../../constants/Colors";
import Layout from "../../../constants/Layout";
import { TextStyles } from "../../../constants/Fonts";
import * as SecureStore from "expo-secure-store";

// Import services
import authService from "../../../services/auth.service";
import dataService from "../../../services/data.service";

// Import temp data for now
import tempData from "../../../assets/temp.json";

// Type definitions
interface NutritionSummary {
  consumedCalories: number;
  totalCalories: number;
  percentage: number;
}

interface DailySession {
  id: number;
  name: string;
  description: string;
}

interface Objective {
  id: number;
  title: string;
  completed: boolean;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [nutritionSummary, setNutritionSummary] = useState<NutritionSummary>({
    consumedCalories: 0,
    totalCalories: 0,
    percentage: 0,
  });
  const [todaySession, setTodaySession] = useState<DailySession>({
    id: 0,
    name: "",
    description: "",
  });
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Charger le profil utilisateur
      const profileData = await authService.getProfile();
      console.log("Profile Data:", profileData);
      setUserName(profileData.user.firstName);

      // 2. Charger les préférences utilisateur
      const preferencesData = await dataService.getUserPreferences();
      console.log("Preferences Data:", preferencesData);

      // Récupérer l'objectif calorique quotidien pour le calcul de pourcentage
      const totalCalorieGoal = parseFloat(
        preferencesData.preferences.calories_quotidiennes
      );

      // 3. Essayer de charger la séance du jour
      try {
        const programsData = await fetch(
          `${
            process.env.EXPO_PUBLIC_API_URL || "http://192.168.56.1:5000/api"
          }/data/programs/today-session`,
          {
            headers: {
              Authorization: `Bearer ${await SecureStore.getItemAsync(
                "token"
              )}`,
            },
          }
        ).then((res) => res.json());

        console.log("Programs Data:", programsData);

        if (programsData.data.todaySession) {
          setTodaySession({
            id: programsData.data.todaySession.id,
            name: programsData.data.todaySession.name.split(" ")[0],
            description: programsData.data.todaySession.exercises
              ? `(${extractMuscleGroups(
                  programsData.data.todaySession.exercises
                )})`
              : "",
          });
        } else {
          // Si pas de séance, mettre une séance factice reconnaissable
          setTodaySession({
            id: 0,
            name: "Repos",
            description: "(Aucune séance prévue)",
          });
        }
      } catch (error) {
        console.error("Error loading today's session:", error);
        // Fallback sur les données mockées
        mockTodaySession();
      }

      // 4. Pour les données nutritionnelles, utiliser des données mockées
      // IMPORTANT: Dans la vraie vie, vous feriez un appel à une API
      mockNutritionalData(totalCalorieGoal);

      // 5. Pour les objectifs, utiliser des données mockées
      mockObjectives();
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // Fallback complet sur les données mockées
      fallbackToMockData();
    } finally {
      setIsLoading(false);
    }
  };

  const extractMuscleGroups = (exercises) => {
    // Fonction d'extraction de groupes musculaires
    return "Pectoraux, Triceps, Épaules";
  };

  const mockNutritionalData = (totalCalorieGoal) => {
    // Pour l'instant, créer des données factices de suivi nutritionnel
    // Vous pourriez utiliser une valeur aléatoire entre 50-90% de l'objectif
    const consumedPercentage = Math.floor(Math.random() * 40) + 50; // Entre 50 et 90%
    const consumedCalories = Math.round(
      (consumedPercentage / 100) * totalCalorieGoal
    );

    setNutritionSummary({
      consumedCalories,
      totalCalories: totalCalorieGoal,
      percentage: consumedPercentage,
    });
  };

  const mockTodaySession = () => {
    // Séance fictive facilement identifiable
    setTodaySession({
      id: 999,
      name: "Push",
      description: "(Pectoraux, Triceps, Épaules)",
    });
  };

  const mockObjectives = () => {
    // Créer deux objectifs simples
    setObjectives([
      {
        id: 1,
        title: "Ajouter un repas au suivi nutritionnel",
        completed: false,
      },
      {
        id: 2,
        title: "Compléter la séance d'entraînement du jour",
        completed: false,
      },
    ]);
  };

  const fallbackToMockData = () => {
    setUserName("Utilisateur");
    mockNutritionalData(2500); // Valeur par défaut
    mockTodaySession();
    mockObjectives();
  };

  // Component for nutrition summary card
  const NutritionSummaryCard = () => (
    <TouchableOpacity
      style={[styles.card, styles.nutritionCard]}
      activeOpacity={0.7}
      onPress={() => router.push("/user/dashboard/nutrition-monitoring")}
    >
      <Text style={styles.cardTitle}>Calories absorbées</Text>
      <Text style={styles.calorieValue}>
        {nutritionSummary.consumedCalories} cal
      </Text>

      <View style={styles.circleContainer}>
        <View style={styles.circle}>
          <Text style={styles.circleText}>{nutritionSummary.percentage}%</Text>
          <Text style={styles.circleSubtext}>objectif respecté</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Component for workout card
  const WorkoutCard = () => (
    <TouchableOpacity
      style={[styles.card, styles.workoutCard]}
      activeOpacity={0.7}
      onPress={() => router.push("/user/dashboard/sport-monitoring")}
    >
      <Text style={[styles.cardTitle, styles.whiteText]}>Séance du jour</Text>

      <View style={styles.workoutContent}>
        <View style={styles.workoutInfo}>
          <Text style={[styles.workoutName, styles.whiteText]}>
            {todaySession.name}
          </Text>
          <Text style={[styles.workoutDescription, styles.whiteText]}>
            {todaySession.description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Component for objectives list
  const ObjectivesList = () => (
    <View style={styles.objectivesContainer}>
      <Text style={styles.sectionTitle}>Mes objectifs</Text>

      {objectives.map((objective) => (
        <View key={objective.id} style={styles.objectiveItem}>
          <View
            style={[
              styles.checkCircle,
              objective.completed && styles.completedCheckCircle,
            ]}
          >
            {objective.completed && (
              <Ionicons name="checkmark" size={16} color={Colors.white} />
            )}
          </View>
          <Text style={styles.objectiveText}>{objective.title}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>Bon retour,</Text>
              <Text style={styles.userName}>{userName || "Utilisateur"}</Text>
            </View>
            <TouchableOpacity
              style={styles.starButton}
              onPress={() => router.push("/user/dashboard/badge-monitoring")}
            >
              <Ionicons name="star" size={24} color="#FFD700" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Suivi quotidien</Text>

        <View style={styles.cardsRow}>
          <NutritionSummaryCard />
          <WorkoutCard />
        </View>

        <ObjectivesList />
      </ScrollView>
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
    padding: Layout.spacing.lg,
  },
  header: {
    marginTop: Layout.spacing.md,
    marginBottom: Layout.spacing.xl,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  starButton: {
    padding: Layout.spacing.xs,
  },
  greeting: {
    ...TextStyles.bodyLarge,
    color: Colors.gray.dark,
  },
  userName: {
    ...TextStyles.h3,
    marginTop: Layout.spacing.xs,
  },
  sectionTitle: {
    ...TextStyles.h4,
    marginBottom: Layout.spacing.md,
  },
  cardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Layout.spacing.xl,
  },
  card: {
    width: "48%",
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    ...Layout.elevation.sm,
    minHeight: 150,
  },
  nutritionCard: {
    backgroundColor: Colors.white,
    alignItems: "center",
  },
  workoutCard: {
    backgroundColor: Colors.brandBlue[1],
  },
  cardTitle: {
    ...TextStyles.bodySmall,
    color: Colors.gray.dark,
    marginBottom: Layout.spacing.sm,
  },
  whiteText: {
    color: Colors.white,
  },
  calorieValue: {
    ...TextStyles.h4,
    color: Colors.brandBlue[0],
    marginBottom: Layout.spacing.xs,
  },
  circleContainer: {
    alignItems: "center",
    marginTop: Layout.spacing.sm,
  },
  circle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.brandBlue[1],
    alignItems: "center",
    justifyContent: "center",
  },
  circleText: {
    ...TextStyles.bodyLarge,
    color: Colors.white,
    fontWeight: "600",
  },
  circleSubtext: {
    ...TextStyles.caption,
    color: Colors.white,
    fontSize: 8,
    textAlign: "center",
  },
  workoutContent: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Layout.spacing.md,
  },
  workoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Layout.spacing.sm,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    ...TextStyles.body,
    fontWeight: "600",
    fontSize: 16,
  },
  workoutDescription: {
    ...TextStyles.bodySmall,
    opacity: 0.9,
    marginTop: 2,
  },
  objectivesContainer: {
    marginBottom: Layout.spacing.lg,
  },
  objectiveItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
    ...Layout.elevation.sm,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray.light,
    backgroundColor: Colors.gray.ultraLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Layout.spacing.md,
  },
  completedCheckCircle: {
    backgroundColor: Colors.brandBlue[0],
    borderColor: Colors.brandBlue[0],
  },
  objectiveText: {
    ...TextStyles.body,
    flex: 1,
  },
});
