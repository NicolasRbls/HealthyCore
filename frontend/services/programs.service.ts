import apiService from "./api.service";
import cacheService, { CACHE_KEYS } from "./cache.service";
import { Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo"; // Pour vérifier la co

// Types conformes à l'API
export interface Tag {
  id: number;
  name: string;
}

export interface Program {
  id: number;
  name: string;
  image: string;
  duration: number;
  sessionCount: number;
  tags: Tag[];
  inProgress: boolean;
}

export interface ProgramsResponse {
  recommendedPrograms: Program[];
  programs: Program[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

// Service
const programsService = {
  /**
   * Récupérer tous les programmes
   */
  async getPrograms(
    page: number = 1,
    limit: number = 10,
    tagId?: number
  ): Promise<ProgramsResponse> {
    let endpoint = `/data/programs?page=${page}&limit=${limit}`;
    if (tagId) {
      endpoint += `&tagId=${tagId}`;
    }

    try {
      const response = await apiService.get<ProgramsResponse>(endpoint);
      // Cache-Aside: Sauvegarder la réponse API telle quelle pour utilisation offline directe
      // On sauvegarde uniquement si on est sur la première page sans filtre (page d'accueil par défaut)
      if (page === 1 && !tagId) {
        await cacheService.save(CACHE_KEYS.PROGRAMS_PAGE, response);
      }
      return response;
    } catch (error) {
      console.error("Error in programsService.getPrograms:", error);

      // Fallback 1: Cache spécifique API (Prioritaire car format frontend)
      const cachedPage = await cacheService.get(CACHE_KEYS.PROGRAMS_PAGE);
      if (cachedPage) {
        return cachedPage;
      }

      // Fallback 2: Cache Sync (Format DB brut, nécessite mapping)
      // Note: C'est un backup si jamais cachedPage est vide
      const cachedPrograms = await cacheService.get(CACHE_KEYS.PROGRAMS);
      if (cachedPrograms && Array.isArray(cachedPrograms)) {
        return {
          recommendedPrograms: [], // Pas de reco offline
          programs: cachedPrograms.map(p => ({
            // Mapping si nécessaire, mais le structure doit correspondre
            id: p.id_programme,
            name: p.nom,
            image: p.image,
            duration: p.duree,
            sessionCount: 0, // Manquant dans sync brut
            tags: [], // Idem
            inProgress: false
          })),
          pagination: {
            total: cachedPrograms.length,
            totalPages: 1,
            currentPage: 1,
            limit: cachedPrograms.length,
          },
        };
      }

      // Retourner une réponse vide en cas d'erreur ou cache vide
      return {
        recommendedPrograms: [],
        programs: [],
        pagination: {
          total: 0,
          totalPages: 0,
          currentPage: page,
          limit: limit,
        },
      };
    }
  },

  /**
   * Récupérer les détails d'un programme
   * @param programId - ID du programme
   */
  async getProgramDetails(programId: number): Promise<any> {
    try {
      const response = await apiService.get<any>(`/data/programs/${programId}`);
      return response.program || response;
    } catch (error) {
      console.error(
        `Error fetching program details for ID ${programId}:`,
        error
      );

      // Fallback Cache
      const cachedPrograms = await cacheService.get(CACHE_KEYS.PROGRAMS);
      if (cachedPrograms) {
        const program = cachedPrograms.find((p: any) => p.id_programme === programId);
        if (program) {
          // Mapper les champs DB vers Frontend si besoin
          return {
            id: program.id_programme,
            name: program.nom,
            image: program.image,
            duration: program.duree,
            description: "Mode hors-ligne", // Champ manquant dans liste simple
            sessions: [] // On peut essayer de trouver les séances associées dans le cache 'seances'
          };
        }
      }

      throw error;
    }
  },

  /**
   * Démarrer un programme pour l'utilisateur
   * @param programId - ID du programme
   * @param startDate - Date de début (optionnelle)
   */
  async startProgram(programId: number, startDate?: string): Promise<any> {
    try {
      const body = startDate ? { startDate } : {};
      const response = await apiService.post<any>(
        `/data/programs/${programId}/start`,
        body
      );
      return response.userProgram || response;
    } catch (error) {
      console.error(`Error starting program ID ${programId}:`, error);
      throw error;
    }
  },

  /**
   * Récupérer les détails d'une séance
   * @param sessionId - ID de la séance
   */
  async getSessionDetails(sessionId: number): Promise<any> {
    try {
      const response = await apiService.get<any>(
        `/data/programs/sessions/${sessionId}`
      );
      return response.session || response;
    } catch (error) {
      console.error(
        `Error fetching session details for ID ${sessionId}:`,
        error
      );
      // Fallback Cache
      const cachedSessions = await cacheService.get('cache_seances'); // Utilise la clé brute du SyncManager
      if (cachedSessions) {
        const session = cachedSessions.find((s: any) => s.id_seance === sessionId);
        if (session) {
          return {
            id: session.id_seance,
            title: session.nom,
            description: session.description,
            duration: session.duree,
            // Exercices? Difficile à reconstruire sans 'cache_exercices' et jointure
            // Pour MVP: Retourner session vide ou essayer de mapper
            exercises: []
          };
        }
      }
      throw error;
    }
  },

  /**
   * Marquer une séance comme terminée
   * @param sessionId - ID de la séance
   * @param date - Date de complétion (optionnelle, par défaut aujourd'hui)
   */
  async completeSession(sessionId: number, date?: string): Promise<any> {
    try {
      const body = date ? { date } : {};
      const response = await apiService.post<any>(
        `/data/programs/sessions/${sessionId}/complete`,
        body
      );
      return response.completedSession || response;
    } catch (error) {
      console.error(`Error completing session ID ${sessionId}:`, error);
      throw error;
    }
  },
  async getSportProgress(): Promise<any> {
    try {
      const response = await apiService.get<any>("/data/programs/sport-progress");
      // Mettre en cache la réponse complète (schedule, stats, activeProgram)
      await cacheService.save(CACHE_KEYS.SPORT_PROGRESS, response);
      // Mettre aussi à jour le cache spécifique ACTIVE_PROGRAM si présent
      if (response.activeProgram) {
        await cacheService.save(CACHE_KEYS.ACTIVE_PROGRAM, response.activeProgram);
      }
      return response;
    } catch (error) {
      console.error("Error getting sport progress:", error);
      const cached = await cacheService.get(CACHE_KEYS.SPORT_PROGRESS);
      if (cached) return cached;

      // Si pas de cache global, on essaie de construire un fallback partiel
      // avec ACTIVE_PROGRAM s'il existe
      const activeProgram = await cacheService.get(CACHE_KEYS.ACTIVE_PROGRAM);
      if (activeProgram) {
        return { activeProgram, weeklySchedule: [], stats: {} };
      }

      console.log('No sport progress cache found');
      // Ne pas throw pour éviter l'écran rouge, retourner vide
      return { activeProgram: null, weeklySchedule: [], stats: {} };
    }
  },

  async getActiveUserProgram(): Promise<any> {
    const progress = await this.getSportProgress();
    return progress.activeProgram || null;
  },
};

export default programsService;
