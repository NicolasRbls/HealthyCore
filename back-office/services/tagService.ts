import api from "./api";
import {
  TagsResponse,
  TagResponse,
  CreateTagRequest,
  UpdateTagRequest,
} from "@/types/tag";

const tagService = {
  // Récupérer tous les tags avec pagination et filtrage
  getTags: async (page = 1, limit = 20, type = ""): Promise<TagsResponse> => {
    // Route: GET /api/admin/tags
    // const response = await api.get('/api/admin/tags', {
    //   params: { page, limit, type }
    // });
    // return response.data;

    // Mock pour le développement
    return {
      status: "success",
      data: {
        tags: Array(20)
          .fill(0)
          .map((_, i) => ({
            id_tag: i + 1,
            nom: `Tag ${i + 1}`,
            type: i % 2 === 0 ? "sport" : "aliment",
          })),
        pagination: {
          total: 45,
          totalPages: 3,
          currentPage: page,
          limit,
        },
      },
      message: "Tags récupérés avec succès",
    };
  },

  // Récupérer un tag spécifique
  getTagById: async (tagId: number): Promise<TagResponse> => {
    // Route: GET /api/admin/tags/:tagId
    // const response = await api.get(`/api/admin/tags/${tagId}`);
    // return response.data;

    // Mock pour le développement
    return {
      status: "success",
      data: {
        tag: {
          id_tag: tagId,
          nom: "Cardio",
          type: "sport",
          usageStats: {
            aliments: 0,
            exercices: 12,
            programmes: 3,
            seances: 8,
            total: 23,
          },
        },
      },
      message: "Tag récupéré avec succès",
    };
  },

  // Créer un nouveau tag
  createTag: async (tagData: CreateTagRequest): Promise<TagResponse> => {
    // Route: POST /api/admin/tags
    // const response = await api.post('/api/admin/tags', tagData);
    // return response.data;

    // Mock pour le développement
    return {
      status: "success",
      data: {
        tag: {
          id_tag: 46,
          nom: tagData.name,
          type: tagData.type,
        },
      },
      message: "Tag créé avec succès",
    };
  },

  // Mettre à jour un tag
  updateTag: async (
    tagId: number,
    tagData: UpdateTagRequest
  ): Promise<TagResponse> => {
    // Route: PUT /api/admin/tags/:tagId
    // const response = await api.put(`/api/admin/tags/${tagId}`, tagData);
    // return response.data;

    // Mock pour le développement
    return {
      status: "success",
      data: {
        tag: {
          id_tag: tagId,
          nom: tagData.name || "Végétarien",
          type: tagData.type || "aliment",
        },
      },
      message: "Tag mis à jour avec succès",
    };
  },

  // Supprimer un tag
  deleteTag: async (
    tagId: number
  ): Promise<{ status: string; message: string }> => {
    // Route: DELETE /api/admin/tags/:tagId
    // const response = await api.delete(`/api/admin/tags/${tagId}`);
    // return response.data;

    // Mock pour le développement
    return {
      status: "success",
      message: "Tag supprimé avec succès",
    };
  },
};

export default tagService;
