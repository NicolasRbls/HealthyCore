import apiService from "./api.service";

// Types pour les données
export interface SedentaryLevel {
  id_niveau_sedentarite: number;
  nom: string;
  description: string;
  valeur: number;
}

export interface NutritionalPlan {
  id_repartition_nutritionnelle: number;
  nom: string;
  description: string;
  type: string;
  pourcentage_glucides: number;
  pourcentage_proteines: number;
  pourcentage_lipides: number;
}

export interface Diet {
  id_regime_alimentaire: number;
  nom: string;
  description: string;
}

export interface Activity {
  id_activite: number;
  nom: string;
  description: string;
}

export interface WeeklySession {
  id: number;
  value: string;
  label: string;
}

export interface UserPreferences {
  preferences: any;
  currentWeight: number | null;
  currentHeight: number | null;
  macroDistribution: any;
  tdee: number | null;
}

export interface EvolutionData {
  date: string;
  weight: number;
  height: number;
  bmi: string;
}

// Service de données
const dataService = {
  /**
   * Récupère les niveaux de sédentarité
   */
  async getSedentaryLevels(): Promise<SedentaryLevel[]> {
    return apiService.get<SedentaryLevel[]>(
      "/data/sedentary-levels",
      {},
      false
    );
  },

  /**
   * Récupère les plans nutritionnels
   * @param type - Type de plan nutritionnel (perte_de_poids, prise_de_poids, maintien)
   */
  async getNutritionalPlans(type?: string): Promise<NutritionalPlan[]> {
    const endpoint = type
      ? `/data/nutritional-plans?type=${type}`
      : "/data/nutritional-plans";
    return apiService.get<NutritionalPlan[]>(endpoint, {}, false);
  },

  /**
   * Récupère les régimes alimentaires
   */
  async getDiets(): Promise<Diet[]> {
    return apiService.get<Diet[]>("/data/diets", {}, false);
  },

  /**
   * Récupère les activités
   */
  async getActivities(): Promise<Activity[]> {
    return apiService.get<Activity[]>("/data/activities", {}, false);
  },

  /**
   * Récupère les options de sessions hebdomadaires
   */
  async getWeeklySessions(): Promise<WeeklySession[]> {
    return apiService.get<WeeklySession[]>("/data/weekly-sessions", {}, false);
  },

  /**
   * Récupère les préférences de l'utilisateur
   */
  async getUserPreferences(): Promise<UserPreferences> {
    return apiService.get<UserPreferences>("/data/user-preferences");
  },

  /**
   * Récupère l'évolution de l'utilisateur
   */
  async getUserEvolution(): Promise<EvolutionData[]> {
    return apiService.get<EvolutionData[]>("/data/user-evolution");
  },
};

export default dataService;
