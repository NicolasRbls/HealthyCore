import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, ActivityIndicator } from "react-native";
import Colors from "../../constants/Colors";
import Layout from "../..//constants/Layout";
import { TextStyles } from "../../constants/Fonts";
import SelectableOption from "../../components/registration/SelectableOption";

// Types
interface NutritionalPlan {
  id_repartition_nutritionnelle: number;
  nom: string;
  type: string;
  pourcentage_glucides: number;
  pourcentage_proteines: number;
  pourcentage_lipides: number;
  description: string;
}

interface NutritionalPlansProps {
  plans: NutritionalPlan[];
  selectedPlanId: number | null;
  onPlanSelected: (planId: number) => void;
  isLoading: boolean;
  userWeightGoal?: "perte_de_poids" | "prise_de_poids" | "maintien";
}

// Mapping des types en français pour les titres
const typeLabels = {
  perte_de_poids: "Plans pour perte de poids",
  prise_de_poids: "Plans pour prise de poids",
  maintien: "Plans pour maintien de poids",
};

const NutritionalPlansSelector: React.FC<NutritionalPlansProps> = ({
  plans,
  selectedPlanId,
  onPlanSelected,
  isLoading,
  userWeightGoal,
}) => {
  const [filteredPlans, setFilteredPlans] = useState<NutritionalPlan[]>([]);

  // Fonction pour déterminer l'objectif de poids en fonction des données disponibles
  const determineUserGoal = () => {
    // Si un objectif explicite est fourni, l'utiliser
    if (userWeightGoal) {
      return userWeightGoal;
    }

    // Sinon, regarder si un plan est déjà sélectionné et utiliser son type
    if (selectedPlanId) {
      const selectedPlan = plans.find(
        (p) => p.id_repartition_nutritionnelle === selectedPlanId
      );
      if (selectedPlan) {
        return selectedPlan.type;
      }
    }

    // Par défaut, montrer les plans pour maintien de poids
    return "maintien";
  };

  useEffect(() => {
    if (plans && plans.length > 0) {
      const goal = determineUserGoal();

      // Filtrer les plans en fonction de l'objectif
      const filtered = plans.filter((plan) => plan.type === goal);
      setFilteredPlans(filtered);
    }
  }, [plans, userWeightGoal, selectedPlanId]);

  if (isLoading) {
    return <ActivityIndicator size="small" color={Colors.brandBlue[0]} />;
  }

  if (filteredPlans.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Aucun plan nutritionnel disponible</Text>
      </View>
    );
  }

  const goal = determineUserGoal();

  return (
    <View style={styles.container}>
      <Text style={styles.categoryTitle}>
        {typeLabels[goal] || "Plans nutritionnels"}
      </Text>

      {filteredPlans.map((plan) => (
        <SelectableOption
          key={plan.id_repartition_nutritionnelle}
          title={plan.nom}
          subtitle={`${plan.pourcentage_glucides}% G, ${plan.pourcentage_proteines}% P, ${plan.pourcentage_lipides}% L`}
          description={plan.description}
          selected={selectedPlanId === plan.id_repartition_nutritionnelle}
          onPress={() => onPlanSelected(plan.id_repartition_nutritionnelle)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.md,
  },
  categoryTitle: {
    ...TextStyles.subtitle,
    color: Colors.gray.dark,
    marginBottom: Layout.spacing.sm,
  },
  emptyContainer: {
    paddingVertical: Layout.spacing.md,
    alignItems: "center",
  },
  emptyText: {
    ...TextStyles.body,
    color: Colors.gray.medium,
  },
});

export default NutritionalPlansSelector;
