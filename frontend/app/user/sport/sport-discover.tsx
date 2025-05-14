import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
} from "react-native";
import imageMapping from "../../../constants/imageMapping";
import { router } from "expo-router";
import Colors from "../../../constants/Colors";
import Layout from "../../../constants/Layout";
import { TextStyles } from "../../../constants/Fonts";
import Header from "../../../components/layout/Header";
import programsService from "../../../services/programs.service";

interface Tag {
  id: number;
  name: string;
}

interface Program {
  id: number;
  name: string;
  image: string;
  duration: number;
  sessionCount: number;
  tags: Tag[];
  inProgress: boolean;
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = 175;

export default function SportDiscoverScreen() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [beginnerPrograms, setBeginnerPrograms] = useState<Program[]>([]);
  const [intermediatePrograms, setIntermediatePrograms] = useState<Program[]>(
    []
  );
  const [recommendedPrograms, setRecommendedPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchPrograms();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setIsLoading(true);
    try {
      const response = await programsService.getPrograms();

      setPrograms(response.programs);

      // Programmes recommandés
      setRecommendedPrograms(response.recommendedPrograms);

      // Filtre pour les programmes débutants
      const beginner = response.programs.filter((program) =>
        program.tags.some((tag) => tag.name.toLowerCase().includes("débutant"))
      );
      setBeginnerPrograms(beginner);

      // Filtre pour les programmes intermédiaires
      const intermediate = response.programs.filter((program) =>
        program.tags.some((tag) =>
          tag.name.toLowerCase().includes("intermédiaire")
        )
      );
      setIntermediatePrograms(intermediate);
    } catch (error) {
      console.error("Error fetching programs:", error);
      setPrograms([]);
      setBeginnerPrograms([]);
      setIntermediatePrograms([]);
      setRecommendedPrograms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getProgramTitle = (fullName: string | undefined) => {
    if (!fullName) return "Programme";
    return fullName.split("|")[0];
  };

  const getProgramDescription = (fullName: string | undefined) => {
    if (!fullName) return "";
    const parts = fullName.split("|");
    return parts.length > 1 ? parts[1] : "";
  };

  const navigateToProgram = (programId: number) => {
    router.push(`/user/sport/programs/${programId}`);
  };

  const ProgramCard = ({ program }: { program: Program }) => (
    <TouchableOpacity
      style={styles.programCard}
      onPress={() => navigateToProgram(program.id)}
      activeOpacity={0.8}
    >
      <Image
        source={
          imageMapping[program.id + 100] || {
            uri: `https://placehold.co/600x300/92A3FD/FFFFFF?text=${getProgramTitle(
              program.name
            )}`,
          }
        }
        style={styles.programImage}
        resizeMode="contain"
      />

      <View style={styles.programContent}>
        <Text style={styles.programTitle}>{getProgramTitle(program.name)}</Text>
        <Text style={styles.programDuration}>
          {program.duration} semaines • {program.sessionCount} séances
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
    </TouchableOpacity>
  );

  const ProgramCardPlaceholder = () => (
    <View style={[styles.programCard, styles.placeholderCard]}>
      <View style={styles.placeholderImage} />
      <View style={styles.programContent}>
        <View style={[styles.placeholderText, { width: "60%", height: 18 }]} />
        <View
          style={[
            styles.placeholderText,
            { width: "40%", height: 16, marginTop: 8 },
          ]}
        />
        <View
          style={[
            styles.placeholderText,
            { width: "80%", height: 16, marginTop: 8 },
          ]}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Découvrir des programmes"
        style={{ marginTop: Layout.spacing.md }}
      />

      <ScrollView
        contentContainerStyle={styles.container}
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pour vous</Text>
          {isLoading ? (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.programList}
              data={[1, 2, 3]}
              renderItem={() => <ProgramCardPlaceholder />}
              keyExtractor={(_, index) => `placeholder-${index}`}
              snapToInterval={CARD_WIDTH + Layout.spacing.md}
              decelerationRate="fast"
            />
          ) : (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.programList}
              data={recommendedPrograms}
              renderItem={({ item }) => <ProgramCard program={item} />}
              keyExtractor={(item) => `recommended-${item.id}`}
              snapToInterval={CARD_WIDTH + Layout.spacing.md}
              decelerationRate="fast"
              ListEmptyComponent={
                <Text style={styles.emptyText}>Aucun programme recommandé</Text>
              }
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Programmes débutants</Text>
          {isLoading ? (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.programList}
              data={[1, 2]}
              renderItem={() => <ProgramCardPlaceholder />}
              keyExtractor={(_, index) => `placeholder-beginner-${index}`}
              snapToInterval={CARD_WIDTH + Layout.spacing.md}
              decelerationRate="fast"
            />
          ) : (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.programList}
              data={beginnerPrograms}
              renderItem={({ item }) => <ProgramCard program={item} />}
              keyExtractor={(item) => `beginner-${item.id}`}
              snapToInterval={CARD_WIDTH + Layout.spacing.md}
              decelerationRate="fast"
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  Aucun programme débutant disponible
                </Text>
              }
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Programmes intermédiaires</Text>
          {isLoading ? (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.programList}
              data={[1, 2]}
              renderItem={() => <ProgramCardPlaceholder />}
              keyExtractor={(_, index) => `placeholder-inter-${index}`}
              snapToInterval={CARD_WIDTH + Layout.spacing.md}
              decelerationRate="fast"
            />
          ) : (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.programList}
              data={intermediatePrograms}
              renderItem={({ item }) => <ProgramCard program={item} />}
              keyExtractor={(item) => `intermediate-${item.id}`}
              snapToInterval={CARD_WIDTH + Layout.spacing.md}
              decelerationRate="fast"
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  Aucun programme intermédiaire disponible
                </Text>
              }
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Les styles restent identiques
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    padding: Layout.spacing.lg,
    paddingBottom: -10,
  },
  section: {
    marginBottom: Layout.spacing.xl,
  },
  sectionTitle: {
    ...TextStyles.h4,
    marginBottom: Layout.spacing.md,
  },
  programList: {
    paddingRight: Layout.spacing.lg,
  },
  programCard: {
    width: CARD_WIDTH,
    marginRight: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.white,
    borderWidth: 0.5,
    borderColor: "rgba(0, 0, 0, 0.1)",
    shadowColor: "rgba(0, 0, 0, 0.2)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 2,
    overflow: "hidden",
  },
  programImage: {
    width: "100%",
    height: 175,
    backgroundColor: Colors.gray.ultraLight,
  },
  programContent: {
    padding: Layout.spacing.md,
  },
  programTitle: {
    ...TextStyles.bodyLarge,
    fontWeight: "600",
    marginBottom: Layout.spacing.xs,
  },
  programDuration: {
    ...TextStyles.bodySmall,
    color: Colors.gray.dark,
    marginBottom: Layout.spacing.xs,
  },
  programTags: {
    ...TextStyles.caption,
    color: Colors.brandBlue[0],
  },
  placeholderCard: {
    backgroundColor: Colors.gray.ultraLight,
  },
  placeholderImage: {
    width: "100%",
    height: 160,
    backgroundColor: Colors.gray.light,
  },
  placeholderText: {
    backgroundColor: Colors.gray.light,
    borderRadius: 4,
  },
  emptyText: {
    ...TextStyles.body,
    color: Colors.gray.dark,
    fontStyle: "italic",
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    textAlign: "center",
    width: CARD_WIDTH,
  },
});
