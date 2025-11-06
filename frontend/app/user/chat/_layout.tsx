import { Stack } from "expo-router";
import { useAuth } from "../../../context/AuthContext";
import { Redirect } from "expo-router";

export default function ChatLayout() {
  const { isAuthenticated, loading } = useAuth();

  // Si l'authentification est en cours, ne rien afficher
  if (loading) {
    return null;
  }

  // Si l'utilisateur n'est pas authentifié, rediriger vers /welcome
  if (!isAuthenticated) {
    return <Redirect href={"/welcome" as any} />;
  }

  // Stack Navigator pour l'onglet Chat
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      {/* Écran principal du chat */}
      <Stack.Screen name="index" />

    </Stack>
  );
}
