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
import imageMapping from "../../../../constants/imageMapping";
import programsService from "../../../../services/programs.service";

// Import temp data for fallback
import tempData from "../../../../assets/temp.json";

// Types adaptés à l'API
interface Tag {
  id: number;
  name: string;
}

interface ProgramSession {
  id: number;
  name: string;
  order: number;
  exerciseCount: number;
  exercises: Exercise[];
}

interface Exercise {
  id: number;
  name: string;
  order: number;
  sets: number | null;
  repetitions: number | null;
  duration: number;
  description?: string;
  equipment?: string;
  gif?: string | null;
}

interface Program {
  id: number;
  name: string;
  image: string;
  duration: number;
  description: string;
  tags: Tag[];
  sessions: ProgramSession[];
  inProgress: boolean;
  userProgress?: {
    startDate: string;
    endDate: string;
    completedSessions: number;
    totalSessions: number;
    progressPercentage: number;
  };
}

export default function ProgramDetailsScreen() {
  const params = useLocalSearchParams();
  const programId = Number(params.id);

  const [program, setProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [activeProgram, setActiveProgram] = useState<any>(null);

  useEffect(() => {
    fetchProgramDetails();
    checkActiveProgram();
  }, [programId]);

  const checkActiveProgram = async () => {
    try {
      const active = await programsService.getActiveUserProgram();
      setActiveProgram(active);
    } catch (error) {
      console.error("Error checking active program:", error);
    }
  };

  const fetchProgramDetails = async () => {
    setIsLoading(true);
    try {
      console.log(`Fetching program details for ID: ${programId}`);
      const response = await programsService.getProgramDetails(programId);
      console.log("Program details response:", JSON.stringify(response));

      // Si nous avons une réponse valide de l'API
      if (response && response.id) {
        setProgram(response);
      } else {
        // Fallback aux données statiques si la réponse API n'est pas valide
        fallbackToStaticData();
      }
    } catch (error) {
      console.error("Error fetching program details:", error);
      fallbackToStaticData();
    } finally {
      setIsLoading(false);
    }
  };

  const fallbackToStaticData = () => {
    // Utiliser les données statiques comme fallback
    console.log("Using static data as fallback");
    try {
      const programsData = tempData.programmes || [];
      const sessionsData = tempData.seances || [];

      // Trouver le programme par ID
      const foundProgram = programsData.find(
        (p) => p.id_programme === programId
      );

      if (foundProgram) {
        // Adapter le format aux types attendus
        const adaptedProgram: Program = {
          id: foundProgram.id_programme,
          name: foundProgram.nom,
          image: foundProgram.image,
          duration: foundProgram.duree,
          description:
            foundProgram.nom.split("|")[1] || "Description non disponible",
          tags: (foundProgram.tags || []).map((tagId) => {
            const tag = (tempData.tags || []).find((t) => t.id_tag === tagId);
            return {
              id: tagId,
              name: tag?.nom || "Tag inconnu",
            };
          }),
          sessions: [],
          inProgress: false,
        };

        // Trouver les sessions associées et les adapter
        if (foundProgram.seances) {
          adaptedProgram.sessions = foundProgram.seances
            .map((ps) => {
              const session = sessionsData.find(
                (s) => s.id_seance === ps.id_seance
              );
              if (!session) return null;

              return {
                id: session.id_seance,
                name: session.nom,
                order: ps.ordre_seance,
                exerciseCount: (session.exercices || []).length,
                exercises: [], // On ne charge pas tous les exercices par souci de performance
              };
            })
            .filter(Boolean) as ProgramSession[];

          // Trier les sessions par ordre
          adaptedProgram.sessions.sort((a, b) => a.order - b.order);
        }

        setProgram(adaptedProgram);
      } else {
        console.error("Program not found in static data");
        setProgram(null);
      }
    } catch (error) {
      console.error("Error processing static data:", error);
      setProgram(null);
    }
  };

  // Get program title and description
  const getProgramTitle = (fullName: string) => {
    if (!fullName) return "Programme";
    return fullName.split("|")[0];
  };

  const getProgramDescription = (fullName: string) => {
    if (!fullName) return "";
    const parts = fullName.split("|");
    return parts.length > 1 ? parts[1] : "";
  };

  // Navigate to session details
  const navigateToSession = (sessionId: number) => {
    router.push(`/user/sport/sessions/${sessionId}`);
  };

  // Start program
  const startProgram = async () => {
    if (!program) return;

    setIsStarting(true);
    try {
      console.log(`Starting program ID: ${programId}`);
      // Appel API pour démarrer le programme
      const startDate = new Date().toISOString();
      const response = await programsService.startProgram(programId, startDate);
      console.log("Program start response:", JSON.stringify(response));

      // Mettre à jour l'état local pour refléter que le programme a démarré
      setProgram({
        ...program,
        inProgress: true,
        userProgress: {
          startDate: response?.startDate || startDate,
          endDate:
            response?.endDate ||
            new Date(
              Date.now() + program.duration * 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
          completedSessions: 0,
          totalSessions: 0,
          progressPercentage: 0,
        },
      });

      Alert.alert(
        "Programme démarré",
        `Vous avez commencé le programme "${getProgramTitle(
          program.name
        )}". Vous pouvez maintenant suivre votre progression.`,
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
      setIsStarting(false);
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
              imageMapping[program.id + 100] || {
                uri: `https://placehold.co/600x300/92A3FD/FFFFFF?text=${getProgramTitle(
                  program.name
                )}`,
              }
            }
            style={styles.coverImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.programInfo}>
          <Text style={styles.programTitle}>
            {getProgramTitle(program.name)}
          </Text>
          <Text style={styles.programDuration}>
            {program.duration} semaines • {program.sessions.length} séances
          </Text>
          <Text style={styles.programTags}>
            {program.tags
              .map((tag) => tag.name)
              .join(", ")
              .split(", ")
              .map((tag) => tag.charAt(0).toUpperCase() + tag.slice(1))
              .join(", ")}
          </Text>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {program.description || getProgramDescription(program.name)}
          </Text>
        </View>

        <View style={styles.sessionsContainer}>
          <Text style={styles.sectionTitle}>Séances</Text>

          {program.sessions.map((session, index) => (
            <TouchableOpacity
              key={`session-${session.id}`}
              style={styles.sessionCard}
              onPress={() => navigateToSession(session.id)}
              activeOpacity={0.8}
            >
              <View style={styles.sessionHeader}>
                <View style={styles.sessionNumberContainer}>
                  <Text style={styles.sessionNumber}>{index + 1}</Text>
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionTitle}>{session.name}</Text>
                  <Text style={styles.sessionDetails}>
                    {session.exerciseCount} exercices
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
              program.inProgress
                ? "Programme en cours"
                : activeProgram && activeProgram.id !== program.id
                ? "Vous suivez déjà un programme"
                : "Choisir ce programme"
            }
            onPress={startProgram}
            disabled={
              program.inProgress ||
              isStarting ||
              (activeProgram && activeProgram.id !== program.id)
            }
            loading={isStarting}
            fullWidth
            size="lg"
          />

          {program.inProgress && (
            <Text style={styles.activeNote}>
              Ce programme est déjà en cours. Vous pouvez suivre votre
              progression dans la section "Suivi sportif".
            </Text>
          )}

          {activeProgram && activeProgram.id !== program.id && (
            <Text style={styles.activeNote}>
              Vous suivez déjà le programme "{activeProgram.name}". Vous devez
              terminer ce programme avant d'en commencer un nouveau.
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
