import React, { createContext, useState, useContext } from "react";
import { router } from "expo-router";
import { useAuth } from "./AuthContext";
import validationService from "../services/validation.service";
import dataService from "../services/data.service";

// Types pour le processus d'inscription
interface RegistrationData {
  // Étape 1: Informations de base
  firstName: string;
  lastName: string;
  email: string;
  password: string;

  // Étape 2: Attributs physiques
  gender: string;
  birthDate: string;
  weight: number;
  height: number;

  // Étape 3: Niveau de sédentarité
  sedentaryLevelId: number;

  // Étape 4: Poids cible
  targetWeight: number;
  bmr: number;
  tdee: number;
  dailyCalories: number;
  targetDurationWeeks: number;
  caloricDeficitSurplus: number;
  weightChangeType: string; // 'loss', 'gain', 'maintain'

  // Étape 5: Plan nutritionnel
  nutritionalPlanId: number;

  // Étape 6: Régime alimentaire
  dietId: number;

  // Étape 7: Activités préférées
  activities: number[];

  // Étape 8: Séances hebdomadaires
  sessionsPerWeek: number;
}

interface RegistrationContextType {
  data: Partial<RegistrationData>;
  setField: <K extends keyof RegistrationData>(
    field: K,
    value: RegistrationData[K]
  ) => void;
  setFields: (fields: Partial<RegistrationData>) => void;
  resetForm: () => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  currentStep: number;
  totalSteps: number;
  completeRegistration: () => Promise<void>;
  validateStep: (step: number) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

const initialData: Partial<RegistrationData> = {};

const RegistrationContext = createContext<RegistrationContextType | undefined>(
  undefined
);

export const RegistrationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<Partial<RegistrationData>>(initialData);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { register } = useAuth();

  const totalSteps = 8; // 8 étapes au total (9 avec l'écran de fin)

