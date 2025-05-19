// _Users_badre_Desktop_HealthyCore_back-office_services_sessionService.ts

import api from "./api";
import {
  SessionsResponse,
  SessionResponse,
  CreateSessionRequest,
  UpdateSessionRequest,
} from "@/types/session";

const sessionService = {
  // Récupérer toutes les séances avec pagination, recherche et filtrage
  getSessions: async (
    page = 1,
    limit = 20,
    search = "",
    tagId = ""
  ): Promise<SessionsResponse> => {
    const response = await api.get("/api/admin/sessions", {
      params: { page, limit, search, tagId },
    });
    return response.data;
  },

  // Récupérer une séance spécifique
  getSessionById: async (sessionId: number): Promise<SessionResponse> => {
    const response = await api.get(`/api/admin/sessions/${sessionId}`);
    return response.data;
  },

  // Créer une nouvelle séance
  createSession: async (
    sessionData: CreateSessionRequest
  ): Promise<SessionResponse> => {
    const response = await api.post("/api/admin/sessions", sessionData);
    return response.data;
  },

  // Mettre à jour une séance
  updateSession: async (
    sessionId: number,
    sessionData: UpdateSessionRequest
  ): Promise<SessionResponse> => {
    const response = await api.put(
      `/api/admin/sessions/${sessionId}`,
      sessionData
    );
    return response.data;
  },

  // Supprimer une séance
  deleteSession: async (
    sessionId: number
  ): Promise<{ status: string; message: string }> => {
    const response = await api.delete(`/api/admin/sessions/${sessionId}`);
    return response.data;
  },
};

export default sessionService;
