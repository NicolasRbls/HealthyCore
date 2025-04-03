import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import Colors from "../../../constants/Colors";
import Layout from "../../../constants/Layout";
import { TextStyles } from "../../../constants/Fonts";
import Header from "../../../components/layout/Header";

// Import temp data
import tempData from "../../../assets/temp.json";

// Types
interface Badge {
  id: number;
  name: string;
  description: string;
  imagePath: string;
  obtained: boolean;
  obtainedDate?: Date;
}

export default function BadgeMonitoring() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // In a real app, you would fetch this data with:
    // GET /api/user/badges
    fetchBadges();
  }, []);

  const fetchBadges = () => {
    setIsLoading(true);

    try {
      // Get user badges from temp.json
      const userBadges = tempData.badges_utilisateurs_exemple || [];

      // Map all badges
      const allBadges: Badge[] = tempData.badges.map((badge) => {
        // Check if user has this badge
        const userBadge = userBadges.find(
          (ub) => ub.id_badge === badge.id_badge
        );

        return {
          id: badge.id_badge,
          name: badge.nom,
          description: badge.description,
          imagePath: badge.image,
          obtained: !!userBadge,
          obtainedDate: userBadge
            ? new Date(userBadge.date_obtention)
            : undefined,
        };
      });

      setBadges(allBadges);
    } catch (error) {
      console.error("Error fetching badges:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Dictionnaire des mois en anglais et français
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

  // Helper function to format date
  const formatDate = (date: Date): string => {
    const day = date.getDate();
    const monthEnglish = date.toLocaleString("default", { month: "long" }); // Mois en anglais
    const monthFrench = monthsTranslation[monthEnglish]; // Mois en français via le dictionnaire
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

  // Badge item component
  const BadgeItem = ({ badge }: { badge: Badge }) => (
    <View style={styles.badgeCard}>
      <View
        style={[
          styles.badgeImageContainer,
          !badge.obtained && styles.badgeNotObtained,
        ]}
      >
        <Image
          source={getBadgeImage(badge.imagePath)}
          style={styles.badgeImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.badgeInfo}>
        <Text
          style={[
            styles.badgeName,
            !badge.obtained && styles.badgeTextNotObtained,
          ]}
        >
          {badge.name}
        </Text>

        <Text
          style={[
            styles.badgeDescription,
            !badge.obtained && styles.badgeTextNotObtained,
          ]}
        >
          {badge.description}
        </Text>

        {badge.obtained && badge.obtainedDate && (
          <Text style={styles.badgeDate}>{formatDate(badge.obtainedDate)}</Text>
        )}
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

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Vos récompenses pour vos accomplissements
        </Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.brandBlue[0]} />
            <Text style={styles.loadingText}>Chargement des badges...</Text>
          </View>
        ) : badges.length > 0 ? (
          <View style={styles.badgesContainer}>
            {badges.map((badge) => (
              <BadgeItem key={badge.id} badge={badge} />
            ))}
          </View>
        ) : (
          <Text style={styles.noBadgesText}>
            Aucun badge disponible pour le moment
          </Text>
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
  badgesContainer: {
    flex: 1,
  },
  badgeCard: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.lg,
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
