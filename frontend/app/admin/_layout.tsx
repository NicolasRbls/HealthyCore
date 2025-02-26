import { Stack, Redirect } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout() {
  const { isAuthenticated, loading, user } = useAuth();

  // Si l'authentification est en cours de chargement, ne rien rendre
  if (loading) {
    return null;
  }

  // Dans admin/_layout.tsx
  if (!isAuthenticated) {
    return <Redirect href={"/welcome" as any} />;
  }

  if (user?.role !== "admin") {
    return <Redirect href={"/user/dashboard" as any} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
    </Stack>
  );
}
