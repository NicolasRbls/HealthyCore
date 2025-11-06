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
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../../../constants/Colors";
import Layout from "../../../../constants/Layout";
import { TextStyles } from "../../../../constants/Fonts";
import Header from "../../../../components/layout/Header";
import Button from "../../../../components/ui/Button";
import imageMapping from "../../../../constants/imageMapping";
import { useAuth } from "../../../../context/AuthContext";
import { nutritionService } from "../../../../services/nutrition.service";

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
  barcode?: string;
  ingredients?: string;
  description?: string;
  tags: Tag[];
}

export default function ProductDetailScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const productId = Number(params.id);

  const [product, setProduct] = useState<FoodProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<string>("100");
  const [selectedMeal, setSelectedMeal] = useState<string>("dejeuner");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    setIsLoading(true);
    try {
      const product = await nutritionService.getFoodById(productId);

      if (product) {
        setProduct(product);
      } else {
        Alert.alert(
          "Erreur",
          "Impossible de récupérer les détails du produit."
        );
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      Alert.alert(
        "Erreur",
        "Une erreur s'est produite lors de la récupération des détails du produit. Veuillez réessayer plus tard."
      );
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
    const mappedId = 200 + product.id;

    return (
      imageMapping[mappedId] || {
        uri: `https://placehold.co/400x300/92A3FD/FFFFFF?text=${encodeURIComponent(
          product.name
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

  const handleAddToTracking = async () => {
    // Validate quantity
    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      Alert.alert("Erreur", "Veuillez entrer une quantité valide");
      return;
    }

    setIsSubmitting(true);
    try {
      await nutritionService.logNutrition(
        product?.id as number,
        parsedQuantity,
        selectedMeal
      );

      // Fermer la modale
      setShowAddModal(false);

      // Afficher un message de succès
      Alert.alert(
        "Aliment ajouté",
        `${
          product?.name.split(" - ")[0]
        } (${parsedQuantity}g) a été ajouté à votre suivi nutritionnel.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error adding to tracking:", error);
      Alert.alert(
        "Erreur",
        "Impossible d'ajouter cet aliment à votre suivi. Veuillez réessayer plus tard."
      );
    } finally {
      setIsSubmitting(false);
    }
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
          <ActivityIndicator size="large" color={Colors.brandBlue[0]} />
          <Text style={styles.loadingText}>Chargement des détails...</Text>
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
  const nameParts = product.name.split(" - ");
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
                  <Text style={styles.nutrientValue}>{product.carbs}g</Text>
                </View>
                <View style={styles.nutrientBarContainer}>
                  <View
                    style={[
                      styles.nutrientBar,
                      styles.carbsBar,
                      {
                        width: `${calculatePercentage(product.carbs, 100)}%`,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Proteins */}
              <View style={styles.nutrientRow}>
                <View style={styles.nutrientLabelContainer}>
                  <Text style={styles.nutrientLabel}>Protéines</Text>
                  <Text style={styles.nutrientValue}>{product.proteins}g</Text>
                </View>
                <View style={styles.nutrientBarContainer}>
                  <View
                    style={[
                      styles.nutrientBar,
                      styles.proteinsBar,
                      {
                        width: `${calculatePercentage(product.proteins, 50)}%`,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Fats */}
              <View style={styles.nutrientRow}>
                <View style={styles.nutrientLabelContainer}>
                  <Text style={styles.nutrientLabel}>Lipides</Text>
                  <Text style={styles.nutrientValue}>{product.fats}g</Text>
                </View>
                <View style={styles.nutrientBarContainer}>
                  <View
                    style={[
                      styles.nutrientBar,
                      styles.fatsBar,
                      { width: `${calculatePercentage(product.fats, 50)}%` },
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
          {product.barcode && (
            <View style={styles.barcodeContainer}>
              <Ionicons
                name="barcode-outline"
                size={20}
                color={Colors.gray.dark}
              />
              <Text style={styles.barcodeText}>{product.barcode}</Text>
            </View>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={styles.tagsTitle}>Catégories :</Text>
              <View style={styles.tagsList}>
                {product.tags.map((tag) => (
                  <View key={tag.id} style={styles.tagChip}>
                    <Text style={styles.tagText}>
                      {tag.name.charAt(0).toUpperCase() +
                        tag.name.slice(1).replace(/-/g, " ")}
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

              <Text style={styles.modalLabel}>Repas</Text>
              <View style={styles.mealSelector}>
                <TouchableOpacity
                  style={[
                    styles.mealOption,
                    selectedMeal === "petit-dejeuner" &&
                      styles.selectedMealOption,
                  ]}
                  onPress={() => setSelectedMeal("petit-dejeuner")}
                >
                  <Ionicons
                    name="sunny-outline"
                    size={20}
                    color={
                      selectedMeal === "petit-dejeuner"
                        ? Colors.white
                        : Colors.gray.dark
                    }
                  />
                  <Text
                    style={[
                      styles.mealOptionText,
                      selectedMeal === "petit-dejeuner" &&
                        styles.selectedMealOptionText,
                    ]}
                  >
                    Petit-déj.
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.mealOption,
                    selectedMeal === "dejeuner" && styles.selectedMealOption,
                  ]}
                  onPress={() => setSelectedMeal("dejeuner")}
                >
                  <Ionicons
                    name="restaurant-outline"
                    size={20}
                    color={
                      selectedMeal === "dejeuner"
                        ? Colors.white
                        : Colors.gray.dark
                    }
                  />
                  <Text
                    style={[
                      styles.mealOptionText,
                      selectedMeal === "dejeuner" &&
                        styles.selectedMealOptionText,
                    ]}
                  >
                    Déjeuner
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.mealOption,
                    selectedMeal === "collation" && styles.selectedMealOption,
                  ]}
                  onPress={() => setSelectedMeal("collation")}
                >
                  <Ionicons
                    name="cafe-outline"
                    size={20}
                    color={
                      selectedMeal === "collation"
                        ? Colors.white
                        : Colors.gray.dark
                    }
                  />
                  <Text
                    style={[
                      styles.mealOptionText,
                      selectedMeal === "collation" &&
                        styles.selectedMealOptionText,
                    ]}
                  >
                    Collation
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.mealOption,
                    selectedMeal === "diner" && styles.selectedMealOption,
                  ]}
                  onPress={() => setSelectedMeal("diner")}
                >
                  <Ionicons
                    name="moon-outline"
                    size={20}
                    color={
                      selectedMeal === "diner" ? Colors.white : Colors.gray.dark
                    }
                  />
                  <Text
                    style={[
                      styles.mealOptionText,
                      selectedMeal === "diner" && styles.selectedMealOptionText,
                    ]}
                  >
                    Dîner
                  </Text>
                </TouchableOpacity>
              </View>

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
                disabled={isSubmitting}
              />
              <Button
                text={isSubmitting ? "Ajout en cours..." : "Ajouter"}
                onPress={handleAddToTracking}
                style={styles.modalButton}
                disabled={isSubmitting}
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
    marginTop: Layout.spacing.md,
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
  mealSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Layout.spacing.md,
  },
  mealOption: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.gray.light,
    width: "23%",
  },
  selectedMealOption: {
    backgroundColor: Colors.brandBlue[0],
    borderColor: Colors.brandBlue[0],
  },
  mealOptionText: {
    ...TextStyles.caption,
    color: Colors.gray.dark,
    marginTop: 4,
  },
  selectedMealOptionText: {
    color: Colors.white,
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
