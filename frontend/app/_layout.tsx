import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../context/AuthContext";
import { RegistrationProvider } from "../context/RegistrationContext";
import StatusBar from "../components/ui/StatusBar";
import Colors from "../constants/Colors";

// Empêcher l'écran de splash de se cacher automatiquement
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Chargement des polices personnalisées
  const [fontsLoaded, error] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
  });

  useEffect(() => {
    // Cacher l'écran de splash une fois les polices chargées
    if (fontsLoaded || error) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <AuthProvider>
        <RegistrationProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "slide_from_right",
            }}
          />
        </RegistrationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
