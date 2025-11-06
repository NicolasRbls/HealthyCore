import { Stack } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Redirect } from "expo-router";

export default function AuthLayout() {
  const { isAuthenticated, loading } = useAuth();

  // Redirection si déjà authentifié
  if (!loading && isAuthenticated) {
    return <Redirect href="/" />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
