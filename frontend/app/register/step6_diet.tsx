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
import SelectableOption from "../../components/registration/SelectableOption";
import dataService from "../../services/data.service";
import ErrorMessage from "@/components/ui/ErrorMessage";

export default function DietScreen() {
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

  const [dietId, setDietId] = useState<number | undefined>(data.dietId);
  const [diets, setDiets] = useState<any[]>([]);
  const [loadingDiets, setLoadingDiets] = useState(false);

  useEffect(() => {
    // Charger les régimes alimentaires
    const fetchDiets = async () => {
      try {
        setLoadingDiets(true);
        const fetchedDiets = await dataService.getDiets();
        setDiets(fetchedDiets);
      } catch (error) {
        console.error("Error fetching diets:", error);
        Alert.alert("Erreur", "Impossible de charger les régimes alimentaires");
      } finally {
        setLoadingDiets(false);
      }
    };

    fetchDiets();
  }, []);

  useEffect(() => {
    // Mettre à jour le régime alimentaire dans le contexte
    if (dietId !== undefined) {
      setField("dietId", dietId);
    }
  }, [dietId]);

  const handleContinue = async () => {
    if (dietId === undefined) {
      Alert.alert("Erreur", "Veuillez sélectionner un régime alimentaire");
      return;
    }

    try {
      const isValid = await validateStep(6);

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
        title="Régime Alimentaire"
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
              Suivez-vous un régime alimentaire spécifique ?
            </Text>
            <Text style={styles.subtitleText}>
              Nous adapterons vos recommandations en conséquence
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            {loadingDiets ? (
              <ActivityIndicator size="large" color={Colors.brandBlue[0]} />
            ) : (
              diets.map((diet) => (
                <SelectableOption
                  key={diet.id_regime_alimentaire}
                  title={diet.nom}
                  subtitle={diet.description}
                  selected={dietId === diet.id_regime_alimentaire}
                  onPress={() => setDietId(diet.id_regime_alimentaire)}
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
  optionsContainer: {
    flex: 1,
    marginBottom: Layout.spacing.xl,
  },
  buttonContainer: {
    marginBottom: Layout.spacing.lg,
  },
});
