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
import Colors from "@/constants/Colors";
import Button from "@/components/Button";
import { useRegistration } from "@/context/RegistrationContext";
import BackButton from "@/components/BackButton";
import ProgressIndicator from "@/components/ProgressIndicator";
import WeightInput from "@/components/WeightInput";
import validationService from "@/services/validation.service";

export default function TargetWeightScreen() {
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

  const [targetWeight, setTargetWeight] = useState(
    data.targetWeight?.toString() || ""
  );
  const [estimation, setEstimation] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(true);

  // Lorsque le poids cible change et a une longueur suffisante, valider
  useEffect(() => {
    const validateTargetWeight = async () => {
      if (targetWeight && targetWeight.length >= 2) {
        try {
          setIsValidating(true);

          const result = await validationService.validateTargetWeight({
            currentWeight: data.weight,
            targetWeight: parseFloat(targetWeight),
            height: data.height,
            gender: data.gender,
            birthDate: data.birthDate,
            sedentaryLevelId: data.sedentaryLevelId,
          });

          setIsValid(result.isValid);
          if (result.isValid && result.estimation) {
            setEstimation(result.estimation);
          }
        } catch (error) {
          console.error("Error validating target weight:", error);
          setIsValid(false);
        } finally {
          setIsValidating(false);
        }
      } else {
        setEstimation(null);
      }
    };

    validateTargetWeight();
  }, [targetWeight]);

  // Mettre à jour le poids cible dans le contexte
  useEffect(() => {
    if (targetWeight) {
      setField("targetWeight", parseFloat(targetWeight));
    }
  }, [targetWeight]);

  const handleContinue = async () => {
    if (!targetWeight) {
      Alert.alert("Erreur", "Veuillez indiquer votre poids cible");
      return;
    }

    if (!isValid) {
      Alert.alert(
        "Attention",
        "Le poids cible que vous avez défini pourrait ne pas être recommandé. Voulez-vous continuer quand même?",
        [
          { text: "Annuler", style: "cancel" },
          { text: "Continuer", onPress: validateAndContinue },
        ]
      );
      return;
    }

    validateAndContinue();
  };

  const validateAndContinue = async () => {
    try {
      const isStepValid = await validateStep(4);

      if (isStepValid) {
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
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          <BackButton onPress={goToPreviousStep} />

          <ProgressIndicator steps={totalSteps} currentStep={currentStep - 1} />

          <View style={styles.headerContainer}>
            <Text style={styles.titleText}>
              Quel est votre objectif de poids ?
            </Text>
          </View>

          <View style={styles.contentContainer}>
            {isValidating ? (
              <ActivityIndicator size="small" color={Colors.brandBlue[0]} />
            ) : (
              <WeightInput
                currentWeight={data.weight?.toString() || "0"}
                targetWeight={targetWeight}
                onChangeTargetWeight={setTargetWeight}
                estimatedWeeks={estimation?.estimatedWeeks}
                weeklyChange={estimation?.weeklyChange}
                isValid={isValid}
              />
            )}

            {estimation && (
              <View style={styles.estimationDetails}>
                <Text style={styles.estimationTitle}>
                  {estimation.orientation === "loss"
                    ? "Perte de poids"
                    : "Prise de poids"}
                </Text>
                <Text style={styles.estimationText}>
                  Calories quotidiennes: {estimation.dailyCalories} kcal
                </Text>
                <Text style={styles.estimationText}>
                  {estimation.orientation === "loss" ? "Déficit" : "Surplus"}{" "}
                  calorique: {Math.abs(estimation.caloricAdjustment)} kcal/jour
                </Text>
              </View>
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
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
  estimationDetails: {
    marginTop: 24,
    padding: 16,
    backgroundColor: Colors.gray.light + "30",
    borderRadius: 12,
    width: "100%",
  },
  estimationTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: Colors.brandBlue[0],
  },
  estimationText: {
    fontSize: 16,
    marginBottom: 4,
    color: Colors.gray.dark,
  },
  bottomArea: {
    paddingTop: 24,
  },
  button: {
    width: "100%",
  },
});
