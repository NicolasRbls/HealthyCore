import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "../../constants/Colors";
import Layout from "../../constants/Layout";
import { TextStyles } from "../../constants/Fonts";
import Button from "./Button";
import Card from "./Card";
import NumericInput from "./NumericInput";
import userService, { WeightUpdateStatus } from "../../services/user.service";

interface WeightUpdateReminderProps {
  onWeightUpdated?: () => void;
}

const WeightUpdateReminder: React.FC<WeightUpdateReminderProps> = ({
  onWeightUpdated,
}) => {
  const [status, setStatus] = useState<WeightUpdateStatus | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [height, setHeight] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkWeightUpdateStatus();
  }, []);

  const checkWeightUpdateStatus = async () => {
    try {
      setChecking(true);
      const result = await userService.checkWeightUpdateStatus();
      setStatus(result);

      // If weight needs to be updated, get current height
      if (result.needsUpdate) {
        const profile = await userService.getUserProfile();
        if (profile.metrics?.currentHeight) {
          setHeight(profile.metrics.currentHeight.toString());
        }
      }
    } catch (error) {
      console.error("Error checking weight update status:", error);
    } finally {
      setChecking(false);
    }
  };

  const handleUpdateWeight = async () => {
    if (!newWeight || parseFloat(newWeight) <= 0) {
      Alert.alert("Erreur", "Veuillez entrer un poids valide");
      return;
    }

    try {
      setIsLoading(true);
      await userService.addEvolutionEntry({
        weight: parseFloat(newWeight),
        height: parseFloat(height),
      });

      setShowModal(false);
      setStatus(null);
      Alert.alert("Succès", "Votre poids a été mis à jour avec succès");

      if (onWeightUpdated) {
        onWeightUpdated();
      }
    } catch (error) {
      console.error("Error updating weight:", error);
      Alert.alert("Erreur", "Impossible de mettre à jour votre poids");
    } finally {
      setIsLoading(false);
    }
  };

  if (checking || !status || !status.needsUpdate) {
    return null;
  }

  return (
    <>
      <Card style={styles.container}>
        <View style={styles.contentRow}>
          <Ionicons
            name="scale-outline"
            size={24}
            color={Colors.brandBlue[0]}
            style={styles.icon}
          />
          <View style={styles.textContainer}>
            <Text style={styles.title}>Mise à jour du poids nécessaire</Text>
            <Text style={styles.description}>
              Votre dernière mise à jour date d'il y a{" "}
              {status.daysSinceLastUpdate} jours. Mettez à jour votre poids pour
              un suivi plus précis.
            </Text>
          </View>
        </View>
        <View style={styles.actionRow}>
          <Button
            text="Mettre à jour maintenant"
            size="sm"
            onPress={() => setShowModal(true)}
            style={styles.updateButton}
          />
          <TouchableOpacity
            onPress={() => setStatus(null)}
            style={styles.dismissButton}
          >
            <Text style={styles.dismissText}>Plus tard</Text>
          </TouchableOpacity>
        </View>
      </Card>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mettre à jour votre poids</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={Colors.gray.dark} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <NumericInput
                label="Poids actuel (kg)"
                value={newWeight}
                onChangeText={setNewWeight}
                min={30}
                max={300}
                precision={1}
                icon="barbell-outline"
                placeholder="Entrez votre poids actuel"
              />

              <Text style={styles.dateNote}>
                Date: Aujourd'hui ({new Date().toLocaleDateString()})
              </Text>
            </View>

            <View style={styles.modalFooter}>
              <Button
                text="Annuler"
                variant="outline"
                onPress={() => setShowModal(false)}
                style={styles.modalButton}
              />
              <Button
                text="Enregistrer"
                onPress={handleUpdateWeight}
                loading={isLoading}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.md,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: Layout.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...TextStyles.bodyLarge,
    fontWeight: "600",
    marginBottom: 4,
  },
  description: {
    ...TextStyles.bodySmall,
    color: Colors.gray.dark,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: Layout.spacing.md,
  },
  updateButton: {
    marginRight: Layout.spacing.md,
  },
  dismissButton: {
    padding: Layout.spacing.sm,
  },
  dismissText: {
    ...TextStyles.bodySmall,
    color: Colors.gray.dark,
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
  dateNote: {
    ...TextStyles.caption,
    color: Colors.gray.dark,
    marginTop: Layout.spacing.md,
    fontStyle: "italic",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    marginHorizontal: Layout.spacing.xs,
  },
});

export default WeightUpdateReminder;
