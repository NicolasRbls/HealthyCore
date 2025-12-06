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
    <Stack>
      <Stack.Screen
        name="nutrition-discover"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="search-products"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="scan-product"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="report"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
