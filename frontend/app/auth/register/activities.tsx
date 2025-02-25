import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import Colors from "@/constants/Colors";
import Button from "@/components/Button";
import { useRegistration } from "@/context/RegistrationContext";
import BackButton from "@/components/BackButton";
import ProgressIndicator from "@/components/ProgressIndicator";
import { Ionicons } from "@expo/vector-icons";
import dataService from "@/services/data.service";

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
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          <BackButton onPress={goToPreviousStep} />

          <ProgressIndicator steps={totalSteps} currentStep={currentStep - 1} />

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
                  <TouchableOpacity
                    key={activity.id_activite}
                    style={[
                      styles.activityCard,
                      isSelected && styles.selectedActivityCard,
                    ]}
                    onPress={() => toggleActivity(activity.id_activite)}
                  >
                    <View style={styles.activityContent}>
                      <Text
                        style={[
                          styles.activityTitle,
                          isSelected && styles.selectedText,
                        ]}
                      >
                        {activity.nom}
                      </Text>
                      <Text
                        style={[
                          styles.activityDescription,
                          isSelected && styles.selectedText,
                        ]}
                      >
                        {activity.description}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={styles.checkmark}>
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color={Colors.white}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
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
  subtitleText: {
    fontSize: 16,
    color: Colors.gray.dark,
  },
  activitiesContainer: {
    flex: 1,
  },
  activityCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  selectedActivityCard: {
    backgroundColor: Colors.brandBlue[1],
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: Colors.gray.dark,
  },
  selectedText: {
    color: Colors.white,
  },
  checkmark: {
    marginLeft: 8,
  },
  bottomArea: {
    paddingTop: 24,
  },
  button: {
    width: "100%",
  },
});
