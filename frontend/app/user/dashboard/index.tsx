import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { format } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../context/AuthContext";
import Colors from "../../../constants/Colors";
import Layout from "../../../constants/Layout";
import { TextStyles } from "../../../constants/Fonts";

// Import services
import authService from "../../../services/auth.service";
import userService from "../../../services/user.service";
import dataService from "../../../services/data.service";
import apiService from "../../../services/api.service";
import objectivesService from "../../../services/objectives.service";
import { nutritionService } from "../../../services/nutrition.service";
import programsService from "../../../services/programs.service";

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

interface WeekDay {
  day: string;
  date: string;
  session: {
    id: number;
    name: string;
    order: number;
    completed: boolean;
  } | null;
}

interface Objective {
  id: number;
  objectiveId: number;
  title: string;
  completed: boolean;
  date: string;
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
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Charger le profil utilisateur (Utiliser userService pour le cache)
      try {
        const profileData = await userService.getUserProfile();
        setUserName(profileData.user.firstName);
      } catch (e) {
        console.log("Error loading profile:", e);
        setUserName("Utilisateur");
      }

      // 2. Charger les données nutritionnelles
      try {
        const nutritionData = await nutritionService.getNutritionSummary();

        if (nutritionData && nutritionData.calorieGoal) {
          setNutritionSummary({
            consumedCalories: nutritionData.caloriesConsumed || 0,
            totalCalories: nutritionData.calorieGoal || 0,
            percentage: nutritionData.percentCompleted || 0,
          });
        } else {
          setNutritionSummary({ consumedCalories: 0, totalCalories: 0, percentage: 0 });
        }
      } catch (error) {
        console.error("Error loading nutrition data:", error);
        // Fallback propre : Zéro
        setNutritionSummary({ consumedCalories: 0, totalCalories: 0, percentage: 0 });
      }

      // 3. Charger les objectifs quotidiens
      try {
        const objectivesResponse = await objectivesService.getDailyObjectives();
        if (objectivesResponse && objectivesResponse.objectives) {
          setObjectives(objectivesResponse.objectives);
        } else {
          setObjectives([]);
        }
      } catch (error) {
        console.error("Error loading objectives:", error);
        setObjectives([]);
      }

      // 4. Charger les données sportives
      try {
        const sportProgressData = await programsService.getSportProgress();
        // Note: activeUserProgram logic. 
        // Si l'appel API échoue, pour l'instant pas de cache explicite sur "weeklySchedule" dans `programs.service`
        // J'ai ajouté `ACTIVE_PROGRAM` cache, mais `sport-progress` renvoie plus que ça.
        // Pour l'instant, si ça fail, on met vide.
        // Le mockTodaySession est supprimé pour éviter l'aléatoire.

        const todayStr = format(new Date(), "yyyy-MM-dd");

        if (
          sportProgressData &&
          sportProgressData.weeklySchedule &&
          sportProgressData.weeklySchedule.length > 0
        ) {
          const todayScheduleItem = sportProgressData.weeklySchedule.find(
            (day: WeekDay) => day.date === todayStr && day.session !== null
          );

          if (todayScheduleItem && todayScheduleItem.session) {
            setTodaySession({
              id: todayScheduleItem.session.id,
              name: todayScheduleItem.session.name.split("(")[0],
              description: todayScheduleItem.session.name.split("(")[1]?.replace(")", "") || "",
            });
          } else {
            setTodaySession({ id: 0, name: "Repos", description: "Aucune séance prévue" });
          }
        } else {
          setTodaySession({ id: 0, name: "Repos", description: "Aucune séance prévue" });
        }
      } catch (error) {
        console.error("Error loading sport progress data:", error);
        setTodaySession({ id: 0, name: "--", description: "Non disponible hors-ligne" });
      }
    } catch (error) {
      console.error("Error loading dashboard data (Global):", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Use useFocusEffect to refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };



  // Component for nutrition summary card
  const NutritionSummaryCard = () => (
    <TouchableOpacity
      style={[styles.card, styles.nutritionCard]}
      activeOpacity={0.7}
      onPress={() => router.push({ pathname: "/user/dashboard/nutrition-monitoring", params: { from: "dashboard" } })}
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
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.brandBlue[0]]}
            tintColor={Colors.brandBlue[0]}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>Bon retour,</Text>
              <Text style={styles.userName}>{userName || "Utilisateur"}</Text>
            </View>
            <TouchableOpacity
              testID="badge-button"
              style={styles.badgeButton}
              onPress={() => router.push({ pathname: "/user/dashboard/badge-monitoring", params: { from: "dashboard" } })}
            >
              <Ionicons name="trophy" size={24} color="#A091FF" />
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
  badgeButton: {
    padding: Layout.spacing.xs,
    backgroundColor: Colors.white,
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    ...Layout.elevation.lg,
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
    fontSize: 22,
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
    fontWeight: "700",
    fontSize: 24,
  },
  circleSubtext: {
    ...TextStyles.caption,
    color: Colors.white,
    fontSize: 10,
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
