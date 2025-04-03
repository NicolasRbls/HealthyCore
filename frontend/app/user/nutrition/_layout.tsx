import React from "react";
import { Stack, Redirect } from "expo-router";
import { useAuth } from "../../../context/AuthContext";

export default function NutritionLayout() {
  const { isAuthenticated, loading, user } = useAuth();

  // If authentication is loading, don't render anything
  if (loading) {
    return null;
  }

  // If not authenticated, redirect to the welcome screen
  if (!isAuthenticated) {
    return <Redirect href={"/welcome" as any} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="nutrition-discover" />
      <Stack.Screen name="recipes/[id]" />
      <Stack.Screen name="products/[id]" />
    </Stack>
  );
}
