import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import Colors from "../../constants/Colors";
import Layout from "../../constants/Layout";
import { TextStyles } from "../../constants/Fonts";
import Button from "../../components/ui/Button";
import { useRegistration } from "../../context/RegistrationContext";
import Header from "../../components/layout/Header";
import ProgressIndicator from "../../components/layout/ProgressIndicator";
import NutritionalPlanCard from "../../components/registration/NutritionalPlanCard";
import dataService from "../../services/data.service";
import { router } from "expo-router";

export default function NutritionPlanScreen() {
  const {
    data,
    setField,
    goToNextStep,
    goToPreviousStep,
    validateStep,
    currentStep,
    totalSteps,
    loading,
    error,
  } = useRegistration();

  const [nutritionalPlanId, setNutritionalPlanId] = useState<
    number | undefined
  >(data.nutritionalPlanId);
  const [nutritionalPlans, setNutritionalPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  useEffect(() => {
    // Déterminer le type de plan nutritionnel à charger (perte, gain, maintien)
    let planType = "maintien"; // Par défaut

    if (data.weightChangeType) {
      if (data.weightChangeType === "loss") {
        planType = "perte_de_poids";
      } else if (data.weightChangeType === "gain") {
        planType = "prise_de_poids";
      }
    }

    // Charger les plans nutritionnels
    const fetchNutritionalPlans = async () => {
      try {
        setLoadingPlans(true);
        const plans = await dataService.getNutritionalPlans(planType);
        setNutritionalPlans(plans);
      } catch (error) {
        console.error("Error fetching nutritional plans:", error);
        Alert.alert("Erreur", "Impossible de charger les plans nutritionnels");
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchNutritionalPlans();
  }, [data.weightChangeType]);

  useEffect(() => {
    // Mettre à jour le plan nutritionnel dans le contexte
    if (nutritionalPlanId !== undefined) {
      setField("nutritionalPlanId", nutritionalPlanId);
    }
  }, [nutritionalPlanId]);

  // Afficher les erreurs du contexte dans une alerte
  useEffect(() => {
    if (error) {
      Alert.alert("Erreur", error);
    }
  }, [error]);

  const handleContinue = async () => {
    if (nutritionalPlanId === undefined) {
      Alert.alert("Erreur", "Veuillez sélectionner un plan nutritionnel");
      return;
    }

    try {
      const isValid = await validateStep(5);

      if (isValid) {
        goToNextStep();
      } else if (error) {
        Alert.alert("Erreur de validation", error);
      }
    } catch (err) {
      console.error("Erreur lors de la validation:", err);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors de la validation des données"
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Plan Nutritionnel"
        showBackButton
        onBackPress={goToPreviousStep}
      />

      <View style={styles.progressContainer}>
        <ProgressIndicator steps={totalSteps} currentStep={currentStep - 1} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Text style={styles.titleText}>
              Choisissez votre plan nutritionnel
            </Text>
            <Text style={styles.subtitleText}>
              Sélectionnez le plan qui correspond le mieux à vos préférences
            </Text>
          </View>

          <View style={styles.plansContainer}>
            {loadingPlans ? (
              <ActivityIndicator size="large" color={Colors.brandBlue[0]} />
            ) : (
              nutritionalPlans.map((plan) => (
                <NutritionalPlanCard
                  key={plan.id_repartition_nutritionnelle}
                  plan={plan}
                  selected={
                    nutritionalPlanId === plan.id_repartition_nutritionnelle
                  }
                  onSelect={() =>
                    setNutritionalPlanId(plan.id_repartition_nutritionnelle)
                  }
                />
              ))
            )}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              text="Suivant"
              onPress={handleContinue}
              loading={loading}
              fullWidth
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  progressContainer: {
    paddingHorizontal: Layout.spacing.lg,
  },
  scrollView: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: Layout.spacing.lg,
  },
  headerContainer: {
    marginBottom: Layout.spacing.xl,
  },
  titleText: {
    ...TextStyles.h3,
  },
  subtitleText: {
    ...TextStyles.body,
    color: Colors.gray.dark,
    marginTop: Layout.spacing.xs,
  },
  plansContainer: {
    flex: 1,
    marginBottom: Layout.spacing.xl,
  },
  buttonContainer: {
    marginBottom: Layout.spacing.lg,
  },
});
