import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path, Line, Circle, Text as SvgText } from "react-native-svg";
import Colors from "../../../constants/Colors";
import Layout from "../../../constants/Layout";
import { TextStyles } from "../../../constants/Fonts";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Header from "../../../components/layout/Header";
import Input from "../../../components/ui/Input";
import NumericInput from "../../../components/ui/NumericInput";
import DatePicker from "../../../components/ui/DatePicker";
import { useAuth } from "../../../context/AuthContext";
import { router } from "expo-router";

// Import des données d'exemple pour le développement
import tempData from "../../../assets/temp.json";

export default function ProgressScreen() {
  const { user } = useAuth();
  const [evolutionData, setEvolutionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [period, setPeriod] = useState("all"); // "all", "month", "year"

  // État pour le formulaire d'ajout d'évolution
  const [newEvolution, setNewEvolution] = useState({
    weight: "",
    height: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Simuler le chargement des données depuis l'API
  useEffect(() => {
    // En production, nous remplacerions ceci par un appel API
    // GET /api/user/evolution
    setTimeout(() => {
      const exampleEvolutions = [...tempData.evolutions_exemple]; // Créer une copie pour éviter les mutations

      // Calculer l'IMC pour chaque entrée et formater les données
      const formattedData = exampleEvolutions
        .map((ev) => ({
          date: new Date(ev.date).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
          }),
          rawDate: ev.date, // Conserver la date brute pour le filtre
          weight: ev.poids,
          height: ev.taille,
          bmi: (ev.poids / ((ev.taille / 100) * (ev.taille / 100))).toFixed(1),
        }))
        .sort(
          (a, b) =>
            new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime()
        );

      setEvolutionData(formattedData);
      setLoading(false);
    }, 600);
  }, []);

  // Filtrer les données selon la période sélectionnée
  const getFilteredData = () => {
    if (period === "all") return evolutionData;

    const now = new Date();
    let compareDate: Date;

    if (period === "month") {
      compareDate = new Date();
      compareDate.setMonth(now.getMonth() - 1);
    } else {
      // period === "year"
      compareDate = new Date();
      compareDate.setFullYear(now.getFullYear() - 1);
    }

    return evolutionData.filter(
      (item) => new Date(item.rawDate) >= compareDate
    );
  };

  // Calculer les statistiques
  const calculateStats = () => {
    if (evolutionData.length === 0) return null;

    const filteredData = getFilteredData();
    const initialRecord = filteredData[0];
    const currentRecord = filteredData[filteredData.length - 1];

    const weightChange = currentRecord.weight - initialRecord.weight;
    const weightChangePercentage = (
      (weightChange / initialRecord.weight) *
      100
    ).toFixed(2);
    const bmiChange = (
      parseFloat(currentRecord.bmi) - parseFloat(initialRecord.bmi)
    ).toFixed(1);

    return {
      initialWeight: initialRecord.weight,
      currentWeight: currentRecord.weight,
      weightChange: weightChange.toFixed(1),
      weightChangePercentage,
      initialBmi: initialRecord.bmi,
      currentBmi: currentRecord.bmi,
      bmiChange,
      period:
        period === "all" ? "totale" : period === "month" ? "1 mois" : "1 an",
    };
  };

  // Gérer l'ajout d'une nouvelle évolution
  const handleAddEvolution = () => {
    // Validation simple
    if (!newEvolution.weight || !newEvolution.height) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    const weight = parseFloat(newEvolution.weight);
    const height = parseFloat(newEvolution.height);

    if (isNaN(weight) || isNaN(height) || weight <= 0 || height <= 0) {
      Alert.alert("Erreur", "Veuillez entrer des valeurs numériques valides");
      return;
    }

    // En production, nous ferions un appel API
    // POST /api/user/evolution

    // Simuler l'ajout de données
    const bmi = (weight / ((height / 100) * (height / 100))).toFixed(1);
    const newEntry = {
      date: new Date(newEvolution.date).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
      }),
      rawDate: newEvolution.date,
      weight,
      height,
      bmi,
    };

    // Ajouter la nouvelle entrée et trier par date
    setEvolutionData(
      [...evolutionData, newEntry].sort(
        (a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime()
      )
    );

    // Réinitialiser le formulaire et fermer le modal
    setNewEvolution({
      weight: "",
      height: "",
      date: new Date().toISOString().split("T")[0],
    });
    setShowAddModal(false);

    Alert.alert("Succès", "Évolution enregistrée avec succès");
  };

  // Graphique de ligne personnalisé
  const SimpleLineChart = ({ data }: { data: any[] }) => {
    if (!data || data.length === 0) return null;

    const width = Layout.window.width - 80;
    const height = 220;
    const padding = { top: 20, right: 20, bottom: 40, left: 40 };

    // Trouver les valeurs min et max pour les axes
    const weights = data.map((d) => d.weight);
    const minWeight = Math.min(...weights) - 1;
    const maxWeight = Math.max(...weights) + 1;

    // Fonction de mise à l'échelle pour les positions X et Y
    const scaleX = (index: number) =>
      padding.left +
      (index / (data.length - 1)) * (width - padding.left - padding.right);

    const scaleY = (value: number) =>
      height -
      padding.bottom -
      ((value - minWeight) / (maxWeight - minWeight)) *
        (height - padding.top - padding.bottom);

    // Générer le chemin de la ligne
    let pathD = "";
    data.forEach((d, i) => {
      const x = scaleX(i);
      const y = scaleY(d.weight);
      if (i === 0) pathD += `M ${x} ${y}`;
      else pathD += ` L ${x} ${y}`;
    });

    return (
      <Svg width={width} height={height}>
        {/* Axe Y */}
        <Line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke={Colors.gray.medium}
          strokeWidth={1}
        />

        {/* Axe X */}
        <Line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke={Colors.gray.medium}
          strokeWidth={1}
        />

        {/* Ligne des données */}
        <Path
          d={pathD}
          stroke={Colors.brandBlue[0]}
          strokeWidth={2}
          fill="none"
        />

        {/* Points sur la ligne */}
        {data.map((d, i) => (
          <Circle
            key={i}
            cx={scaleX(i)}
            cy={scaleY(d.weight)}
            r={3}
            fill={Colors.brandBlue[0]}
          />
        ))}

        {/* Étiquettes des axes X (dates) */}
        {data.map(
          (d, i) =>
            i % Math.ceil(data.length / 5) === 0 && ( // Afficher seulement quelques dates
              <SvgText
                key={`label-${i}`}
                x={scaleX(i)}
                y={height - padding.bottom + 15}
                fontSize="10"
                fill={Colors.gray.dark}
                textAnchor="middle"
              >
                {d.date}
              </SvgText>
            )
        )}

        {/* Étiquettes des axes Y (poids) */}
        {[minWeight, (minWeight + maxWeight) / 2, maxWeight].map((value, i) => (
          <SvgText
            key={`y-${i}`}
            x={padding.left - 10}
            y={scaleY(value) + 5}
            fontSize="10"
            fill={Colors.gray.dark}
            textAnchor="end"
          >
            {value.toFixed(1)}
          </SvgText>
        ))}

        {/* Légende */}
        <Circle
          cx={width - padding.right - 60}
          cy={padding.top + 10}
          r={3}
          fill={Colors.brandBlue[0]}
        />
        <SvgText
          x={width - padding.right - 50}
          y={padding.top + 14}
          fontSize="10"
          fill={Colors.gray.dark}
        >
          Poids (kg)
        </SvgText>
      </Svg>
    );
  };

  // Obtenir les statistiques
  const stats = calculateStats();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Ma progression"
        showBackButton
        onBackPress={() => router.back()}
        style={{ marginTop: Layout.spacing.md }}
      />

      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          {/* Filtres de période */}
          <View style={styles.periodFilter}>
            <TouchableOpacity
              style={[
                styles.periodButton,
                period === "all" && styles.activePeriod,
              ]}
              onPress={() => setPeriod("all")}
            >
              <Text
                style={[
                  styles.periodText,
                  period === "all" && styles.activePeriodText,
                ]}
              >
                Tout
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.periodButton,
                period === "year" && styles.activePeriod,
              ]}
              onPress={() => setPeriod("year")}
            >
              <Text
                style={[
                  styles.periodText,
                  period === "year" && styles.activePeriodText,
                ]}
              >
                Année
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.periodButton,
                period === "month" && styles.activePeriod,
              ]}
              onPress={() => setPeriod("month")}
            >
              <Text
                style={[
                  styles.periodText,
                  period === "month" && styles.activePeriodText,
                ]}
              >
                Mois
              </Text>
            </TouchableOpacity>
          </View>

          {/* Graphique d'évolution */}
          <Card style={styles.graphCard}>
            <Text style={styles.sectionTitle}>Évolution du poids</Text>

            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>
                  Chargement du graphique...
                </Text>
              </View>
            ) : getFilteredData().length > 0 ? (
              <View style={styles.chartContainer}>
                <SimpleLineChart data={getFilteredData()} />
              </View>
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>
                  Aucune donnée pour cette période
                </Text>
              </View>
            )}
          </Card>

          {/* Statistiques */}
          {stats && (
            <Card style={styles.statsCard}>
              <Text style={styles.sectionTitle}>
                Statistiques sur {stats.period}
              </Text>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Poids initial</Text>
                  <Text style={styles.statValue}>{stats.initialWeight} kg</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Poids actuel</Text>
                  <Text style={styles.statValue}>{stats.currentWeight} kg</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Différence</Text>
                  <Text style={[styles.statValue]}>
                    {stats.weightChange} kg
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Pourcentage</Text>
                  <Text style={[styles.statValue]}>
                    {stats.weightChangePercentage}%
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>IMC initial</Text>
                  <Text style={styles.statValue}>{stats.initialBmi}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>IMC actuel</Text>
                  <Text style={styles.statValue}>{stats.currentBmi}</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Différence IMC</Text>
                  <Text style={[styles.statValue]}>{stats.bmiChange}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Catégorie</Text>
                  <Text style={styles.statValue}>
                    {parseFloat(stats.currentBmi) < 18.5
                      ? "Maigreur"
                      : parseFloat(stats.currentBmi) < 25
                      ? "Normal"
                      : parseFloat(stats.currentBmi) < 30
                      ? "Surpoids"
                      : "Obésité"}
                  </Text>
                </View>
              </View>
            </Card>
          )}

          {/* Liste des enregistrements */}
          <Card style={styles.recordsCard}>
            <View style={styles.recordsHeader}>
              <Text style={styles.sectionTitle}>Historique d'évolution</Text>
              <Button
                text="Ajouter"
                size="sm"
                leftIcon="add-outline"
                onPress={() => setShowAddModal(true)}
                style={styles.addButton}
              />
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>
                  Chargement de l'historique...
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.recordHeader}>
                  <Text style={styles.recordHeaderText}>Date</Text>
                  <Text style={styles.recordHeaderText}>Poids</Text>
                  <Text style={styles.recordHeaderText}>Taille</Text>
                  <Text style={styles.recordHeaderText}>IMC</Text>
                </View>

                {evolutionData
                  .slice()
                  .reverse()
                  .map((item, index) => (
                    <View key={index} style={styles.recordItem}>
                      <Text style={styles.recordText}>{item.date}</Text>
                      <Text style={styles.recordText}>{item.weight} kg</Text>
                      <Text style={styles.recordText}>{item.height} cm</Text>
                      <Text style={styles.recordText}>{item.bmi}</Text>
                    </View>
                  ))}
              </>
            )}
          </Card>

          {/* Modal pour ajouter une nouvelle évolution */}
          <Modal
            visible={showAddModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowAddModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Ajouter une évolution</Text>
                  <TouchableOpacity onPress={() => setShowAddModal(false)}>
                    <Ionicons name="close" size={24} color={Colors.gray.dark} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <DatePicker
                    label="Date"
                    value={
                      newEvolution.date ? new Date(newEvolution.date) : null
                    }
                    onChange={(date) =>
                      setNewEvolution({
                        ...newEvolution,
                        date: date
                          ? date.toISOString().split("T")[0]
                          : new Date().toISOString().split("T")[0],
                      })
                    }
                    maxDate={new Date()}
                    icon="calendar-outline"
                  />

                  <NumericInput
                    label="Poids (kg)"
                    value={newEvolution.weight}
                    onChangeText={(value) =>
                      setNewEvolution({ ...newEvolution, weight: value })
                    }
                    placeholder="Entrez votre poids"
                    min={30}
                    max={300}
                    precision={1}
                    icon="barbell-outline"
                  />

                  <NumericInput
                    label="Taille (cm)"
                    value={newEvolution.height}
                    onChangeText={(value) =>
                      setNewEvolution({ ...newEvolution, height: value })
                    }
                    placeholder="Entrez votre taille"
                    min={100}
                    max={250}
                    precision={1}
                    icon="resize-outline"
                  />
                </View>

                <View style={styles.modalFooter}>
                  <Button
                    text="Annuler"
                    variant="outline"
                    onPress={() => setShowAddModal(false)}
                    style={styles.modalButton}
                    textStyle={styles.modalButtonText}
                  />
                  <Button
                    text="Enregistrer"
                    onPress={handleAddEvolution}
                    style={styles.modalButton}
                    textStyle={styles.modalButtonText}
                  />
                </View>
              </View>
            </View>
          </Modal>
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
  scrollView: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: Layout.spacing.lg,
  },
  periodFilter: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: Layout.spacing.lg,
  },
  periodButton: {
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
    borderRadius: Layout.borderRadius.pill,
    marginHorizontal: Layout.spacing.xs,
    backgroundColor: Colors.gray.ultraLight,
  },
  activePeriod: {
    backgroundColor: Colors.brandBlue[0],
  },
  periodText: {
    ...TextStyles.body,
    color: Colors.gray.dark,
  },
  activePeriodText: {
    color: Colors.white,
    fontWeight: "600",
  },
  graphCard: {
    marginBottom: Layout.spacing.md, // Réduit de lg à md
    padding: Layout.spacing.md,
  },
  statsCard: {
    marginBottom: Layout.spacing.md, // Réduit de lg à md
    padding: Layout.spacing.md,
  },
  recordsCard: {
    marginBottom: Layout.spacing.lg,
    padding: Layout.spacing.md,
  },
  sectionTitle: {
    ...TextStyles.h4,
    marginBottom: Layout.spacing.md,
    flex: 1, // Permet au titre de s'adapter
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.gray.dark,
  },
  chartContainer: {
    height: 220, // Réduit de 250 à 220
    alignItems: "center",
    marginBottom: -Layout.spacing.md, // Réduit l'espace en bas
  },
  noDataContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    ...TextStyles.body,
    color: Colors.gray.dark,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Layout.spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    ...TextStyles.caption,
    color: Colors.gray.dark,
    marginBottom: 4,
  },
  statValue: {
    ...TextStyles.bodyLarge,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray.ultraLight,
    marginVertical: Layout.spacing.md,
  },
  recordsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Layout.spacing.sm,
    width: "100%", // Assurez-vous que la largeur est à 100%
  },
  addButton: {
    marginLeft: Layout.spacing.sm,
    minWidth: 90, // Fixe une largeur minimale
  },
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.ultraLight,
    marginBottom: Layout.spacing.xs,
  },
  recordHeaderText: {
    ...TextStyles.bodySmall,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  recordItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.ultraLight,
  },
  recordText: {
    ...TextStyles.body,
    flex: 1,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Layout.spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.lg,
    width: "100%",
    padding: Layout.spacing.lg,
    ...Layout.elevation.md,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Layout.spacing.lg,
  },
  modalTitle: {
    ...TextStyles.h4,
  },
  modalBody: {
    marginBottom: Layout.spacing.lg,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 50,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: Layout.spacing.xs + 5,
  },
  modalButtonText: {
    fontSize: 16, // Taille de texte plus standard
    fontWeight: "bold",
  },
});
