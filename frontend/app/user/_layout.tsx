import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import { useAuth } from "../../context/AuthContext";
import { Redirect } from "expo-router";

export default function UserLayout() {
  const { isAuthenticated, loading, user } = useAuth();

  // If authentication is loading, don't render anything
  if (loading) {
    return null;
  }

  // Redirect to welcome screen if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/welcome" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.brandBlue[0],
        tabBarInactiveTintColor: Colors.gray.medium,
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.gray.ultraLight,
          height: 60,
          paddingBottom: 5, // Réduit l'espace sous les icônes
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="nutrition"
        options={{
          title: "Nutrition",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "restaurant" : "restaurant-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="sport"
        options={{
          title: "Sport",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "barbell" : "barbell-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
