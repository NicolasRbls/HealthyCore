import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../../constants/Colors";
import Layout from "../../../constants/Layout";
import { TextStyles } from "../../../constants/Fonts";
import Header from "../../../components/layout/Header";
import apiService from "../../../services/api.service";

// Types
interface Session {
  id: number;
  name: string;
  date: string;
  done: boolean;
  icon?: string;
  isDaySession?: boolean;
}

interface WeekDay {
  day: string;
  date: string;
  session: {
    id: number;
    name: string;
    order: number;
    completed: boolean;
  } | null;
}

export default function SportMonitoring() {
  const [currentProgram, setCurrentProgram] = useState<string>("");
  const [programDescription, setProgramDescription] = useState<string>("");
  const [todaySession, setTodaySession] = useState<Session | null>(null);
  const [weekSessions, setWeekSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSportData();
  }, []);

  const fetchSportData = async () => {
    setIsLoading(true);
    try {
      // Récupérer les deux données en parallèle pour de meilleures performances
      const [sportProgressData, todaySessionData] = await Promise.all([
        apiService.get("/data/programs/sport-progress"),
        apiService.get("/data/programs/today-session"),
      ]);

      // Obtenir la date du jour pour comparer
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split("T")[0]; // Format YYYY-MM-DD

      // Si l'utilisateur a un programme actif
      if (sportProgressData.activeProgram) {
        // Extraire le nom et la description du programme
        const fullName = sportProgressData.activeProgram.name;
        if (fullName.includes("|")) {
          const parts = fullName.split("|");
          setCurrentProgram(parts[0].trim());
          setProgramDescription(parts[1] ? parts[1].trim() : "");
        } else {
          setCurrentProgram(fullName);
        }

        // Extraire les données de suivi hebdomadaire
        if (
          sportProgressData.weeklySchedule &&
          sportProgressData.weeklySchedule.length > 0
        ) {
          // Traiter l'emploi du temps hebdomadaire
          const sessionList = sportProgressData.weeklySchedule
            .filter((day: WeekDay) => day.session !== null)
            .map((day: WeekDay) => {
              // Vérifier si c'est la séance du jour
              const isToday = day.date === todayStr;

              // Formater la date en format lisible
              const dayDate = new Date(day.date);
              dayDate.setHours(0, 0, 0, 0);
              const formattedDate = dayDate.toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "numeric",
              });

              return {
                id: day.session?.id,
                name: day.session?.name,
                date: formattedDate,
                done: day.session?.completed,
                icon: getSessionIconType(day.session.name),
                isDaySession: isToday,
              };
            });

          setWeekSessions(sessionList);
        }
      } else {
        // Réinitialiser les états si aucun programme actif
        setCurrentProgram("");
        setProgramDescription("");
        setWeekSessions([]);
      }

      // Traiter la séance du jour depuis todaySessionData
      if (todaySessionData.todaySession) {
        const todayDate = new Date();
        const formattedDate = todayDate.toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "numeric",
        });

        setTodaySession({
          id: todaySessionData.todaySession.id,
          name: todaySessionData.todaySession.name,
          date: formattedDate,
          done: todaySessionData.todaySession.completed || false,
          icon: getSessionIconType(todaySessionData.todaySession.name),
          isDaySession: true,
        });
      } else {
        setTodaySession(null);
      }
    } catch (error) {
      console.error("Error fetching sport data:", error);
      // En cas d'erreur, charger des données par défaut (vides)
      setCurrentProgram("");
      setProgramDescription("");
      setWeekSessions([]);
      setTodaySession(null);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchSportData();
    } finally {
      setRefreshing(false);
    }
  };

  // Helper function to determine icon type based on session name
  const getSessionIconType = (sessionName: string): string => {
    const name = sessionName.toLowerCase();
    if (name.includes("push") || name.includes("pectoraux")) return "barbell";
    if (name.includes("pull") || name.includes("dos")) return "body";
    if (
      name.includes("legs") ||
      name.includes("jambes") ||
      name.includes("cuisses")
    )
      return "run";
    return "fitness";
  };

  const toggleSessionDone = async (sessionId: number, event: any) => {
    // Stop event propagation to prevent navigation when clicking the switch
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }

    // Stocker l'état actuel
    const currentSessionDone =
      todaySession?.id === sessionId
        ? todaySession.done
        : weekSessions.find((s) => s.id === sessionId)?.done || false;

    // Pas besoin de mettre à jour l'UI si la session est déjà terminée
    if (currentSessionDone) {
      return; // On ne peut pas "décompléter" une session, donc on sort ici
    }

    // Mettre à jour l'UI immédiatement pour un retour utilisateur rapide
    if (todaySession && todaySession.id === sessionId) {
      setTodaySession({
        ...todaySession,
        done: true,
      });
    }

    setWeekSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === sessionId ? { ...session, done: true } : session
      )
    );
    try {
      // Appel API pour marquer la séance comme complétée
      await apiService.post(
        `/data/programs/sessions/${sessionId}/complete`,
        {}
      );

      // Rafraîchir les données pour confirmer que tout est à jour
      fetchSportData();
    } catch (error) {
      console.error("Error toggling session status:", error);

      // Revenir à l'état précédent en cas d'erreur
      if (todaySession && todaySession.id === sessionId) {
        setTodaySession({
          ...todaySession,
          done: currentSessionDone,
        });
      }

      setWeekSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.id === sessionId
            ? { ...session, done: currentSessionDone }
            : session
        )
      );

      Alert.alert(
        "Erreur",
        "Impossible de mettre à jour le statut de la séance"
      );
    }
  };

  // Navigate to session details
  const navigateToSessionDetails = (sessionId: number) => {
    router.push(`/user/sport/sessions/${sessionId}`);
  };

  // Helper function to get icon based on session type
  const getSessionIcon = (type: string) => {
    switch (type) {
      case "run":
        return <Ionicons name="walk-outline" size={24} color="#fff" />;
      case "body":
        return <Ionicons name="body-outline" size={24} color="#fff" />;
      case "barbell":
        return <Ionicons name="barbell-outline" size={24} color="#fff" />;
      default:
        return <Ionicons name="fitness-outline" size={24} color="#fff" />;
    }
  };

  // Session card component
  const SessionCard = ({ session }: { session: Session }) => (
    <TouchableOpacity
      style={[
        styles.sessionCard,
        session.isDaySession && !session.done ? styles.todaySessionCard : null,
      ]}
      onPress={() => navigateToSessionDetails(session.id)}
      activeOpacity={0.8}
    >
      <View style={styles.sessionRow}>
        <View
          style={[
            styles.sessionIcon,
            {
              backgroundColor: session.isDaySession
                ? Colors.secondary[0]
                : Colors.brandBlue[0],
            },
          ]}
        >
          {getSessionIcon(session.icon || "fitness")}
        </View>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionName}>
            {session.name}
            {session.isDaySession && !session.done && (
              <Text style={styles.todayBadge}> (Aujourd'hui)</Text>
            )}
          </Text>
          <Text style={styles.sessionDate}>{session.date}</Text>
        </View>
        <View style={styles.actionColumn}>
          <Switch
            value={session.done}
            onValueChange={(value) => {
              if (!session.done && session.isDaySession) {
                // Seulement si pas déjà complété et si c'est la séance du jour
                toggleSessionDone(session.id, { stopPropagation: () => {} });
              }
            }}
            trackColor={{ false: Colors.gray.light, true: Colors.secondary[0] }}
            thumbColor={Colors.white}
            ios_backgroundColor={Colors.gray.light}
            style={styles.sessionSwitch}
            disabled={session.done || !session.isDaySession} // Désactiver le switch si la session est déjà terminée ou si ce n'est pas la séance du jour
          />
          <Ionicons
            name="chevron-forward"
            size={18}
            color={Colors.gray.medium}
            style={styles.chevronIcon}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  // Loading placeholder (for when data is fetching)
  const PlaceholderCard = () => (
    <View style={[styles.sessionCard, styles.placeholderCard]}>
      <View style={styles.sessionRow}>
        <View style={[styles.sessionIcon, styles.placeholderIcon]} />
        <View style={styles.sessionInfo}>
          <View
            style={[styles.placeholderText, { width: "70%", height: 16 }]}
          />
          <View
            style={[
              styles.placeholderText,
              { width: "50%", height: 14, marginTop: 8 },
            ]}
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Suivi sportif"
        showBackButton
        onBackPress={() => router.back()}
        style={{ marginTop: Layout.spacing.md }}
      />

      {currentProgram && (
        <View style={styles.programBanner}>
          <Text style={styles.programName}>{currentProgram}</Text>
          {programDescription && (
            <Text style={styles.programDescription}>{programDescription}</Text>
          )}
        </View>
      )}

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
        <Text style={styles.sectionTitle}>Ma séance du jour</Text>
        {isLoading ? (
          <PlaceholderCard />
        ) : todaySession ? (
          <SessionCard session={todaySession} />
        ) : (
          <Text style={styles.noSessionText}>
            Aucune séance prévue aujourd'hui
          </Text>
        )}

        <Text style={styles.sectionTitle}>Ma semaine</Text>
        {isLoading ? (
          <>
            <PlaceholderCard />
            <PlaceholderCard />
            <PlaceholderCard />
          </>
        ) : weekSessions.length > 0 ? (
          weekSessions
            .filter((session) =>
              todaySession ? session.id !== todaySession.id : true
            ) // Filtrer pour exclure la séance du jour déjà affichée plus haut
            .map((session) => (
              <SessionCard key={session.id} session={session} />
            ))
        ) : (
          <Text style={styles.noSessionText}>
            Aucune séance programmée cette semaine
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
    marginBottom: Layout.spacing.md,
  },
  programBanner: {
    backgroundColor: "#6A0DAD", // Fond violet
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.sm,
  },
  programName: {
    ...TextStyles.bodyLarge,
    color: Colors.white,
    fontWeight: "600",
    marginBottom: 4,
  },
  programDescription: {
    ...TextStyles.caption,
    color: Colors.white,
    opacity: 0.9,
  },
  sectionTitle: {
    ...TextStyles.h4,
    marginBottom: Layout.spacing.md,
    marginTop: Layout.spacing.md,
  },
  sessionCard: {
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.md,
    padding: Layout.spacing.md,
    ...Layout.elevation.sm,
  },
  todaySessionCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary[0],
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sessionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.brandBlue[0],
    alignItems: "center",
    justifyContent: "center",
    marginRight: Layout.spacing.md,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    ...TextStyles.body,
    fontWeight: "600",
  },
  todayBadge: {
    color: Colors.secondary[0],
    fontWeight: "700",
  },
  sessionDate: {
    ...TextStyles.caption,
    color: Colors.gray.dark,
    marginTop: 2,
  },
  actionColumn: {
    flexDirection: "row",
    alignItems: "center",
  },
  sessionSwitch: {
    marginRight: Layout.spacing.xs,
  },
  chevronIcon: {
    marginLeft: Layout.spacing.xs,
  },
  placeholderCard: {
    backgroundColor: Colors.gray.ultraLight,
  },
  placeholderIcon: {
    backgroundColor: Colors.gray.light,
  },
  placeholderText: {
    backgroundColor: Colors.gray.light,
    borderRadius: 4,
  },
  noSessionText: {
    ...TextStyles.body,
    color: Colors.gray.dark,
    textAlign: "center",
    padding: Layout.spacing.lg,
    fontStyle: "italic",
  },
});
