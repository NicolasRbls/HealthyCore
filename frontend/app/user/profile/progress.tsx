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
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path, Line, Circle, Text as SvgText } from "react-native-svg";
import Colors from "../../../constants/Colors";
import Layout from "../../../constants/Layout";
import { TextStyles } from "../../../constants/Fonts";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Header from "../../../components/layout/Header";
import NumericInput from "../../../components/ui/NumericInput";
import DatePicker from "../../../components/ui/DatePicker";
import { router } from "expo-router";
import userService, {
  EvolutionEntry,
  EvolutionStatistics,
  ProgressStats,
} from "../../../services/user.service";

export default function ProgressScreen() {
  const [evolutionData, setEvolutionData] = useState<EvolutionEntry[]>([]);
  const [statistics, setStatistics] = useState<EvolutionStatistics | null>(
    null
  );
  const [progressStats, setProgressStats] = useState<ProgressStats | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [period, setPeriod] = useState("month"); // "all", "month", "year"

  // État pour le formulaire d'ajout d'évolution
  const [newEvolution, setNewEvolution] = useState({
    weight: "",
    height: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchEvolutionData();
    fetchProgressStats();
  }, [period]);

  const fetchEvolutionData = async () => {
    try {
      setLoading(true);
      let startDate: string | undefined;

      // Determine start date based on period
      if (period === "month") {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        startDate = date.toISOString().split("T")[0];
      } else if (period === "year") {
        const date = new Date();
        date.setFullYear(date.getFullYear() - 1);
        startDate = date.toISOString().split("T")[0];
      }

      const response = await userService.getUserEvolution(startDate);
      // Ensure we have arrays even if the API returns null/undefined
      setEvolutionData(response.evolution || []);
      setStatistics(response.statistics || null);
    } catch (error) {
      console.error("Error fetching evolution data:", error);
      Alert.alert("Erreur", "Impossible de charger les données d'évolution.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProgressStats = async () => {
    try {
      const stats = await userService.getProgressStats(
        period === "all" ? "year" : period
      );
      setProgressStats(stats || null);
    } catch (error) {
      console.error("Error fetching progress stats:", error);
      // Set default values for progress stats if there's an error
      setProgressStats(null);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchEvolutionData();
      await fetchProgressStats();
    } finally {
      setRefreshing(false);
    }
  };

  // Gérer l'ajout d'une nouvelle évolution
  const handleAddEvolution = async () => {
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

    try {
      setLoading(true);
      await userService.addEvolutionEntry({
        weight,
        height,
        date: newEvolution.date,
      });

      // Réinitialiser le formulaire et fermer le modal
      setNewEvolution({
        weight: "",
        height: "",
        date: new Date().toISOString().split("T")[0],
      });
      setShowAddModal(false);

      // Rafraîchir les données
      await fetchEvolutionData();
      Alert.alert("Succès", "Évolution enregistrée avec succès");
    } catch (error) {
      console.error("Error adding evolution:", error);
      Alert.alert("Erreur", "Impossible d'enregistrer l'évolution.");
    } finally {
      setLoading(false);
    }
  };

  // Graphique de ligne personnalisé
  const SimpleLineChart = ({ data }: { data: EvolutionEntry[] }) => {
    if (!data || data.length === 0) return null;

    const width = Layout.window.width - 80;
    const height = 220;
    const padding = { top: 20, right: 20, bottom: 40, left: 40 };

    // Trouver les valeurs min et max pour les axes
    const weights = data.map((d) => d.weight);
    const minWeight = Math.floor(Math.min(...weights)) - 1;
    const maxWeight = Math.ceil(Math.max(...weights)) + 1;

    // Fonction de mise à l'échelle pour les positions X et Y
    const scaleX = (index: number) =>
      padding.left +
      (index / Math.max(data.length - 1, 1)) *
        (width - padding.left - padding.right);

    const scaleY = (value: number) =>
      height -
      padding.bottom -
      ((value - minWeight) / Math.max(maxWeight - minWeight, 1)) *
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
        {data.length > 0 &&
          data.map((d, i) =>
            // Only show labels for first, middle and last point if too many points
            data.length <= 5 ||
            i === 0 ||
            i === Math.floor(data.length / 2) ||
            i === data.length - 1 ? (
              <SvgText
                key={`label-${i}`}
                x={scaleX(i)}
                y={height - padding.bottom + 15}
                fontSize="10"
                fill={Colors.gray.dark}
                textAnchor="middle"
              >
                {new Date(d.date).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "2-digit",
                })}
              </SvgText>
            ) : null
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

  // Safe number formatting function
  const formatNumber = (value: any, decimals: number = 1): string => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return "0";
    }
    return Number(value).toFixed(decimals);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Ma progression"
        showBackButton
        onBackPress={() => router.back()}
        style={{ marginTop: Layout.spacing.md }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.brandBlue[0]]}
            tintColor={Colors.brandBlue[0]}
          />
        }
      >
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
            ) : evolutionData.length > 0 ? (
              <View style={styles.chartContainer}>
                <SimpleLineChart data={evolutionData} />
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
          <Card style={styles.statsCard}>
            <Text style={styles.sectionTitle}>
              Statistiques sur{" "}
              {period === "all"
                ? "toute la période"
                : period === "month"
                ? "le mois"
                : "l'année"}
            </Text>

            {statistics &&
            statistics.initialWeight &&
            statistics.currentWeight ? (
              <>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Poids initial</Text>
                    <Text style={styles.statValue}>
                      {formatNumber(statistics.initialWeight)} kg
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Poids actuel</Text>
                    <Text style={styles.statValue}>
                      {formatNumber(statistics.currentWeight)} kg
                    </Text>
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Différence</Text>
                    <Text style={[styles.statValue]}>
                      {formatNumber(statistics.weightChange)} kg
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Pourcentage</Text>
                    <Text style={[styles.statValue]}>
                      {formatNumber(statistics.weightChangePercentage)}%
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>IMC initial</Text>
                    <Text style={styles.statValue}>
                      {formatNumber(statistics.initialBmi)}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>IMC actuel</Text>
                    <Text style={styles.statValue}>
                      {formatNumber(statistics.currentBmi)}
                    </Text>
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Différence IMC</Text>
                    {statistics.initialBmi && statistics.currentBmi ? (
                      <Text style={[styles.statValue]}>
                        {formatNumber(
                          Number(statistics.currentBmi) -
                            Number(statistics.initialBmi)
                        )}
                      </Text>
                    ) : (
                      <Text style={[styles.statValue]}>0</Text>
                    )}
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Catégorie</Text>
                    <Text style={styles.statValue}>
                      {statistics.currentBmi
                        ? Number(statistics.currentBmi) < 18.5
                          ? "Maigreur"
                          : Number(statistics.currentBmi) < 25
                          ? "Normal"
                          : Number(statistics.currentBmi) < 30
                          ? "Surpoids"
                          : "Obésité"
                        : "Non disponible"}
                    </Text>
                  </View>
                </View>
              </>
            ) : evolutionData.length > 0 ? (
              // Fallback to single entry stats if we have at least one entry
              <>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Poids actuel</Text>
                    <Text style={styles.statValue}>
                      {formatNumber(
                        evolutionData[evolutionData.length - 1].weight
                      )}{" "}
                      kg
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Taille</Text>
                    <Text style={styles.statValue}>
                      {formatNumber(
                        evolutionData[evolutionData.length - 1].height
                      )}{" "}
                      cm
                    </Text>
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>IMC actuel</Text>
                    <Text style={styles.statValue}>
                      {formatNumber(
                        evolutionData[evolutionData.length - 1].bmi
                      )}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Catégorie</Text>
                    <Text style={styles.statValue}>
                      {Number(evolutionData[evolutionData.length - 1].bmi) <
                      18.5
                        ? "Maigreur"
                        : Number(evolutionData[evolutionData.length - 1].bmi) <
                          25
                        ? "Normal"
                        : Number(evolutionData[evolutionData.length - 1].bmi) <
                          30
                        ? "Surpoids"
                        : "Obésité"}
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <Text style={styles.noDataText}>
                Pas assez de données pour calculer les statistiques sur cette
                période.
              </Text>
            )}
          </Card>

          {/* Statistiques supplémentaires */}
          {progressStats && (
            <Card style={styles.progressStatsCard}>
              <Text style={styles.sectionTitle}>Résumé de progression</Text>

              <View style={styles.progressSection}>
                <Text style={styles.progressSectionTitle}>Nutrition</Text>
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>Calories moyennes :</Text>
                  <Text style={styles.progressValue}>
                    {progressStats.nutrition?.averageCalories || 0} kcal
                  </Text>
                </View>
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>Protéines moyennes :</Text>
                  <Text style={styles.progressValue}>
                    {progressStats.nutrition?.averageProteins || 0} g
                  </Text>
                </View>
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>Taux de suivi :</Text>
                  <Text style={styles.progressValue}>
                    {progressStats.nutrition?.goalCompletionRate || 0}%
                  </Text>
                </View>
              </View>

              <View style={styles.progressSection}>
                <Text style={styles.progressSectionTitle}>Activité</Text>
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>Séances complétées :</Text>
                  <Text style={styles.progressValue}>
                    {progressStats.activity?.completedSessions || 0}
                  </Text>
                </View>
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>
                    Séances par semaine :
                  </Text>
                  <Text style={styles.progressValue}>
                    {progressStats.activity?.sessionsPerWeek || 0}
                  </Text>
                </View>
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>
                    Type d'activité favorite :
                  </Text>
                  <Text style={styles.progressValue}>
                    {progressStats.activity?.mostFrequentActivity
                      ? progressStats.activity.mostFrequentActivity
                          .charAt(0)
                          .toUpperCase() +
                        progressStats.activity.mostFrequentActivity.slice(1)
                      : "Aucune"}
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

                {evolutionData.length > 0 ? (
                  [...evolutionData].reverse().map((item, index) => (
                    <View key={index} style={styles.recordItem}>
                      <Text style={styles.recordText}>
                        {new Date(item.date).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                        })}
                      </Text>
                      <Text style={styles.recordText}>{item.weight} kg</Text>
                      <Text style={styles.recordText}>{item.height} cm</Text>
                      <Text style={styles.recordText}>{item.bmi}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noDataText}>
                    Aucune donnée d'évolution disponible
                  </Text>
                )}
              </>
            )}
          </Card>
        </View>
      </ScrollView>

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
                value={newEvolution.date ? new Date(newEvolution.date) : null}
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
    marginBottom: Layout.spacing.md,
    padding: Layout.spacing.md,
  },
  statsCard: {
    marginBottom: Layout.spacing.md,
    padding: Layout.spacing.md,
  },
  progressStatsCard: {
    marginBottom: Layout.spacing.md,
    padding: Layout.spacing.md,
  },
  recordsCard: {
    marginBottom: Layout.spacing.lg,
    padding: Layout.spacing.md,
  },
  sectionTitle: {
    ...TextStyles.h4,
    marginBottom: Layout.spacing.md,
    flex: 1,
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
    height: 220,
    alignItems: "center",
    marginBottom: -Layout.spacing.md,
  },
  noDataContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    ...TextStyles.body,
    color: Colors.gray.dark,
    textAlign: "center",
    padding: Layout.spacing.md,
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
    width: "100%",
  },
  addButton: {
    marginLeft: Layout.spacing.sm,
    minWidth: 90,
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
    fontSize: 16,
    fontWeight: "bold",
  },
  progressSection: {
    marginBottom: Layout.spacing.md,
    padding: Layout.spacing.md,
    backgroundColor: Colors.gray.ultraLight,
    borderRadius: Layout.borderRadius.md,
  },
  progressSectionTitle: {
    ...TextStyles.bodyLarge,
    fontWeight: "600",
    marginBottom: Layout.spacing.sm,
    color: Colors.brandBlue[0],
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Layout.spacing.xs,
  },
  progressLabel: {
    ...TextStyles.body,
    color: Colors.gray.dark,
  },
  progressValue: {
    ...TextStyles.body,
    fontWeight: "600",
  },
});
