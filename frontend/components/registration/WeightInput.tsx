import React, { useRef } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import Layout from "../../constants/Layout";
import { TextStyles } from "../../constants/Fonts";

interface WeightInputProps {
  currentWeight: string;
  targetWeight: string;
  onChangeTargetWeight: (text: string) => void;
  estimatedWeeks?: number;
  weeklyChange?: number;
  tdee?: number;
  dailyCalories?: number;
  caloricAdjustment?: number;
  isValid?: boolean;
  orientation?: "loss" | "gain" | "maintain";
}

const WeightInput: React.FC<WeightInputProps> = ({
  currentWeight,
  targetWeight,
  onChangeTargetWeight,
  estimatedWeeks = 0,
  weeklyChange = 0,
  tdee = 0,
  dailyCalories = 0,
  caloricAdjustment = 0,
  isValid = true,
  orientation = "maintain",
}) => {
  // Retourne la même couleur pour la flèche indépendamment de l'orientation
  const getOrientationColor = () => {
    return Colors.brandBlue[0]; // Toujours bleu principal
  };

  // Détermine l'icône en fonction de l'orientation
  const getOrientationIcon = () => {
    switch (orientation) {
      case "loss":
        return "arrow-down";
      case "gain":
        return "arrow-up";
      case "maintain":
      default:
        return "arrow-forward";
    }
  };

  // Formater les nombres pour l'affichage
  const formatNumber = (value: number | undefined): string => {
    if (value === undefined || isNaN(value)) return "-";
    return Math.round(value).toString();
  };

  return (
    <View style={styles.container}>
      {/* Section d'entrée de poids simplifiée */}
      <View style={styles.inputContainer}>
        {/* Poids actuel */}
        <View style={styles.weightDisplay}>
          <Text style={styles.weightLabel}>Poids actuel</Text>
          <Text style={styles.weightText}>{currentWeight}</Text>
          <Text style={styles.unitText}>kg</Text>
        </View>

        {/* Flèche */}
        <View style={styles.arrowContainer}>
          <Ionicons
            name={getOrientationIcon() as any}
            size={24}
            color={getOrientationColor()}
          />
        </View>

        {/* Poids cible (éditable) */}
        <View style={styles.targetInputContainer}>
          <Text style={styles.weightLabel}>Poids cible</Text>
          <TextInput
            style={styles.targetInputText}
            value={targetWeight}
            onChangeText={onChangeTargetWeight}
            keyboardType="numeric"
            maxLength={5}
            placeholder="0"
            placeholderTextColor={Colors.gray.medium}
            returnKeyType="done"
            blurOnSubmit={false}
          />
          <Text style={styles.unitText}>kg</Text>
        </View>
      </View>

      {/* Estimation - toujours afficher, avec valeurs par défaut si nécessaire */}
      <View style={styles.estimationContainer}>
        {orientation === "maintain" ? (
          <Text style={styles.estimationText}>Maintien du poids actuel</Text>
        ) : (
          <Text style={styles.estimationText}>
            {estimatedWeeks || "-"} semaines (
            {orientation === "loss" ? "-" : "+"}
            {weeklyChange ? Math.abs(weeklyChange).toFixed(1) : "0"} kg par
            semaine)
          </Text>
        )}
      </View>

      {/* Détails nutritionnels - toujours afficher avec valeurs par défaut */}
      <View style={styles.nutritionContainer}>
        <Text style={styles.nutritionTitle}>Votre plan nutritionnel</Text>

        <View style={styles.nutritionRow}>
          <Text style={styles.nutritionLabel}>Calories normales:</Text>
          <Text style={styles.nutritionValue}>
            {formatNumber(tdee)} kcal/jour
          </Text>
        </View>

        <View style={styles.nutritionRow}>
          <Text style={styles.nutritionLabel}>Calories recommandées:</Text>
          <Text style={styles.nutritionValue}>
            {formatNumber(dailyCalories)} kcal/jour
          </Text>
        </View>

        {orientation !== "maintain" && (
          <View style={styles.nutritionRow}>
            <Text style={styles.nutritionLabel}>
              {orientation === "loss" ? "Déficit" : "Surplus"} calorique:
            </Text>
            <Text style={styles.nutritionValue}>
              {caloricAdjustment
                ? Math.abs(Math.round(caloricAdjustment))
                : "-"}{" "}
              kcal/jour
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: Layout.spacing.md,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
  },
  weightDisplay: {
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
  },
  weightLabel: {
    ...TextStyles.caption,
    color: Colors.gray.dark,
    marginBottom: 4,
  },
  weightText: {
    fontSize: 24,
    color: Colors.gray.dark,
    fontWeight: "500",
  },
  unitText: {
    fontSize: 16,
    color: Colors.gray.dark,
    marginTop: 2,
  },
  arrowContainer: {
    marginHorizontal: Layout.spacing.md,
    alignItems: "center",
    width: 40,
    justifyContent: "center",
  },
  targetInputContainer: {
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
  },
  targetInputText: {
    fontSize: 24,
    color: Colors.black,
    fontWeight: "600",
    textAlign: "center",
    minWidth: 70,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.brandBlue[0],
    paddingBottom: 2,
  },
  estimationContainer: {
    marginVertical: Layout.spacing.xs,
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
    backgroundColor: Colors.gray.ultraLight,
    borderRadius: Layout.borderRadius.sm,
    alignItems: "center",
  },
  estimationText: {
    ...TextStyles.body,
    fontWeight: "500",
    color: Colors.gray.dark,
  },
  nutritionContainer: {
    marginTop: Layout.spacing.md,
    padding: Layout.spacing.md,
    backgroundColor: Colors.gray.ultraLight,
    borderRadius: Layout.borderRadius.md,
    width: "100%",
  },
  nutritionTitle: {
    ...TextStyles.bodyLarge,
    fontWeight: "600",
    color: Colors.brandBlue[0],
    marginBottom: Layout.spacing.sm,
  },
  nutritionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Layout.spacing.xs,
  },
  nutritionLabel: {
    ...TextStyles.body,
    color: Colors.gray.dark,
  },
  nutritionValue: {
    ...TextStyles.body,
    fontWeight: "600",
    color: Colors.black,
  },
});

export default WeightInput;
