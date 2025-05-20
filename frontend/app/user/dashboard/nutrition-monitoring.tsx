import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../../constants/Colors";
import Layout from "../../../constants/Layout";
import { TextStyles } from "../../../constants/Fonts";
import Header from "../../../components/layout/Header";
import Card from "../../../components/ui/Card";
import Svg, { Circle, Text as SvgText } from "react-native-svg";
import { useAuth } from "../../../context/AuthContext";
import { nutritionService } from "../../../services/nutrition.service";

// Type definitions
interface MacroNutrient {
  goal: number;
  consumed: number;
  remaining: number;
  percentCompleted: number;
  unit: string;
}

interface NutritionSummary {
  calorieGoal: number;
  caloriesConsumed: number;
  caloriesRemaining: number;
  percentCompleted: number;
  macronutrients: {
    carbs: MacroNutrient;
    proteins: MacroNutrient;
    fats: MacroNutrient;
  };
}

interface FoodEntry {
  id: number;
  foodId: number;
  name: string;
  meal: string;
  quantity: number;
  calories: number;
  image?: string;
  type?: string;
}

interface NutritionData {
  date: string;
  meals: {
    [key: string]: FoodEntry[];
  };
  totals: {
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
  };
}

export default function NutritionMonitoring() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<NutritionSummary | null>(null);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(
    null
  );
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteInProgress, setDeleteInProgress] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load nutrition summary
      const summaryData = await nutritionService.getNutritionSummary();
      if (summaryData) {
        setSummary(summaryData);
      }

      // Load today's nutrition data
      const todayData = await nutritionService.getTodayNutrition();
      if (todayData) {
        setNutritionData(todayData);

        // Flatten meals into a single array for display
        const allEntries: FoodEntry[] = [];
        Object.entries(todayData.meals).forEach(([mealType, entries]) => {
          entries.forEach((entry) => {
            allEntries.push({
              ...entry,
              meal: mealType,
            });
          });
        });

        setFoodEntries(allEntries);
      }
    } catch (error) {
      console.error("Error loading nutrition data:", error);
      Alert.alert(
        "Erreur",
        "Impossible de charger les données nutritionnelles. Veuillez réessayer plus tard."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  // Delete food entry
  const deleteFoodEntry = async (entryId: number) => {
    setDeleteInProgress(entryId);
    try {
      await nutritionService.deleteNutritionEntry(entryId);

      // Remove from local state
      setFoodEntries((prevEntries) =>
        prevEntries.filter((entry) => entry.id !== entryId)
      );

      // Reload data to update summary
      await loadData();

      Alert.alert(
        "Suppression réussie",
        "L'aliment a été supprimé de votre suivi nutritionnel."
      );
    } catch (error) {
      console.error("Error deleting food entry:", error);
      Alert.alert(
        "Erreur",
        "Impossible de supprimer l'aliment. Veuillez réessayer plus tard."
      );
    } finally {
      setDeleteInProgress(null);
    }
  };

  // Navigate to discover page
  const navigateToDiscover = () => {
    router.push("/user/nutrition/nutrition-discover");
  };

  // Navigate to history page
  const navigateToHistory = () => {
    router.push("/user/dashboard/history");
  };

  // Macro nutrient component
  const MacroCircle = ({
    title,
    percentage,
    consumed,
    remaining,
    color,
  }: {
    title: string;
    percentage: number;
    consumed: number;
    remaining: number;
    color: string;
  }) => {
    const radius = 40;
    const strokeWidth = 6;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (circumference * percentage) / 100;
    const fontSize = 20;
    const textYOffset = fontSize / 2;

    return (
      <View style={styles.macroContainer}>
        <Svg width={radius * 2} height={radius * 2}>
          <Circle
            cx={radius}
            cy={radius}
            r={radius - strokeWidth / 2}
            stroke={Colors.gray.ultraLight}
            strokeWidth={strokeWidth}
            fill="transparent"
            rotation="-90"
            origin={`${radius}, ${radius}`}
          />
          <Circle
            cx={radius}
            cy={radius}
            r={radius - strokeWidth / 2}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            fill="transparent"
            rotation="-90"
            origin={`${radius}, ${radius}`}
          />
          <SvgText
            x={radius}
            y={radius + textYOffset}
            textAnchor="middle"
            fontSize={fontSize + 5}
            fontWeight="bold"
            fill={color}
          >
            {percentage.toString().trim()}
          </SvgText>
        </Svg>
        <Text style={[styles.macroTitle, { color }]}>{title}</Text>
        <Text style={styles.macroSubtitle}>
          {consumed.toString()}g consommés
        </Text>
        <Text style={styles.macroSubtitle}>
          {remaining.toString()}g restants
        </Text>
      </View>
    );
  };

  // Navigate to food detail
  const navigateToFoodDetail = (foodId: number) => {
    // Find the food item to determine its type
    const foodEntry = foodEntries.find((entry) => entry.foodId === foodId);
    if (!foodEntry) return;

    // Here we would need to determine if it's a recipe or product
    // For now, we'll use a simple approach by calling the service to get details
    nutritionService
      .getFoodById(foodId)
      .then((food) => {
        const route =
          food.type === "recette"
            ? `/user/nutrition/recipes/${foodId}`
            : `/user/nutrition/products/${foodId}`;

        router.push(route as any);
      })
      .catch((error) => {
        console.error("Error fetching food details:", error);
        // Fallback to products route
        router.push(`/user/nutrition/products/${foodId}` as any);
      });
  };

  // Food entry component
  const FoodItem = ({ item }: { item: FoodEntry }) => {
    // Déterminer l'unité à afficher selon le type
    const getUnitText = () => {
      if (item.type === "recette") {
        return item.quantity > 1 ? "portions" : "portion";
      }
      return "g";
    };

    return (
      <Card
        style={styles.foodCard}
        onPress={() => navigateToFoodDetail(item.foodId)}
      >
        <View style={styles.foodRow}>
          <View style={styles.foodImageContainer}>
            {item.image ? (
              <Image
                source={{ uri: item.image }}
                style={styles.foodImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.foodImagePlaceholder}>
                <Ionicons
                  name="restaurant-outline"
                  size={24}
                  color={Colors.gray.medium}
                />
              </View>
            )}
          </View>

          <View style={styles.foodInfo}>
            <Text style={styles.foodName}>{item.name.split(" - ")[0]}</Text>
            <Text style={styles.foodMeal}>{getMealLabel(item.meal)}</Text>
          </View>

          <View style={styles.foodActions}>
            <View style={styles.foodCalories}>
              <Text style={styles.caloriesText}>{item.calories} cal</Text>
              <Text style={styles.quantityText}>
                {item.quantity} {getUnitText()}
              </Text>
            </View>

            {/* Delete button */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => {
                Alert.alert(
                  "Confirmer la suppression",
                  "Voulez-vous vraiment supprimer cet aliment de votre suivi ?",
                  [
                    { text: "Annuler", style: "cancel" },
                    {
                      text: "Supprimer",
                      onPress: () => deleteFoodEntry(item.id),
                      style: "destructive",
                    },
                  ]
                );
              }}
              disabled={deleteInProgress === item.id}
            >
              {deleteInProgress === item.id ? (
                <ActivityIndicator size="small" color={Colors.error} />
              ) : (
                <Ionicons name="trash-outline" size={20} color={Colors.error} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );
  };

  // Progress bar component
  const CalorieProgressBar = () => {
    if (!summary) return null;

    const percentage = Math.min(summary.percentCompleted, 100);
    const isOverLimit = summary.caloriesConsumed > summary.calorieGoal;
    const barColor = isOverLimit ? Colors.error : Colors.brandBlue[0];

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${percentage}%`,
                backgroundColor: barColor,
              },
            ]}
          />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressText}>
            {summary.caloriesConsumed} calories absorbées
          </Text>
          <Text style={styles.progressText}>
            Objectif : {summary.calorieGoal}
          </Text>
        </View>
      </View>
    );
  };

  // Helper to translate meal types
  const getMealLabel = (mealType: string): string => {
    const mealLabels: Record<string, string> = {
      "petit-dejeuner": "Petit-déjeuner",
      dejeuner: "Déjeuner",
      diner: "Dîner",
      collation: "Collation",
    };
    return mealLabels[mealType] || mealType;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Suivi nutritionnel"
          showBackButton
          onBackPress={() => router.back()}
          style={{ marginTop: Layout.spacing.md }}
          rightIconName="calendar-outline"
          onRightIconPress={navigateToHistory}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.brandBlue[0]} />
          <Text style={styles.loadingText}>
            Chargement du suivi nutritionnel...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Determine text color for remaining calories
  const getRemainingCaloriesColor = () => {
    if (!summary) return Colors.brandBlue[0];
    return summary.caloriesRemaining < 0 ? Colors.error : Colors.brandBlue[0];
  };

  // Get appropriate text for calories status
  const getCaloriesStatusText = () => {
    if (!summary) return "Chargement des calories...";

    if (summary.caloriesRemaining < 0) {
      return `Vous avez dépassé de ${Math.abs(
        summary.caloriesRemaining
      )} Calories`;
    }

    return `Vous pouvez encore manger ${summary.caloriesRemaining} Calories`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Suivi nutritionnel"
        showBackButton
        onBackPress={() => router.back()}
        style={{ marginTop: Layout.spacing.md }}
        rightIconName="calendar-outline"
        onRightIconPress={navigateToHistory}
      />

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.brandBlue[0]]}
            tintColor={Colors.brandBlue[0]}
          />
        }
      >
        {summary && (
          <View style={styles.summarySection}>
            <Text
              style={[
                styles.remainingText,
                { color: getRemainingCaloriesColor() },
              ]}
            >
              {getCaloriesStatusText()}
            </Text>

            <CalorieProgressBar />

            <View style={styles.macrosContainer}>
              <MacroCircle
                title="Glucides"
                percentage={summary.macronutrients.carbs.percentCompleted}
                consumed={summary.macronutrients.carbs.consumed}
                remaining={summary.macronutrients.carbs.remaining}
                color={Colors.secondary[0]}
              />

              <MacroCircle
                title="Protéines"
                percentage={summary.macronutrients.proteins.percentCompleted}
                consumed={summary.macronutrients.proteins.consumed}
                remaining={summary.macronutrients.proteins.remaining}
                color={Colors.brandBlue[0]}
              />

              <MacroCircle
                title="Graisses"
                percentage={summary.macronutrients.fats.percentCompleted}
                consumed={summary.macronutrients.fats.consumed}
                remaining={summary.macronutrients.fats.remaining}
                color={Colors.plan.cardio.primary}
              />
            </View>
          </View>
        )}

        <View style={styles.foodsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Aliments consommés aujourd'hui
            </Text>
          </View>

          {foodEntries.length > 0 ? (
            foodEntries.map((entry) => <FoodItem key={entry.id} item={entry} />)
          ) : (
            <View style={styles.emptyStateContainer}>
              <Ionicons
                name="restaurant-outline"
                size={48}
                color={Colors.gray.light}
              />
              <Text style={styles.emptyStateText}>
                Vous n'avez pas encore ajouté d'aliments aujourd'hui.
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={navigateToDiscover}
              >
                <Text style={styles.emptyStateButtonText}>
                  Ajouter des aliments
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={navigateToDiscover}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color={Colors.white} />
      </TouchableOpacity>
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
  },
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
  summarySection: {
    padding: Layout.spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.ultraLight,
  },
  remainingText: {
    ...TextStyles.bodyLarge,
    marginBottom: Layout.spacing.md,
    fontWeight: "600",
  },
  highlightText: {
    color: Colors.brandBlue[0],
    fontWeight: "600",
  },
  progressContainer: {
    marginBottom: Layout.spacing.lg - 20,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: Colors.gray.ultraLight,
    borderRadius: 6,
    marginBottom: Layout.spacing.xs,
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.brandBlue[0],
    borderRadius: 6,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressText: {
    ...TextStyles.caption,
    color: Colors.gray.dark,
  },
  macrosContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: Layout.spacing.lg,
  },
  macroContainer: {
    alignItems: "center",
  },
  macroCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Layout.spacing.xs,
  },
  macroPercentage: {
    ...TextStyles.bodyLarge,
    fontWeight: "600",
  },
  macroTitle: {
    ...TextStyles.body,
    fontWeight: "600",
    marginBottom: 2,
  },
  macroSubtitle: {
    ...TextStyles.caption,
    color: Colors.gray.dark,
  },
  foodsSection: {
    padding: Layout.spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Layout.spacing.md,
  },
  sectionTitle: {
    ...TextStyles.h4,
    flex: 1, // Pour que le titre prenne l'espace disponible
  },
  foodCard: {
    marginBottom: Layout.spacing.md,
    padding: Layout.spacing.md,
    borderWidth: 1, // Ajout d'une bordure
    borderColor: Colors.gray.ultraLight, // Couleur de la bordure
    shadowColor: "#000", // Amélioration de l'ombre
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  foodRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  foodImageContainer: {
    marginRight: Layout.spacing.md,
  },
  foodImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.gray.ultraLight,
  },
  foodImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.gray.ultraLight,
    alignItems: "center",
    justifyContent: "center",
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    ...TextStyles.body,
    fontWeight: "600",
  },
  foodMeal: {
    ...TextStyles.caption,
    color: Colors.gray.dark,
  },
  foodActions: {
    alignItems: "flex-end",
  },
  foodCalories: {
    alignItems: "flex-end",
  },
  caloriesText: {
    ...TextStyles.body,
    fontWeight: "500",
  },
  quantityText: {
    ...TextStyles.caption,
    color: Colors.gray.dark,
  },
  deleteButton: {
    marginTop: Layout.spacing.sm,
    padding: Layout.spacing.xs,
  },
  emptyStateContainer: {
    padding: Layout.spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateText: {
    ...TextStyles.body,
    color: Colors.gray.dark,
    textAlign: "center",
    marginTop: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  emptyStateButton: {
    backgroundColor: Colors.brandBlue[0],
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.pill,
  },
  emptyStateButtonText: {
    ...TextStyles.body,
    color: Colors.white,
    fontWeight: "600",
  },
  // Floating Action Button styles
  fab: {
    position: "absolute",
    bottom: 32,
    right: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.secondary[0],
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 999,
  },
});
