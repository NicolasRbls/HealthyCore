import apiService from "./api.service";
import cacheService, { CACHE_KEYS } from "./cache.service";

// Types
interface Objective {
  id: number;
  objectiveId: number;
  title: string;
  completed: boolean;
  date: string;
}

/**
 * Service pour gérer les objectifs utilisateur
 */
const objectivesService = {
  /**
   * Récupère les objectifs quotidiens de l'utilisateur
   */
  async getDailyObjectives() {
    try {
      const response = await apiService.get("/objectives/daily");
      await cacheService.save(CACHE_KEYS.OBJECTIVES, response);
      return response;
    } catch (error) {
      console.error("Error fetching daily objectives:", error);
      const cached = await cacheService.get(CACHE_KEYS.OBJECTIVES);
      if (cached) return cached;
      throw error;
    }
  },

  /**
   * Marque un objectif comme complété
   * @param objectiveId - ID de l'objectif à compléter
   */
  async completeObjective(objectiveId: number) {
    try {
      const response = await apiService.put(
        `/objectives/${objectiveId}/complete`,
        {}
      );
      return response;
    } catch (error) {
      console.error("Error completing objective:", error);
      throw error;
    }
  },
};

export default objectivesService;
