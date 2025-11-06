import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../../constants/Colors";
import Layout from "../../../constants/Layout";
import { TextStyles } from "../../../constants/Fonts";
import Header from "../../../components/layout/Header";
import Card from "../../../components/ui/Card";
import { useAuth } from "../../../context/AuthContext";
import { nutritionService } from "../../../services/nutrition.service";

// Type definitions
interface FoodEntry {
  id: number;
  foodId: number;
  name: string;
  meal: string;
  quantity: number;
  calories: number;
  type?: string; // "recette" or "produit"
}

interface DayNutrition {
  date: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  goalCompleted: boolean;
  entries: FoodEntry[];
}

interface HistoryData {
  history: DayNutrition[];
  summary: {
    totalDays: number;
    daysCompleted: number;
    calorieGoal: number;
  };
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const DAY_ITEM_WIDTH = SCREEN_WIDTH / 4 - 16; // 4 items per row with some spacing

export default function NutritionHistoryScreen() {
  const { user } = useAuth();
  const [historyData, setHistoryData] = useState<HistoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  useEffect(() => {
    loadHistoryData();
  }, []);

  const loadHistoryData = async (start?: string, end?: string) => {
    setIsLoading(true);
    try {
      const historyData = await nutritionService.getNutritionHistory(
        start,
        end
      );

      if (historyData) {
        setHistoryData(historyData);

        // Set the first day as selected by default
        if (historyData.history.length > 0 && !selectedDay) {
          setSelectedDay(historyData.history[0].date);
        }

        // Store the date range
        if (historyData.history.length > 0) {
          const lastIndex = historyData.history.length - 1;
          setStartDate(historyData.history[lastIndex].date);
          setEndDate(historyData.history[0].date);
        }
      }
    } catch (error) {
      console.error("Error loading history data:", error);
      Alert.alert(
        "Erreur",
        "Impossible de charger l'historique nutritionnel. Veuillez réessayer plus tard."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreHistory = async () => {
    if (!startDate || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      // Calculate new start date (7 days before current start date)
      const currentStartDate = new Date(startDate);
      currentStartDate.setDate(currentStartDate.getDate() - 7);
      const newStartDate = currentStartDate.toISOString().slice(0, 10);

      const historyData = await nutritionService.getNutritionHistory(
        newStartDate,
        startDate
      );

      if (historyData && historyData.history.length > 0) {
        // Merge with existing data
        setHistoryData((prevData) => {
          if (!prevData) return historyData;

          return {
            ...historyData,
            history: [...prevData.history, ...historyData.history],
            summary: {
              ...historyData.summary,
              totalDays:
                prevData.summary.totalDays + historyData.history.length,
              daysCompleted:
                prevData.summary.daysCompleted +
                historyData.history.filter((day) => day.goalCompleted).length,
            },
          };
        });

        // Update start date
        setStartDate(historyData.history[historyData.history.length - 1].date);
      }
    } catch (error) {
      console.error("Error loading more history:", error);
      Alert.alert(
        "Erreur",
        "Impossible de charger plus d'historique. Veuillez réessayer plus tard."
      );
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Format date to display (e.g. "Lundi 12 Mars")
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
    };
    // Capitalize first letter
    const formatted = date.toLocaleDateString("fr-FR", options);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  // Format date to short display (e.g. "12/03")
  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    return `${day}/${month}`;
  };

  // Check if date is today
  const isToday = (dateString: string) => {
    const today = new Date();
    const date = new Date(dateString);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Navigate to food detail
  const navigateToFoodDetail = (foodId: number) => {
    // Here we need to determine if it's a recipe or product
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

  // Render day item
  const renderDayItem = ({
    item,
    index,
  }: {
    item: DayNutrition;
    index: number;
  }) => {
    const isSelected = selectedDay === item.date;

    return (
      <TouchableOpacity
        style={[
          styles.dayItem,
          isSelected && styles.selectedDayItem,
          item.goalCompleted && styles.completedDayItem,
          { marginRight: (index + 1) % 4 === 0 ? 0 : 8 }, // No margin on the last item of each row
        ]}
        onPress={() => setSelectedDay(item.date)}
        activeOpacity={0.7}
        key={`day-${item.date}-${index}`}
      >
        <Text
          style={[
            styles.dayDate,
            isSelected && styles.selectedDayText,
            item.goalCompleted && styles.completedDayText,
          ]}
        >
          {formatShortDate(item.date)}
        </Text>
        {isToday(item.date) && (
          <Text
            style={[
              styles.todayIndicator,
              isSelected && styles.selectedDayText,
            ]}
          >
            Aujourd'hui
          </Text>
        )}
        <Text
          style={[
            styles.dayCalories,
            isSelected && styles.selectedDayText,
            item.goalCompleted && styles.completedDayText,
          ]}
        >
          {item.calories} cal
        </Text>
      </TouchableOpacity>
    );
  };

  // Render food entry
  const renderFoodEntry = ({
    item,
    index,
  }: {
    item: FoodEntry;
    index: number;
  }) => {
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
        activeOpacity={0.8}
        key={`entry-${item.id}-${index}`}
      >
        <View style={styles.foodRow}>
          <View style={styles.mealTag}>
            <Text style={styles.mealTagText}>{getMealLabel(item.meal)}</Text>
          </View>

          <View style={styles.foodInfo}>
            <Text style={styles.foodName}>{item.name.split(" - ")[0]}</Text>
            <Text style={styles.foodQuantity}>
              {item.quantity} {getUnitText()}
            </Text>
          </View>

          <Text style={styles.foodCalories}>{item.calories} cal</Text>
        </View>
      </Card>
    );
  };

  // Render selected day details
  const renderSelectedDayDetails = () => {
    if (!historyData || !selectedDay) return null;

    const selectedDayData = historyData.history.find(
      (day) => day.date === selectedDay
    );
    if (!selectedDayData) return null;

    return (
      <View style={styles.dayDetailsContainer}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayTitle}>
            {formatDate(selectedDay)}
            {isToday(selectedDay) && " (Aujourd'hui)"}
          </Text>

          <View style={styles.goalContainer}>
            <Text style={styles.goalText}>
              Objectif : {historyData.summary.calorieGoal} cal
            </Text>
            {selectedDayData.goalCompleted ? (
              <View style={styles.goalCompletedBadge}>
                <Ionicons name="checkmark" size={14} color={Colors.white} />
                <Text style={styles.goalCompletedText}>Atteint</Text>
              </View>
            ) : (
              <View style={styles.goalNotCompletedBadge}>
                <Text style={styles.goalNotCompletedText}>Non atteint</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.nutritionSummary}>
          <View style={styles.nutrientSummary}>
            <Text style={styles.nutrientValue}>{selectedDayData.calories}</Text>
            <Text style={styles.nutrientLabel}>Calories</Text>
          </View>
          <View style={styles.nutrientSummary}>
            <Text style={styles.nutrientValue}>{selectedDayData.carbs}g</Text>
            <Text style={styles.nutrientLabel}>Glucides</Text>
          </View>
          <View style={styles.nutrientSummary}>
            <Text style={styles.nutrientValue}>
              {selectedDayData.proteins}g
            </Text>
            <Text style={styles.nutrientLabel}>Protéines</Text>
          </View>
          <View style={styles.nutrientSummary}>
            <Text style={styles.nutrientValue}>{selectedDayData.fats}g</Text>
            <Text style={styles.nutrientLabel}>Lipides</Text>
          </View>
        </View>

        <Text style={styles.entriesSectionTitle}>Aliments consommés</Text>

        {selectedDayData.entries.length > 0 ? (
          selectedDayData.entries.map((entry, index) =>
            renderFoodEntry({ item: entry, index })
          )
        ) : (
          <View style={styles.emptyEntriesContainer}>
            <Text style={styles.emptyEntriesText}>
              Aucun aliment enregistré pour cette journée.
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Render footer for days list
  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.loadingMoreContainer}>
        <ActivityIndicator size="small" color={Colors.brandBlue[0]} />
        <Text style={styles.loadingMoreText}>Chargement...</Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Historique nutritionnel"
          showBackButton
          onBackPress={() => router.back()}
          style={{ marginTop: Layout.spacing.md }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.brandBlue[0]} />
          <Text style={styles.loadingText}>Chargement de l'historique...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!historyData || historyData.history.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Historique nutritionnel"
          showBackButton
          onBackPress={() => router.back()}
          style={{ marginTop: Layout.spacing.md }}
        />
        <View style={styles.emptyContainer}>
          <Ionicons
            name="calendar-outline"
            size={64}
            color={Colors.gray.light}
          />
          <Text style={styles.emptyText}>
            Aucun historique nutritionnel disponible.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() =>
              router.push("/user/nutrition/nutrition-discover" as any)
            }
          >
            <Text style={styles.emptyButtonText}>Ajouter des aliments</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Historique nutritionnel"
        showBackButton
        onBackPress={() => router.back()}
        style={{ marginTop: Layout.spacing.md }}
      />

      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {historyData.summary.totalDays}
          </Text>
          <Text style={styles.summaryLabel}>Jours suivis</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {historyData.summary.daysCompleted}
          </Text>
          <Text style={styles.summaryLabel}>Objectifs atteints</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {historyData.summary.totalDays > 0
              ? Math.round(
                  (historyData.summary.daysCompleted /
                    historyData.summary.totalDays) *
                    100
                )
              : 0}
            %
          </Text>
          <Text style={styles.summaryLabel}>Taux de réussite</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Historique des jours</Text>

      <View style={styles.daysGrid}>
        {historyData.history.map((day, index) =>
          renderDayItem({ item: day, index })
        )}
        {isLoadingMore && (
          <View style={styles.loadingMoreContainer}>
            <ActivityIndicator size="small" color={Colors.brandBlue[0]} />
          </View>
        )}
      </View>

      <ScrollView style={styles.container}>
        {renderSelectedDayDetails()}
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Layout.spacing.xl,
  },
  emptyText: {
    ...TextStyles.body,
    color: Colors.gray.dark,
    textAlign: "center",
    marginTop: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  emptyButton: {
    backgroundColor: Colors.brandBlue[0],
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.pill,
  },
  emptyButtonText: {
    ...TextStyles.body,
    color: Colors.white,
    fontWeight: "600",
  },
  summaryContainer: {
    flexDirection: "row",
    backgroundColor: Colors.gray.ultraLight,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginHorizontal: Layout.spacing.lg,
    marginVertical: Layout.spacing.md,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryValue: {
    ...TextStyles.h3,
    color: Colors.brandBlue[0],
  },
  summaryLabel: {
    ...TextStyles.caption,
    color: Colors.gray.dark,
  },
  sectionTitle: {
    ...TextStyles.bodyLarge,
    fontWeight: "600",
    marginHorizontal: Layout.spacing.lg,
    marginTop: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
  },
  dayItem: {
    width: DAY_ITEM_WIDTH,
    backgroundColor: Colors.brandBlue[0],
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
  },
  selectedDayItem: {
    backgroundColor: Colors.secondary[0],
  },
  completedDayItem: {
    backgroundColor: Colors.green,
  },
  dayDate: {
    ...TextStyles.body,
    fontWeight: "600",
    color: Colors.white,
  },
  selectedDayText: {
    color: Colors.white,
  },
  completedDayText: {
    color: Colors.white,
  },
  todayIndicator: {
    ...TextStyles.caption,
    color: Colors.white,
    marginTop: 2,
  },
  dayCalories: {
    ...TextStyles.caption,
    color: Colors.white,
    marginTop: Layout.spacing.xs,
  },
  dayDetailsContainer: {
    padding: Layout.spacing.lg,
    paddingBottom: 100, // Extra padding at bottom
  },
  dayHeader: {
    marginBottom: Layout.spacing.md,
  },
  dayTitle: {
    ...TextStyles.h4,
    marginBottom: Layout.spacing.xs,
  },
  goalContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  goalText: {
    ...TextStyles.body,
    color: Colors.gray.dark,
  },
  goalCompletedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.green,
    paddingVertical: 2,
    paddingHorizontal: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.pill,
    marginLeft: Layout.spacing.sm,
  },
  goalCompletedText: {
    ...TextStyles.caption,
    color: Colors.white,
    marginLeft: 2,
  },
  goalNotCompletedBadge: {
    backgroundColor: Colors.gray.light,
    paddingVertical: 2,
    paddingHorizontal: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.pill,
    marginLeft: Layout.spacing.sm,
  },
  goalNotCompletedText: {
    ...TextStyles.caption,
    color: Colors.gray.dark,
  },
  nutritionSummary: {
    flexDirection: "row",
    backgroundColor: Colors.gray.ultraLight,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  nutrientSummary: {
    flex: 1,
    alignItems: "center",
  },
  nutrientValue: {
    ...TextStyles.bodyLarge,
    fontWeight: "600",
  },
  nutrientLabel: {
    ...TextStyles.caption,
    color: Colors.gray.dark,
  },
  entriesSectionTitle: {
    ...TextStyles.bodyLarge,
    fontWeight: "600",
    marginBottom: Layout.spacing.md,
  },
  foodCard: {
    marginBottom: Layout.spacing.md,
    padding: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray.ultraLight,
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  foodRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  mealTag: {
    backgroundColor: Colors.gray.ultraLight,
    paddingVertical: 2,
    paddingHorizontal: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.pill,
    marginRight: Layout.spacing.sm,
  },
  mealTagText: {
    ...TextStyles.caption,
    color: Colors.gray.dark,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    ...TextStyles.body,
    fontWeight: "500",
  },
  foodQuantity: {
    ...TextStyles.caption,
    color: Colors.gray.dark,
  },
  foodCalories: {
    ...TextStyles.body,
    fontWeight: "600",
    color: Colors.brandBlue[0],
  },
  emptyEntriesContainer: {
    padding: Layout.spacing.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.gray.ultraLight,
    borderRadius: Layout.borderRadius.md,
  },
  emptyEntriesText: {
    ...TextStyles.body,
    color: Colors.gray.dark,
    textAlign: "center",
  },
  loadingMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Layout.spacing.sm,
  },
  loadingMoreText: {
    ...TextStyles.caption,
    color: Colors.gray.dark,
    marginLeft: Layout.spacing.xs,
  },
});

// Define ScrollView to use FlatList for better performance
const ScrollView = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) => {
  return (
    <FlatList
      data={[{ key: "content" }]}
      renderItem={() => <View>{children}</View>}
      style={style}
      showsVerticalScrollIndicator={false}
    />
  );
};
