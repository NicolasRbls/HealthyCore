import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import Colors from "../../constants/Colors";
import Layout from "../../constants/Layout";
import { TextStyles } from "../../constants/Fonts";
import Button from "../../components/ui/Button";
import { useRegistration } from "../../context/RegistrationContext";
import { router } from "expo-router";

export default function CompleteScreen() {
  const { completeRegistration, data, loading } = useRegistration();

  useEffect(() => {
    // Si l'utilisateur arrive directement sur cet écran sans avoir complété les étapes précédentes
    if (!data.firstName || !data.targetWeight || !data.activities) {
      Alert.alert(
        "Erreur",
        "Vous devez compléter toutes les étapes d'inscription",
        [
          {
            text: "OK",
            onPress: () => router.replace("/register/step1_profile" as any),
          },
        ]
      );
    }
  }, []);

  const handleCompleteRegistration = async () => {
    try {
      await completeRegistration();
      // La redirection est gérée dans le AuthContext
    } catch (err) {
      console.error("Erreur lors de la finalisation de l'inscription:", err);
    }
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.content}>
            <Image
              source={require("../../assets/images/registration-complete.png")}
              style={styles.image}
              resizeMode="contain"
            />

            <Text style={styles.title}>
              Bienvenue,{" "}
              {capitalizeFirstLetter(data.firstName || "Utilisateur")}
            </Text>

            <Text style={styles.description}>
              Votre profil est prêt ! Ensemble, nous allons atteindre vos
              objectifs de santé et de forme.
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              text="C'est parti !"
              onPress={handleCompleteRegistration}
              size="lg"
              fullWidth
              style={styles.button}
              loading={loading}
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
    padding: Layout.spacing.lg,
    justifyContent: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 260,
    height: 260,
    marginBottom: Layout.spacing.xl,
  },
  title: {
    ...TextStyles.h2,
    textAlign: "center",
    marginBottom: Layout.spacing.md,
  },
  description: {
    ...TextStyles.body,
    textAlign: "center",
    marginBottom: Layout.spacing.xl,
    color: Colors.gray.dark,
    paddingHorizontal: Layout.spacing.xl,
  },
  buttonContainer: {
    width: "100%",
    marginBottom: Layout.spacing.lg,
  },
  button: {
    width: "100%",
  },
});
