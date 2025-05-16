import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../../../constants/Colors";
import Layout from "../../../../constants/Layout";
import { TextStyles } from "../../../../constants/Fonts";
import Header from "../../../../components/layout/Header";
import Button from "../../../../components/ui/Button";
import imageMapping from "../../../../constants/imageMapping";

// Import temp data
import tempData from "../../../../assets/temp.json";

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
  code_barres?: string;
  ingredients?: string;
  tags: number[];
}

export default function ProductDetailScreen() {
  const params = useLocalSearchParams();
  const productId = Number(params.id);

  const [product, setProduct] = useState<FoodProduct | null>(null);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [productTags, setProductTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [quantity, setQuantity] = useState("100");

  useEffect(() => {
    // Fetch product details
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = () => {
    setIsLoading(true);
    try {
      // Get data from temp.json
      const foodData = tempData.aliments as FoodProduct[];
      const tagsData = tempData.tags as Tag[];

      // Find the product by ID
      const foundProduct = foodData.find((p) => p.id_aliment === productId);

      if (foundProduct) {
        setProduct(foundProduct);

        // Filter tags to only include food-related tags
        const foodTags = tagsData.filter((tag) => tag.type === "aliment");
        setAllTags(foodTags);

        // Get product's tags
        if (foundProduct.tags && foundProduct.tags.length > 0) {
          const productTagsData = foodTags.filter((tag) =>
            foundProduct.tags.includes(tag.id_tag)
          );
          setProductTags(productTagsData);
        }
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get product image
  const getProductImage = () => {
    if (!product) return null;

    // Check if the image path is an HTTP or HTTPS URL
    if (
      product.image &&
      (product.image.startsWith("http://") ||
        product.image.startsWith("https://"))
    ) {
      return { uri: product.image };
    }

    // Map product IDs to the imageMapping
    const mappedId = 200 + product.id_aliment;

    return (
      imageMapping[mappedId] || {
        uri: `https://placehold.co/400x300/92A3FD/FFFFFF?text=${encodeURIComponent(
          product.nom
        )}`,
      }
    );
  };

  // Format ingredients list from string
  const formatIngredients = (ingredientsStr?: string) => {
    if (!ingredientsStr) return [];

    // Split by | character which separates ingredients in our data
    return ingredientsStr.split("|").map((ingredient) => ingredient.trim());
  };

  // Calculate percentage for nutrition bars
  const calculatePercentage = (value: number, total: number) => {
    return Math.min(100, (value / total) * 100);
  };

  const handleAddToTracking = () => {
    // Validate quantity
    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      Alert.alert("Erreur", "Veuillez entrer une quantité valide");
      return;
    }

    // In a real app, this would call an API to add the food to user's tracking
    // For now, just show a success message
    Alert.alert(
      "Aliment ajouté",
      `${product?.nom} (${parsedQuantity}g) a été ajouté à votre suivi nutritionnel.`,
      [{ text: "OK", onPress: () => setShowAddModal(false) }]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Détails du produit"
          showBackButton
          onBackPress={() => router.back()}
          style={{ marginTop: Layout.spacing.md }}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Détails du produit"
          showBackButton
          onBackPress={() => router.back()}
          style={{ marginTop: Layout.spacing.md }}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Produit non trouvé</Text>
          <Button
            text="Retour"
            onPress={() => router.back()}
            style={styles.backButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Product name parts (usually in format "Name - Brand - Weight")
  const nameParts = product.nom.split(" - ");
  const productName = nameParts[0];
  const productBrand = nameParts.length > 1 ? nameParts[1] : "";
  const productWeight = nameParts.length > 2 ? nameParts[2] : "";

  // Format ingredients list
  const ingredients = formatIngredients(product.ingredients);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Détails du produit"
        showBackButton
        onBackPress={() => router.back()}
        style={{ marginTop: Layout.spacing.md }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={getProductImage()}
            style={styles.productImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.contentContainer}>
          {/* Product Header */}
          <View style={styles.productHeader}>
            <Text style={styles.productName}>{productName}</Text>
            {productBrand && (
              <Text style={styles.productBrand}>{productBrand}</Text>
            )}
            {productWeight && (
              <Text style={styles.productWeight}>{productWeight}</Text>
            )}
          </View>

          {/* Nutritional Info */}
          <View style={styles.nutritionCard}>
            <Text style={styles.sectionTitle}>
              Informations nutritionnelles
            </Text>
            <Text style={styles.perServingText}>Pour 100g</Text>

            <View style={styles.mainNutritionRow}>
              <View style={styles.nutritionCircle}>
                <Text style={styles.nutritionValue}>{product.calories}</Text>
                <Text style={styles.nutritionLabel}>Calories</Text>
              </View>
            </View>

            <View style={styles.nutritionDetails}>
              {/* Carbs */}
              <View style={styles.nutrientRow}>
                <View style={styles.nutrientLabelContainer}>
                  <Text style={styles.nutrientLabel}>Glucides</Text>
                  <Text style={styles.nutrientValue}>{product.glucides}g</Text>
                </View>
                <View style={styles.nutrientBarContainer}>
                  <View
                    style={[
                      styles.nutrientBar,
                      styles.carbsBar,
                      {
                        width: `${calculatePercentage(product.glucides, 100)}%`,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Proteins */}
              <View style={styles.nutrientRow}>
                <View style={styles.nutrientLabelContainer}>
                  <Text style={styles.nutrientLabel}>Protéines</Text>
                  <Text style={styles.nutrientValue}>{product.proteines}g</Text>
                </View>
                <View style={styles.nutrientBarContainer}>
                  <View
                    style={[
                      styles.nutrientBar,
                      styles.proteinsBar,
                      {
                        width: `${calculatePercentage(product.proteines, 50)}%`,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Fats */}
              <View style={styles.nutrientRow}>
                <View style={styles.nutrientLabelContainer}>
                  <Text style={styles.nutrientLabel}>Lipides</Text>
                  <Text style={styles.nutrientValue}>{product.lipides}g</Text>
                </View>
                <View style={styles.nutrientBarContainer}>
                  <View
                    style={[
                      styles.nutrientBar,
                      styles.fatsBar,
                      { width: `${calculatePercentage(product.lipides, 50)}%` },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Ingredients */}
          {ingredients.length > 0 && (
            <View style={styles.ingredientsCard}>
              <Text style={styles.sectionTitle}>Ingrédients</Text>
              {ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.ingredientText}>{ingredient}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Barcode */}
          {product.code_barres && (
            <View style={styles.barcodeContainer}>
              <Ionicons
                name="barcode-outline"
                size={20}
                color={Colors.gray.dark}
              />
              <Text style={styles.barcodeText}>{product.code_barres}</Text>
            </View>
          )}

          {/* Tags */}
          {productTags.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={styles.tagsTitle}>Catégories :</Text>
              <View style={styles.tagsList}>
                {productTags.map((tag) => (
                  <View key={tag.id_tag} style={styles.tagChip}>
                    <Text style={styles.tagText}>
                      {tag.nom.charAt(0).toUpperCase() +
                        tag.nom.slice(1).replace(/-/g, " ")}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add to Tracking Button */}
      <View style={styles.addButtonContainer}>
        <Button
          text="Ajouter au suivi"
          onPress={() => setShowAddModal(true)}
          fullWidth
          style={styles.addButton}
        />
      </View>

      {/* Add to Tracking Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ajouter {productName}</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons
                  name="close-outline"
                  size={24}
                  color={Colors.gray.dark}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Quantité (g)</Text>
              <TextInput
                style={styles.quantityInput}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                placeholder="100"
              />

              <View style={styles.nutritionSummary}>
                <Text style={styles.summaryLabel}>
                  Calories pour {quantity}g :
                </Text>
                <Text style={styles.summaryValue}>
                  {isNaN(parseInt(quantity))
                    ? "0"
                    : Math.round(
                        (product.calories * parseInt(quantity)) / 100
                      )}{" "}
                  cal
                </Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <Button
                text="Annuler"
                variant="outline"
                onPress={() => setShowAddModal(false)}
                style={styles.modalButton}
              />
              <Button
                text="Ajouter"
                onPress={handleAddToTracking}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Layout.spacing.lg,
  },
  errorText: {
    ...TextStyles.bodyLarge,
    color: Colors.error,
    marginBottom: Layout.spacing.lg,
  },
  backButton: {
    marginTop: Layout.spacing.md,
  },
  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.gray.ultraLight,
    height: 250,
    padding: Layout.spacing.lg,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    padding: Layout.spacing.lg,
    paddingBottom: 100, // Extra padding for button
  },
  productHeader: {
    marginBottom: Layout.spacing.lg,
  },
  productName: {
    ...TextStyles.h3,
    marginBottom: Layout.spacing.xs,
  },
  productBrand: {
    ...TextStyles.bodyLarge,
    color: Colors.brandBlue[0],
    marginBottom: Layout.spacing.xs,
  },
  productWeight: {
    ...TextStyles.body,
    color: Colors.gray.dark,
  },
  nutritionCard: {
    backgroundColor: Colors.gray.ultraLight,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.lg,
  },
  sectionTitle: {
    ...TextStyles.bodyLarge,
    fontWeight: "600",
    marginBottom: Layout.spacing.md,
  },
  perServingText: {
    ...TextStyles.caption,
    color: Colors.gray.dark,
    marginBottom: Layout.spacing.md,
  },
  mainNutritionRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: Layout.spacing.lg,
  },
  nutritionCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.brandBlue[0],
    justifyContent: "center",
    alignItems: "center",
    padding: Layout.spacing.sm,
  },
  nutritionValue: {
    ...TextStyles.h3,
    color: Colors.white,
    fontWeight: "bold",
  },
  nutritionLabel: {
    ...TextStyles.caption,
    color: Colors.white,
  },
  nutritionDetails: {
    marginTop: Layout.spacing.md,
  },
  nutrientRow: {
    marginBottom: Layout.spacing.md,
  },
  nutrientLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Layout.spacing.xs,
  },
  nutrientLabel: {
    ...TextStyles.body,
    color: Colors.gray.dark,
  },
  nutrientValue: {
    ...TextStyles.body,
    fontWeight: "600",
  },
  nutrientBarContainer: {
    height: 8,
    backgroundColor: Colors.gray.light,
    borderRadius: Layout.borderRadius.pill,
    overflow: "hidden",
  },
  nutrientBar: {
    height: "100%",
    borderRadius: Layout.borderRadius.pill,
  },
  carbsBar: {
    backgroundColor: Colors.secondary[0],
  },
  proteinsBar: {
    backgroundColor: Colors.brandBlue[0],
  },
  fatsBar: {
    backgroundColor: Colors.plan.cardio.primary,
  },
  ingredientsCard: {
    backgroundColor: Colors.gray.ultraLight,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.lg,
  },
  ingredientItem: {
    flexDirection: "row",
    marginBottom: Layout.spacing.sm,
    alignItems: "flex-start",
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.brandBlue[0],
    marginTop: 8,
    marginRight: Layout.spacing.sm,
  },
  ingredientText: {
    ...TextStyles.body,
    flex: 1,
  },
  barcodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Layout.spacing.lg,
  },
  barcodeText: {
    ...TextStyles.body,
    color: Colors.gray.dark,
    marginLeft: Layout.spacing.sm,
  },
  tagsContainer: {
    marginBottom: Layout.spacing.xl,
  },
  tagsTitle: {
    ...TextStyles.body,
    fontWeight: "600",
    marginBottom: Layout.spacing.sm,
  },
  tagsList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tagChip: {
    backgroundColor: Colors.gray.ultraLight,
    borderRadius: Layout.borderRadius.pill,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.xs,
    marginRight: Layout.spacing.sm,
    marginBottom: Layout.spacing.sm,
  },
  tagText: {
    ...TextStyles.caption,
    color: Colors.brandBlue[0],
  },
  addButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    padding: Layout.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.gray.ultraLight,
  },
  addButton: {
    width: "100%",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Layout.borderRadius.lg,
    borderTopRightRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Layout.spacing.lg,
  },
  modalTitle: {
    ...TextStyles.h4,
  },
  modalBody: {
    marginBottom: Layout.spacing.lg,
  },
  modalLabel: {
    ...TextStyles.body,
    fontWeight: "600",
    marginBottom: Layout.spacing.sm,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: Colors.gray.light,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    fontSize: 16,
    marginBottom: Layout.spacing.md,
  },
  nutritionSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.gray.ultraLight,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
  },
  summaryLabel: {
    ...TextStyles.body,
    color: Colors.gray.dark,
  },
  summaryValue: {
    ...TextStyles.bodyLarge,
    fontWeight: "600",
    color: Colors.brandBlue[0],
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 50,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: Layout.spacing.xs,
  },
});
