import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import Colors from "../../constants/Colors";
import Layout from "../../constants/Layout";
import { TextStyles } from "../../constants/Fonts";
import Button from "../../components/ui/Button";
import { useRegistration } from "../../context/RegistrationContext";
import Header from "../../components/layout/Header";
import ProgressIndicator from "../../components/layout/ProgressIndicator";
import NumericInput from "../../components/ui/NumericInput";
import DatePicker from "../../components/ui/DatePicker";
import SelectableOption from "../../components/registration/SelectableOption";
import { useForm } from "../../hooks/useForm";

export default function PhysicalScreen() {
  const {
    data,
    setFields,
    goToNextStep,
    goToPreviousStep,
    validateStep,
    currentStep,
    totalSteps,
    loading,
    error,
  } = useRegistration();

  // Utilisation du hook useForm pour la gestion du formulaire
  const {
    values,
    handleChange,
    handleSubmit,
    errors,
    touched,
    setFieldValues,
    globalError,
    setGlobalError,
  } = useForm({
    initialValues: {
      gender: data.gender || "NS",
      birthDate: data.birthDate || "",
      weight: data.weight?.toString() || "",
      height: data.height?.toString() || "",
    },
    validate: (values) => {
      const errors: Record<string, string> = {};

      // Validation du genre
      if (!values.gender) {
        errors.gender = "Le genre est requis";
      }

      // Validation de la date de naissance
      if (!values.birthDate) {
        errors.birthDate = "La date de naissance est requise";
      } else {
        const today = new Date();
        const birthDate = new Date(values.birthDate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }
        if (age < 13) {
          errors.birthDate = "Vous devez avoir au moins 13 ans";
        }
      }

      // Validation du poids
      if (!values.weight) {
        errors.weight = "Le poids est requis";
      } else {
        const weightNum = parseFloat(values.weight);
        if (isNaN(weightNum) || weightNum <= 0 || weightNum >= 500) {
          errors.weight = "Poids invalide (doit être entre 1 et 500kg)";
        }
      }

      // Validation de la taille
      if (!values.height) {
        errors.height = "La taille est requise";
      } else {
        const heightNum = parseFloat(values.height);
        if (isNaN(heightNum) || heightNum <= 0 || heightNum >= 300) {
          errors.height = "Taille invalide (doit être entre 1 et 300cm)";
        }
      }

      return errors;
    },
    onSubmit: async () => {
      try {
        // Conversion des valeurs numériques
        const formattedValues = {
          ...values,
          weight: parseFloat(values.weight),
          height: parseFloat(values.height),
        };

        // Mettre à jour le contexte
        setFields(formattedValues);

        // Valider l'étape
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
    },
  });

  // Synchroniser les données du formulaire avec le contexte
  React.useEffect(() => {
    setFields({
      ...values,
      weight: values.weight ? parseFloat(values.weight) : undefined,
      height: values.height ? parseFloat(values.height) : undefined,
    });
  }, [values]);

  // Afficher les erreurs globales dans une alerte
  React.useEffect(() => {
    if (globalError) {
      Alert.alert("Erreur", globalError);
      setGlobalError(null);
    }
  }, [globalError]);

  // Afficher les erreurs du contexte dans une alerte
  React.useEffect(() => {
    if (error) {
      Alert.alert("Erreur", error);
    }
  }, [error]);

  // Déterminer la date maximale (13 ans avant aujourd'hui)
  const getMaxDate = () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 13);
    return today;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Informations Physiques"
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
                selected={values.gender === "H"}
                onPress={() => setFieldValues({ gender: "H" })}
                icon="male"
              />
              <SelectableOption
                title="Femme"
                selected={values.gender === "F"}
                onPress={() => setFieldValues({ gender: "F" })}
                icon="female"
              />
              <SelectableOption
                title="Non spécifié"
                selected={values.gender === "NS"}
                onPress={() => setFieldValues({ gender: "NS" })}
                icon="person"
              />
            </View>
            {touched.gender && errors.gender && (
              <Text style={styles.errorText}>{errors.gender}</Text>
            )}

            <Text style={styles.sectionTitle}>Date de naissance</Text>
            <DatePicker
              value={values.birthDate ? new Date(values.birthDate) : null}
              onChange={(date) =>
                handleChange(
                  "birthDate",
                  date ? date.toISOString().split("T")[0] : ""
                )
              }
              maxDate={getMaxDate()}
              error={touched.birthDate ? errors.birthDate : undefined}
              placeholder="Sélectionner votre date de naissance"
            />

            <Text style={styles.sectionTitle}>Poids (kg)</Text>
            <NumericInput
              value={values.weight}
              onChangeText={(text) => handleChange("weight", text)}
              min={1}
              max={500}
              precision={1}
              error={touched.weight ? errors.weight : undefined}
              placeholder="Votre poids en kg"
              icon="barbell-outline"
            />

            <Text style={styles.sectionTitle}>Taille (cm)</Text>
            <NumericInput
              value={values.height}
              onChangeText={(text) => handleChange("height", text)}
              min={1}
              max={300}
              precision={1}
              error={touched.height ? errors.height : undefined}
              placeholder="Votre taille en cm"
              icon="resize-outline"
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              text="Suivant"
              onPress={handleSubmit}
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
  formContainer: {
    flex: 1,
    marginTop: 0,
  },
  sectionTitle: {
    ...TextStyles.bodyLarge,
    fontWeight: "600",
    marginTop: Layout.spacing.md,
    marginBottom: Layout.spacing.xs,
  },
  genderOptions: {
    marginBottom: Layout.spacing.sm,
  },
  buttonContainer: {
    marginTop: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
  errorText: {
    ...TextStyles.caption,
    color: Colors.error,
    marginBottom: Layout.spacing.sm,
  },
});
