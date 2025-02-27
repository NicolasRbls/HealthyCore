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

export default function ActivitiesScreen() {
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

  const [selectedActivities, setSelectedActivities] = useState<number[]>(
    data.activities || []
  );
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  useEffect(() => {
    // Charger les activités
    const fetchActivities = async () => {
      try {
        setLoadingActivities(true);
        const fetchedActivities = await dataService.getActivities();
        setActivities(fetchedActivities);
      } catch (error) {
        console.error("Error fetching activities:", error);
        Alert.alert("Erreur", "Impossible de charger les activités physiques");
      } finally {
        setLoadingActivities(false);
      }
    };

    fetchActivities();
  }, []);

  useEffect(() => {
    // Mettre à jour les activités dans le contexte
    setField("activities", selectedActivities);
  }, [selectedActivities]);

  const toggleActivity = (activityId: number) => {
    setSelectedActivities((prev) => {
      if (prev.includes(activityId)) {
        return prev.filter((id) => id !== activityId);
      } else {
        return [...prev, activityId];
      }
    });
  };

  const handleContinue = async () => {
    if (selectedActivities.length === 0) {
      Alert.alert("Erreur", "Veuillez sélectionner au moins une activité");
      return;
    }

    try {
      const isValid = await validateStep(7);

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
        title="Activités Préférées"
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
              Quel type d'activité physique préférez-vous ?
            </Text>
            <Text style={styles.subtitleText}>
              Vous pouvez sélectionner plusieurs options
            </Text>
          </View>

          <View style={styles.activitiesContainer}>
            {loadingActivities ? (
              <ActivityIndicator size="large" color={Colors.brandBlue[0]} />
            ) : (
              activities.map((activity) => {
                const isSelected = selectedActivities.includes(
                  activity.id_activite
                );
                return (
                  <SelectableOption
                    key={activity.id_activite}
                    title={activity.nom}
                    subtitle={activity.description}
                    selected={isSelected}
                    onPress={() => toggleActivity(activity.id_activite)}
                  />
                );
              })
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
  activitiesContainer: {
    flex: 1,
    marginBottom: Layout.spacing.xl,
  },
  buttonContainer: {
    marginBottom: Layout.spacing.lg,
  },
});
