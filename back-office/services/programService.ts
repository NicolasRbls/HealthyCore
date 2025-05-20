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
    const response = await api.get("/api/admin/programs", {
      params: { page, limit, search, tagId },
    });
    return response.data;
  },

  // Récupérer un programme spécifique
  getProgramById: async (programId: number): Promise<ProgramResponse> => {
    const response = await api.get(`/api/admin/programs/${programId}`);
    return response.data;
  },

  // Créer un nouveau programme
  createProgram: async (
    programData: CreateProgramRequest
  ): Promise<ProgramResponse> => {
    const response = await api.post("/api/admin/programs", programData);
    return response.data;
  },

  // Mettre à jour un programme
  updateProgram: async (
    programId: number,
    programData: UpdateProgramRequest
  ): Promise<ProgramResponse> => {
    const response = await api.put(
      `/api/admin/programs/${programId}`,
      programData
    );
    return response.data;
  },

  // Supprimer un programme
  deleteProgram: async (
    programId: number
  ): Promise<{ status: string; message: string }> => {
    const response = await api.delete(`/api/admin/programs/${programId}`);
    return response.data;
  },
};

export default programService;
