import { Stack, Redirect } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function UserLayout() {
  const { isAuthenticated, loading, user } = useAuth();

  // Si l'authentification est en cours de chargement, ne rien rendre
  if (loading) {
    return null;
  }

  // Si non authentifié, rediriger vers l'écran de bienvenue
  if (!isAuthenticated) {
    return <Redirect href={"/welcome" as any} />;
  }

  // Si authentifié en tant qu'admin, rediriger vers le dashboard admin
  if (user?.role === "admin") {
    return <Redirect href={"/admin/dashboard" as any} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
    </Stack>
  );
}
