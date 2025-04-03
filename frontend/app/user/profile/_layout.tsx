import { Stack } from "expo-router";
import { useAuth } from "../../../context/AuthContext";
import { Redirect } from "expo-router";

export default function ProfileLayout() {
  const { isAuthenticated, loading, user } = useAuth();

  // Si l'authentification est en cours de chargement, ne rien rendre
  if (loading) {
    return null;
  }

  // Si non authentifié, rediriger vers l'écran de bienvenue
  if (!isAuthenticated) {
    return <Redirect href={"/welcome" as any} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="progress" />
    </Stack>
  );
}
