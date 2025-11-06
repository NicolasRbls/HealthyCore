import api from "./api";
import {
  Session,
  SessionResponse,
  SessionsResponse,
  CreateSessionRequest,
  UpdateSessionRequest,
} from "@/types/session";

const sessionService = {
  // Récupérer toutes les séances avec pagination, recherche et filtrage par tag
  getSessions: async (
    page = 1,
    limit = 20,
    search = "",
    tagId = ""
  ): Promise<SessionsResponse> => {
    try {
      const response = await api.get("/api/admin/sessions", {
        params: { page, limit, search, tagId },
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des séances:", error);
      throw error;
    }
  },

  // Récupérer une séance par son ID
  getSessionById: async (sessionId: number): Promise<SessionResponse> => {
    try {
      const response = await api.get(`/api/admin/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors du chargement des détails de la séance:",
        error
      );
      throw error;
    }
  },

  // Créer une nouvelle séance
  createSession: async (
    sessionData: CreateSessionRequest
  ): Promise<SessionResponse> => {
    try {
      const response = await api.post("/api/admin/sessions", sessionData);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création de la séance:", error);
      throw error;
    }
  },

  // Mettre à jour une séance
  updateSession: async (
    sessionId: number,
    sessionData: UpdateSessionRequest
  ): Promise<SessionResponse> => {
    try {
      const response = await api.put(
        `/api/admin/sessions/${sessionId}`,
        sessionData
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la séance:", error);
      throw error;
    }
  },

  // Supprimer une séance
  deleteSession: async (
    sessionId: number
  ): Promise<{ status: string; message: string }> => {
    try {
      const response = await api.delete(`/api/admin/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la suppression de la séance:", error);
      throw error;
    }
  },
};

export default sessionService;
