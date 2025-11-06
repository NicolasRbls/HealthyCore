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
    const response = await api.get("/api/admin/tag", {
      params: { page, limit, type },
    });
    return response.data;
  },

  // Récupérer un tag spécifique
  getTagById: async (tagId: number): Promise<TagResponse> => {
    const response = await api.get(`/api/admin/tag/${tagId}`);
    return response.data;
  },

  // Créer un nouveau tag
  createTag: async (tagData: CreateTagRequest): Promise<TagResponse> => {
    const response = await api.post("/api/admin/tag", tagData);
    return response.data;
  },

  // Mettre à jour un tag
  updateTag: async (
    tagId: number,
    tagData: UpdateTagRequest
  ): Promise<TagResponse> => {
    const response = await api.put(`/api/admin/tag/${tagId}`, tagData);
    return response.data;
  },

  // Supprimer un tag
  deleteTag: async (
    tagId: number
  ): Promise<{ status: string; message: string }> => {
    const response = await api.delete(`/api/admin/tag/${tagId}`);
    return response.data;
  },
};

export default tagService;
