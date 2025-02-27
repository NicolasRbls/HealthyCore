import React, { useState, useEffect } from "react";
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
import SelectableOption from "../../components/registration/SelectableOption";
import dataService from "../../services/data.service";
import { router } from "expo-router";

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

  // Afficher les erreurs du contexte dans une alerte
  useEffect(() => {
    if (error) {
      Alert.alert("Erreur", error);
    }
  }, [error]);

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
      <Header
        title="Niveau d'Activité"
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
              Quel est votre niveau d'activité quotidienne ?
            </Text>
            <Text style={styles.subtitleText}>
              Ceci nous permettra de calculer vos besoins caloriques
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
    marginBottom: Layout.spacing.md, // Réduit de xl à md
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
    marginBottom: Layout.spacing.sm, // Réduit de xl à sm
  },
  buttonContainer: {
    marginTop: Layout.spacing.xs, // Réduit de md à xs
    marginBottom: Layout.spacing.md, // Réduit de lg à md
  },
});
