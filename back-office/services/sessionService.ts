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
    // Route: GET /api/admin/sessions
    // const response = await api.get('/api/admin/sessions', {
    //   params: { page, limit, search, tagId }
    // });
    // return response.data;

    // Mock pour le développement
    return {
      status: "success",
      data: {
        sessions: Array(20)
          .fill(0)
          .map((_, i) => ({
            id_seance: i + 1,
            nom: `Séance ${i + 1}`,
            createdBy: {
              id: 1,
              name: "Admin",
            },
            exerciseCount: 5 + (i % 5),
            tags: [
              {
                id_tag: (i % 5) + 1,
                nom: `Tag ${(i % 5) + 1}`,
                type: "sport",
              },
              {
                id_tag: (i % 3) + 6,
                nom: `Tag ${(i % 3) + 6}`,
                type: "sport",
              },
            ],
          })),
        pagination: {
          total: 25,
          totalPages: 2,
          currentPage: page,
          limit,
        },
      },
      message: "Séances récupérées avec succès",
    };
  },

  // Récupérer une séance spécifique
  getSessionById: async (sessionId: number): Promise<SessionResponse> => {
    // Route: GET /api/admin/sessions/:sessionId
    // const response = await api.get(`/api/admin/sessions/${sessionId}`);
    // return response.data;

    // Mock pour le développement
    return {
      status: "success",
      data: {
        session: {
          id_seance: sessionId,
          nom: "Séance Full Body",
          createdBy: {
            id: 1,
            name: "Admin Admin",
          },
          tags: [
            {
              id_tag: 3,
              nom: "Full Body",
              type: "sport",
            },
            {
              id_tag: 9,
              nom: "Débutant",
              type: "sport",
            },
          ],
          exercises: [
            {
              id: 1,
              orderInSession: 1,
              name: "Squat",
              description: "Un exercice pour les jambes",
              repetitions: 12,
              sets: 3,
              duration: 0,
            },
            {
              id: 5,
              orderInSession: 2,
              name: "Pompes",
              description: "Un exercice pour la poitrine et les triceps",
              repetitions: 10,
              sets: 3,
              duration: 0,
            },
            {
              id: 8,
              orderInSession: 3,
              name: "Planche",
              description: "Un exercice pour les abdominaux",
              repetitions: 0,
              sets: 3,
              duration: 30,
            },
          ],
          usageStats: {
            programs: 3,
            users: 15,
          },
        },
      },
      message: "Détails de la séance récupérés avec succès",
    };
  },

  // Créer une nouvelle séance
  createSession: async (
    sessionData: CreateSessionRequest
  ): Promise<SessionResponse> => {
    // Route: POST /api/admin/sessions
    // const response = await api.post('/api/admin/sessions', sessionData);
    // return response.data;

    // Mock pour le développement
    return {
      status: "success",
      data: {
        session: {
          id_seance: 12,
          nom: sessionData.name,
          tags: sessionData.tagIds.map((id) => ({
            id_tag: id,
            nom: `Tag ${id}`,
            type: "sport",
          })),
          exercises: sessionData.exercises.map((ex) => ({
            id: ex.exerciseId,
            orderInSession: ex.order,
            name: `Exercice ${ex.exerciseId}`,
            description: `Description de l'exercice ${ex.exerciseId}`,
            repetitions: ex.repetitions || 0,
            sets: ex.sets || 0,
            duration: ex.duration,
          })),
        },
      },
      message: "Séance créée avec succès",
    };
  },

  // Mettre à jour une séance
  updateSession: async (
    sessionId: number,
    sessionData: UpdateSessionRequest
  ): Promise<SessionResponse> => {
    // Route: PUT /api/admin/sessions/:sessionId
    // const response = await api.put(`/api/admin/sessions/${sessionId}`, sessionData);
    // return response.data;

    // Mock pour le développement
    return {
      status: "success",
      data: {
        session: {
          id_seance: sessionId,
          nom: sessionData.name || "Séance modifiée",
          tags: (sessionData.tagIds || [2, 7]).map((id) => ({
            id_tag: id,
            nom: `Tag ${id}`,
            type: "sport",
          })),
          exercises: (sessionData.exercises || []).map((ex) => ({
            id: ex.exerciseId,
            orderInSession: ex.order,
            name: `Exercice ${ex.exerciseId}`,
            description: `Description de l'exercice ${ex.exerciseId}`,
            repetitions: ex.repetitions || 0,
            sets: ex.sets || 0,
            duration: ex.duration,
          })),
        },
      },
      message: "Séance mise à jour avec succès",
    };
  },

  // Supprimer une séance
  deleteSession: async (
    sessionId: number
  ): Promise<{ status: string; message: string }> => {
    // Route: DELETE /api/admin/sessions/:sessionId
    // const response = await api.delete(`/api/admin/sessions/${sessionId}`);
    // return response.data;

    // Mock pour le développement
    return {
      status: "success",
      message: "Séance supprimée avec succès",
    };
  },
};

export default sessionService;
