import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../../constants/Colors";
import Layout from "../../../constants/Layout";
import { TextStyles } from "../../../constants/Fonts";
import Header from "../../../components/layout/Header";

// Import temp data
import tempData from "../../../assets/temp.json";

// Types
interface Session {
  id: number;
  name: string;
  date: string;
  done: boolean;
  icon?: string;
}

export default function SportMonitoring() {
  const [currentProgram, setCurrentProgram] = useState<string>("");
  const [todaySession, setTodaySession] = useState<Session | null>(null);
  const [weekSessions, setWeekSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // In a real app, you would fetch this data with:
    // GET /api/data/programs/sport-progress
    fetchSportData();
  }, []);

  const fetchSportData = () => {
    setIsLoading(true);

    try {
      // Get program data from temp.json
      const userData = tempData.user_exemple;

      // Assuming the user is enrolled in the first program
      const program = tempData.programmes[0]; // PPL débutant

      if (program) {
        // Set program name - using the part before | as the short name
        const programName = program.nom.split("|")[0];
        setCurrentProgram(programName);

        // Get today's date and format it to YYYY-MM-DD for comparison
        const today = new Date();
        const todayFormatted = today.toISOString().split("T")[0];

        // Find sessions in the program
        const programSessions = program.seances;
        const allSessions: Session[] = [];

        // Get all seances data
        const seancesData = tempData.seances;

        // Get sport tracking data
        const sportTrackings = tempData.suivis_sportifs_exemple;

        // Find today's tracking if any
        const todayTracking = sportTrackings.find((tracking) => {
          const trackingDate = new Date(tracking.date)
            .toISOString()
            .split("T")[0];
          return trackingDate === todayFormatted;
        });

        // Process sessions from the program
        programSessions.forEach((programSession, index) => {
          const seance = seancesData.find(
            (s) => s.id_seance === programSession.id_seance
          );

          if (seance) {
            // Check if this session is done based on tracking data
            const isDone = sportTrackings.some(
              (tracking) => tracking.id_seance === seance.id_seance
            );

            // For demo purposes, assign different dates
            const dateOptions = [
              "Aujourd'hui",
              "Hier",
              "8 avril",
              "10 avril",
              "12 avril",
            ];
            // If it's in sportTrackings, use the actual date
            let sessionDate = dateOptions[index % dateOptions.length];
            const tracking = sportTrackings.find(
              (t) => t.id_seance === seance.id_seance
            );
            if (tracking) {
              const date = new Date(tracking.date);
              if (date.toISOString().split("T")[0] === todayFormatted) {
                sessionDate = "Aujourd'hui";
              } else {
                sessionDate = date.toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                });
              }
            }

            // Create session object
            const session: Session = {
              id: seance.id_seance,
              name: seance.nom,
              date: sessionDate,
              done: isDone,
              icon: getSessionIconType(seance.nom),
            };

            // If this is today's session (based on tracking), set it separately
            if (todayTracking && todayTracking.id_seance === seance.id_seance) {
              setTodaySession(session);
            }

            allSessions.push(session);
          }
        });

        // If no session was marked for today but we have sessions, show the first undone session as today's
        if (!todaySession && allSessions.length > 0) {
          const nextSession = allSessions.find((s) => !s.done);
          if (nextSession) {
            setTodaySession({ ...nextSession, date: "Aujourd'hui" });
          } else {
            // If all sessions are done, use the first one
            setTodaySession({ ...allSessions[0], date: "Aujourd'hui" });
          }
        }

        // Set all sessions for the week
        setWeekSessions(allSessions);
      }
    } catch (error) {
      console.error("Error fetching sport data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to determine icon type based on session name
  const getSessionIconType = (sessionName: string): string => {
    const name = sessionName.toLowerCase();
    if (name.includes("push") || name.includes("pectoraux")) return "barbell";
    if (name.includes("pull") || name.includes("dos")) return "body";
    if (name.includes("legs") || name.includes("jambes")) return "run";
    return "fitness";
  };

  const toggleSessionDone = async (sessionId: number, event: any) => {
    // Stop event propagation to prevent navigation when clicking the switch
    event.stopPropagation();

    // In a real app, you would make an API call:
    // POST /api/data/programs/sessions/:sessionId/complete

    try {
      // Update session state
      if (todaySession && todaySession.id === sessionId) {
        setTodaySession({
          ...todaySession,
          done: !todaySession.done,
        });
      }

      setWeekSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.id === sessionId
            ? { ...session, done: !session.done }
            : session
        )
      );

      // When toggling session done status, we'd also update objectives
      // This would be handled by the backend in a real app
    } catch (error) {
      console.error("Error toggling session status:", error);
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
      style={styles.sessionCard}
      onPress={() => navigateToSessionDetails(session.id)}
      activeOpacity={0.8}
    >
      <View style={styles.sessionRow}>
        <View
          style={[styles.sessionIcon, { backgroundColor: Colors.brandBlue[0] }]}
        >
          {getSessionIcon(session.icon || "fitness")}
        </View>

        <View style={styles.sessionInfo}>
          <Text style={styles.sessionName}>{session.name}</Text>
          <Text style={styles.sessionDate}>{session.date}</Text>
        </View>

        <View style={styles.actionColumn}>
          <Switch
            value={session.done}
            onValueChange={(value) =>
              toggleSessionDone(session.id, { stopPropagation: () => {} })
            }
            trackColor={{ false: Colors.gray.light, true: Colors.secondary[0] }}
            thumbColor={session.done ? Colors.white : Colors.white}
            ios_backgroundColor={Colors.gray.light}
            style={styles.sessionSwitch}
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
        </View>
      )}

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
          weekSessions.map((session) => (
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
  },
  programBanner: {
    backgroundColor: Colors.brandBlue[1],
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.sm,
  },
  programName: {
    ...TextStyles.bodyLarge,
    color: Colors.white,
    fontWeight: "600",
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
