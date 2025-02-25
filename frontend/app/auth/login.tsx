import React, { useState } from "react";
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
import { router } from "expo-router";
import Separator from "@/components/Separator";
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login, loading } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    try {
      await login(email, password);
      // La redirection est gérée dans le AuthContext
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      Alert.alert(
        "Erreur de connexion",
        error.message || "Email ou mot de passe incorrect. Veuillez réessayer."
      );
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert("Information", "Ça ne marche pas pour l'instant, déso");
  };

  const handleFacebookLogin = () => {
    Alert.alert("Information", "Ça ne marche pas pour l'instant, déso");
  };

  const navigateToForgotPassword = () => {
    Alert.alert("Information", "Ça ne marche pas pour l'instant, déso");
  };

  const navigateToRegister = () => {
    router.push("/auth/register");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Text style={styles.welcomeText}>Salut,</Text>
            <Text style={styles.titleText}>Bon retour !</Text>
          </View>
          <View style={styles.formContainer}>
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

            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={navigateToForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>
                Mot de passe oublié ?
              </Text>
            </TouchableOpacity>

            <Button
              text={loading ? "Connexion..." : "Se connecter"}
              onPress={handleLogin}
              style={styles.loginButtonContainer}
            />

            <Separator />

            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleGoogleLogin}
                disabled={loading}
              >
                <Image
                  source={require("@/assets/images/google-icon.png")}
                  style={styles.socialIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleFacebookLogin}
                disabled={loading}
              >
                <Image
                  source={require("@/assets/images/facebook-icon.png")}
                  style={styles.socialIcon}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Pas de compte ? </Text>
              <TouchableOpacity onPress={navigateToRegister} disabled={loading}>
                <Text style={styles.registerLink}>Inscrivez-vous</Text>
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
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: Colors.gray.dark,
    fontSize: 14,
  },
  loginButtonContainer: {
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
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  registerText: {
    color: Colors.gray.dark,
    fontSize: 16,
  },
  registerLink: {
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
});
