import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  // Image,
  TouchableOpacity,
  Linking,
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

// Import temp data
import tempData from "../../../../assets/temp.json";

// Type definitions
interface Tag {
  id_tag: number;
  nom: string;
  type: string;
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
    marginBottom: -Layout.spacing.xxl,
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
});

export default function SessionDetailsScreen() {
  const params = useLocalSearchParams();
  const sessionId = Number(params.id);

  const [session, setSession] = useState<Session | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [sessionExercises, setSessionExercises] = useState<
    Array<SessionExercise & { exerciseDetails: Exercise | null }>
  >([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedExercises, setExpandedExercises] = useState<number[]>([]);

  useEffect(() => {
    // In a real app, you would fetch session details with:
    // GET /api/data/programs/sessions/:sessionId
    fetchSessionDetails();
  }, [sessionId]);

  const fetchSessionDetails = () => {
    setIsLoading(true);
    try {
      // Get data from temp.json
      const sessionsData = tempData.seances as Session[];
      const exercisesData = tempData.exercices as Exercise[];
      const tagsData = tempData.tags as Tag[];

      // Find the session by ID
      const foundSession = sessionsData.find((s) => s.id_seance === sessionId);

      if (foundSession) {
        setSession(foundSession);

        // Get exercise details for session
        const detailedExercises = foundSession.exercices.map(
          (sessionExercise) => {
            const exerciseDetails =
              exercisesData.find(
                (e) => e.id_exercice === sessionExercise.id_exercice
              ) || null;
            return {
              ...sessionExercise,
              exerciseDetails,
            };
          }
        );

        // Sort by ordre_exercice
        detailedExercises.sort((a, b) => a.ordre_exercice - b.ordre_exercice);

        setSessionExercises(detailedExercises);
        setExercises(exercisesData);
      }

      setAllTags(tagsData);
    } catch (error) {
      console.error("Error fetching session details:", error);
    } finally {
      setIsLoading(false);
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

  // Get tags for a program or session
  const getTagsString = (tagIds: number[]) => {
    return tagIds
      .map((id) => allTags.find((tag) => tag.id_tag === id))
      .filter((tag) => tag && tag.type === "sport")
      .map((tag) => tag?.nom)
      .join(", ");
  };

  // Format exercise sets and reps
  const formatExerciseDetails = (exercise: SessionExercise) => {
    if (exercise.duree > 0 && !exercise.series && !exercise.repetitions) {
      return `${exercise.duree} minutes`;
    } else if (exercise.series && exercise.repetitions) {
      return `${exercise.series} séries × ${exercise.repetitions} répétitions`;
    } else if (exercise.series && !exercise.repetitions) {
      return `${exercise.series} séries`;
    } else if (!exercise.series && exercise.repetitions) {
      return `${exercise.repetitions} répétitions`;
    } else {
      return "Non spécifié";
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
            <Text style={styles.sessionTitle}>{session.nom}</Text>
            <Text style={styles.sessionDetails}>
              {session.exercices.length} exercices
            </Text>
            <Text style={styles.sessionTags}>
              {getTagsString(session.tags)
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

          {sessionExercises.map((exercise, index) => (
            <View
              key={`exercise-${exercise.id_exercice}-${index}`}
              style={styles.exerciseCard}
            >
              <TouchableOpacity
                style={styles.exerciseHeader}
                onPress={() => toggleExerciseExpansion(exercise.id_exercice)}
                activeOpacity={0.7}
              >
                <View style={styles.exerciseNumberContainer}>
                  <Text style={styles.exerciseNumber}>{index + 1}</Text>
                </View>

                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>
                    {exercise.exerciseDetails?.nom || "Exercice inconnu"}
                  </Text>
                  <Text style={styles.exerciseSpecs}>
                    {formatExerciseDetails(exercise)}
                  </Text>
                </View>

                <Ionicons
                  name={
                    expandedExercises.includes(exercise.id_exercice)
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={24}
                  color={Colors.gray.medium}
                />
              </TouchableOpacity>

              {expandedExercises.includes(exercise.id_exercice) &&
                exercise.exerciseDetails && (
                  <View style={styles.exerciseDetails}>
                    {exercise.exerciseDetails.gif && (
                      <View style={styles.gifContainer}>
                        <Image
                          source={
                            imageMapping[
                              exercise.exerciseDetails.id_exercice
                            ] || {
                              uri: `https://placehold.co/400x300/92A3FD/FFFFFF?text=${exercise.exerciseDetails.nom}`,
                            }
                          }
                          style={styles.exerciseGif}
                          resizeMode="contain"
                          autoplay
                        />
                      </View>
                    )}

                    <Text style={styles.exerciseDescription}>
                      {exercise.exerciseDetails.description}
                    </Text>

                    {exercise.exerciseDetails.equipement && (
                      <View style={styles.equipmentContainer}>
                        <Text style={styles.equipmentTitle}>
                          Équipement nécessaire :
                        </Text>
                        <Text style={styles.equipmentText}>
                          {exercise.exerciseDetails.equipement}
                        </Text>
                      </View>
                    )}

                    <View style={styles.exerciseTags}>
                      <Text style={styles.exerciseTagsTitle}>Catégories :</Text>
                      <Text style={styles.exerciseTagsText}>
                        {getTagsString(exercise.exerciseDetails.tags)
                          .split(", ")
                          .map(
                            (tag) => tag.charAt(0).toUpperCase() + tag.slice(1)
                          )
                          .join(", ")}
                      </Text>
                    </View>
                  </View>
                )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
