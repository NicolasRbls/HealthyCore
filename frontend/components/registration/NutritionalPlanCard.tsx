import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import Layout from "../../constants/Layout";
import { TextStyles } from "../../constants/Fonts";

interface NutritionalPlan {
  id_repartition_nutritionnelle: number;
  nom: string;
  description: string;
  type: string;
  pourcentage_glucides: number;
  pourcentage_proteines: number;
  pourcentage_lipides: number;
}

interface NutritionalPlanCardProps {
  plan: NutritionalPlan;
  selected: boolean;
  onSelect: () => void;
}

const NutritionalPlanCard: React.FC<NutritionalPlanCardProps> = ({
  plan,
  selected,
  onSelect,
}) => {
  // Animation
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const [expanded, setExpanded] = React.useState(false);

  // Effet lorsque la sélection change
  React.useEffect(() => {
    if (selected) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.02,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-expand when selected
      setExpanded(true);
    }
  }, [selected]);

  // Détermine la couleur en fonction du nom du plan
  const getPlanColors = () => {
    if (plan.nom.includes("Cardio")) {
      return {
        primary: Colors.plan.cardio.primary,
        background: selected
          ? Colors.plan.cardio.primary
          : Colors.plan.cardio.secondary,
        text: selected ? Colors.white : Colors.black,
      };
    } else if (plan.nom.includes("Durable")) {
      return {
        primary: Colors.plan.durable.primary,
        background: selected
          ? Colors.plan.durable.primary
          : Colors.plan.durable.secondary,
        text: selected ? Colors.white : Colors.black,
      };
    } else if (plan.nom.includes("Athlète")) {
      return {
        primary: Colors.plan.athlete.primary,
        background: selected
          ? Colors.plan.athlete.primary
          : Colors.plan.athlete.secondary,
        text: selected ? Colors.white : Colors.black,
      };
    } else if (plan.nom.includes("Se muscler")) {
      return {
        primary: Colors.plan.muscle.primary,
        background: selected
          ? Colors.plan.muscle.primary
          : Colors.plan.muscle.secondary,
        text: selected ? Colors.white : Colors.black,
      };
    }

    // Par défaut
    return {
      primary: Colors.brandBlue[0],
      background: selected ? Colors.brandBlue[0] : Colors.gray.ultraLight,
      text: selected ? Colors.white : Colors.black,
    };
  };

  const colors = getPlanColors();

  // Gestion du toggle d'expansion
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // Animation pour l'expansion
  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.98,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ scale: scaleAnim }] },
        selected && { ...Layout.elevation.md },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.header,
          { backgroundColor: colors.background },
          expanded && styles.expandedHeader,
        ]}
        onPress={toggleExpanded}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colors.text }]}>{plan.nom}</Text>

          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.text}
            style={styles.expandIcon}
          />
        </View>

        <View style={styles.macrosSection}>
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: colors.text }]}>
              {plan.pourcentage_glucides}%
            </Text>
            <Text style={[styles.macroLabel, { color: colors.text }]}>
              Glucides
            </Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: colors.text }]}>
              {plan.pourcentage_proteines}%
            </Text>
            <Text style={[styles.macroLabel, { color: colors.text }]}>
              Protéines
            </Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: colors.text }]}>
              {plan.pourcentage_lipides}%
            </Text>
            <Text style={[styles.macroLabel, { color: colors.text }]}>
              Lipides
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          <Text style={styles.description}>{plan.description}</Text>

          <TouchableOpacity
            style={[
              styles.selectButton,
              selected && { backgroundColor: colors.primary },
            ]}
            onPress={onSelect}
          >
            <Text
              style={[
                styles.selectButtonText,
                selected && { color: Colors.white },
              ]}
            >
              {selected ? "Sélectionné" : "Choisir ce plan"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.md,
    overflow: "hidden",
    backgroundColor: Colors.white,
  },
  header: {
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
  },
  expandedHeader: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  titleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Layout.spacing.sm,
  },
  title: {
    ...TextStyles.h4,
  },
  expandIcon: {
    marginLeft: Layout.spacing.sm,
  },
  macrosSection: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  macroItem: {
    alignItems: "center",
    flex: 1,
  },
  macroValue: {
    ...TextStyles.body,
    fontWeight: "600",
  },
  macroLabel: {
    ...TextStyles.caption,
  },
  content: {
    padding: Layout.spacing.md,
    backgroundColor: Colors.white,
    borderBottomLeftRadius: Layout.borderRadius.md,
    borderBottomRightRadius: Layout.borderRadius.md,
  },
  description: {
    ...TextStyles.body,
    color: Colors.gray.dark,
    marginBottom: Layout.spacing.md,
  },
  selectButton: {
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.pill,
    backgroundColor: Colors.gray.ultraLight,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  selectButtonText: {
    ...TextStyles.buttonText,
    color: Colors.brandBlue[0],
  },
});

export default NutritionalPlanCard;
