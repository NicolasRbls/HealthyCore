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

interface Recipe {
  id_aliment: number;
  nom: string;
  image: string;
  type: string;
  source: string;
  calories: number;
  proteines: number;
  glucides: number;
  lipides: number;
  ingredients: string;
  description: string;
  temps_preparation: number;
  tags: number[];
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
    width: "100%",
    height: 250,
  },
  recipeImage: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    padding: Layout.spacing.lg,
    paddingBottom: 100, // Extra padding for button
  },
  recipeHeader: {
    marginBottom: Layout.spacing.lg,
  },
  recipeName: {
    ...TextStyles.h3,
    marginBottom: Layout.spacing.md,
  },
  recipeMetaInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: Layout.spacing.md,
  },
  metaText: {
    ...TextStyles.bodySmall,
    color: Colors.gray.dark,
    marginLeft: 4,
  },
  metaBadge: {
    backgroundColor: Colors.brandBlue[1],
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: 2,
    borderRadius: Layout.borderRadius.pill,
  },
  metaBadgeText: {
    ...TextStyles.caption,
    color: Colors.white,
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
  instructionsCard: {
    backgroundColor: Colors.gray.ultraLight,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.lg,
  },
  instructionItem: {
    flexDirection: "row",
    marginBottom: Layout.spacing.md,
    alignItems: "flex-start",
  },
  instructionNumberContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.brandBlue[0],
    justifyContent: "center",
    alignItems: "center",
    marginRight: Layout.spacing.sm,
    marginTop: 2,
  },
  instructionNumber: {
    ...TextStyles.bodySmall,
    color: Colors.white,
    fontWeight: "bold",
  },
  instructionText: {
    ...TextStyles.body,
    flex: 1,
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

export default function RecipeDetailScreen() {
  const params = useLocalSearchParams();
  const recipeId = Number(params.id);

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [recipeTags, setRecipeTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [portions, setPortions] = useState("1");

  useEffect(() => {
    // Fetch recipe details
    fetchRecipeDetails();
  }, [recipeId]);

  const fetchRecipeDetails = () => {
    setIsLoading(true);
    try {
      // Get data from temp.json
      const foodData = tempData.aliments as Recipe[];
      const tagsData = tempData.tags as Tag[];

      // Find the recipe by ID
      const foundRecipe = foodData.find(
        (r) => r.id_aliment === recipeId && r.type === "recette"
      );

      if (foundRecipe) {
        setRecipe(foundRecipe);

        // Filter tags to only include food-related tags
        const foodTags = tagsData.filter((tag) => tag.type === "aliment");
        setAllTags(foodTags);

        // Get recipe's tags
        if (foundRecipe.tags && foundRecipe.tags.length > 0) {
          const recipeTagsData = foodTags.filter((tag) =>
            foundRecipe.tags.includes(tag.id_tag)
          );
          setRecipeTags(recipeTagsData);
        }
      }
    } catch (error) {
      console.error("Error fetching recipe details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get recipe image
  const getRecipeImage = () => {
    if (!recipe) return null;

    // Check if the image path is an HTTP or HTTPS URL
    if (
      recipe.image &&
      (recipe.image.startsWith("http://") ||
        recipe.image.startsWith("https://"))
    ) {
      return { uri: recipe.image };
    }

    // Map product IDs to the imageMapping
    const mappedId = 200 + recipe.id_aliment;

    return (
      imageMapping[mappedId] || {
        uri: `https://placehold.co/400x300/92A3FD/FFFFFF?text=${encodeURIComponent(
          recipe.nom
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

  // Format recipe instructions from string
  const formatInstructions = (description?: string) => {
    if (!description) return [];

    // Split by | character which separates steps in our data
    return description.split("|").map((step) => step.trim());
  };

  // Calculate percentage for nutrition bars
  const calculatePercentage = (value: number, total: number) => {
    return Math.min(100, (value / total) * 100);
  };

  const handleAddToTracking = () => {
    // Validate portions
    const parsedPortions = parseInt(portions);
    if (isNaN(parsedPortions) || parsedPortions <= 0) {
      Alert.alert("Erreur", "Veuillez entrer un nombre de portions valide");
      return;
    }

    // In a real app, this would call an API to add the food to user's tracking
    // For now, just show a success message
    Alert.alert(
      "Recette ajoutée",
      `${recipe?.nom} (${parsedPortions} portion${
        parsedPortions > 1 ? "s" : ""
      }) a été ajoutée à votre suivi nutritionnel.`,
      [{ text: "OK", onPress: () => setShowAddModal(false) }]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Détails de la recette"
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

  if (!recipe) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Détails de la recette"
          showBackButton
          onBackPress={() => router.back()}
          style={{ marginTop: Layout.spacing.md }}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Recette non trouvée</Text>
          <Button
            text="Retour"
            onPress={() => router.back()}
            style={styles.backButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Format ingredients and instructions
  const ingredients = formatIngredients(recipe.ingredients);
  const instructions = formatInstructions(recipe.description);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Détails de la recette"
        showBackButton
        onBackPress={() => router.back()}
        style={{ marginTop: Layout.spacing.md }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={getRecipeImage()}
            style={styles.recipeImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.contentContainer}>
          {/* Recipe Header */}
          <View style={styles.recipeHeader}>
            <Text style={styles.recipeName}>{recipe.nom}</Text>
            <View style={styles.recipeMetaInfo}>
              <View style={styles.metaItem}>
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={Colors.gray.dark}
                />
                <Text style={styles.metaText}>
                  {recipe.temps_preparation} min
                </Text>
              </View>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>1 portion</Text>
              </View>
            </View>
          </View>

          {/* Nutritional Info */}
          <View style={styles.nutritionCard}>
            <Text style={styles.sectionTitle}>
              Informations nutritionnelles
            </Text>
            <Text style={styles.perServingText}>Pour 1 portion</Text>

            <View style={styles.mainNutritionRow}>
              <View style={styles.nutritionCircle}>
                <Text style={styles.nutritionValue}>{recipe.calories}</Text>
                <Text style={styles.nutritionLabel}>Calories</Text>
              </View>
            </View>

            <View style={styles.nutritionDetails}>
              {/* Carbs */}
              <View style={styles.nutrientRow}>
                <View style={styles.nutrientLabelContainer}>
                  <Text style={styles.nutrientLabel}>Glucides</Text>
                  <Text style={styles.nutrientValue}>{recipe.glucides}g</Text>
                </View>
                <View style={styles.nutrientBarContainer}>
                  <View
                    style={[
                      styles.nutrientBar,
                      styles.carbsBar,
                      {
                        width: `${calculatePercentage(recipe.glucides, 100)}%`,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Proteins */}
              <View style={styles.nutrientRow}>
                <View style={styles.nutrientLabelContainer}>
                  <Text style={styles.nutrientLabel}>Protéines</Text>
                  <Text style={styles.nutrientValue}>{recipe.proteines}g</Text>
                </View>
                <View style={styles.nutrientBarContainer}>
                  <View
                    style={[
                      styles.nutrientBar,
                      styles.proteinsBar,
                      {
                        width: `${calculatePercentage(recipe.proteines, 50)}%`,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Fats */}
              <View style={styles.nutrientRow}>
                <View style={styles.nutrientLabelContainer}>
                  <Text style={styles.nutrientLabel}>Lipides</Text>
                  <Text style={styles.nutrientValue}>{recipe.lipides}g</Text>
                </View>
                <View style={styles.nutrientBarContainer}>
                  <View
                    style={[
                      styles.nutrientBar,
                      styles.fatsBar,
                      { width: `${calculatePercentage(recipe.lipides, 50)}%` },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Ingredients */}
          <View style={styles.ingredientsCard}>
            <Text style={styles.sectionTitle}>Ingrédients</Text>
            {ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.ingredientText}>{ingredient}</Text>
              </View>
            ))}
          </View>

          {/* Instructions */}
          <View style={styles.instructionsCard}>
            <Text style={styles.sectionTitle}>Préparation</Text>
            {instructions.map((step, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.instructionNumberContainer}>
                  <Text style={styles.instructionNumber}>{index + 1}</Text>
                </View>
                <Text style={styles.instructionText}>{step}</Text>
              </View>
            ))}
          </View>

          {/* Tags */}
          {recipeTags.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={styles.tagsTitle}>Catégories :</Text>
              <View style={styles.tagsList}>
                {recipeTags.map((tag) => (
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
              <Text style={styles.modalTitle}>Ajouter {recipe.nom}</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons
                  name="close-outline"
                  size={24}
                  color={Colors.gray.dark}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Nombre de portions</Text>
              <TextInput
                style={styles.quantityInput}
                value={portions}
                onChangeText={setPortions}
                keyboardType="numeric"
                placeholder="1"
              />

              <View style={styles.nutritionSummary}>
                <Text style={styles.summaryLabel}>
                  Calories pour {portions} portion
                  {parseInt(portions) > 1 ? "s" : ""} :
                </Text>
                <Text style={styles.summaryValue}>
                  {isNaN(parseInt(portions))
                    ? "0"
                    : Math.round(recipe.calories * parseInt(portions))}{" "}
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
