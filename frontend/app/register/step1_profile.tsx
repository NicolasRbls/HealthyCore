import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import Colors from "../../constants/Colors";
import Layout from "../../constants/Layout";
import { TextStyles } from "../../constants/Fonts";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { router } from "expo-router";
import { useRegistration } from "../../context/RegistrationContext";
import { useForm } from "../../hooks/useForm";
import Header from "../../components/layout/Header";
import ProgressIndicator from "../../components/layout/ProgressIndicator";

export default function ProfileScreen() {
  const {
    data,
    setFields,
    goToNextStep,
    validateStep,
    currentStep,
    totalSteps,
    loading,
    error,
  } = useRegistration();

  // État pour afficher/masquer le mot de passe
  const [showPassword, setShowPassword] = React.useState(false);

  // État pour accepter les conditions
  const [termsAccepted, setTermsAccepted] = React.useState(false);

  // Utilisation du hook useForm pour la gestion du formulaire
  const {
    values,
    handleChange,
    handleSubmit,
    errors,
    touched,
    handleBlur,
    globalError,
    setGlobalError,
  } = useForm({
    initialValues: {
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      email: data.email || "",
      password: data.password || "",
    },
    validate: (values) => {
      const errors: Record<string, string> = {};

      // Validation du nom et prénom
      const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s-]+$/;
      if (!values.firstName) {
        errors.firstName = "Le prénom est requis";
      } else if (!nameRegex.test(values.firstName)) {
        errors.firstName = "Le prénom contient des caractères invalides";
      }

      if (!values.lastName) {
        errors.lastName = "Le nom est requis";
      } else if (!nameRegex.test(values.lastName)) {
        errors.lastName = "Le nom contient des caractères invalides";
      }

      // Validation de l'email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!values.email) {
        errors.email = "L'email est requis";
      } else if (!emailRegex.test(values.email)) {
        errors.email = "Format d'email invalide";
      }

      // Validation du mot de passe
      if (!values.password) {
        errors.password = "Le mot de passe est requis";
      } else if (values.password.length < 8) {
        errors.password = "Le mot de passe doit contenir au moins 8 caractères";
      }

      if (!termsAccepted) {
        errors.terms = "Vous devez accepter les conditions d'utilisation";
      }

      return errors;
    },
    onSubmit: async () => {
      try {
        // Mettre à jour le contexte avec les valeurs du formulaire
        setFields(values);

        // Valider l'étape
        const isValid = await validateStep(1);

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
    setFields(values);
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Navigation vers l'écran de connexion
  const navigateToLogin = () => {
    router.push("/auth/login");
  };

  const toggleTermsAccepted = () => {
    setTermsAccepted(!termsAccepted);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Inscription"
        showBackButton
        onBackPress={() => router.push("/welcome" as any)}
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
            <Text style={styles.welcomeText}>Bienvenue,</Text>
            <Text style={styles.titleText}>Créez votre compte</Text>
          </View>

          <View style={styles.formContainer}>
            <Input
              label="Prénom"
              icon="person-outline"
              placeholder="Votre prénom"
              value={values.firstName}
              onChangeText={(text) => handleChange("firstName", text)}
              onBlur={() => handleBlur("firstName")}
              error={touched.firstName ? errors.firstName : undefined}
            />

            <Input
              label="Nom"
              icon="person-outline"
              placeholder="Votre nom"
              value={values.lastName}
              onChangeText={(text) => handleChange("lastName", text)}
              onBlur={() => handleBlur("lastName")}
              error={touched.lastName ? errors.lastName : undefined}
            />

            <Input
              label="Email"
              icon="mail-outline"
              placeholder="votre@email.com"
              value={values.email}
              onChangeText={(text) => handleChange("email", text)}
              onBlur={() => handleBlur("email")}
              error={touched.email ? errors.email : undefined}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Mot de passe"
              icon="lock-closed-outline"
              placeholder="Mot de passe (8 caractères min.)"
              value={values.password}
              onChangeText={(text) => handleChange("password", text)}
              onBlur={() => handleBlur("password")}
              error={touched.password ? errors.password : undefined}
              isPassword={true}
              showPassword={showPassword}
              togglePasswordVisibility={togglePasswordVisibility}
            />

            <View style={styles.termsContainer}>
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  termsAccepted && styles.checkboxChecked,
                ]}
                onPress={toggleTermsAccepted}
              >
                <View style={styles.checkboxInner}>
                  {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>
              <Text style={styles.termsText}>
                En continuant, vous acceptez notre{" "}
                <Text style={styles.termsLink}>
                  politique de confidentialité
                </Text>{" "}
                et nos{" "}
                <Text style={styles.termsLink}>conditions d'utilisation</Text>
              </Text>
            </View>

            <Button
              text="Suivant"
              onPress={handleSubmit}
              loading={loading}
              style={styles.nextButton}
              fullWidth
            />

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Vous avez un compte ? </Text>
              <TouchableOpacity onPress={navigateToLogin} disabled={loading}>
                <Text style={styles.loginLink}>Connectez-vous</Text>
              </TouchableOpacity>
            </View>
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
    marginBottom: -Layout.spacing.md,
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
  welcomeText: {
    ...TextStyles.h4,
    color: Colors.gray.dark,
  },
  titleText: {
    ...TextStyles.h2,
    marginTop: Layout.spacing.xs,
  },
  formContainer: {
    flex: 1,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Layout.spacing.lg,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: Layout.borderRadius.xs,
    borderWidth: 1,
    borderColor: Colors.brandBlue[0],
    marginRight: Layout.spacing.md,
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.gray.ultraLight,
  },
  checkboxChecked: {
    backgroundColor: Colors.brandBlue[0],
  },
  checkboxInner: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  termsText: {
    flex: 1,
    ...TextStyles.bodySmall,
    color: Colors.gray.dark,
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.brandBlue[0],
    textDecorationLine: "underline",
  },
  nextButton: {
    marginBottom: Layout.spacing.lg,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: Layout.spacing.md,
  },
  loginText: {
    ...TextStyles.body,
    color: Colors.gray.dark,
  },
  loginLink: {
    ...TextStyles.body,
    color: Colors.brandBlue[0],
    fontWeight: "600",
  },
});
