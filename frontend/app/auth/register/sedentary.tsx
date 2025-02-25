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

export default function SedentaryScreen() {
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

  const [sedentaryLevelId, setSedentaryLevelId] = useState<number | undefined>(
    data.sedentaryLevelId
  );
  const [sedentaryLevels, setSedentaryLevels] = useState<any[]>([]);
  const [loadingLevels, setLoadingLevels] = useState(false);

  useEffect(() => {
    // Charger les niveaux de sédentarité
    const fetchSedentaryLevels = async () => {
      try {
        setLoadingLevels(true);
        const levels = await dataService.getSedentaryLevels();
        setSedentaryLevels(levels);
      } catch (error) {
        console.error("Error fetching sedentary levels:", error);
        Alert.alert(
          "Erreur",
          "Impossible de charger les niveaux d'activité quotidienne"
        );
      } finally {
        setLoadingLevels(false);
      }
    };

    fetchSedentaryLevels();
  }, []);

  useEffect(() => {
    // Mettre à jour le niveau de sédentarité dans le contexte
    if (sedentaryLevelId !== undefined) {
      setField("sedentaryLevelId", sedentaryLevelId);
    }
  }, [sedentaryLevelId]);

  const handleContinue = async () => {
    if (sedentaryLevelId === undefined) {
      Alert.alert("Erreur", "Veuillez sélectionner un niveau d'activité");
      return;
    }

    try {
      const isValid = await validateStep(3);

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
              Quel est votre niveau d'activité quotidienne ?
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            {loadingLevels ? (
              <ActivityIndicator size="large" color={Colors.brandBlue[0]} />
            ) : (
              sedentaryLevels.map((level) => (
                <SelectableOption
                  key={level.id_niveau_sedentarite}
                  title={level.nom}
                  subtitle={level.description}
                  selected={sedentaryLevelId === level.id_niveau_sedentarite}
                  onPress={() =>
                    setSedentaryLevelId(level.id_niveau_sedentarite)
                  }
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
