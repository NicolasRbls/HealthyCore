import apiService from "./api.service";

// Types pour la validation
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string | null>;
}

export interface TargetWeightValidationData {
  currentWeight: number;
  targetWeight: number;
  height: number;
  gender: string;
  birthDate: string;
  sedentaryLevelId: number;
}

export interface TargetWeightValidationResult {
  isValid: boolean;
  targetBMI: number;
  estimation?: {
    bmr: number;
    tdee: number;
    dailyCalories: number;
    caloricAdjustment: number;
    estimatedDays: number;
    estimatedWeeks: number;
    weeklyChange: number;
    orientation: "loss" | "gain" | "maintain";
  };
  message: string;
}

// Service de validation
const validationService = {
  /**
   * Vérifie si un email est disponible
   * @param email - Email à vérifier
   */
  async checkEmail(email: string): Promise<{ available: boolean }> {
    return apiService.post<{ available: boolean }>(
      "/validation/check-email",
      { email },
      {},
      false
    );
  },

  /**
   * Valide les données du profil
   * @param profileData - Données du profil (prénom, nom, email, mot de passe)
   */
  async validateProfile(profileData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<ValidationResult> {
    return apiService.post<ValidationResult>(
      "/validation/validate-profile",
      profileData,
      {},
      false
    );
  },

  /**
   * Valide les attributs physiques
   * @param physicalData - Données physiques (genre, date de naissance, poids, taille)
   */
  async validatePhysical(physicalData: {
    gender: string;
    birthDate: string;
    weight: number;
    height: number;
  }): Promise<ValidationResult> {
    return apiService.post<ValidationResult>(
      "/validation/validate-physical",
      physicalData,
      {},
      false
    );
  },

  /**
   * Valide le poids cible et calcule l'estimation
   * @param weightData - Données pour le calcul d'estimation
   */
  async validateTargetWeight(
    weightData: TargetWeightValidationData
  ): Promise<TargetWeightValidationResult> {
    return apiService.post<TargetWeightValidationResult>(
      "/validation/validate-target-weight",
      weightData,
      {},
      false
    );
  },

  /**
   * Calcule l'âge à partir d'une date de naissance
   * @param birthDate - Date de naissance au format 'YYYY-MM-DD'
   */
  calculateAge(birthDate: string): number {
    const today = new Date();
    const birthDateObj = new Date(birthDate);

    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
    ) {
      age--;
    }

    return age;
  },
};

export default validationService;
