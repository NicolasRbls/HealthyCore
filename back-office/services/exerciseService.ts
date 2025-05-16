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
    // Route: GET /api/admin/exercises
    // const response = await api.get('/api/admin/exercises', {
    //   params: { page, limit, search, tagId }
    // });
    // return response.data;

    // Mock pour le développement
    return {
      status: "success",
      data: {
        exercises: Array(20)
          .fill(0)
          .map((_, i) => ({
            id_exercice: i + 1,
            nom: `Exercice ${i + 1}`,
            description: `Description de l'exercice ${i + 1}`,
            equipement: i % 3 === 0 ? "Poids corporel" : "Haltères",
            gif: `https://example.com/exercise${i + 1}.gif`,
            tags: [
              {
                id_tag: (i % 5) + 1,
                nom: `Tag ${(i % 5) + 1}`,
                type: "sport",
              },
            ],
          })),
        pagination: {
          total: 45,
          totalPages: 3,
          currentPage: page,
          limit,
        },
      },
      message: "Exercices récupérés avec succès",
    };
  },

  // Récupérer un exercice spécifique
  getExerciseById: async (exerciseId: number): Promise<ExerciseResponse> => {
    // Route: GET /api/admin/exercises/:exerciseId
    // const response = await api.get(`/api/admin/exercises/${exerciseId}`);
    // return response.data;

    // Mock pour le développement
    return {
      status: "success",
      data: {
        exercise: {
          id_exercice: exerciseId,
          nom: "Squat",
          description:
            "Un exercice polyarticulaire qui sollicite principalement les quadriceps, ischio-jambiers et fessiers.",
          equipement: "Poids corporel",
          gif: "https://example.com/squat.gif",
          tags: [
            {
              id_tag: 5,
              nom: "Jambes",
              type: "sport",
            },
            {
              id_tag: 8,
              nom: "Force",
              type: "sport",
            },
          ],
          usageStats: {
            sessions: 12,
            programs: 5,
          },
        },
      },
      message: "Détails de l'exercice récupérés avec succès",
    };
  },

  // Créer un nouvel exercice
  createExercise: async (
    exerciseData: CreateExerciseRequest
  ): Promise<ExerciseResponse> => {
    // Route: POST /api/admin/exercises
    // const response = await api.post('/api/admin/exercises', exerciseData);
    // return response.data;

    // Mock pour le développement
    return {
      status: "success",
      data: {
        exercise: {
          id_exercice: 46,
          nom: exerciseData.name,
          description: exerciseData.description,
          equipement: exerciseData.equipment,
          gif: exerciseData.gif,
          tags: exerciseData.tagIds.map((id) => ({
            id_tag: id,
            nom: `Tag ${id}`,
            type: "sport",
          })),
        },
      },
      message: "Exercice créé avec succès",
    };
  },

  // Mettre à jour un exercice
  updateExercise: async (
    exerciseId: number,
    exerciseData: UpdateExerciseRequest
  ): Promise<ExerciseResponse> => {
    // Route: PUT /api/admin/exercises/:exerciseId
    // const response = await api.put(`/api/admin/exercises/${exerciseId}`, exerciseData);
    // return response.data;

    // Mock pour le développement
    return {
      status: "success",
      data: {
        exercise: {
          id_exercice: exerciseId,
          nom: exerciseData.name || "Développé couché",
          description:
            exerciseData.description || "Un exercice pour la poitrine",
          equipement: exerciseData.equipment || "Banc et haltères",
          gif: exerciseData.gif || "https://example.com/bench-press.gif",
          tags: (exerciseData.tagIds || [2, 7]).map((id) => ({
            id_tag: id,
            nom: `Tag ${id}`,
            type: "sport",
          })),
        },
      },
      message: "Exercice mis à jour avec succès",
    };
  },

  // Supprimer un exercice
  deleteExercise: async (
    exerciseId: number
  ): Promise<{ status: string; message: string }> => {
    // Route: DELETE /api/admin/exercises/:exerciseId
    // const response = await api.delete(`/api/admin/exercises/${exerciseId}`);
    // return response.data;

    // Mock pour le développement
    return {
      status: "success",
      message: "Exercice supprimé avec succès",
    };
  },
};

export default exerciseService;
