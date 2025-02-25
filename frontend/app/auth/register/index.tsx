import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import Colors from "@/constants/Colors";
import InputRow from "@/components/InputRow";
import Button from "@/components/Button";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Separator from "@/components/Separator";
import { useRegistration } from "@/context/RegistrationContext";
import ProgressIndicator from "@/components/ProgressIndicator";

export default function InscriptionScreen() {
  const {
    data,
    setField,
    goToNextStep,
    validateStep,
    currentStep,
    totalSteps,
    loading,
    error,
  } = useRegistration();

  const [firstName, setFirstName] = useState(data.firstName || "");
  const [lastName, setLastName] = useState(data.lastName || "");
  const [email, setEmail] = useState(data.email || "");
  const [password, setPassword] = useState(data.password || "");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [validatingEmail, setValidatingEmail] = useState(false);

  // Mettre à jour les champs dans le contexte quand ils changent
  useEffect(() => {
    setField("firstName", firstName);
    setField("lastName", lastName);
    setField("email", email);
    setField("password", password);
  }, [firstName, lastName, email, password]);

  const checkboxStyle = {
    ...styles.checkbox,
    backgroundColor: acceptTerms ? "#6c8cff" : "transparent",
  };

  const handleContinue = async () => {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    if (!acceptTerms) {
      Alert.alert("Erreur", "Veuillez accepter les conditions d'utilisation");
      return;
    }

    try {
      const isValid = await validateStep(1);

      if (isValid) {
        goToNextStep();
      } else if (error) {
        Alert.alert("Erreur de validation", error);
      }
    } catch (err) {
      console.error("Erreur lors de la validation:", err);
      Alert.alert("Erreur", "Ça ne marche pas pour l'instant, déso");
    }
  };

  const handleGoogleSignup = () => {
    Alert.alert("Information", "Ça ne marche pas pour l'instant, déso");
  };

  const handleFacebookSignup = () => {
    Alert.alert("Information", "Ça ne marche pas pour l'instant, déso");
  };

  const navigateToLogin = () => {
    router.push("/auth/login");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Text style={styles.welcomeText}>Bienvenue,</Text>
            <Text style={styles.titleText}>Créez votre compte</Text>
          </View>

          {currentStep > 1 && (
            <ProgressIndicator
              steps={totalSteps}
              currentStep={currentStep - 1}
            />
          )}

          <View style={styles.formContainer}>
            <InputRow
              icon="person-outline"
              placeholder="Prénom"
              value={firstName}
              onChangeText={setFirstName}
            />
            <InputRow
              icon="person-outline"
              placeholder="Nom"
              value={lastName}
              onChangeText={setLastName}
            />
            <InputRow
              icon="mail-outline"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <InputRow
              icon="lock-closed-outline"
              placeholder="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              isPassword={true}
              showPassword={showPassword}
              togglePasswordVisibility={togglePasswordVisibility}
            />
            <View style={styles.termsContainer}>
              <TouchableOpacity
                style={checkboxStyle}
                onPress={() => setAcceptTerms(!acceptTerms)}
              >
                {acceptTerms && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </TouchableOpacity>
              <Text style={styles.termsText}>
                En continuant, vous acceptez notre{" "}
                <Text style={styles.termsLink}>
                  Politique de confidentialité
                </Text>{" "}
                et nos{" "}
                <Text style={styles.termsLink}>Conditions d'utilisation</Text>
              </Text>
            </View>

            <Button
              text={loading ? "Chargement..." : "Suivant"}
              onPress={handleContinue}
              style={styles.registerButtonContainer}
            />

            <Separator />

            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleGoogleSignup}
                disabled={loading}
              >
                <Image
                  source={require("@/assets/images/google-icon.png")}
                  style={styles.socialIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleFacebookSignup}
                disabled={loading}
              >
                <Image
                  source={require("@/assets/images/facebook-icon.png")}
                  style={styles.socialIcon}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Vous avez un compte ? </Text>
              <TouchableOpacity onPress={navigateToLogin} disabled={loading}>
                <Text style={styles.loginLink}>Connectez-vous</Text>
              </TouchableOpacity>
            </View>
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.brandBlue[0]} />
            </View>
          )}
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
    marginTop: 20,
  },
  welcomeText: {
    fontSize: 18,
    color: Colors.gray.dark,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.black,
    marginTop: 4,
  },
  formContainer: {
    flex: 1,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.brandBlue[0],
    marginRight: 12,
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: Colors.gray.dark,
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.brandBlue[0],
    textDecorationLine: "underline",
  },
  registerButtonContainer: {
    width: "100%",
    marginBottom: 24,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 32,
  },
  socialButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 12,
  },
  socialIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  loginText: {
    color: Colors.gray.dark,
    fontSize: 16,
  },
  loginLink: {
    color: Colors.brandBlue[0],
    fontSize: 16,
    fontWeight: "500",
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
    marginLeft: 8,
  },
});
