import apiService from "./api.service";

// Types pour les données de nutrition
export interface Tag {
  id: number;
  name: string;
}

export interface FoodProduct {
  id: number;
  name: string;
  image: string | null;
  type: string;
  source: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  barcode?: string;
  ingredients?: string;
  description?: string;
  preparationTime?: number;
  tags: Tag[];
}

export interface FoodEntry {
  id: number;
  foodId: number;
  name: string;
  meal: string;
  quantity: number;
  calories: number;
  image?: string;
}

export interface MacroNutrient {
  goal: number;
  consumed: number;
  remaining: number;
  percentCompleted: number;
  unit: string;
}

export interface NutritionSummary {
  calorieGoal: number;
  caloriesConsumed: number;
  caloriesRemaining: number;
  percentCompleted: number;
  macronutrients: {
    carbs: MacroNutrient;
    proteins: MacroNutrient;
    fats: MacroNutrient;
  };
}

export interface NutritionData {
  date: string;
  meals: {
    [key: string]: FoodEntry[];
  };
  totals: {
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
  };
}

export interface DayNutrition {
  date: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  goalCompleted: boolean;
  entries: FoodEntry[];
}

export interface HistoryData {
  history: DayNutrition[];
  summary: {
    totalDays: number;
    daysCompleted: number;
    calorieGoal: number;
  };
}

export interface FoodSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: "produit" | "recette";
  tagId?: number;
  source?: "user" | "admin" | "api";
}

/**
 * Utilitaire pour convertir des paramètres en query string
 */
const buildQueryString = (params: Record<string, any>): string => {
  if (!params || Object.keys(params).length === 0) return "";

  const queryParams = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");

  return queryParams ? `?${queryParams}` : "";
};

/**
 * Service pour la gestion des fonctionnalités de nutrition
 */
const nutritionService = {
  /**
   * Récupère tous les aliments avec filtrage et pagination
   */
  async getAllFoods(
    params: FoodSearchParams = {}
  ): Promise<{ foods: FoodProduct[]; pagination: any }> {
    try {
      const queryString = buildQueryString(params);
      const response = await apiService.get(`/nutrition${queryString}`);
      return response;
    } catch (error) {
      console.error("Error fetching foods:", error);
      throw error;
    }
  },

  /**
   * Récupère un aliment par son identifiant
   */
  async getFoodById(id: number): Promise<FoodProduct> {
    try {
      return await apiService.get(`/nutrition/${id}`);
    } catch (error) {
      console.error(`Error fetching food with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Récupère le résumé nutritionnel de l'utilisateur
   */
  async getNutritionSummary(): Promise<NutritionSummary> {
    try {
      return await apiService.get("/nutrition/user/summary");
    } catch (error) {
      console.error("Error fetching nutrition summary:", error);
      throw error;
    }
  },

  /**
   * Récupère le suivi nutritionnel du jour
   */
  async getTodayNutrition(): Promise<NutritionData> {
    try {
      return await apiService.get("/nutrition/user/today");
    } catch (error) {
      console.error("Error fetching today nutrition:", error);
      throw error;
    }
  },

  /**
   * Ajoute un aliment au suivi nutritionnel
   */
  async logNutrition(
    foodId: number,
    quantity: number,
    meal: string,
    date?: string
  ): Promise<any> {
    try {
      const data = { foodId, quantity, meal, date };
      return await apiService.post("/nutrition/user/log", data);
    } catch (error) {
      console.error("Error logging nutrition:", error);
      throw error;
    }
  },

  /**
   * Supprime une entrée du suivi nutritionnel
   */
  async deleteNutritionEntry(entryId: number): Promise<void> {
    try {
      await apiService.delete(`/nutrition/user/log/${entryId}`);
    } catch (error) {
      console.error(`Error deleting nutrition entry ${entryId}:`, error);
      throw error;
    }
  },

  /**
   * Récupère l'historique nutritionnel
   */
  async getNutritionHistory(
    startDate?: string,
    endDate?: string
  ): Promise<HistoryData> {
    try {
      const params: Record<string, string> = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const queryString = buildQueryString(params);
      return await apiService.get(`/nutrition/user/history${queryString}`);
    } catch (error) {
      console.error("Error fetching nutrition history:", error);
      throw error;
    }
  },
};

/**
 * Service pour l'interaction avec OpenFoodFacts
 */
const openFoodFactsService = {
  /**
   * Récupère un produit par code-barres
   */
  async getProductByBarcode(barcode: string): Promise<FoodProduct> {
    try {
      return await apiService.get(`/openfoodfacts/product/${barcode}`);
    } catch (error) {
      console.error(`Error fetching product with barcode ${barcode}:`, error);
      throw error;
    }
  },

  /**
   * Recherche des produits par terme
   */
  async searchProducts(
    query: string,
    limit: number = 10
  ): Promise<FoodProduct[]> {
    try {
      const queryString = buildQueryString({ query, limit });
      return await apiService.get(`/openfoodfacts/search${queryString}`);
    } catch (error) {
      console.error(`Error searching products with query "${query}":`, error);
      throw error;
    }
  },
};

export { nutritionService, openFoodFactsService };
