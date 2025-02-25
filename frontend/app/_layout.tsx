import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider } from "@/context/AuthContext";
import { RegistrationProvider } from "@/context/RegistrationContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || error) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <AuthProvider>
      <RegistrationProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </RegistrationProvider>
    </AuthProvider>
  );
}
