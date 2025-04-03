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
} from "react-native";
import imageMapping from "../../../constants/imageMapping";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "../../../constants/Colors";
import Layout from "../../../constants/Layout";
import { TextStyles } from "../../../constants/Fonts";
import Header from "../../../components/layout/Header";
import Card from "../../../components/ui/Card";

// Import temp data
import tempData from "../../../assets/temp.json";

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

const { width } = Dimensions.get("window");
const CARD_WIDTH = 175;

export default function SportDiscoverScreen() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [beginnerPrograms, setBeginnerPrograms] = useState<Program[]>([]);
  const [intermediatePrograms, setIntermediatePrograms] = useState<Program[]>(
    []
  );
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch this data with:
    // GET /api/data/programs
    fetchPrograms();
  }, []);

  const fetchPrograms = () => {
    setIsLoading(true);
    try {
      // Get data from temp.json
      const programsData = tempData.programmes as Program[];
      const tagsData = tempData.tags as Tag[];

      setPrograms(programsData);
      setAllTags(tagsData);

      // Filter programs by beginner tag (id_tag: 1)
      const beginner = programsData.filter((program) =>
        program.tags.includes(1)
      );
      setBeginnerPrograms(beginner);

      // Filter programs by intermediate tag (id_tag: 5)
      const intermediate = programsData.filter((program) =>
        program.tags.includes(5)
      );
      setIntermediatePrograms(intermediate);
    } catch (error) {
      console.error("Error fetching programs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get program title (text before | character)
  const getProgramTitle = (fullName: string) => {
    return fullName.split("|")[0];
  };

  // Get program description (text after | character)
  const getProgramDescription = (fullName: string) => {
    const parts = fullName.split("|");
    return parts.length > 1 ? parts[1] : "";
  };

  // Get tags for a program
  const getProgramTags = (tagIds: number[]) => {
    return tagIds
      .map((id) => allTags.find((tag) => tag.id_tag === id))
      .filter((tag) => tag && tag.type === "sport")
      .map((tag) => tag?.nom)
      .join(", ");
  };

  // Navigate to program details
  const navigateToProgram = (programId: number) => {
    router.push(`/user/sport/programs/${programId}`);
  };

  // Program card component
  const ProgramCard = ({ program }: { program: Program }) => (
    <TouchableOpacity
      style={styles.programCard}
      onPress={() => navigateToProgram(program.id_programme)}
      activeOpacity={0.8}
    >
      <Image
        source={
          imageMapping[program.id_programme + 100] || {
            uri: `ttps://placehold.co/600x300/92A3FD/FFFFFF?text=${getProgramTitle(
              program.nom
            )}`,
          }
        }
        style={styles.programImage}
        resizeMode="contain"
      />

      <View style={styles.programContent}>
        <Text style={styles.programTitle}>{getProgramTitle(program.nom)}</Text>
        <Text style={styles.programDuration}>
          {program.duree} semaines • {program.seances.length} séances
        </Text>
        <Text style={styles.programTags}>
          {getProgramTags(program.tags)
            .split(", ")
            .map((tag) => tag.charAt(0).toUpperCase() + tag.slice(1))
            .join(", ")}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Loading placeholder
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
              data={programs}
              renderItem={({ item }) => <ProgramCard program={item} />}
              keyExtractor={(item) => `program-${item.id_programme}`}
              snapToInterval={CARD_WIDTH + Layout.spacing.md}
              decelerationRate="fast"
              ListEmptyComponent={
                <Text style={styles.emptyText}>Aucun programme disponible</Text>
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
              keyExtractor={(item) => `beginner-${item.id_programme}`}
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
              keyExtractor={(item) => `intermediate-${item.id_programme}`}
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
    // Ajout d'une bordure avec ombre simulée
    borderWidth: 0.5,
    borderColor: "rgba(0, 0, 0, 0.1)", // Couleur de la bordure avec ombre légère
    shadowColor: "rgba(0, 0, 0, 0.2)", // Couleur de l'ombre
    shadowOffset: { width: 0, height: 2 }, // Décalage de l'ombre vers le bas
    shadowOpacity: 1, // Opacité de l'ombre
    shadowRadius: 2, // Rayon de l'ombre
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
