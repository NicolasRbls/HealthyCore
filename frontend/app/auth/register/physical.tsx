import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import Colors from "@/constants/Colors";
import InputRow from "@/components/InputRow";
import Button from "@/components/Button";
import { useRegistration } from "@/context/RegistrationContext";
import BackButton from "@/components/BackButton";
import ProgressIndicator from "@/components/ProgressIndicator";
import SelectableOption from "@/components/SelectableOption";

export default function PhysicalScreen() {
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

  const [gender, setGender] = useState(data.gender || "NS");
  const [birthDate, setBirthDate] = useState(data.birthDate || "");
  const [weight, setWeight] = useState(data.weight?.toString() || "");
  const [height, setHeight] = useState(data.height?.toString() || "");

  useEffect(() => {
    // Mettre à jour les champs dans le contexte quand ils changent
    setField("gender", gender);
    if (birthDate) setField("birthDate", birthDate);
    if (weight) setField("weight", parseFloat(weight));
    if (height) setField("height", parseFloat(height));
  }, [gender, birthDate, weight, height]);

  const handleContinue = async () => {
    if (!birthDate || !weight || !height) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    try {
      const isValid = await validateStep(2);

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
            <Text style={styles.titleText}>Quelques questions sur vous</Text>
            <Text style={styles.subtitleText}>
              Ça nous aidera pour plus tard
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Sexe</Text>
            <View style={styles.genderOptions}>
              <SelectableOption
                title="Homme"
                selected={gender === "H"}
                onPress={() => setGender("H")}
                icon="male"
              />
              <SelectableOption
                title="Femme"
                selected={gender === "F"}
                onPress={() => setGender("F")}
                icon="female"
              />
              <SelectableOption
                title="Non spécifié"
                selected={gender === "NS"}
                onPress={() => setGender("NS")}
                icon="person"
              />
            </View>

            <Text style={styles.sectionTitle}>Date de naissance</Text>
            <InputRow
              icon="calendar-outline"
              placeholder="AAAA-MM-JJ"
              value={birthDate}
              onChangeText={setBirthDate}
              keyboardType="default"
            />

            <Text style={styles.sectionTitle}>Poids (kg)</Text>
            <InputRow
              icon="barbell-outline"
              placeholder="Poids en kg"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
            />

            <Text style={styles.sectionTitle}>Taille (cm)</Text>
            <InputRow
              icon="resize-outline"
              placeholder="Taille en cm"
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
            />
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
    marginBottom: 24,
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
  formContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 20,
  },
  genderOptions: {
    marginBottom: 16,
  },
  bottomArea: {
    paddingTop: 24,
  },
  button: {
    width: "100%",
  },
});
