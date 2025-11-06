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
      <Stack.Screen name="index" options={{ title: "Nutrition" }} />
      <Stack.Screen
        name="nutrition-discover"
        options={{ title: "Découvrir des Aliments" }}
      />
      <Stack.Screen
        name="recipes/[id]"
        options={{ title: "Détails Recette" }}
      />
      <Stack.Screen
        name="products/[id]"
        options={{ title: "Détails Produit" }}
      />
      <Stack.Screen
        name="search-products"
        options={{ title: "Recherche Produit" }}
      />
    </Stack>
  );
}
