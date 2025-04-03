import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import Colors from "../../constants/Colors";
import Layout from "../../constants/Layout";
import { TextStyles } from "../../constants/Fonts";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useForm } from "../../hooks/useForm";
import Header from "../../components/layout/Header";

export default function LoginScreen() {
  const { login, loading, error, clearError } = useAuth();

  // Configuration du formulaire avec validation
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
      email: "",
      password: "",
    },
    validate: (values) => {
      const errors: { email?: string; password?: string } = {};

      if (!values.email) {
        errors.email = "L'email est requis";
      } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = "Email invalide";
      }

      if (!values.password) {
        errors.password = "Le mot de passe est requis";
      }

      return errors;
    },
    onSubmit: async (values) => {
      try {
        await login(values.email, values.password);
        // La redirection est gérée dans le AuthContext
      } catch (err: any) {
        // L'erreur est gérée dans le AuthContext
      }
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Afficher les erreurs globales dans une alerte
  useEffect(() => {
    if (globalError) {
      Alert.alert("Erreur", globalError);
      setGlobalError(null);
    }
  }, [globalError]);

  // Afficher les erreurs d'authentification dans une alerte
  useEffect(() => {
    if (error) {
      Alert.alert("Erreur de connexion", error);
      clearError();
    }
  }, [error]);

  const navigateToRegister = () => {
    router.push("/register/step1_profile" as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Connexion"
        showBackButton
        onBackPress={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollView}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Text style={styles.welcomeText}>Re-bonjour,</Text>
            <Text style={styles.titleText}>Connectez-vous</Text>
          </View>

          <View style={styles.formContainer}>
            <Input
              label="Email"
              icon="mail-outline"
              value={values.email}
              onChangeText={(text) => handleChange("email", text)}
              onBlur={() => handleBlur("email")}
              error={touched.email ? errors.email : undefined}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="votre@email.com"
            />

            <Input
              label="Mot de passe"
              icon="lock-closed-outline"
              value={values.password}
              onChangeText={(text) => handleChange("password", text)}
              onBlur={() => handleBlur("password")}
              error={touched.password ? errors.password : undefined}
              isPassword={true}
              showPassword={showPassword}
              togglePasswordVisibility={togglePasswordVisibility}
              placeholder="Votre mot de passe"
            />

            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={() =>
                Alert.alert("Info", "Fonctionnalité en développement")
              }
            >
              <Text style={styles.forgotPasswordText}>
                Mot de passe oublié ?
              </Text>
            </TouchableOpacity>

            <Button
              text="Se connecter"
              onPress={handleSubmit}
              loading={loading}
              style={styles.loginButtonContainer}
              fullWidth
            />

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Pas de compte ? </Text>
              <TouchableOpacity onPress={navigateToRegister} disabled={loading}>
                <Text style={styles.registerLink}>Inscrivez-vous</Text>
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
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: Layout.spacing.lg,
  },
  forgotPasswordText: {
    ...TextStyles.bodySmall,
    color: Colors.brandBlue[0],
  },
  loginButtonContainer: {
    marginBottom: Layout.spacing.lg,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: Layout.spacing.md,
  },
  registerText: {
    ...TextStyles.body,
    color: Colors.gray.dark,
  },
  registerLink: {
    ...TextStyles.body,
    color: Colors.brandBlue[0],
    fontWeight: "600",
  },
});
