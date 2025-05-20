import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import imageMapping from "../../../../constants/imageMapping";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import Colors from "../../../../constants/Colors";
import Layout from "../../../../constants/Layout";
import { TextStyles } from "../../../../constants/Fonts";
import Header from "../../../../components/layout/Header";
import Button from "../../../../components/ui/Button";
import programsService from "../../../../services/programs.service";

// Import temp data pour fallback
import tempData from "../../../../assets/temp.json";

// Types adaptés à l'API
interface Tag {
  id: number;
  name: string;
}

interface Exercise {
  id: number;
  name: string;
  order: number;
  sets: number | null;
  repetitions: number | null;
  duration: number;
  description: string;
  equipment: string | null;
  gif: string | null;
}

interface Session {
  id: number;
  name: string;
  description: string;
  level: string;
  estimatedDuration: number;
  tags: Tag[];
  exercises: Exercise[];
}

export default function SessionDetailsScreen() {
  const params = useLocalSearchParams();
  const sessionId = Number(params.id);

  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedExercises, setExpandedExercises] = useState<number[]>([]);

  useEffect(() => {
    fetchSessionDetails();
  }, [sessionId]);

  const fetchSessionDetails = async () => {
    setIsLoading(true);
    try {
      const response = await programsService.getSessionDetails(sessionId);

      // Si nous avons une réponse valide de l'API
      if (response && response.id) {
        setSession(response);
      } else {
        // Fallback aux données statiques en cas d'échec
        fallbackToStaticData();
      }
    } catch (error) {
      console.error("Error fetching session details:", error);
      fallbackToStaticData();
    } finally {
      setIsLoading(false);
    }
  };

  const fallbackToStaticData = () => {
    // Utiliser les données statiques comme fallback
    try {
      const sessionsData = tempData.seances || [];
      const exercisesData = tempData.exercices || [];
      const tagsData = tempData.tags || [];

      // Trouver la séance par ID
      const foundSession = sessionsData.find((s) => s.id_seance === sessionId);

      if (foundSession) {
        // Adapter au format attendu
        const adaptedSession: Session = {
          id: foundSession.id_seance,
          name: foundSession.nom,
          description:
            "Une séance complète et efficace pour développer force et endurance.",
          level: "Intermédiaire",
          estimatedDuration: foundSession.exercices.reduce(
            (total, ex) => total + ex.duree,
            30
          ),
          tags: (foundSession.tags || []).map((tagId) => {
            const tag = (tagsData || []).find((t) => t.id_tag === tagId);
            return {
              id: tagId,
              name: tag?.nom || "Tag inconnu",
            };
          }),
          exercises: [],
        };

        // Ajouter les exercices détaillés
        if (foundSession.exercices) {
          adaptedSession.exercises = foundSession.exercices
            .map((sessionExercise) => {
              const exerciseDetails = exercisesData.find(
                (e) => e.id_exercice === sessionExercise.id_exercice
              );
              if (!exerciseDetails) return null;

              return {
                id: exerciseDetails.id_exercice,
                name: exerciseDetails.nom,
                order: sessionExercise.ordre_exercice,
                sets: sessionExercise.series,
                repetitions: sessionExercise.repetitions,
                duration: sessionExercise.duree,
                description:
                  exerciseDetails.description || "Description non disponible",
                equipment: exerciseDetails.equipement,
                gif: exerciseDetails.gif,
              };
            })
            .filter(Boolean) as Exercise[];

          // Trier les exercices par ordre
          adaptedSession.exercises.sort((a, b) => a.order - b.order);
        }

        setSession(adaptedSession);
      } else {
        console.error("Session not found in static data");
        setSession(null);
      }
    } catch (error) {
      console.error("Error processing static data for session:", error);
      setSession(null);
    }
  };

  // Toggle exercise expansion
  const toggleExerciseExpansion = (exerciseId: number) => {
    setExpandedExercises((prev) => {
      if (prev.includes(exerciseId)) {
        return prev.filter((id) => id !== exerciseId);
      } else {
        return [...prev, exerciseId];
      }
    });
  };

  // Format exercise sets and reps
  const formatExerciseDetails = (exercise: Exercise) => {
    if (exercise.duration > 0 && !exercise.sets && !exercise.repetitions) {
      return `${exercise.duration} minutes`;
    } else if (exercise.sets && exercise.repetitions) {
      return `${exercise.sets} séries × ${exercise.repetitions} répétitions`;
    } else if (exercise.sets && !exercise.repetitions) {
      return `${exercise.sets} séries`;
    } else if (!exercise.sets && exercise.repetitions) {
      return `${exercise.repetitions} répétitions`;
    } else {
      return "Non spécifié";
    }
  };

  // Handle session completion
  const markSessionAsComplete = async () => {
    if (!session) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await programsService.completeSession(sessionId, today);

      router.push("/user/dashboard/sport-monitoring");
    } catch (error) {
      console.error("Error completing session:", error);
      alert("Impossible de marquer la séance comme terminée pour le moment.");
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Détails de la séance"
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

  if (!session) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Détails de la séance"
          showBackButton
          onBackPress={() => router.back()}
          style={{ marginTop: Layout.spacing.md }}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Séance non trouvée</Text>
          <Button
            text="Retour"
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
        title="Détails de la séance"
        showBackButton
        onBackPress={() => router.back()}
        style={{ marginTop: Layout.spacing.md }}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sessionHeader}>
          <View style={styles.sessionTitleContainer}>
            <Text style={styles.sessionTitle}>{session.name}</Text>
            <Text style={styles.sessionDetails}>
              {session.exercises.length} exercices
            </Text>
            <Text style={styles.sessionTags}>
              {session.tags
                .map((tag) => tag.name)
                .join(", ")
                .split(", ")
                .map((tag) =>
                  tag
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")
                )
                .join(", ")}
            </Text>
          </View>
        </View>

        <View style={styles.exercisesContainer}>
          <Text style={styles.sectionTitle}>Exercices</Text>

          {session.exercises.map((exercise, index) => (
            <View
              key={`exercise-${exercise.id}-${index}`}
              style={styles.exerciseCard}
            >
              <TouchableOpacity
                style={styles.exerciseHeader}
                onPress={() => toggleExerciseExpansion(exercise.id)}
                activeOpacity={0.7}
              >
                <View style={styles.exerciseNumberContainer}>
                  <Text style={styles.exerciseNumber}>{index + 1}</Text>
                </View>

                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>
                    {exercise.name || "Exercice inconnu"}
                  </Text>
                  <Text style={styles.exerciseSpecs}>
                    {formatExerciseDetails(exercise)}
                  </Text>
                </View>

                <Ionicons
                  name={
                    expandedExercises.includes(exercise.id)
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={24}
                  color={Colors.gray.medium}
                />
              </TouchableOpacity>

              {expandedExercises.includes(exercise.id) && (
                <View style={styles.exerciseDetails}>
                  {exercise.gif && (
                    <View style={styles.gifContainer}>
                      <Image
                        source={
                          exercise.gif &&
                          (exercise.gif.startsWith("http://") ||
                            exercise.gif.startsWith("https://"))
                            ? { uri: exercise.gif }
                            : imageMapping[exercise.id] || {
                                uri: `https://placehold.co/400x300/92A3FD/FFFFFF?text=${exercise.name}`,
                              }
                        }
                        style={styles.exerciseGif}
                        resizeMode="contain"
                        autoplay
                      />
                    </View>
                  )}

                  <Text style={styles.exerciseDescription}>
                    {exercise.description}
                  </Text>

                  {exercise.equipment && (
                    <View style={styles.equipmentContainer}>
                      <Text style={styles.equipmentTitle}>
                        Équipement nécessaire :
                      </Text>
                      <Text style={styles.equipmentText}>
                        {exercise.equipment}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}
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
  sessionHeader: {
    padding: Layout.spacing.lg,
    backgroundColor: Colors.brandBlue[1],
  },
  sessionTitleContainer: {
    marginBottom: Layout.spacing.md,
  },
  sessionTitle: {
    ...TextStyles.h3,
    color: Colors.white,
    marginBottom: Layout.spacing.xs,
  },
  sessionDetails: {
    ...TextStyles.body,
    color: Colors.white,
    marginBottom: Layout.spacing.xs,
  },
  sessionTags: {
    ...TextStyles.bodySmall,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: -18,
  },
  exercisesContainer: {
    padding: Layout.spacing.lg,
  },
  sectionTitle: {
    ...TextStyles.h4,
    marginBottom: Layout.spacing.md,
  },
  exerciseCard: {
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray.ultraLight,
    ...Layout.elevation.sm,
    overflow: "hidden",
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: Layout.spacing.md,
  },
  exerciseNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.brandBlue[0],
    alignItems: "center",
    justifyContent: "center",
    marginRight: Layout.spacing.md,
  },
  exerciseNumber: {
    ...TextStyles.body,
    color: Colors.white,
    fontWeight: "600",
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    ...TextStyles.body,
    fontWeight: "600",
    marginBottom: 2,
  },
  exerciseSpecs: {
    ...TextStyles.caption,
    color: Colors.gray.dark,
  },
  exerciseDetails: {
    padding: Layout.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.gray.ultraLight,
    backgroundColor: Colors.gray.ultraLight,
  },
  gifContainer: {
    width: "100%",
    height: 240,
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.gray.ultraLight,
    marginBottom: Layout.spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseGif: {
    width: "100%",
    height: "100%",
  },
  exerciseDescription: {
    ...TextStyles.body,
    color: Colors.gray.dark,
    marginBottom: Layout.spacing.md,
    lineHeight: 22,
  },
  equipmentContainer: {
    marginBottom: Layout.spacing.md,
  },
  equipmentTitle: {
    ...TextStyles.bodySmall,
    fontWeight: "600",
    marginBottom: 4,
  },
  equipmentText: {
    ...TextStyles.bodySmall,
    color: Colors.gray.dark,
  },
  exerciseTags: {
    marginBottom: Layout.spacing.sm,
  },
  exerciseTagsTitle: {
    ...TextStyles.bodySmall,
    fontWeight: "600",
    marginBottom: 4,
  },
  exerciseTagsText: {
    ...TextStyles.bodySmall,
    color: Colors.brandBlue[0],
  },
  actionContainer: {
    padding: Layout.spacing.lg,
    marginTop: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
});
