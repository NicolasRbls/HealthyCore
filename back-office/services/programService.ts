import api from "./api";
import {
  ProgramsResponse,
  ProgramResponse,
  CreateProgramRequest,
  UpdateProgramRequest,
} from "@/types/program";

const programService = {
  // Récupérer tous les programmes avec pagination, recherche et filtrage
  getPrograms: async (
    page = 1,
    limit = 20,
    search = "",
    tagId = ""
  ): Promise<ProgramsResponse> => {
    // Route: GET /api/admin/programs
    // const response = await api.get('/api/admin/programs', {
    //   params: { page, limit, search, tagId }
    // });
    // return response.data;

    // Mock pour le développement
    return {
      status: "success",
      data: {
        programs: Array(15)
          .fill(0)
          .map((_, i) => ({
            id_programme: i + 1,
            nom: `Programme ${i + 1}`,
            image: `https://example.com/program${i + 1}.jpg`,
            duration: 28 + (i % 4) * 7,
            createdBy: {
              id: 1,
              name: "Admin Admin",
            },
            sessionCount: 3 + (i % 3),
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
          total: 15,
          totalPages: 1,
          currentPage: page,
          limit,
        },
      },
      message: "Programmes récupérés avec succès",
    };
  },

  // Récupérer un programme spécifique
  getProgramById: async (programId: number): Promise<ProgramResponse> => {
    // Route: GET /api/admin/programs/:programId
    // const response = await api.get(`/api/admin/programs/${programId}`);
    // return response.data;

    // Mock pour le développement
    return {
      status: "success",
      data: {
        program: {
          id_programme: programId,
          nom: "Programme Débutant 4 semaines",
          image: "https://example.com/program1.jpg",
          duration: 28,
          createdBy: {
            id: 1,
            name: "Admin Admin",
          },
          tags: [
            {
              id_tag: 9,
              nom: "Débutant",
              type: "sport",
            },
            {
              id_tag: 3,
              nom: "Full Body",
              type: "sport",
            },
          ],
          sessions: [
            {
              id: 1,
              orderInProgram: 1,
              name: "Séance Full Body A",
              exerciseCount: 8,
            },
            {
              id: 2,
              orderInProgram: 2,
              name: "Séance Full Body B",
              exerciseCount: 7,
            },
            {
              id: 3,
              orderInProgram: 3,
              name: "Séance Full Body C",
              exerciseCount: 6,
            },
          ],
          usageStats: {
            users: 25,
          },
        },
      },
      message: "Détails du programme récupérés avec succès",
    };
  },

  // Créer un nouveau programme
  createProgram: async (
    programData: CreateProgramRequest
  ): Promise<ProgramResponse> => {
    // Route: POST /api/admin/programs
    // const response = await api.post('/api/admin/programs', programData);
    // return response.data;

    // Mock pour le développement
    return {
      status: "success",
      data: {
        program: {
          id_programme: 16,
          nom: programData.name,
          image: programData.image || "https://example.com/program-default.jpg",
          duration: programData.duration,
          tags: programData.tagIds.map((id) => ({
            id_tag: id,
            nom: `Tag ${id}`,
            type: "sport",
          })),
          sessions: programData.sessions.map((session) => ({
            id: session.sessionId,
            orderInProgram: session.order,
            name: `Séance ${session.sessionId}`,
            exerciseCount: 6 + (session.sessionId % 3),
          })),
        },
      },
      message: "Programme créé avec succès",
    };
  },

  // Mettre à jour un programme
  updateProgram: async (
    programId: number,
    programData: UpdateProgramRequest
  ): Promise<ProgramResponse> => {
    // Route: PUT /api/admin/programs/:programId
    // const response = await api.put(`/api/admin/programs/${programId}`, programData);
    // return response.data;

    // Mock pour le développement
    return {
      status: "success",
      data: {
        program: {
          id_programme: programId,
          nom: programData.name || "Programme modifié",
          image: programData.image || "https://example.com/program-updated.jpg",
          duration: programData.duration || 42,
          tags: (programData.tagIds || [2, 7]).map((id) => ({
            id_tag: id,
            nom: `Tag ${id}`,
            type: "sport",
          })),
          sessions: (programData.sessions || []).map((session) => ({
            id: session.sessionId,
            orderInProgram: session.order,
            name: `Séance ${session.sessionId}`,
            exerciseCount: 6 + (session.sessionId % 3),
          })),
        },
      },
      message: "Programme mis à jour avec succès",
    };
  },

  // Supprimer un programme
  deleteProgram: async (
    programId: number
  ): Promise<{ status: string; message: string }> => {
    // Route: DELETE /api/admin/programs/:programId
    // const response = await api.delete(`/api/admin/programs/${programId}`);
    // return response.data;

    // Mock pour le développement
    return {
      status: "success",
      message: "Programme supprimé avec succès",
    };
  },
};

export default programService;
