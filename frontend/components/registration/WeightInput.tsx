import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import Layout from "../../constants/Layout";
import { TextStyles } from "../../constants/Fonts";
import NumericInput from "../ui/NumericInput";

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
  estimatedWeeks,
  weeklyChange,
  tdee,
  dailyCalories,
  caloricAdjustment,
  isValid = true,
  orientation = "maintain",
}) => {
  // Animation pour la flèche de changement
  const arrowScaleAnim = React.useRef(new Animated.Value(1)).current;
  const arrowOpacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Animation lorsque les valeurs changent
    Animated.parallel([
      Animated.timing(arrowScaleAnim, {
        toValue: 1.2,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(arrowOpacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.timing(arrowScaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }, [targetWeight, currentWeight]);

  // Détermine la couleur et l'icône en fonction de l'orientation
  const getOrientationColor = () => {
    switch (orientation) {
      case "loss":
        return Colors.plan.cardio.primary;
      case "gain":
        return Colors.plan.muscle.primary;
      case "maintain":
      default:
        return Colors.plan.durable.primary;
    }
  };

  const getOrientationIcon = () => {
    switch (orientation) {
      case "loss":
        return "arrow-down";
      case "gain":
        return "arrow-up";
      case "maintain":
      default:
        return "remove";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {/* Poids actuel (non éditable) */}
        <View style={styles.weightDisplay}>
          <Text style={styles.weightText}>{currentWeight}</Text>
          <Text style={styles.unitText}>kg</Text>
        </View>

        {/* Flèche animée */}
        <Animated.View
          style={[
            styles.arrowContainer,
            {
              transform: [{ scale: arrowScaleAnim }],
              opacity: arrowOpacityAnim,
            },
          ]}
        >
          <Ionicons
            name={getOrientationIcon() as any}
            size={32}
            color={getOrientationColor()}
          />
        </Animated.View>

        {/* Poids cible (éditable) */}
        <View style={styles.targetInputContainer}>
          <NumericInput
            value={targetWeight}
            onChangeText={onChangeTargetWeight}
            min={1}
            max={500}
            precision={1}
            placeholderTextColor={Colors.gray.medium}
            style={styles.targetInput}
            inputStyle={styles.targetInputText}
            containerStyle={styles.numericInputContainer}
          />
        </View>
      </View>

      {/* Estimation */}
      {(estimatedWeeks !== undefined || weeklyChange !== undefined) && (
        <View
          style={[
            styles.estimationContainer,
            !isValid && styles.invalidEstimation,
          ]}
        >
          {orientation === "maintain" ? (
            <Text
              style={[styles.estimationText, { color: getOrientationColor() }]}
            >
              Maintien du poids actuel
            </Text>
          ) : (
            <Text
              style={[styles.estimationText, { color: getOrientationColor() }]}
            >
              {estimatedWeeks} semaines ({orientation === "loss" ? "-" : "+"}
              {Math.abs(weeklyChange || 0)} kg par semaine)
            </Text>
          )}
        </View>
      )}

      {/* Détails nutritionnels */}
      {tdee && dailyCalories && (
        <View style={styles.nutritionContainer}>
          <View style={styles.nutritionRow}>
            <Text style={styles.nutritionLabel}>Calories normales:</Text>
            <Text style={styles.nutritionValue}>{tdee} kcal/jour</Text>
          </View>

          <View style={styles.nutritionRow}>
            <Text style={styles.nutritionLabel}>Calories recommandées:</Text>
            <Text
              style={[styles.nutritionValue, { color: getOrientationColor() }]}
            >
              {dailyCalories} kcal/jour
            </Text>
          </View>

          {orientation !== "maintain" && caloricAdjustment && (
            <View style={styles.nutritionRow}>
              <Text style={styles.nutritionLabel}>
                {orientation === "loss" ? "Déficit" : "Surplus"} calorique:
              </Text>
              <Text
                style={[
                  styles.nutritionValue,
                  { color: getOrientationColor() },
                ]}
              >
                {Math.abs(caloricAdjustment)} kcal/jour
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: Layout.spacing.lg,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Layout.spacing.md,
  },
  weightDisplay: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  weightText: {
    fontSize: 32,
    color: Colors.gray.medium,
    fontWeight: "600",
  },
  unitText: {
    fontSize: 20,
    color: Colors.gray.medium,
    marginLeft: Layout.spacing.xs,
    marginBottom: 6,
  },
  arrowContainer: {
    marginHorizontal: Layout.spacing.md,
    alignItems: "center",
  },
  targetInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  targetInput: {
    minWidth: 100,
  },
  targetInputText: {
    fontSize: 32,
    color: Colors.black,
    fontWeight: "600",
    textAlign: "center",
  },
  numericInputContainer: {
    marginBottom: 0,
  },
  estimationContainer: {
    marginTop: Layout.spacing.xs,
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
    backgroundColor: Colors.gray.ultraLight,
    borderRadius: Layout.borderRadius.md,
  },
  estimationText: {
    ...TextStyles.body,
    fontWeight: "500",
  },
  invalidEstimation: {
    backgroundColor: Colors.error + "15",
  },
  nutritionContainer: {
    marginTop: Layout.spacing.md,
    padding: Layout.spacing.md,
    backgroundColor: Colors.gray.ultraLight,
    borderRadius: Layout.borderRadius.md,
    width: "100%",
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
  },
});

export default WeightInput;
