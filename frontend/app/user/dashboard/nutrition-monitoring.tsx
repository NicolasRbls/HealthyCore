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
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../../constants/Colors";
import Layout from "../../../constants/Layout";
import { TextStyles } from "../../../constants/Fonts";
import Header from "../../../components/layout/Header";
import Card from "../../../components/ui/Card";
import Svg, { Circle, Text as SvgText } from "react-native-svg";

// Import temp data
import tempData from "../../../assets/temp.json";

// Type definitions
interface MacroNutrient {
  percentage: number;
  consumed: number;
  remaining: number;
}

interface NutritionSummary {
  consumedCalories: number;
  remainingCalories: number;
  totalCalories: number;
  macros: {
    carbs: MacroNutrient;
    proteins: MacroNutrient;
    fats: MacroNutrient;
  };
}

interface FoodEntry {
  id: number;
  name: string;
  meal: string;
  quantity: number;
  calories: number;
  image: string | null;
  foodId?: number; // Optional ID linking to the original food item
}

export default function NutritionMonitoring() {
  const [summary, setSummary] = useState<NutritionSummary>({
    consumedCalories: 0,
    remainingCalories: 0,
    totalCalories: 0,
    macros: {
      carbs: { percentage: 0, consumed: 0, remaining: 0 },
      proteins: { percentage: 0, consumed: 0, remaining: 0 },
      fats: { percentage: 0, consumed: 0, remaining: 0 },
    },
  });
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // In a real app, you would fetch this data with:
    // GET /api/user/nutrition/today

    loadData();
  }, []);

  const loadData = () => {
    // Get user preferences
    const userData = tempData.user_exemple;
    const userPreferences = userData.preferences;

    // Get nutritional tracking data
    const nutritionalTracking = tempData.suivis_nutritionnels_exemple;

    // Calculate consumed calories and macros
    let totalCalories = 0;
    let totalCarbs = 0;
    let totalProteins = 0;
    let totalFats = 0;

    const entries: FoodEntry[] = [];

    nutritionalTracking.forEach((tracking) => {
      const aliment = tempData.aliments.find(
        (a) => a.id_aliment === tracking.id_aliment
      );
      if (aliment) {
        const quantity = tracking.quantite / 100; // assuming quantity is in grams
        const calories = aliment.calories * quantity;

        totalCalories += calories;
        totalCarbs += parseFloat(aliment.glucides) * quantity;
        totalProteins += parseFloat(aliment.proteines) * quantity;
        totalFats += parseFloat(aliment.lipides) * quantity;

        // Add to food entries
        entries.push({
          id: tracking.id_suivi_nutritionnel,
          name: aliment.nom,
          meal: tracking.repas,
          quantity: tracking.quantite,
          calories: Math.round(calories),
          image: aliment.image,
          foodId: aliment.id_aliment, // Store the original food ID for navigation
        });
      }
    });

    // Get calorie goal and remaining calories
    const totalCalorieGoal = userPreferences.calories_quotidiennes;
    const remainingCalories = totalCalorieGoal - totalCalories;

    // Get nutritional plan for macro distribution
    const nutritionalPlan = tempData.repartitionsNutritionnelles.find(
      (plan) =>
        plan.id_repartition_nutritionnelle ===
        userPreferences.id_repartition_nutritionnelle
    );

    // Calculate macro targets and percentages
    const carbPercentage = nutritionalPlan
      ? parseFloat(nutritionalPlan.pourcentage_glucides)
      : 50;
    const proteinPercentage = nutritionalPlan
      ? parseFloat(nutritionalPlan.pourcentage_proteines)
      : 20;
    const fatPercentage = nutritionalPlan
      ? parseFloat(nutritionalPlan.pourcentage_lipides)
      : 30;

    const carbTarget = (totalCalorieGoal * (carbPercentage / 100)) / 4; // 4 calories per gram of carbs
    const proteinTarget = (totalCalorieGoal * (proteinPercentage / 100)) / 4; // 4 calories per gram of protein
    const fatTarget = (totalCalorieGoal * (fatPercentage / 100)) / 9; // 9 calories per gram of fat

    // Set nutrition summary
    setSummary({
      consumedCalories: Math.round(totalCalories),
      remainingCalories: Math.round(remainingCalories),
      totalCalories: totalCalorieGoal,
      macros: {
        carbs: {
          percentage: Math.round((totalCarbs / carbTarget) * 100),
          consumed: Math.round(totalCarbs),
          remaining: Math.round(carbTarget - totalCarbs),
        },
        proteins: {
          percentage: Math.round((totalProteins / proteinTarget) * 100),
          consumed: Math.round(totalProteins),
          remaining: Math.round(proteinTarget - totalProteins),
        },
        fats: {
          percentage: Math.round((totalFats / fatTarget) * 100),
          consumed: Math.round(totalFats),
          remaining: Math.round(fatTarget - totalFats),
        },
      },
    });

    setFoodEntries(entries);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  // Helper function to get the correct image using a mapping approach
  const getImageSource = (imagePath: string | null) => {
    if (!imagePath) return null;

    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return { uri: imagePath };
    }

    // Define a mapping for the images in temp.json to their actual requires
    const imageMapping: Record<string, any> = {
      "/assets/images/aliments/1-nutella-1kg.png": require("../../../assets/images/aliments/1-nutella-1kg.png"),
      "/assets/images/aliments/2-prince-100g.png": require("../../../assets/images/aliments/2-prince-100g.png"),
      "/assets/images/aliments/3-fruits-secs-alesto-200g.png": require("../../../assets/images/aliments/3-fruits-secs-alesto-200g.png"),
      "/assets/images/aliments/4-pat-noisettes-bonne-maman-360g.png": require("../../../assets/images/aliments/4-pat-noisettes-bonne-maman-360g.png"),
      "/assets/images/aliments/5-tuc-100g.png": require("../../../assets/images/aliments/5-tuc-100g.png"),
      "/assets/images/aliments/6-salade-verte-avocat.png": require("../../../assets/images/aliments/6-salade-verte-avocat.png"),
      "/assets/images/aliments/7-pates-tomates-mozza.png": require("../../../assets/images/aliments/7-pates-tomates-mozza.png"),
      "/assets/images/aliments/8-perfect-white-rice.png": require("../../../assets/images/aliments/8-perfect-white-rice.png"),
    };

    // Return the mapped image or null if not found
    return imageMapping[imagePath] || null;
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

  // Navigate to discover page
  const navigateToDiscover = () => {
    router.push("/user/nutrition/nutrition-discover");
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
    const fontSize = 20; // Taille de la police
    const textYOffset = fontSize / 2; // Ajustement vertical pour le centrage

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
            y={radius + textYOffset} // Calcul de la position y pour le centrage
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
  const navigateToFoodDetail = (
    foodId: number,
    foodType: string = "produit"
  ) => {
    // Find the original food item in the aliments data
    const foodItem = tempData.aliments.find((a) => a.id_aliment === foodId);

    if (!foodItem) return;

    // Determine the route based on the food type
    const route =
      foodItem.type === "recette"
        ? `/user/nutrition/recipes/${foodId}`
        : `/user/nutrition/products/${foodId}`;

    router.push(route as any);
  };

  // Food entry component
  const FoodItem = ({ item }: { item: FoodEntry }) => {
    const imageSource = getImageSource(item.image);

    // The foodId is now directly stored in the item, simplifying the lookup
    const foodId = item.foodId;

    // Find the original food item to get its type
    const originalFood = foodId
      ? tempData.aliments.find((a) => a.id_aliment === foodId)
      : null;

    return (
      <Card
        style={styles.foodCard}
        onPress={() =>
          foodId &&
          navigateToFoodDetail(foodId, originalFood?.type || "produit")
        }
      >
        <View style={styles.foodRow}>
          <View style={styles.foodImageContainer}>
            {imageSource ? (
              <Image
                source={imageSource}
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
            <Text style={styles.foodName}>{item.name}</Text>
            <Text style={styles.foodMeal}>{getMealLabel(item.meal)}</Text>
          </View>

          <View style={styles.foodCalories}>
            <Text style={styles.caloriesText}>
              {item.calories.toString()} cal
            </Text>
            <Text style={styles.quantityText}>{item.quantity.toString()}g</Text>
          </View>
        </View>
      </Card>
    );
  };

  // Progress bar component
  const CalorieProgressBar = () => {
    const percentage = Math.min(
      (summary.consumedCalories / summary.totalCalories) * 100,
      100
    );

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${percentage}%` }]} />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressText}>
            {summary.consumedCalories.toString()} calories absorbées
          </Text>
          <Text style={styles.progressText}>
            Objectif : {summary.totalCalories.toString()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Suivi nutritionnel"
        showBackButton
        onBackPress={() => router.back()}
        style={{ marginTop: Layout.spacing.md }}
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
        <View style={styles.summarySection}>
          <Text style={styles.remainingText}>
            Vous pouvez encore manger{" "}
            <Text style={styles.highlightText}>
              {summary.remainingCalories.toString()}
            </Text>{" "}
            Calories
          </Text>

          <CalorieProgressBar />

          <View style={styles.macrosContainer}>
            <MacroCircle
              title="Glucides"
              percentage={summary.macros.carbs.percentage}
              consumed={summary.macros.carbs.consumed}
              remaining={summary.macros.carbs.remaining}
              color={Colors.secondary[0]}
            />

            <MacroCircle
              title="Protéines"
              percentage={summary.macros.proteins.percentage}
              consumed={summary.macros.proteins.consumed}
              remaining={summary.macros.proteins.remaining}
              color={Colors.brandBlue[0]}
            />

            <MacroCircle
              title="Graisses"
              percentage={summary.macros.fats.percentage}
              consumed={summary.macros.fats.consumed}
              remaining={summary.macros.fats.remaining}
              color={Colors.plan.cardio.primary}
            />
          </View>
        </View>

        <View style={styles.foodsSection}>
          <Text style={styles.sectionTitle}>
            Aliments consommés aujourd'hui
          </Text>

          {foodEntries.map((entry) => (
            <FoodItem key={entry.id} item={entry} />
          ))}
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
  summarySection: {
    padding: Layout.spacing.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.ultraLight,
  },
  remainingText: {
    ...TextStyles.bodyLarge,
    marginBottom: Layout.spacing.md,
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
  sectionTitle: {
    ...TextStyles.h4,
    marginBottom: Layout.spacing.md,
  },
  foodCard: {
    marginBottom: Layout.spacing.md,
    padding: Layout.spacing.md,
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
