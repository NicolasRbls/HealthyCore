import { Stack } from "expo-router";

export default function DashboardLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="nutrition-monitoring" />
      <Stack.Screen name="sport-monitoring" />
      <Stack.Screen name="badge-monitoring" />
    </Stack>
  );
}
