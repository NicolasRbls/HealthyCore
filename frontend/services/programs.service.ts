import apiService from "./api.service";

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
      return response;
    } catch (error) {
      console.error("Error in programsService.getPrograms:", error);
      // Retourner une réponse vide en cas d'erreur
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
  async getActiveUserProgram(): Promise<any> {
    try {
      const response = await apiService.get<any>(
        "/data/programs/sport-progress"
      );
      return response.activeProgram || null;
    } catch (error) {
      console.error("Error getting active user program:", error);
      return null;
    }
  },
};

export default programsService;
