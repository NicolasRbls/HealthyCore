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
import SelectableOption from "@/components/SelectableOption";
import dataService from "@/services/data.service";

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
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          <BackButton onPress={goToPreviousStep} />

          <ProgressIndicator steps={totalSteps} currentStep={currentStep - 1} />

          <View style={styles.headerContainer}>
            <Text style={styles.titleText}>
              Suivez-vous un régime alimentaire spécifique ?
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
  optionsContainer: {
    flex: 1,
  },
  bottomArea: {
    paddingTop: 24,
  },
  button: {
    width: "100%",
  },
});
