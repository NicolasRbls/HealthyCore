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
  TextInput,
  Modal,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "../../../constants/Colors";
import Layout from "../../../constants/Layout";
import { TextStyles } from "../../../constants/Fonts";
import Header from "../../../components/layout/Header";
import Card from "../../../components/ui/Card";
import imageMapping from "../../../constants/imageMapping";
import { Camera } from "expo-camera";

// Import temp data
import tempData from "../../../assets/temp.json";

// Type definitions
interface Tag {
  id_tag: number;
  nom: string;
  type: string;
}

interface FoodProduct {
  id_aliment: number;
  nom: string;
  image: string;
  type: string;
  source: string;
  calories: number;
  proteines: number;
  glucides: number;
  lipides: number;
  tags: number[];
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = 170;

export default function NutritionDiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showQRScanner, setShowQRScanner] = useState<boolean>(false);
  const [allProducts, setAllProducts] = useState<FoodProduct[]>([]);
  const [recipes, setRecipes] = useState<FoodProduct[]>([]);
  const [commercialProducts, setCommercialProducts] = useState<FoodProduct[]>(
    []
  );
  const [featuredItems, setFeaturedItems] = useState<FoodProduct[]>([]);
  const [categorizedItems, setCategorizedItems] = useState<{
    [key: string]: FoodProduct[];
  }>({});
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // In a real app, you would fetch this data with:
    // GET /api/nutrition/discover
    fetchNutritionData();
  }, []);

  const fetchNutritionData = () => {
    setIsLoading(true);
    try {
      // Get data from temp.json
      const foodData = tempData.aliments as FoodProduct[];
      const tagsData = tempData.tags as Tag[];

      // Filter food tags
      const foodTags = tagsData.filter((tag) => tag.type === "aliment");
      setAllTags(foodTags);

      // Process food data
      setAllProducts(foodData);

      // Filter recipes and products
      const recipesData = foodData.filter((item) => item.type === "recette");
      const productsData = foodData.filter((item) => item.type === "produit");

      setRecipes(recipesData);
      setCommercialProducts(productsData);

      // Set featured items (could be random, recent, or most popular)
      setFeaturedItems(foodData.slice(0, 5));

      // Categorize by tags
      const categories: { [key: string]: FoodProduct[] } = {};

      // Get main categories from tags
      const mainCategories = [
        "chocolat",
        "snack",
        "végétarien",
        "pâtes",
        "riz",
      ];

      mainCategories.forEach((category) => {
        const tagId = foodTags.find((tag) => tag.nom === category)?.id_tag;
        if (tagId) {
          // Find all foods with this tag
          const foodsInCategory = foodData.filter((food) =>
            foodData
              .find((f) => f.id_aliment === food.id_aliment)
              ?.tags?.includes(tagId)
          );

          if (foodsInCategory.length > 0) {
            categories[category] = foodsInCategory;
          }
        }
      });

      setCategorizedItems(categories);
    } catch (error) {
      console.error("Error fetching nutrition data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchNutritionData();
    } finally {
      setRefreshing(false);
    }
  };

  // Get food image based on id
  const getFoodImage = (food: FoodProduct) => {
    // Map aliment IDs to the imageMapping
    const mappedId = 200 + food.id_aliment;

    return (
      imageMapping[mappedId] || {
        uri: `https://placehold.co/400x300/92A3FD/FFFFFF?text=${encodeURIComponent(
          food.nom
        )}`,
      }
    );
  };

  // Handle search
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    // Actual search implementation would be here
  };

  // Navigate to food detail
  const navigateToFoodDetail = (foodId: number, type: string) => {
    if (type === "recette") {
      router.push(`/user/nutrition/recipes/${foodId}` as any);
    } else {
      router.push(`/user/nutrition/products/${foodId}` as any);
    }
  };

  // Food card component
  const FoodCard = ({ food }: { food: FoodProduct }) => (
    <TouchableOpacity
      style={styles.foodCard}
      onPress={() => navigateToFoodDetail(food.id_aliment, food.type)}
      activeOpacity={0.8}
    >
      <Image
        source={getFoodImage(food)}
        style={styles.foodImage}
        resizeMode="cover"
      />

      <View style={styles.foodContent}>
        <Text style={styles.foodTitle} numberOfLines={2}>
          {food.nom.split(" - ")[0]}
        </Text>
        <Text style={styles.foodCalories}>{food.calories} cal</Text>

        <View style={styles.macrosRow}>
          <Text style={styles.macroText}>P: {food.proteines}g</Text>
          <Text style={styles.macroText}>G: {food.glucides}g</Text>
          <Text style={styles.macroText}>L: {food.lipides}g</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // QR Scanner Modal
  const QRScannerModal = () => (
    <Modal
      visible={showQRScanner}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowQRScanner(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Scanner un code-barres</Text>
            <TouchableOpacity onPress={() => setShowQRScanner(false)}>
              <Ionicons name="close" size={24} color={Colors.gray.dark} />
            </TouchableOpacity>
          </View>

          <View style={styles.scannerArea}>
            <View style={styles.scannerPlaceholder}>
              <Ionicons
                name="scan-outline"
                size={120}
                color={Colors.gray.light}
              />
              <Text style={styles.scannerText}>
                Cadrez le code-barres dans la zone de scan
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowQRScanner(false)}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Loading placeholder
  const PlaceholderCard = () => (
    <View style={[styles.foodCard, styles.placeholderCard]}>
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Nutrition" style={{ marginTop: Layout.spacing.md }} />

      {/* Search Bar and QR Scanner Button */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.gray.medium} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un aliment..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor={Colors.gray.medium}
          />
        </View>
        <TouchableOpacity
          style={styles.qrButton}
          onPress={() => setShowQRScanner(true)}
        >
          <Ionicons name="barcode-outline" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>En vedette</Text>

          {isLoading ? (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.foodList}
              data={[1, 2, 3]}
              renderItem={() => <PlaceholderCard />}
              keyExtractor={(_, index) => `placeholder-featured-${index}`}
              snapToInterval={CARD_WIDTH + Layout.spacing.md}
              decelerationRate="fast"
            />
          ) : (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.foodList}
              data={featuredItems}
              renderItem={({ item }) => <FoodCard food={item} />}
              keyExtractor={(item) => `featured-${item.id_aliment}`}
              snapToInterval={CARD_WIDTH + Layout.spacing.md}
              decelerationRate="fast"
              ListEmptyComponent={
                <Text style={styles.emptyText}>Aucun aliment en vedette</Text>
              }
            />
          )}
        </View>

        {/* Recipes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recettes</Text>

          {isLoading ? (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.foodList}
              data={[1, 2]}
              renderItem={() => <PlaceholderCard />}
              keyExtractor={(_, index) => `placeholder-recipe-${index}`}
              snapToInterval={CARD_WIDTH + Layout.spacing.md}
              decelerationRate="fast"
            />
          ) : (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.foodList}
              data={recipes}
              renderItem={({ item }) => <FoodCard food={item} />}
              keyExtractor={(item) => `recipe-${item.id_aliment}`}
              snapToInterval={CARD_WIDTH + Layout.spacing.md}
              decelerationRate="fast"
              ListEmptyComponent={
                <Text style={styles.emptyText}>Aucune recette disponible</Text>
              }
            />
          )}
        </View>

        {/* Products Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Produits</Text>

          {isLoading ? (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.foodList}
              data={[1, 2]}
              renderItem={() => <PlaceholderCard />}
              keyExtractor={(_, index) => `placeholder-product-${index}`}
              snapToInterval={CARD_WIDTH + Layout.spacing.md}
              decelerationRate="fast"
            />
          ) : (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.foodList}
              data={commercialProducts}
              renderItem={({ item }) => <FoodCard food={item} />}
              keyExtractor={(item) => `product-${item.id_aliment}`}
              snapToInterval={CARD_WIDTH + Layout.spacing.md}
              decelerationRate="fast"
              ListEmptyComponent={
                <Text style={styles.emptyText}>Aucun produit disponible</Text>
              }
            />
          )}
        </View>

        {/* Category-based sections */}
        {!isLoading &&
          Object.entries(categorizedItems).map(([category, items]) => (
            <View key={`category-${category}`} style={styles.section}>
              <Text style={styles.sectionTitle}>
                {category.charAt(0).toUpperCase() +
                  category.slice(1).replace(/-/g, " ")}
              </Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.foodList}
                data={items}
                renderItem={({ item }) => <FoodCard food={item} />}
                keyExtractor={(item) => `${category}-${item.id_aliment}`}
                snapToInterval={CARD_WIDTH + Layout.spacing.md}
                decelerationRate="fast"
                ListEmptyComponent={
                  <Text style={styles.emptyText}>Aucun élément disponible</Text>
                }
              />
            </View>
          ))}
      </ScrollView>

      {/* QR Code Scanner Modal */}
      <QRScannerModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.gray.ultraLight,
    borderRadius: Layout.borderRadius.pill,
    paddingHorizontal: Layout.spacing.md,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: Layout.spacing.sm,
    ...TextStyles.body,
    color: Colors.black,
  },
  qrButton: {
    marginLeft: Layout.spacing.md,
    backgroundColor: Colors.brandBlue[0],
    borderRadius: Layout.borderRadius.pill,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    ...Layout.elevation.sm,
  },
  container: {
    padding: Layout.spacing.lg,
    paddingBottom: 100, // Extra padding at bottom for the tab bar
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Layout.borderRadius.lg,
    borderTopRightRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
    height: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Layout.spacing.md,
  },
  modalTitle: {
    ...TextStyles.h4,
  },
  scannerArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.gray.ultraLight,
    borderRadius: Layout.borderRadius.md,
    marginVertical: Layout.spacing.xl,
  },
  scannerPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    padding: Layout.spacing.lg,
  },
  scannerText: {
    ...TextStyles.body,
    color: Colors.gray.dark,
    textAlign: "center",
    marginTop: Layout.spacing.md,
  },
  cancelButton: {
    paddingVertical: Layout.spacing.md,
    alignItems: "center",
    backgroundColor: Colors.gray.ultraLight,
    borderRadius: Layout.borderRadius.pill,
    marginTop: Layout.spacing.lg,
  },
  cancelButtonText: {
    ...TextStyles.body,
    color: Colors.gray.dark,
    fontWeight: "600",
  },
});