  // Mise à jour d'un champ individuel
  const setField = <K extends keyof RegistrationData>(
    field: K,
    value: RegistrationData[K]
  ) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  // Mise à jour de plusieurs champs à la fois
  const setFields = (fields: Partial<RegistrationData>) => {
    try {
      // Filtrer les champs indéfinis ou nuls pour ne pas écraser les données existantes
      const validFields = Object.fromEntries(
        Object.entries(fields).filter(
          ([_, value]) => value !== undefined && value !== null
        )
      );

      // Journaliser les champs mis à jour (pour le débogage)
      console.log("Mise à jour des champs:", validFields);

      setData((prev) => {
        const newData = { ...prev, ...validFields };
        // Journaliser le nouvel état (pour le débogage)
        console.log("Nouvel état des données:", newData);
        return newData;
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour des champs:", error);
      setError("Une erreur est survenue lors de la mise à jour des données");
    }
  };

  // Réinitialisation du formulaire
  const resetForm = () => {
    setData(initialData);
    setCurrentStep(1);
    setError(null);
  };

  // Noms des routes pour chaque étape
  const stepRoutes = [
    "/register/step1_profile",
    "/register/step2_physical",
    "/register/step3_sedentary",
    "/register/step4_target_weight",
    "/register/step5_nutrition_plan",
    "/register/step6_diet",
    "/register/step7_activities",
    "/register/step8_sessions",
    "/register/step9_complete",
  ];

  // Navigation vers l'étape suivante
  const goToNextStep = () => {
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    router.push(stepRoutes[nextStep - 1] as any);
  };

  // Navigation vers l'étape précédente
  const goToPreviousStep = () => {
    const prevStep = currentStep - 1;
    if (prevStep >= 1) {
      setCurrentStep(prevStep);
      router.push(stepRoutes[prevStep - 1] as any);
    }
  };

  // Validation de l'étape courante
  const validateStep = async (step: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      switch (step) {
        case 1:
          // Validation de l'étape 1: Informations de base
          const profileValidation = await validationService.validateProfile({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            password: data.password || "",
          });

          if (!profileValidation.isValid) {
            // Création d'un message d'erreur combiné
            const errorMessages = Object.values(profileValidation.errors)
              .filter(Boolean)
              .join(", ");
            setError(errorMessages || "Données de profil invalides");
            return false;
          }

          // Vérifier si l'email est disponible
          const emailCheck = await validationService.checkEmail(data.email!);
          if (!emailCheck.available) {
            setError("Cette adresse email est déjà utilisée");
            return false;
          }

          return true;

        case 2:
          // Validation de l'étape 2: Attributs physiques
          const physicalValidation = await validationService.validatePhysical({
            gender: data.gender || "",
            birthDate: data.birthDate || "",
            weight: data.weight || 0,
            height: data.height || 0,
          });

          if (!physicalValidation.isValid) {
            // Création d'un message d'erreur combiné
            const errorMessages = Object.values(physicalValidation.errors)
              .filter(Boolean)
              .join(", ");
            setError(errorMessages || "Données physiques invalides");
            return false;
          }

          return true;

        case 3:
          // Validation de l'étape 3: Niveau de sédentarité
          if (data.sedentaryLevelId === undefined) {
            setError("Veuillez sélectionner un niveau d'activité");
            return false;
          }
          return true;

        case 4:
          // Validation de l'étape 4: Poids cible
          if (data.targetWeight === undefined) {
            setError("Le poids cible est requis");
            return false;
          }

          const targetWeightValidation =
            await validationService.validateTargetWeight({
              currentWeight: data.weight!,
              targetWeight: data.targetWeight,
              height: data.height!,
              gender: data.gender!,
              birthDate: data.birthDate!,
              sedentaryLevelId: data.sedentaryLevelId!,
            });

          // On accepte même si l'IMC n'est pas idéal, mais on sauvegarde les résultats du calcul
          setFields({
            bmr: targetWeightValidation.estimation?.bmr || 0,
            tdee: targetWeightValidation.estimation?.tdee || 0,
            dailyCalories:
              targetWeightValidation.estimation?.dailyCalories || 0,
            targetDurationWeeks:
              targetWeightValidation.estimation?.estimatedWeeks || 0,
            caloricDeficitSurplus:
              targetWeightValidation.estimation?.caloricAdjustment || 0,
            weightChangeType:
              targetWeightValidation.estimation?.orientation || "maintain",
          });

          return true;

        case 5:
          // Validation de l'étape 5: Plan nutritionnel
          if (data.nutritionalPlanId === undefined) {
            setError("Veuillez sélectionner un plan nutritionnel");
            return false;
          }
          return true;

        case 6:
          // Validation de l'étape 6: Régime alimentaire
          if (data.dietId === undefined) {
            setError("Veuillez sélectionner un régime alimentaire");
            return false;
          }
          return true;

        case 7:
          // Validation de l'étape 7: Activités préférées
          if (!Array.isArray(data.activities) || data.activities.length === 0) {
            setError("Veuillez sélectionner au moins une activité");
            return false;
          }
          return true;

        case 8:
          // Validation de l'étape 8: Séances hebdomadaires
          if (data.sessionsPerWeek === undefined) {
            setError("Veuillez sélectionner un nombre de séances par semaine");
            return false;
          }
          return true;

        default:
          return true;
      }
    } catch (err: any) {
      console.error(`Validation error for step ${step}:`, err);
      setError(err.message || "Une erreur est survenue lors de la validation");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Finalisation de l'inscription
  const completeRegistration = async () => {
    try {
      setLoading(true);
      setError(null);

      // Enregistrement de l'utilisateur avec toutes les données
      await register(data);
    } catch (err: any) {
      console.error("Registration completion error:", err);
      setError(err.message || "L'inscription a échoué");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegistrationContext.Provider
      value={{
        data,
        setField,
        setFields,
        resetForm,
        goToNextStep,
        goToPreviousStep,
        currentStep,
        totalSteps,
        completeRegistration,
        validateStep,
        loading,
        error,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
};

export const useRegistration = () => {
  const context = useContext(RegistrationContext);
  if (context === undefined) {
    throw new Error(
      "useRegistration must be used within a RegistrationProvider"
    );
  }
  return context;
};
