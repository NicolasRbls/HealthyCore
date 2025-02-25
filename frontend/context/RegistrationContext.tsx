import React, { createContext, useState, useContext } from "react";
import { router } from "expo-router";
import { useAuth } from "./AuthContext";
import validationService from "../services/validation.service";
import dataService from "../services/data.service";

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
  setField: (field: keyof RegistrationData, value: any) => void;
  setFields: (fields: Partial<RegistrationData>) => void;
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

  const totalSteps = 8;

  const setField = (field: keyof RegistrationData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const setFields = (fields: Partial<RegistrationData>) => {
    setData((prev) => ({ ...prev, ...fields }));
  };

  const stepRoutes = [
    "/auth/register",
    "/auth/register/physical",
    "/auth/register/sedentary",
    "/auth/register/target-weight",
    "/auth/register/nutrition-plan",
    "/auth/register/diet",
    "/auth/register/activities",
    "/auth/register/sessions",
    "/auth/register/complete",
  ];

  const goToNextStep = () => {
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    router.push(stepRoutes[nextStep - 1]);
  };

  const goToPreviousStep = () => {
    const prevStep = currentStep - 1;
    if (prevStep >= 1) {
      setCurrentStep(prevStep);
      router.push(stepRoutes[prevStep - 1]);
    }
  };

  const validateStep = async (step: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      switch (step) {
        case 1:
          // Validation de l'étape 1: Informations de base
          const profileValidation = await validationService.validateProfile({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
          });

          if (!profileValidation.isValid) {
            // Erreur de validation
            const errorMessages = Object.values(profileValidation.errors)
              .filter(Boolean)
              .join(", ");
            setError(errorMessages || "Invalid profile data");
            return false;
          }

          // Vérifier si l'email est disponible
          const emailCheck = await validationService.checkEmail(data.email!);
          if (!emailCheck.available) {
            setError("Email already in use");
            return false;
          }

          return true;

        case 2:
          // Validation de l'étape 2: Attributs physiques
          const physicalValidation = await validationService.validatePhysical({
            gender: data.gender,
            birthDate: data.birthDate,
            weight: data.weight,
            height: data.height,
          });

          if (!physicalValidation.isValid) {
            // Erreur de validation
            const errorMessages = Object.values(physicalValidation.errors)
              .filter(Boolean)
              .join(", ");
            setError(errorMessages || "Invalid physical data");
            return false;
          }

          return true;

        case 3:
          // Validation de l'étape 3: Niveau de sédentarité
          return data.sedentaryLevelId !== undefined;

        case 4:
          // Validation de l'étape 4: Poids cible
          if (!data.targetWeight) {
            setError("Target weight is required");
            return false;
          }

          const targetWeightValidation =
            await validationService.validateTargetWeight({
              currentWeight: data.weight,
              targetWeight: data.targetWeight,
              height: data.height,
              gender: data.gender,
              birthDate: data.birthDate,
              sedentaryLevelId: data.sedentaryLevelId,
            });

          if (!targetWeightValidation.isValid) {
            setError(targetWeightValidation.message);
            return false;
          }

          // Sauvegarder les résultats du calcul
          setFields({
            bmr: targetWeightValidation.estimation.bmr,
            tdee: targetWeightValidation.estimation.tdee,
            dailyCalories: targetWeightValidation.estimation.dailyCalories,
            targetDurationWeeks:
              targetWeightValidation.estimation.estimatedWeeks,
            caloricDeficitSurplus:
              targetWeightValidation.estimation.caloricAdjustment,
            weightChangeType: targetWeightValidation.estimation.orientation,
          });

          return true;

        case 5:
          // Validation de l'étape 5: Plan nutritionnel
          return data.nutritionalPlanId !== undefined;

        case 6:
          // Validation de l'étape 6: Régime alimentaire
          return data.dietId !== undefined;

        case 7:
          // Validation de l'étape 7: Activités préférées
          return Array.isArray(data.activities) && data.activities.length > 0;

        case 8:
          // Validation de l'étape 8: Séances hebdomadaires
          return data.sessionsPerWeek !== undefined;

        default:
          return true;
      }
    } catch (error) {
      console.error(`Validation error for step ${step}:`, error);
      setError("An error occurred during validation");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const completeRegistration = async () => {
    try {
      setLoading(true);
      setError(null);

      // Enregistrement de l'utilisateur avec toutes les données
      await register(data);

      return true;
    } catch (error: any) {
      console.error("Registration completion error:", error);
      setError(error.message || "Registration failed");
      throw error;
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
