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
import Card from "../../../components/ui/Card";

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

  useEffect(() => {
    // In a real app, you would fetch data from the API
    // GET /api/data/programs/today-session
    // GET /api/user/nutrition/summary

    loadData();
  }, []);

  const loadData = () => {
    // Get user data from temp.json
    const userData = tempData.user_exemple;

    // Calculate consumed calories from nutrition tracking
    const nutritionalTracking = tempData.suivis_nutritionnels_exemple;
    let totalConsumed = 0;

    nutritionalTracking.forEach((tracking) => {
      const aliment = tempData.aliments.find(
        (a) => a.id_aliment === tracking.id_aliment
      );
      if (aliment) {
        // Assuming quantity is in grams and we need to convert to portion
        const quantity = tracking.quantite / 100;
        totalConsumed += aliment.calories * quantity;
      }
    });

    // Calculate percentage of daily goal
    const totalCalorieGoal = userData.preferences.calories_quotidiennes;
    const percentage = Math.min(
      Math.round((totalConsumed / totalCalorieGoal) * 100),
      100
    );

    setNutritionSummary({
      consumedCalories: Math.round(totalConsumed),
      totalCalories: totalCalorieGoal,
      percentage: percentage,
    });

    // Set today's workout session
    // In a real app, this would come from a different API call
    const todaySportTracking = tempData.suivis_sportifs_exemple[0];
    const session = tempData.seances.find(
      (s) => s.id_seance === todaySportTracking.id_seance
    );

    if (session) {
      // Extract tags for description
      const tags = [];
      if (session.tags.includes(7)) tags.push("Pectoraux");
      if (session.tags.includes(8)) tags.push("Triceps");
      if (session.tags.includes(9)) tags.push("Épaules");

      const description = tags.join(", ");

      setTodaySession({
        id: session.id_seance,
        name: session.nom.split(" ")[0], // Take just the first word of the session name
        description: `(${description})`,
      });
    }

    // Set daily objectives
    const objectivesData = tempData.objectifs.map((obj, index) => ({
      id: obj.id_objectif,
      title: obj.titre,
      // For demo purposes, set the first one as completed
      completed: index === 0,
    }));

    setObjectives(objectivesData);
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
              <Text style={styles.userName}>
                {tempData.user_exemple.prenom || "User Name"}
              </Text>
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
