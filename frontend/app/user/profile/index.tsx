import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../../constants/Colors";
import Layout from "../../../constants/Layout";
import { TextStyles } from "../../../constants/Fonts";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import { useAuth } from "../../../context/AuthContext";
import Header from "../../../components/layout/Header";
import WeightUpdateReminder from "../../../components/ui/WeightUpdateReminder";
import userService from "../../../services/user.service";
import authService from "../../../services/auth.service";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [progressStats, setProgressStats] = useState<any>(null);

  // Charger les données du profil
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger le profil utilisateur
      const profileData = await userService.getUserProfile();
      setUserData(profileData);

      // Charger les statistiques de progression
      try {
        const stats = await userService.getProgressStats("month");
        setProgressStats(stats);
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du profil:", error);
      Alert.alert("Erreur", "Impossible de charger les informations du profil");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      await logout();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors de la déconnexion. Veuillez réessayer."
      );
    }
  };

  const navigateToProgress = () => {
    router.push("/user/profile/progress" as any);
  };

  const navigateToBadges = () => {
    router.push("/user/dashboard/badge-monitoring" as any);
  };

  const navigateToEditProfile = () => {
    router.push("/user/profile/edit" as any);
  };

  // Déterminer le type d'objectif
  const getWeightGoalType = () => {
    if (!userData || !userData.metrics) return "";
    const currentWeight = userData.metrics.currentWeight;
    const targetWeight = userData.metrics.targetWeight;

    if (targetWeight < currentWeight) return "Perte de poids";
    if (targetWeight > currentWeight) return "Prise de poids";
    return "Maintien de poids";
  };

  // Helper to get BMI category
  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return "Maigreur";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Surpoids";
    return "Obésité";
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Profil" style={{ marginTop: Layout.spacing.md }} />

      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.brandBlue[0]]}
            tintColor={Colors.brandBlue[0]}
          />
        }
      >
        <View style={styles.container}>
          {/* Weight Update Reminder */}
          <WeightUpdateReminder onWeightUpdated={loadData} />

          {/* Section Profile Avatar et Infos Principales */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {userData?.user?.firstName?.[0] || "?"}
                  {userData?.user?.lastName?.[0] || "?"}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>
                  {userData?.user?.firstName || "Utilisateur"}{" "}
                  {userData?.user?.lastName || ""}
                </Text>
                <Text style={styles.userGoal}>{getWeightGoalType()}</Text>
              </View>
            </View>
          </View>

          {/* Métriques principales */}
          <View style={styles.metricsContainer}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {userData?.metrics?.currentHeight || "-"}cm
              </Text>
              <Text style={styles.metricLabel}>Taille</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {userData?.metrics?.currentWeight || "-"}kg
              </Text>
              <Text style={styles.metricLabel}>Poids</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {userData?.user?.age || "-"} ans
              </Text>
              <Text style={styles.metricLabel}>Âge</Text>
            </View>
          </View>

          {/* Informations du compte */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Compte</Text>
            <View style={styles.accountItem}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={Colors.gray.dark}
              />
              <Text style={styles.accountValue}>
                {userData?.user?.email || "-"}
              </Text>
            </View>
            <View style={styles.accountItem}>
              <Ionicons
                name="person-outline"
                size={20}
                color={Colors.gray.dark}
              />
              <Text style={styles.accountValue}>
                {userData?.user?.gender === "H"
                  ? "Homme"
                  : userData?.user?.gender === "F"
                  ? "Femme"
                  : "Non spécifié"}
              </Text>
            </View>
            <View style={styles.accountItem}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={Colors.gray.dark}
              />
              <Text style={styles.accountValue}>
                {userData?.user?.birthDate
                  ? new Date(userData.user.birthDate).toLocaleDateString(
                      "fr-FR",
                      {
                        day: "numeric",
                        month: "numeric",
                        year: "numeric",
                      }
                    )
                  : "-"}
              </Text>
            </View>
          </Card>

          {/* Section Objectifs */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Objectifs et préférences</Text>
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Poids cible</Text>
              <Text style={styles.goalValue}>
                {userData?.metrics?.targetWeight || "-"} kg
              </Text>
            </View>
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Calories quotidiennes</Text>
              <Text style={styles.goalValue}>
                {userData?.metrics?.dailyCalories || "-"} kcal
              </Text>
            </View>
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>IMC actuel</Text>
              <Text style={styles.goalValue}>
                {userData?.metrics?.bmi
                  ? `${userData.metrics.bmi} (${getBmiCategory(
                      userData.metrics.bmi
                    )})`
                  : "-"}
              </Text>
            </View>
            <View style={styles.goalItem}>
              <Text style={styles.goalLabel}>Séances par semaine</Text>
              <Text style={styles.goalValue}>
                {userData?.metrics?.sessionsPerWeek || "-"}
              </Text>
            </View>
          </Card>

          {/* Progress Stats Card */}
          {progressStats && progressStats.weight && (
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Progression ce mois-ci</Text>

              {/* Weight Change */}
              <View style={styles.progressItem}>
                <View style={styles.progressIconContainer}>
                  <Ionicons
                    name={
                      progressStats.weight.trend === "ascending"
                        ? "trending-up"
                        : "trending-down"
                    }
                    size={18}
                    color={Colors.white}
                  />
                </View>
                <View style={styles.progressTextContainer}>
                  <Text style={styles.progressTitle}>Évolution du poids</Text>
                  <Text style={styles.progressValue}>
                    {progressStats.weight.change > 0 ? "+" : ""}
                    {progressStats.weight.change} kg (
                    {progressStats.weight.changePercentage}%)
                  </Text>
                </View>
              </View>

              {/* Nutrition */}
              <View style={styles.progressItem}>
                <View
                  style={[
                    styles.progressIconContainer,
                    { backgroundColor: Colors.secondary[0] },
                  ]}
                >
                  <Ionicons name="restaurant" size={18} color={Colors.white} />
                </View>
                <View style={styles.progressTextContainer}>
                  <Text style={styles.progressTitle}>Nutrition</Text>
                  <Text style={styles.progressValue}>
                    {progressStats.nutrition.goalCompletionRate}% de suivi
                  </Text>
                </View>
              </View>

              {/* Activity */}
              <View style={styles.progressItem}>
                <View
                  style={[
                    styles.progressIconContainer,
                    { backgroundColor: Colors.plan.athlete.primary },
                  ]}
                >
                  <Ionicons name="fitness" size={18} color={Colors.white} />
                </View>
                <View style={styles.progressTextContainer}>
                  <Text style={styles.progressTitle}>Activité sportive</Text>
                  <Text style={styles.progressValue}>
                    {progressStats.activity.completedSessions} séances (
                    {progressStats.activity.goalCompletionRate}%)
                  </Text>
                </View>
              </View>

              {/* Streak */}
              <View style={styles.progressItem}>
                <View
                  style={[
                    styles.progressIconContainer,
                    { backgroundColor: Colors.success },
                  ]}
                >
                  <Ionicons name="flame" size={18} color={Colors.white} />
                </View>
                <View style={styles.progressTextContainer}>
                  <Text style={styles.progressTitle}>Série en cours</Text>
                  <Text style={styles.progressValue}>
                    {progressStats.overview.streakDays} jours consécutifs
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.progressDetailsButton}
                onPress={navigateToProgress}
              >
                <Text style={styles.progressDetailsText}>Voir les détails</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={Colors.brandBlue[0]}
                />
              </TouchableOpacity>
            </Card>
          )}

          {/* Liens vers d'autres sections */}
          <View style={styles.buttonContainer}>
            <Button
              text="Voir ma progression"
              onPress={navigateToProgress}
              leftIcon="trending-up-outline"
              style={styles.button}
            />
            <Button
              text="Mes badges"
              onPress={navigateToBadges}
              leftIcon="ribbon-outline"
              variant="outline"
              style={styles.button}
            />
            <Button
              text="Modifier mon profil"
              onPress={navigateToEditProfile}
              leftIcon="create-outline"
              variant="outline"
              style={styles.button}
            />
            <Button
              text="Se déconnecter"
              onPress={handleLogout}
              leftIcon="log-out-outline"
              variant="ghost"
              style={styles.button}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: Layout.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.gray.dark,
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Layout.spacing.md,
  },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.brandBlue[1],
    justifyContent: "center",
    alignItems: "center",
    marginRight: Layout.spacing.md,
  },
  avatarText: {
    ...TextStyles.h2,
    color: Colors.white,
  },
  profileInfo: {
    flexDirection: "column",
  },
  userName: {
    ...TextStyles.h3,
    marginBottom: 2,
  },
  userGoal: {
    ...TextStyles.body,
    color: Colors.gray.dark,
  },
  editButton: {
    backgroundColor: Colors.brandBlue[0],
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.pill,
  },
  editButtonText: {
    ...TextStyles.buttonText,
    fontSize: 14,
    color: Colors.white,
  },
  metricsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
    ...Layout.elevation.sm,
  },
  metricItem: {
    alignItems: "center",
    flex: 1,
  },
  metricValue: {
    ...TextStyles.h4,
    color: Colors.brandBlue[0],
  },
  metricLabel: {
    ...TextStyles.bodySmall,
    color: Colors.gray.dark,
    marginTop: 2,
  },
  sectionCard: {
    marginBottom: Layout.spacing.lg,
    padding: Layout.spacing.md,
  },
  sectionTitle: {
    ...TextStyles.h4,
    marginBottom: Layout.spacing.md,
  },
  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.ultraLight,
  },
  accountValue: {
    ...TextStyles.body,
    marginLeft: Layout.spacing.md,
  },
  goalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.ultraLight,
  },
  goalLabel: {
    ...TextStyles.body,
    color: Colors.gray.dark,
  },
  goalValue: {
    ...TextStyles.body,
    fontWeight: "600",
  },
  buttonContainer: {
    marginTop: Layout.spacing.md,
  },
  button: {
    marginBottom: Layout.spacing.md,
  },
  progressItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Layout.spacing.md,
  },
  progressIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.brandBlue[0],
    justifyContent: "center",
    alignItems: "center",
    marginRight: Layout.spacing.md,
  },
  progressTextContainer: {
    flex: 1,
  },
  progressTitle: {
    ...TextStyles.body,
    fontWeight: "600",
  },
  progressValue: {
    ...TextStyles.bodySmall,
    color: Colors.gray.dark,
  },
  progressDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray.ultraLight,
  },
  progressDetailsText: {
    ...TextStyles.body,
    color: Colors.brandBlue[0],
    marginRight: Layout.spacing.xs,
  },
});
