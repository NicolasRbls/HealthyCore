import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "../../../constants/Colors";
import Layout from "../../../constants/Layout";
import { TextStyles } from "../../../constants/Fonts";
import Header from "../../../components/layout/Header";
import Card from "../../../components/ui/Card";
import imageMapping from "../../../constants/imageMapping";
import { useAuth } from "../../../context/AuthContext";
import { nutritionService } from "../../../services/nutrition.service";

// Type definitions
interface Tag {
  id: number;
  name: string;
}

interface FoodProduct {
  id: number;
  name: string;
  image: string;
  type: string;
  source: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  tags: Tag[];
  barcode?: string;
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = 170;

export default function NutritionDiscoverScreen() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<FoodProduct[]>([]);
  const [featuredRecipes, setFeaturedRecipes] = useState<FoodProduct[]>([]);
  const [vegetarianRecipes, setVegetarianRecipes] = useState<FoodProduct[]>([]);
  const [simpleRecipes, setSimpleRecipes] = useState<FoodProduct[]>([]);
  const [sideRecipes, setSideRecipes] = useState<FoodProduct[]>([]);
  const [allRecipes, setAllRecipes] = useState<FoodProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchRecipes();
  }, []);

  // Fetch recipes from API
  const fetchRecipes = async () => {
    setIsLoading(true);
    try {
      // Get all recipes
      const recipesResponse = await nutritionService.getAllFoods({
        type: "recette",
      });

      // Process recipes data
      if (recipesResponse && recipesResponse.foods) {
        const recipesData = (recipesResponse.foods as FoodProduct[]) || [];

        // Store all recipes
        setRecipes(recipesData);
        setAllRecipes(recipesData);

        // Set featured recipes (pick 5 random)
        const featured = [...recipesData]
          .sort(() => 0.5 - Math.random())
          .slice(0, 5);
        setFeaturedRecipes(featured);

        // Filter vegetarian recipes
        const vegetarian = recipesData.filter(
          (recipe) =>
            recipe.tags &&
            recipe.tags.some(
              (tag) =>
                tag.name.toLowerCase().includes("vegetarien") ||
                tag.name.toLowerCase().includes("veggie") ||
                tag.name.toLowerCase().includes("legume")
            )
        );
        setVegetarianRecipes(vegetarian);

        // Filter simple cooking recipes
        const simple = recipesData.filter(
          (recipe) =>
            recipe.tags &&
            recipe.tags.some(
              (tag) =>
                tag.name.toLowerCase().includes("simple") ||
                tag.name.toLowerCase().includes("rapide") ||
                tag.name.toLowerCase().includes("facile")
            )
        );
        setSimpleRecipes(simple);

        // Filter side dish recipes
        const sides = recipesData.filter(
          (recipe) =>
            recipe.tags &&
            recipe.tags.some(
              (tag) =>
                tag.name.toLowerCase().includes("accompagnement") ||
                tag.name.toLowerCase().includes("garniture")
            )
        );
        setSideRecipes(sides);
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
      Alert.alert(
        "Erreur",
        "Impossible de récupérer les recettes. Veuillez réessayer plus tard."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchRecipes();
    } finally {
      setRefreshing(false);
    }
  };

  // Get food image based on source and id
  const getFoodImage = (food: FoodProduct) => {
    // Check if the image path is an HTTP or HTTPS URL
    if (
      food.image &&
      (food.image.startsWith("http://") || food.image.startsWith("https://"))
    ) {
      return { uri: food.image };
    }

    // Map aliment IDs to the imageMapping for local images
    const mappedId = 200 + food.id;

    return (
      imageMapping[mappedId] || {
        uri: `https://placehold.co/400x300/92A3FD/FFFFFF?text=${encodeURIComponent(
          food.name
        )}`,
      }
    );
  };

  // Navigate to search products screen
  const navigateToSearch = () => {
    router.push("/user/nutrition/search-products" as any);
  };

  // Navigate to recipe detail
  const navigateToRecipeDetail = (recipeId: number) => {
    router.push(`/user/nutrition/recipes/${recipeId}` as any);
  };

  // Recipe card component
  const FoodCard = React.memo(
    ({ food, index }: { food: FoodProduct; index: number }) => (
      <TouchableOpacity
        style={styles.foodCard}
        onPress={() => navigateToRecipeDetail(food.id)}
        activeOpacity={0.8}
        key={`food-${food.id}-${index}`}
      >
        <Image
          source={getFoodImage(food)}
          style={styles.foodImage}
          resizeMode="cover"
        />

        <View style={styles.foodContent}>
          <Text style={styles.foodTitle} numberOfLines={2}>
            {food.name.split(" - ")[0]}
          </Text>
          <Text style={styles.foodCalories}>{food.calories} cal</Text>

          <View style={styles.macrosRow}>
            <Text style={styles.macroText}>P: {food.proteins}g</Text>
            <Text style={styles.macroText}>G: {food.carbs}g</Text>
            <Text style={styles.macroText}>L: {food.fats}g</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  );

  // Loading placeholder
  const PlaceholderCard = ({ index }: { index: number }) => (
    <View
      style={[styles.foodCard, styles.placeholderCard]}
      key={`placeholder-${index}`}
    >
      <View style={styles.placeholderImage} />
      <View style={styles.foodContent}>
        <View style={[styles.placeholderText, { width: "70%", height: 16 }]} />
        <View
          style={[
            styles.placeholderText,
            { width: "40%", height: 14, marginTop: 8 },
          ]}
        />
        <View
          style={[
            styles.placeholderText,
            { width: "80%", height: 12, marginTop: 8 },
          ]}
        />
      </View>
    </View>
  );

  // Empty state component
  const EmptyState = ({ message }: { message: string }) => (
    <View style={styles.emptyStateContainer}>
      <Ionicons name="nutrition-outline" size={60} color={Colors.gray.light} />
      <Text style={styles.emptyStateText}>{message}</Text>
    </View>
  );

  // Render section with food items
  const renderSection = (title: string, items: FoodProduct[]) => {
    if (isLoading) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.foodList}
            data={[1, 2, 3]}
            renderItem={({ item, index }) => <PlaceholderCard index={index} />}
            keyExtractor={(_, index) => `placeholder-${title}-${index}`}
            snapToInterval={CARD_WIDTH + Layout.spacing.md}
            decelerationRate="fast"
          />
        </View>
      );
    }

    if (items.length === 0) {
      return null; // Skip empty sections
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.foodList}
          data={items}
          renderItem={({ item, index }) => (
            <FoodCard food={item} index={index} />
          )}
          keyExtractor={(item, index) => `${title}-${item.id}-${index}`}
          snapToInterval={CARD_WIDTH + Layout.spacing.md}
          decelerationRate="fast"
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aucun élément disponible</Text>
          }
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Découvrir des recettes"
        style={{ marginTop: Layout.spacing.md }}
      />

      {/* Search Button */}
      <View style={styles.searchButtonContainer}>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={navigateToSearch}
        >
          <Ionicons name="search" size={20} color={Colors.white} />
          <Text style={styles.searchButtonText}>Rechercher un produit</Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.brandBlue[0]} />
          <Text style={styles.loadingText}>Chargement des recettes...</Text>
        </View>
      )}

      {!isLoading && (
        <>
          {recipes.length === 0 && (
            <EmptyState message="Aucune recette trouvée. Veuillez réessayer plus tard." />
          )}

          <ScrollView
            contentContainerStyle={styles.container}
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
            {/* Featured Section */}
            {renderSection("En vedette", featuredRecipes)}

            {/* Vegetarian Section */}
            {renderSection("Végétarien", vegetarianRecipes)}

            {/* Simple Cooking Section */}
            {renderSection("Cuisine simple", simpleRecipes)}

            {/* Side Dishes Section */}
            {renderSection("Accompagnements", sideRecipes)}

            {/* All Recipes Section */}
            {renderSection("Toutes les recettes", allRecipes)}

            {/* Spacer at bottom for better scrolling */}
            <View style={{ height: 100 }} />
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  searchButtonContainer: {
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.md,
    marginBottom: -Layout.spacing.md,
    marginTop: 15,
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.brandBlue[0],
    borderRadius: Layout.borderRadius.pill,
    paddingVertical: Layout.spacing.md,
    ...Layout.elevation.sm,
  },
  searchButtonText: {
    ...TextStyles.body,
    color: Colors.white,
    fontWeight: "600",
    marginLeft: Layout.spacing.sm,
  },
  container: {
    padding: Layout.spacing.lg,
    marginBottom: -50,
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
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Layout.spacing.xl,
  },
  emptyStateText: {
    ...TextStyles.body,
    color: Colors.gray.dark,
    textAlign: "center",
    marginTop: Layout.spacing.md,
  },
  section: {
    marginBottom: Layout.spacing.xl,
  },
  sectionTitle: {
    ...TextStyles.h4,
    marginBottom: Layout.spacing.md,
  },
  foodList: {
    paddingRight: Layout.spacing.lg,
  },
  foodCard: {
    width: CARD_WIDTH,
    marginRight: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.white,
    borderWidth: 0.5,
    borderColor: "rgba(0, 0, 0, 0.1)",
    shadowColor: "rgba(0, 0, 0, 0.2)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 2,
    overflow: "hidden",
  },
  foodImage: {
    width: "100%",
    height: 120,
    backgroundColor: Colors.gray.ultraLight,
  },
  foodContent: {
    padding: Layout.spacing.md,
  },
  foodTitle: {
    ...TextStyles.bodyLarge,
    fontWeight: "600",
    marginBottom: Layout.spacing.xs,
    height: 44, // Fixed height for 2 lines
  },
  foodCalories: {
    ...TextStyles.body,
    color: Colors.brandBlue[0],
    fontWeight: "600",
    marginBottom: Layout.spacing.xs,
  },
  macrosRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  macroText: {
    ...TextStyles.caption,
    color: Colors.gray.dark,
  },
  placeholderCard: {
    backgroundColor: Colors.gray.ultraLight,
  },
  placeholderImage: {
    width: "100%",
    height: 120,
    backgroundColor: Colors.gray.light,
  },
  placeholderText: {
    backgroundColor: Colors.gray.light,
    borderRadius: 4,
  },
  emptyText: {
    ...TextStyles.body,
    color: Colors.gray.dark,
    fontStyle: "italic",
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    textAlign: "center",
    width: CARD_WIDTH,
  },
});
