import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import Colors from "../../../../constants/Colors";
import Layout from "../../../../constants/Layout";
import { TextStyles } from "../../../../constants/Fonts";
import Header from "../../../../components/layout/Header";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import imageMapping from "../../../../constants/imageMapping";

// Import temp data
import tempData from "../../../../assets/temp.json";

// Type definitions
interface Tag {
  id_tag: number;
  nom: string;
  type: string;
}

interface ProgramSession {
  id_seance: number;
  ordre_seance: number;
}

interface Program {
  id_programme: number;
  nom: string;
  image: string;
  duree: number;
  tags: number[];
  seances: ProgramSession[];
}

interface SessionExercise {
  id_exercice: number;
  ordre_exercice: number;
  duree: number;
  repetitions: number | null;
  series: number | null;
}

interface Session {
  id_seance: number;
  nom: string;
  tags: number[];
  exercices: SessionExercise[];
}

interface Exercise {
  id_exercice: number;
  nom: string;
  description: string;
  gif: string | null;
  equipement: string | null;
  tags: number[];
}

export default function ProgramDetailsScreen() {
  const params = useLocalSearchParams();
  const programId = Number(params.id);

  const [program, setProgram] = useState<Program | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProgramActive, setIsProgramActive] = useState(false);

  useEffect(() => {
    // In a real app, you would fetch program details with:
    // GET /api/data/programs/:programId
    fetchProgramDetails();
  }, [programId]);

  const fetchProgramDetails = () => {
    setIsLoading(true);
    try {
      // Get data from temp.json
      const programsData = tempData.programmes as Program[];
      const sessionsData = tempData.seances as Session[];
      const tagsData = tempData.tags as Tag[];
      const exercisesData = tempData.exercices as Exercise[];

      // Find the program by ID
      const foundProgram = programsData.find(
        (p) => p.id_programme === programId
      );

      if (foundProgram) {
        setProgram(foundProgram);

        // Find sessions for this program
        const programSessions = foundProgram.seances
          .map((ps) => {
            return sessionsData.find((s) => s.id_seance === ps.id_seance);
          })
          .filter(Boolean) as Session[];

        // Sort sessions by ordre_seance
        programSessions.sort((a, b) => {
          const orderA =
            foundProgram.seances.find((s) => s.id_seance === a.id_seance)
              ?.ordre_seance || 0;
          const orderB =
            foundProgram.seances.find((s) => s.id_seance === b.id_seance)
              ?.ordre_seance || 0;
          return orderA - orderB;
        });

        setSessions(programSessions);
      }

      setAllTags(tagsData);
      setExercises(exercisesData);

      // Check if program is active for the user
      // In a real app, this would be checked server-side
      const userPrograms = tempData.aliments || [];
      const isActive = userPrograms.some((up) => up.id_programme === programId);
      setIsProgramActive(isActive);
    } catch (error) {
      console.error("Error fetching program details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get program title and description
  const getProgramTitle = (fullName: string) => {
    return fullName.split("|")[0];
  };

  const getProgramDescription = (fullName: string) => {
    const parts = fullName.split("|");
    return parts.length > 1 ? parts[1] : "";
  };

  // Get tags for a program or session
  const getTagsString = (tagIds: number[]) => {
    return tagIds
      .map((id) => allTags.find((tag) => tag.id_tag === id))
      .filter((tag) => tag && tag.type === "sport")
      .map((tag) => tag?.nom)
      .join(", ");
  };

  // Navigate to session details
  const navigateToSession = (sessionId: number) => {
    router.push(`/user/sport/sessions/${sessionId}` as any);
  };

  // Start program
  const startProgram = async () => {
    // In a real app, you would make an API call:
    // POST /api/data/programs/:programId/start

    try {
      setIsLoading(true);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      setIsProgramActive(true);

      Alert.alert(
        "Programme démarré",
        `Vous avez commencé le programme "${
          program ? getProgramTitle(program.nom) : ""
        }". Vous pouvez maintenant suivre votre progression.`,
        [
          {
            text: "Voir mes séances",
            onPress: () => router.push("/user/dashboard/sport-monitoring"),
          },
          {
            text: "OK",
            style: "cancel",
          },
        ]
      );
    } catch (error) {
      console.error("Error starting program:", error);
      Alert.alert(
        "Erreur",
        "Impossible de démarrer le programme pour le moment."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Détails du programme"
          showBackButton
          onBackPress={() => router.back()}
          style={{ marginTop: Layout.spacing.md }}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!program) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Détails du programme"
          showBackButton
          onBackPress={() => router.back()}
          style={{ marginTop: Layout.spacing.md }}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Programme non trouvé</Text>
          <Button
            text="Retour aux programmes"
            onPress={() => router.back()}
            style={styles.returnButton}
            variant="outline"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Détails du programme"
        showBackButton
        onBackPress={() => router.back()}
        style={{ marginTop: Layout.spacing.md }}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          <Image
            source={
              imageMapping[program.id_programme + 100] || {
                uri: `ttps://placehold.co/600x300/92A3FD/FFFFFF?text=${getProgramTitle(
                  program.nom
                )}`,
              }
            }
            style={styles.coverImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.programInfo}>
          <Text style={styles.programTitle}>
            {getProgramTitle(program.nom)}
          </Text>
          <Text style={styles.programDuration}>
            {program.duree} semaines • {sessions.length} séances
          </Text>
          <Text style={styles.programTags}>
            {getTagsString(program.tags)
              .split(", ")
              .map((tag) => tag.charAt(0).toUpperCase() + tag.slice(1))
              .join(", ")}
          </Text>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {getProgramDescription(program.nom)}
          </Text>
        </View>

        <View style={styles.sessionsContainer}>
          <Text style={styles.sectionTitle}>Séances</Text>

          {sessions.map((session, index) => (
            <TouchableOpacity
              key={`session-${session.id_seance}`}
              style={styles.sessionCard}
              onPress={() => navigateToSession(session.id_seance)}
              activeOpacity={0.8}
            >
              <View style={styles.sessionHeader}>
                <View style={styles.sessionNumberContainer}>
                  <Text style={styles.sessionNumber}>{index + 1}</Text>
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionTitle}>{session.nom}</Text>
                  <Text style={styles.sessionDetails}>
                    {session.exercices.length} exercices
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={Colors.gray.medium}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.actionContainer}>
          <Button
            text={
              isProgramActive ? "Programme en cours" : "Choisir ce programme"
            }
            onPress={startProgram}
            disabled={isProgramActive || isLoading}
            loading={isLoading}
            fullWidth
            size="lg"
          />

          {isProgramActive && (
            <Text style={styles.activeNote}>
              Ce programme est déjà en cours. Vous pouvez suivre votre
              progression dans la section "Suivi sportif".
            </Text>
          )}
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
  container: {
    paddingBottom: Layout.spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Layout.spacing.lg,
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.gray.dark,
  },
  errorText: {
    ...TextStyles.bodyLarge,
    color: Colors.error,
    marginBottom: Layout.spacing.lg,
  },
  returnButton: {
    marginTop: Layout.spacing.md,
  },
  imageContainer: {
    width: "100%",
    height: 300,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  programInfo: {
    padding: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.ultraLight,
  },
  programTitle: {
    ...TextStyles.h3,
    marginBottom: Layout.spacing.xs,
  },
  programDuration: {
    ...TextStyles.body,
    color: Colors.gray.dark,
    marginBottom: Layout.spacing.xs,
  },
  programTags: {
    ...TextStyles.bodySmall,
    color: Colors.brandBlue[0],
  },
  descriptionContainer: {
    padding: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.ultraLight,
  },
  sectionTitle: {
    ...TextStyles.h4,
    marginBottom: Layout.spacing.md,
  },
  description: {
    ...TextStyles.body,
    color: Colors.gray.dark,
    lineHeight: 22,
  },
  sessionsContainer: {
    padding: Layout.spacing.lg,
  },
  sessionCard: {
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray.ultraLight,
    ...Layout.elevation.sm,
    overflow: "hidden",
  },
  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: Layout.spacing.md,
  },
  sessionNumberContainer: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: Colors.brandBlue[1],
    alignItems: "center",
    justifyContent: "center",
    marginRight: Layout.spacing.md,
  },
  sessionNumber: {
    ...TextStyles.bodyLarge,
    color: Colors.white,
    fontWeight: "600",
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    ...TextStyles.body,
    fontWeight: "600",
  },
  sessionDetails: {
    ...TextStyles.caption,
    color: Colors.gray.dark,
  },
  actionContainer: {
    padding: Layout.spacing.lg,
    marginTop: Layout.spacing.md - 50,
    marginBottom: -Layout.spacing.xl,
  },
  activeNote: {
    ...TextStyles.caption,
    color: Colors.gray.dark,
    textAlign: "center",
    marginTop: Layout.spacing.md,
    fontStyle: "italic",
  },
});
