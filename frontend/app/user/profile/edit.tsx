import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import Colors from "../../../constants/Colors";
import Layout from "../../../constants/Layout";
import { TextStyles } from "../../../constants/Fonts";
import Header from "../../../components/layout/Header";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import DatePicker from "../../../components/ui/DatePicker";
import userService, { ProfileUpdateData } from "../../../services/user.service";
import SelectableOption from "../../../components/registration/SelectableOption";
import dataService from "../../../services/data.service";
import NumericInput from "../../../components/ui/NumericInput";
import NutritionalPlansSelector from "../../../components/nutrition/NutritionalPlansSelector";

export default function EditProfile() {
  const [userData, setUserData] = useState<any>(null);
  const [profileForm, setProfileForm] = useState<ProfileUpdateData>({});
  const [preferencesForm, setPreferencesForm] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentTab, setCurrentTab] = useState("profile"); // 'profile' or 'preferences'
  const [weightGoalType, setWeightGoalType] = useState<
    "perte_de_poids" | "prise_de_poids" | "maintien" | null
  >(null);

  // Data for dropdowns
  const [sedentaryLevels, setSedentaryLevels] = useState<any[]>([]);
  const [nutritionalPlans, setNutritionalPlans] = useState<any[]>([]);
  const [diets, setDiets] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [sessionOptions, setSessionOptions] = useState<any[]>([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    fetchDropdownData();
  }, []);

  // Fonction pour déterminer l'objectif de poids en fonction du poids actuel et du poids cible
  const determineWeightGoalType = (currentWeight, targetWeight) => {
    if (!currentWeight || !targetWeight) return "maintien";

    const difference = targetWeight - currentWeight;

    if (difference < -0.5) return "perte_de_poids";
    if (difference > 0.5) return "prise_de_poids";
    return "maintien";
  };

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await userService.getUserProfile();

      setUserData(response);

      // Initialize profile form
      setProfileForm({
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        email: response.user.email,
        gender: response.user.gender,
        birthDate: response.user.birthDate,
      });

      // Initialize preferences form
      if (response.metrics && response.preferences) {
        const currentWeight = response.metrics.currentWeight;
        const targetWeight = response.metrics.targetWeight;

        // Déterminer l'objectif de poids
        const goalType = determineWeightGoalType(currentWeight, targetWeight);
        setWeightGoalType(goalType);

        setPreferencesForm({
          targetWeight: targetWeight,
          sedentaryLevelId: response.preferences.sedentaryLevel?.id,
          nutritionalPlanId: response.preferences.nutritionalPlan?.id,
          dietId: response.preferences.diet?.id,
          sessionsPerWeek: response.metrics.sessionsPerWeek,
          activities:
            response.preferences.activities?.map((a: any) => a.id_activite) ||
            [],
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      Alert.alert("Erreur", "Impossible de charger les données du profil");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      setLoadingDropdowns(true);

      // Fetch sedentary levels
      const sedentaryLevelsData = await dataService.getSedentaryLevels();
      setSedentaryLevels(sedentaryLevelsData);

      // Fetch nutritional plans
      const nutritionalPlansData = await dataService.getNutritionalPlans();
      setNutritionalPlans(nutritionalPlansData);

      // Fetch diets
      const dietsData = await dataService.getDiets();
      setDiets(dietsData);

      // Fetch activities
      const activitiesData = await dataService.getActivities();
      setActivities(activitiesData);

      // Fetch session options
      const sessionOptionsData = await dataService.getWeeklySessions();
      setSessionOptions(sessionOptionsData);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      Alert.alert(
        "Erreur",
        "Impossible de charger les données des listes déroulantes"
      );
    } finally {
      setLoadingDropdowns(false);
    }
  };

  const handleProfileChange = (field: keyof ProfileUpdateData, value: any) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePreferencesChange = (field: string, value: any) => {
    setPreferencesForm((prev) => {
      const newForm = { ...prev, [field]: value };

      // Si le poids cible change, mettre à jour l'objectif de poids
      if (field === "targetWeight" && userData?.metrics?.currentWeight) {
        const newGoalType = determineWeightGoalType(
          userData.metrics.currentWeight,
          value
        );
        setWeightGoalType(newGoalType);
      }

      return newForm;
    });
  };

  const toggleActivity = (activityId: number) => {
    setPreferencesForm((prev) => {
      const activities = prev.activities || [];
      // Convert to number to ensure type consistency
      const numActivityId = Number(activityId);

      // Check if the activity is already in the list
      const exists = activities.some((id) => Number(id) === numActivityId);

      if (exists) {
        return {
          ...prev,
          activities: activities.filter((id) => Number(id) !== numActivityId),
        };
      } else {
        return {
          ...prev,
          activities: [...activities, numActivityId],
        };
      }
    });
  };

  const saveProfile = async () => {
    try {
      setIsSaving(true);

      // Basic validation
      if (
        !profileForm.firstName ||
        !profileForm.lastName ||
        !profileForm.email
      ) {
        Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
        return;
      }

      // Save profile
      await userService.updateProfile(profileForm);

      Alert.alert("Succès", "Profil mis à jour avec succès");
      await fetchUserProfile(); // Refresh data
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Erreur", "Impossible de mettre à jour le profil");
    } finally {
      setIsSaving(false);
    }
  };

  const savePreferences = async () => {
    try {
      setIsSaving(true);

      // Basic validation
      if (!preferencesForm.targetWeight) {
        Alert.alert("Erreur", "Veuillez spécifier un poids cible");
        return;
      }

      // Save preferences
      await userService.updatePreferences(preferencesForm);

      Alert.alert("Succès", "Préférences mises à jour avec succès");
      await fetchUserProfile(); // Refresh data
    } catch (error) {
      console.error("Error updating preferences:", error);
      Alert.alert("Erreur", "Impossible de mettre à jour les préférences");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header
          title="Modifier le profil"
          showBackButton
          onBackPress={() => router.back()}
          style={{ marginTop: Layout.spacing.md }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.brandBlue[0]} />
          <Text style={styles.loadingText}>Chargement des données...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <Header
          title="Modifier le profil"
          showBackButton
          onBackPress={() => router.back()}
          style={{ marginTop: Layout.spacing.md }}
        />

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, currentTab === "profile" && styles.activeTab]}
            onPress={() => setCurrentTab("profile")}
          >
            <Text
              style={[
                styles.tabText,
                currentTab === "profile" && styles.activeTabText,
              ]}
            >
              Profil
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              currentTab === "preferences" && styles.activeTab,
            ]}
            onPress={() => setCurrentTab("preferences")}
          >
            <Text
              style={[
                styles.tabText,
                currentTab === "preferences" && styles.activeTabText,
              ]}
            >
              Préférences
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Form */}
          {currentTab === "profile" && (
            <Card style={styles.formCard}>
              <Text style={styles.sectionTitle}>Informations personnelles</Text>

              <Input
                label="Prénom"
                value={profileForm.firstName}
                onChangeText={(text) => handleProfileChange("firstName", text)}
                icon="person-outline"
                placeholder="Votre prénom"
              />

              <Input
                label="Nom"
                value={profileForm.lastName}
                onChangeText={(text) => handleProfileChange("lastName", text)}
                icon="person-outline"
                placeholder="Votre nom"
              />

              <Input
                label="Email"
                value={profileForm.email}
                onChangeText={(text) => handleProfileChange("email", text)}
                icon="mail-outline"
                placeholder="Votre email"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.fieldLabel}>Sexe</Text>
              <View style={styles.genderOptions}>
                <SelectableOption
                  title="Homme"
                  selected={profileForm.gender === "H"}
                  onPress={() => handleProfileChange("gender", "H")}
                  icon="male"
                />
                <SelectableOption
                  title="Femme"
                  selected={profileForm.gender === "F"}
                  onPress={() => handleProfileChange("gender", "F")}
                  icon="female"
                />
                <SelectableOption
                  title="Non spécifié"
                  selected={profileForm.gender === "NS"}
                  onPress={() => handleProfileChange("gender", "NS")}
                  icon="person"
                />
              </View>

              <Text style={styles.fieldLabel}>Date de naissance</Text>
              <DatePicker
                value={
                  profileForm.birthDate ? new Date(profileForm.birthDate) : null
                }
                onChange={(date) =>
                  handleProfileChange(
                    "birthDate",
                    date ? date.toISOString().split("T")[0] : ""
                  )
                }
                maxDate={
                  new Date(
                    new Date().setFullYear(new Date().getFullYear() - 13)
                  )
                }
                placeholder="Sélectionner votre date de naissance"
              />

              <Button
                text="Enregistrer"
                onPress={saveProfile}
                loading={isSaving}
                fullWidth
                style={styles.submitButton}
              />
            </Card>
          )}

          {/* Preferences Form */}
          {currentTab === "preferences" && (
            <>
              <Card style={styles.formCard}>
                <Text style={styles.sectionTitle}>Objectifs</Text>

                <NumericInput
                  label="Poids cible (kg)"
                  value={preferencesForm.targetWeight?.toString()}
                  onChangeText={(value) =>
                    handlePreferencesChange("targetWeight", parseFloat(value))
                  }
                  min={30}
                  max={300}
                  precision={1}
                  icon="barbell-outline"
                  placeholder="Votre poids cible"
                />

                <Text style={styles.fieldLabel}>
                  Niveau d'activité quotidienne
                </Text>
                {loadingDropdowns ? (
                  <ActivityIndicator size="small" color={Colors.brandBlue[0]} />
                ) : (
                  sedentaryLevels.map((level) => (
                    <SelectableOption
                      key={level.id_niveau_sedentarite}
                      title={level.nom}
                      subtitle={level.description}
                      selected={
                        preferencesForm.sedentaryLevelId ===
                        level.id_niveau_sedentarite
                      }
                      onPress={() =>
                        handlePreferencesChange(
                          "sedentaryLevelId",
                          level.id_niveau_sedentarite
                        )
                      }
                    />
                  ))
                )}
              </Card>

              <Card style={styles.formCard}>
                <Text style={styles.sectionTitle}>Nutrition</Text>

                <Text style={styles.fieldLabel}>Plan nutritionnel</Text>

                {/* Utiliser le nouveau composant NutritionalPlansSelector */}
                {loadingDropdowns ? (
                  <ActivityIndicator size="small" color={Colors.brandBlue[0]} />
                ) : (
                  <NutritionalPlansSelector
                    plans={nutritionalPlans}
                    selectedPlanId={preferencesForm.nutritionalPlanId}
                    onPlanSelected={(planId) =>
                      handlePreferencesChange("nutritionalPlanId", planId)
                    }
                    isLoading={loadingDropdowns}
                    userWeightGoal={weightGoalType}
                  />
                )}

                <Text style={styles.fieldLabel}>Régime alimentaire</Text>
                {loadingDropdowns ? (
                  <ActivityIndicator size="small" color={Colors.brandBlue[0]} />
                ) : (
                  diets.map((diet) => (
                    <SelectableOption
                      key={diet.id_regime_alimentaire}
                      title={diet.nom}
                      subtitle={diet.description}
                      selected={
                        preferencesForm.dietId === diet.id_regime_alimentaire
                      }
                      onPress={() =>
                        handlePreferencesChange(
                          "dietId",
                          diet.id_regime_alimentaire
                        )
                      }
                    />
                  ))
                )}
              </Card>

              <Card style={styles.formCard}>
                <Text style={styles.sectionTitle}>Activités physiques</Text>

                <Text style={styles.fieldLabel}>Séances par semaine</Text>
                {loadingDropdowns ? (
                  <ActivityIndicator size="small" color={Colors.brandBlue[0]} />
                ) : (
                  sessionOptions.map((option) => (
                    <SelectableOption
                      key={option.id}
                      title={option.value}
                      subtitle={option.label}
                      selected={preferencesForm.sessionsPerWeek === option.id}
                      onPress={() =>
                        handlePreferencesChange("sessionsPerWeek", option.id)
                      }
                    />
                  ))
                )}

                <Text style={styles.fieldLabel}>Activités préférées</Text>
                <Text style={styles.helperText}>
                  Vous pouvez sélectionner plusieurs activités
                </Text>
                {loadingDropdowns ? (
                  <ActivityIndicator size="small" color={Colors.brandBlue[0]} />
                ) : (
                  activities.map((activity) => (
                    <SelectableOption
                      key={activity.id_activite}
                      title={activity.nom}
                      subtitle={activity.description}
                      selected={
                        Array.isArray(preferencesForm.activities) &&
                        preferencesForm.activities.some(
                          (id) => Number(id) === Number(activity.id_activite)
                        )
                      }
                      onPress={() => toggleActivity(activity.id_activite)}
                    />
                  ))
                )}

                <Button
                  text="Enregistrer"
                  onPress={savePreferences}
                  loading={isSaving}
                  fullWidth
                  style={styles.submitButton}
                />
              </Card>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.gray.dark,
    marginTop: Layout.spacing.md,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.ultraLight,
  },
  tab: {
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    flex: 1,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.brandBlue[0],
  },
  tabText: {
    ...TextStyles.body,
    color: Colors.gray.dark,
  },
  activeTabText: {
    color: Colors.brandBlue[0],
    fontWeight: "600",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xxl,
  },
  formCard: {
    marginBottom: Layout.spacing.lg,
    padding: Layout.spacing.md,
  },
  sectionTitle: {
    ...TextStyles.h4,
    marginBottom: Layout.spacing.md,
  },
  fieldLabel: {
    ...TextStyles.label,
    marginBottom: Layout.spacing.sm,
    marginTop: Layout.spacing.md,
  },
  genderOptions: {
    marginBottom: Layout.spacing.md,
  },
  helperText: {
    ...TextStyles.caption,
    color: Colors.gray.dark,
    marginBottom: Layout.spacing.sm,
    marginTop: -Layout.spacing.xs,
  },
  submitButton: {
    marginTop: Layout.spacing.lg,
  },
});
