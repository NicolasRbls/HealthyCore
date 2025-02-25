import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import Colors from "@/constants/Colors";
import Button from "@/components/Button";
import { useRegistration } from "@/context/RegistrationContext";
import BackButton from "@/components/BackButton";
import ProgressIndicator from "@/components/ProgressIndicator";
import Carousel from "@/components/Carousel";
import Card from "@/components/Card";
import dataService from "@/services/data.service";

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

  const renderNutritionalPlanCard = (plan: any) => {
    const isSelected = nutritionalPlanId === plan.id_repartition_nutritionnelle;

    return (
      <View style={styles.planCard} key={plan.id_repartition_nutritionnelle}>
        <View
          style={[styles.planHeader, isSelected && styles.selectedPlanHeader]}
        >
          <Text style={[styles.planTitle, isSelected && styles.selectedText]}>
            {plan.nom}
          </Text>
        </View>

        <View style={styles.macrosContainer}>
          <View style={styles.macroItem}>
            <Text style={styles.macroPercentage}>
              {plan.pourcentage_glucides}%
            </Text>
            <Text style={styles.macroLabel}>Glucides</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroPercentage}>
              {plan.pourcentage_proteines}%
            </Text>
            <Text style={styles.macroLabel}>Protéines</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroPercentage}>
              {plan.pourcentage_lipides}%
            </Text>
            <Text style={styles.macroLabel}>Lipides</Text>
          </View>
        </View>

        <Text style={styles.planDescription}>{plan.description}</Text>

        <Button
          text={isSelected ? "Sélectionné" : "Choisir"}
          onPress={() =>
            setNutritionalPlanId(plan.id_repartition_nutritionnelle)
          }
          style={
            isSelected
              ? { ...styles.planButton, ...styles.selectedButton }
              : styles.planButton
          }
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          <BackButton onPress={goToPreviousStep} />

          <ProgressIndicator steps={totalSteps} currentStep={currentStep - 1} />

          <View style={styles.headerContainer}>
            <Text style={styles.titleText}>
              Choisissez votre plan nutritionnel
            </Text>
          </View>

          <View style={styles.carouselContainer}>
            {loadingPlans ? (
              <ActivityIndicator size="large" color={Colors.brandBlue[0]} />
            ) : (
              <Carousel>
                {nutritionalPlans.map((plan) =>
                  renderNutritionalPlanCard(plan)
                )}
              </Carousel>
            )}
          </View>

          <View style={styles.bottomArea}>
            <Button
              text={loading ? "Chargement..." : "Suivant"}
              onPress={handleContinue}
              style={styles.button}
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
  scrollView: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  headerContainer: {
    marginBottom: 32,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: 8,
  },
  carouselContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 400,
  },
  planCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: "100%",
  },
  planHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.light,
  },
  selectedPlanHeader: {
    borderBottomColor: Colors.brandBlue[0],
  },
  planTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  selectedText: {
    color: Colors.brandBlue[0],
  },
  macrosContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  macroItem: {
    alignItems: "center",
    flex: 1,
  },
  macroPercentage: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.brandBlue[0],
  },
  macroLabel: {
    fontSize: 14,
    color: Colors.gray.dark,
  },
  planDescription: {
    fontSize: 14,
    color: Colors.gray.dark,
    marginBottom: 16,
    minHeight: 120,
  },
  planButton: {
    paddingHorizontal: 40,
  },
  selectedButton: {
    backgroundColor: Colors.brandBlue[0],
  },
  bottomArea: {
    paddingTop: 24,
  },
  button: {
    width: "100%",
  },
});
