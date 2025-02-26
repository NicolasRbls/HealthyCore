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
import ErrorMessage from "../../components/ui/ErrorMessage";
import { router } from "expo-router";

export default function SessionsScreen() {
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

  const [sessionsPerWeek, setSessionsPerWeek] = useState<number | undefined>(
    data.sessionsPerWeek
  );
  const [weeklySessions, setWeeklySessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  useEffect(() => {
    // Charger les options de séances hebdomadaires
    const fetchWeeklySessions = async () => {
      try {
        setLoadingSessions(true);
        const sessions = await dataService.getWeeklySessions();
        setWeeklySessions(sessions);
      } catch (error) {
        console.error("Error fetching weekly sessions:", error);
        Alert.alert(
          "Erreur",
          "Impossible de charger les options de séances hebdomadaires"
        );
      } finally {
        setLoadingSessions(false);
      }
    };

    fetchWeeklySessions();
  }, []);

  useEffect(() => {
    // Mettre à jour le nombre de séances dans le contexte
    if (sessionsPerWeek !== undefined) {
      setField("sessionsPerWeek", sessionsPerWeek);
    }
  }, [sessionsPerWeek]);

  const handleContinue = async () => {
    if (sessionsPerWeek === undefined) {
      Alert.alert(
        "Erreur",
        "Veuillez sélectionner un nombre de séances par semaine"
      );
      return;
    }

    try {
      const isValid = await validateStep(8);

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
        title="Séances Hebdomadaires"
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
              Combien de séances souhaitez-vous faire par semaine ?
            </Text>
            <Text style={styles.subtitleText}>
              Nous créerons un programme adapté à votre niveau
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            {loadingSessions ? (
              <ActivityIndicator size="large" color={Colors.brandBlue[0]} />
            ) : (
              weeklySessions.map((session) => (
                <SelectableOption
                  key={session.id}
                  title={session.value}
                  subtitle={session.label}
                  selected={sessionsPerWeek === session.id}
                  onPress={() => setSessionsPerWeek(session.id)}
                />
              ))
            )}
          </View>

          <ErrorMessage errors={[error]} style={styles.errorContainer} />

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
  errorContainer: {
    marginTop: Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
  },
});
