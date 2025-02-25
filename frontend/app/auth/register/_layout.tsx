import { Stack } from "expo-router";

export default function RegisterLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="physical" />
      <Stack.Screen name="sedentary" />
      <Stack.Screen name="target-weight" />
      <Stack.Screen name="nutrition-plan" />
      <Stack.Screen name="diet" />
      <Stack.Screen name="activities" />
      <Stack.Screen name="sessions" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}
