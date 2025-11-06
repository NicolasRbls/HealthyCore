import api from "./api";
import {
  FoodsResponse,
  FoodResponse,
  FoodStatsResponse,
  CreateFoodRequest,
  UpdateFoodRequest,
} from "@/types/food";

const foodService = {
  // Récupérer tous les aliments avec pagination, recherche et filtrage
  getFoods: async (
    page = 1,
    limit = 20,
    search = "",
    type = "",
    tagId = "",
    source = ""
  ): Promise<FoodsResponse> => {
    const response = await api.get("/api/admin/foods", {
      params: { page, limit, search, type, tagId, source },
    });
    return response.data;
  },

  // Récupérer un aliment spécifique
  getFoodById: async (foodId: number): Promise<FoodResponse> => {
    const response = await api.get(`/api/admin/foods/${foodId}`);
    return response.data;
  },

  // Créer un nouvel aliment
  createFood: async (foodData: CreateFoodRequest): Promise<FoodResponse> => {
    const requestData = {
      name: foodData.name,
      type: foodData.type,
      image: foodData.image || "",
      calories: foodData.calories,
      proteins: foodData.proteins,
      carbs: foodData.carbs,
      fats: foodData.fats,
      preparationTime: foodData.preparationTime || 0,
      ingredients: foodData.ingredients || "",
      description: foodData.description || "",
      barcode: foodData.barcode || "",
      tags: foodData.tagIds.join("-"),
      userId: 1,
    };

    const response = await api.post("/api/admin/foods", requestData);
    return response.data;
  },
  updateFood: async (
    foodId: number,
    foodData: UpdateFoodRequest
  ): Promise<FoodResponse> => {
    const requestData = {
      nom: foodData.name,
      type: foodData.type,
      image: foodData.image || "",
      calories: foodData.calories,
      proteines: foodData.proteins,
      glucides: foodData.carbs,
      lipides: foodData.fats,
      temps_preparation: foodData.preparationTime || 0,
      ingredients: foodData.ingredients || "",
      description: foodData.description || "",
      code_barres: foodData.barcode || "",
      tags: foodData.tagIds ? foodData.tagIds.join("-") : "",
    };

    // Envoyer les données dans le corps de la requête
    const response = await api.put(`/api/admin/foods/${foodId}`, requestData);
    return response.data;
  },

  // Supprimer un aliment
  deleteFood: async (
    foodId: number
  ): Promise<{ status: string; message: string }> => {
    const response = await api.delete(`/api/admin/foods/${foodId}`);
    return response.data;
  },

  // Récupérer les statistiques des aliments
  getFoodStats: async (): Promise<FoodStatsResponse> => {
    const response = await api.get("/api/admin/foods/stats");
    return response.data;
  },
};

export default foodService;
