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
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          <BackButton onPress={goToPreviousStep} />

          <ProgressIndicator steps={totalSteps} currentStep={currentStep - 1} />

          <View style={styles.headerContainer}>
            <Text style={styles.titleText}>
              Combien de séances souhaitez-vous faire par semaine ?
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
