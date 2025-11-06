import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import Colors from "../../../constants/Colors";
import Layout from "../../../constants/Layout";
import { TextStyles } from "../../../constants/Fonts";
import Header from "../../../components/layout/Header";
import userService, {
  UnlockedBadge,
  LockedBadge,
} from "../../../services/user.service";

export default function BadgeMonitoring() {
  const [unlockedBadges, setUnlockedBadges] = useState<UnlockedBadge[]>([]);
  const [lockedBadges, setLockedBadges] = useState<LockedBadge[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    fetchBadges();
    // Check for new badges when the component mounts
    checkNewBadges();
  }, []);

  const fetchBadges = async () => {
    setIsLoading(true);
    try {
      const response = await userService.getUserBadges();
      setUnlockedBadges(response.unlockedBadges);
      setLockedBadges(response.lockedBadges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      Alert.alert("Erreur", "Impossible de charger les badges.");
    } finally {
      setIsLoading(false);
    }
  };

  const checkNewBadges = async () => {
    try {
      const response = await userService.checkNewBadges();
      if (response.newBadges.length > 0) {
        // Show alert with new badges
        Alert.alert(
          "Nouveaux badges débloqués !",
          `Vous avez débloqué ${response.newBadges.length} nouveau(x) badge(s) !`,
          [
            {
              text: "Super !",
              onPress: fetchBadges, // Refresh badges after user acknowledges
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error checking new badges:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchBadges();
      await checkNewBadges();
    } finally {
      setRefreshing(false);
    }
  };

  // Format a date to a readable string
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);

    // Dictionary for month translations
    const monthsTranslation: Record<string, string> = {
      January: "Janvier",
      February: "Février",
      March: "Mars",
      April: "Avril",
      May: "Mai",
      June: "Juin",
      July: "Juillet",
      August: "Août",
      September: "Septembre",
      October: "Octobre",
      November: "Novembre",
      December: "Décembre",
    };

    const day = date.getDate();
    const monthEnglish = date.toLocaleString("default", { month: "long" });
    const monthFrench = monthsTranslation[monthEnglish];
    const year = date.getFullYear();

    return `Obtenu le ${day} ${monthFrench} ${year}`;
  };

  // Helper function to get badge image
  const getBadgeImage = (path: string) => {
    // Define mapping for image paths
    const imageMapping: Record<string, any> = {
      "/assets/images/badges/1-premier-aliment.png": require("@/assets/images/badges/1-premier-aliment.png"),
      "/assets/images/badges/2-premiere-seance.png": require("@/assets/images/badges/2-premiere-seance.png"),
      "/assets/images/badges/3-serie-un-jour.png": require("@/assets/images/badges/3-serie-un-jour.png"),
      "/assets/images/badges/4-serie-sept-jours.png": require("@/assets/images/badges/4-serie-sept-jours.png"),
    };

    return imageMapping[path] || null;
  };

  // Badge item component for unlocked badges
  const UnlockedBadgeItem = ({ badge }: { badge: UnlockedBadge }) => (
    <View style={styles.badgeCard}>
      <View style={styles.badgeImageContainer}>
        <Image
          source={getBadgeImage(badge.image)}
          style={styles.badgeImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.badgeInfo}>
        <Text style={styles.badgeName}>{badge.name}</Text>
        <Text style={styles.badgeDescription}>{badge.description}</Text>
        <Text style={styles.badgeDate}>{formatDate(badge.dateObtained)}</Text>
      </View>
    </View>
  );

  // Badge item component for locked badges
  const LockedBadgeItem = ({ badge }: { badge: LockedBadge }) => (
    <View style={styles.badgeCard}>
      <View style={[styles.badgeImageContainer, styles.badgeNotObtained]}>
        <Image
          source={getBadgeImage(badge.image)}
          style={styles.badgeImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.badgeInfo}>
        <Text style={[styles.badgeName, styles.badgeTextNotObtained]}>
          {badge.name}
        </Text>
        <Text style={[styles.badgeDescription, styles.badgeTextNotObtained]}>
          {badge.description}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Mes badges"
        showBackButton
        onBackPress={() => router.back()}
        style={{ marginTop: Layout.spacing.md }}
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.brandBlue[0]]}
            tintColor={Colors.brandBlue[0]}
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.brandBlue[0]} />
            <Text style={styles.loadingText}>Chargement des badges...</Text>
          </View>
        ) : (
          <>
            {unlockedBadges.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Badges débloqués</Text>
                <View style={styles.badgesContainer}>
                  {unlockedBadges.map((badge) => (
                    <UnlockedBadgeItem key={badge.id} badge={badge} />
                  ))}
                </View>
              </View>
            )}

            {lockedBadges.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Badges à débloquer</Text>
                <View style={styles.badgesContainer}>
                  {lockedBadges.map((badge) => (
                    <LockedBadgeItem key={badge.id} badge={badge} />
                  ))}
                </View>
              </View>
            )}

            {unlockedBadges.length === 0 && lockedBadges.length === 0 && (
              <Text style={styles.noBadgesText}>
                Aucun badge disponible pour le moment
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    padding: Layout.spacing.lg,
  },
  subtitle: {
    ...TextStyles.body,
    color: Colors.gray.dark,
    marginBottom: Layout.spacing.xl,
    textAlign: "center",
  },
  sectionContainer: {
    marginBottom: Layout.spacing.xl,
  },
  sectionTitle: {
    ...TextStyles.h4,
    marginBottom: Layout.spacing.md,
  },
  badgesContainer: {
    flex: 1,
  },
  badgeCard: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.md,
    padding: Layout.spacing.md,
    ...Layout.elevation.sm,
  },
  badgeImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.gray.ultraLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Layout.spacing.md,
    overflow: "hidden",
  },
  badgeNotObtained: {
    opacity: 0.5,
  },
  badgeImage: {
    width: "100%",
    height: "100%",
  },
  badgeInfo: {
    flex: 1,
    justifyContent: "center",
  },
  badgeName: {
    ...TextStyles.body,
    fontWeight: "600",
    marginBottom: 4,
  },
  badgeTextNotObtained: {
    color: Colors.gray.medium,
  },
  badgeDescription: {
    ...TextStyles.caption,
    color: Colors.gray.dark,
    marginBottom: 4,
  },
  badgeDate: {
    ...TextStyles.caption,
    color: Colors.secondary[0],
    fontStyle: "italic",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Layout.spacing.xl,
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.gray.dark,
    marginTop: Layout.spacing.md,
  },
  noBadgesText: {
    ...TextStyles.body,
    color: Colors.gray.dark,
    textAlign: "center",
    padding: Layout.spacing.lg,
    fontStyle: "italic",
  },
});
