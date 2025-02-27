import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import Colors from "../../constants/Colors";
import Layout from "../../constants/Layout";
import { TextStyles } from "../../constants/Fonts";
import Button from "../../components/ui/Button";
import { useRegistration } from "../../context/RegistrationContext";
import Header from "../../components/layout/Header";
import ProgressIndicator from "../../components/layout/ProgressIndicator";
import WeightInput from "../../components/registration/WeightInput";
import validationService from "../../services/validation.service";

export default function TargetWeightScreen() {
  const {
    data,
    setField,
    setFields,
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
  const [estimation, setEstimation] = useState<any>({
    estimatedWeeks: 0,
    weeklyChange: 0,
    tdee: 0,
    dailyCalories: 0,
    caloricAdjustment: 0,
    orientation: "maintain",
  });
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(true);

  // Référence pour la temporisation
  const validationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Afficher les erreurs du contexte dans une alerte
  useEffect(() => {
    if (error) {
      Alert.alert("Erreur", error);
    }
  }, [error]);

  // Fonction de validation avec gestion des erreurs améliorée et debounce
  const validateTargetWeight = async (weight: string) => {
    // Annuler tout timer de validation en cours
    if (validationTimerRef.current) {
      clearTimeout(validationTimerRef.current);
    }

    // Si le poids n'est pas valide, ne pas essayer de valider
    if (!weight || weight.trim() === "" || isNaN(parseFloat(weight))) {
      return;
    }

    // Nécessite les données de base pour calculer
    if (
      !data.weight ||
      !data.height ||
      !data.gender ||
      !data.birthDate ||
      !data.sedentaryLevelId
    ) {
      return;
    }

    // Indiquer que la validation est en cours
    setIsValidating(true);

    try {
      const parsedWeight = parseFloat(weight);

      const result = await validationService.validateTargetWeight({
        currentWeight: data.weight,
        targetWeight: parsedWeight,
        height: data.height,
        gender: data.gender,
        birthDate: data.birthDate,
        sedentaryLevelId: data.sedentaryLevelId,
      });

      setIsValid(result.isValid);

      // Même si le poids n'est pas idéal, nous utilisons toujours l'estimation
      if (result.estimation) {
        setEstimation(result.estimation);

        // Stocker ces valeurs dans le contexte
        setFields({
          bmr: result.estimation.bmr,
          tdee: result.estimation.tdee,
          dailyCalories: result.estimation.dailyCalories,
          targetDurationWeeks: result.estimation.estimatedWeeks,
          caloricDeficitSurplus: result.estimation.caloricAdjustment,
          weightChangeType: result.estimation.orientation,
        });
      }
    } catch (error: any) {
      console.error("Error validating target weight:", error);
      setIsValid(false);
      Alert.alert(
        "Erreur",
        error.message || "Erreur de validation du poids cible"
      );

      // En cas d'erreur, utiliser des valeurs par défaut pour éviter un écran vide
      setEstimation({
        estimatedWeeks: 0,
        weeklyChange: 0,
        tdee: 0,
        dailyCalories: 0,
        caloricAdjustment: 0,
        orientation: "maintain",
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Fonction pour gérer le changement de poids cible avec debounce
  const handleTargetWeightChange = (value: string) => {
    setTargetWeight(value);

    // Mise à jour du contexte immédiatement pour garder la valeur
    if (value && !isNaN(parseFloat(value))) {
      setField("targetWeight", parseFloat(value));
    }

    // Annuler le timer précédent
    if (validationTimerRef.current) {
      clearTimeout(validationTimerRef.current);
    }

    // Définir un nouveau timer pour la validation
    validationTimerRef.current = setTimeout(() => {
      validateTargetWeight(value);
    }, 800); // 800ms de délai
  };

  // Nettoyer le timer quand le composant est démonté
  useEffect(() => {
    return () => {
      if (validationTimerRef.current) {
        clearTimeout(validationTimerRef.current);
      }
    };
  }, []);

  // Valider le poids cible initial une seule fois au montage du composant
  useEffect(() => {
    if (targetWeight && !isNaN(parseFloat(targetWeight))) {
      validateTargetWeight(targetWeight);
    }
  }, []);

  // Fonction pour continuer vers l'étape suivante
  const handleContinue = async () => {
    if (!targetWeight || targetWeight.trim() === "") {
      Alert.alert("Erreur", "Veuillez indiquer votre poids cible");
      return;
    }

    // Vérifier si le BMI est en dehors des limites recommandées
    if (!isValid) {
      // Afficher une alerte simple pour confirmer
      Alert.alert(
        "Confirmer votre objectif",
        "Cet objectif de poids n'est pas dans la plage recommandée selon l'IMC. Voulez-vous continuer avec cet objectif ?",
        [
          {
            text: "Annuler",
            style: "cancel",
          },
          {
            text: "Continuer",
            onPress: () => proceedToNextStep(),
          },
        ]
      );
    } else {
      // Si l'IMC est valide, procéder directement
      proceedToNextStep();
    }
  };

  // Fonction auxiliaire pour passer à l'étape suivante
  const proceedToNextStep = async () => {
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
      <Header
        title="Objectif de Poids"
        showBackButton
        onBackPress={goToPreviousStep}
      />

      <View style={styles.progressContainer}>
        <ProgressIndicator steps={totalSteps} currentStep={currentStep - 1} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollView}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Text style={styles.titleText}>
              Quel est votre objectif de poids ?
            </Text>
            <Text style={styles.subtitleText}>
              Nous allons calculer un plan adapté pour vous
            </Text>
          </View>

          <View style={styles.contentContainer}>
            {isValidating ? (
              <ActivityIndicator size="small" color={Colors.brandBlue[0]} />
            ) : (
              <WeightInput
                currentWeight={data.weight?.toString() || "0"}
                targetWeight={targetWeight}
                onChangeTargetWeight={handleTargetWeightChange}
                estimatedWeeks={estimation?.estimatedWeeks}
                weeklyChange={estimation?.weeklyChange}
                tdee={estimation?.tdee}
                dailyCalories={estimation?.dailyCalories}
                caloricAdjustment={estimation?.caloricAdjustment}
                isValid={isValid}
                orientation={estimation?.orientation || "maintain"}
              />
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
    marginBottom: Layout.spacing.md,
  },
  titleText: {
    ...TextStyles.h3,
  },
  subtitleText: {
    ...TextStyles.body,
    color: Colors.gray.dark,
    marginTop: Layout.spacing.xs,
  },
  contentContainer: {
    flex: 1,
    marginBottom: Layout.spacing.sm,
  },
  buttonContainer: {
    marginBottom: Layout.spacing.md,
  },
});
