import apiService from "./api.service";
import cacheService, { CACHE_KEYS } from "./cache.service";

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

      // Cache-Aside: Sauvegarde si première page et pas de filtres complexes
      // Pour les recettes et produits
      const isDefaultPage = !params.page || params.page === 1;
      const isSimpleFilter = !params.search && !params.source;

      if (isDefaultPage && isSimpleFilter) {
        // On utilise une clé différente selon le type pour ne pas mélanger
        const cacheKey = params.type === 'recette' ?
          `${CACHE_KEYS.NUTRITION_PAGE}_recipes` :
          CACHE_KEYS.NUTRITION_PAGE;
        await cacheService.save(cacheKey, response);
      }
      return response;
    } catch (error) {
      console.error("Error fetching foods:", error);

      // Fallback 1: Cache Cache-Aside (Prioritaire)
      const cacheKey = params.type === 'recette' ?
        `${CACHE_KEYS.NUTRITION_PAGE}_recipes` :
        CACHE_KEYS.NUTRITION_PAGE;

      const cachedPage = await cacheService.get(cacheKey);
      if (cachedPage) {
        return cachedPage;
      }

      // Fallback 2: Cache Sync (Backup)
      const cachedFoods = await cacheService.get(CACHE_KEYS.NUTRITION);
      if (cachedFoods) {
        // Filtrer selon le type demandé si possible
        let filteredFoods = cachedFoods;
        if (params.type) {
          filteredFoods = cachedFoods.filter((f: any) => f.type === params.type);
        }

        return {
          foods: filteredFoods.map((f: any) => ({
            id: f.id_aliment,
            name: f.nom,
            image: f.image,
            type: f.type,
            source: f.source,
            calories: f.calories,
            proteins: Number(f.proteines),
            carbs: Number(f.glucides),
            fats: Number(f.lipides),
            tags: [] // Tags manquants dans sync simple
          })),
          pagination: { // Mock pagination
            total: filteredFoods.length,
            totalPages: 1,
            currentPage: 1,
            limit: filteredFoods.length
          }
        };
      }

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
      // Fallback: Chercher dans la liste globale en cache
      const cachedFoods = await cacheService.get(CACHE_KEYS.NUTRITION);
      if (cachedFoods) {
        // cachedFoods est un array brut du sync (snake_case) ou du service (camelCase)?
        // SyncManager stocke le snake_case db. fallBack getAllFoods map le snake_case.
        // Ici on lit le brut.
        const food = cachedFoods.find((f: any) => f.id_aliment === id);
        if (food) {
          return {
            id: food.id_aliment,
            name: food.nom,
            image: food.image,
            type: food.type,
            source: food.source,
            calories: food.calories,
            proteins: Number(food.proteines),
            carbs: Number(food.glucides),
            fats: Number(food.lipides),
            tags: []
          };
        }
      }
      throw error;
    }
  },

  /**
   * Récupère le résumé nutritionnel de l'utilisateur
   */
  async getNutritionSummary(): Promise<NutritionSummary> {
    try {
      const summary = await apiService.get<NutritionSummary>("/nutrition/user/summary");
      await cacheService.save(CACHE_KEYS.NUTRITION_SUMMARY, summary);
      return summary;
    } catch (error) {
      console.error("Error fetching nutrition summary:", error);
      const cached = await cacheService.get(CACHE_KEYS.NUTRITION_SUMMARY);
      if (cached) return cached;
      throw error;
    }
  },

  /**
   * Récupère le suivi nutritionnel du jour
   */
  async getTodayNutrition(): Promise<NutritionData> {
    try {
      const today = await apiService.get<NutritionData>("/nutrition/user/today");
      await cacheService.save(CACHE_KEYS.NUTRITION_TODAY, today);
      return today;
    } catch (error) {
      console.error("Error fetching today nutrition:", error);
      const cached = await cacheService.get(CACHE_KEYS.NUTRITION_TODAY);
      if (cached) return cached;
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
      const history = await apiService.get<HistoryData>(`/nutrition/user/history${queryString}`);
      // On ne met en cache que l'appel par défaut (sans date spécifique ou mois en cours) pour éviter d'écraser avec des partiels
      // Ou on cache le dernier résultat, tant pis.
      await cacheService.save(CACHE_KEYS.NUTRITION_HISTORY, history);
      return history;
    } catch (error) {
      console.error("Error fetching nutrition history:", error);
      const cached = await cacheService.get(CACHE_KEYS.NUTRITION_HISTORY);
      // Si les dates demandées correspondent "à peu près" ou en fallback simple
      if (cached) return cached;
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
