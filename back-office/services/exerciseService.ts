// _Users_badre_Desktop_HealthyCore_back-office_services_exerciseService.ts

import api from "./api";
import {
  ExercisesResponse,
  ExerciseResponse,
  CreateExerciseRequest,
  UpdateExerciseRequest,
} from "@/types/exercise";

const exerciseService = {
  // Récupérer tous les exercices avec pagination, recherche et filtrage
  getExercises: async (
    page = 1,
    limit = 20,
    search = "",
    tagId = ""
  ): Promise<ExercisesResponse> => {
    const response = await api.get("/api/admin/exercises", {
      params: { page, limit, search, tagId },
    });
    return response.data;
  },

  // Récupérer un exercice spécifique
  getExerciseById: async (exerciseId: number): Promise<ExerciseResponse> => {
    const response = await api.get(`/api/admin/exercises/${exerciseId}`);
    return response.data;
  },

  // Créer un nouvel exercice
  createExercise: async (
    exerciseData: CreateExerciseRequest
  ): Promise<ExerciseResponse> => {
    const response = await api.post("/api/admin/exercises", exerciseData);
    return response.data;
  },

  // Mettre à jour un exercice
  updateExercise: async (
    exerciseId: number,
    exerciseData: UpdateExerciseRequest
  ): Promise<ExerciseResponse> => {
    const response = await api.put(
      `/api/admin/exercises/${exerciseId}`,
      exerciseData
    );
    return response.data;
  },

  // Supprimer un exercice
  deleteExercise: async (
    exerciseId: number
  ): Promise<{ status: string; message: string }> => {
    const response = await api.delete(`/api/admin/exercises/${exerciseId}`);
    return response.data;
  },
};

export default exerciseService;
