import { Stack, Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout() {
  const { isAuthenticated, loading } = useAuth();

  // Si l'authentification est en cours de chargement, ne rien rendre
  if (loading) {
    return null;
  }

  // Si l'utilisateur n'est pas authentifié, rediriger vers la page d'accueil
  if (!isAuthenticated) {
    return <Redirect href="/" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="admin/index" />
      <Stack.Screen name="user/index" />
    </Stack>
  );
}
