import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import Colors from "@/constants/Colors";

export default function DashboardIndex() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin") {
        router.replace("/dashboard/admin" as any);
      } else {
        router.replace("/dashboard/user" as any);
      }
    }
  }, [user, loading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.brandBlue[0]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
});
