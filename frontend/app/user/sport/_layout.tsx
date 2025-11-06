import React from "react";
import { Stack, Redirect } from "expo-router";
import { useAuth } from "../../../context/AuthContext";

export default function SportLayout() {
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
      <Stack.Screen name="sport-discover" />
      <Stack.Screen name="programs" />
      <Stack.Screen name="sessions" />
      <Stack.Screen name="index" />
    </Stack>
  );
}
