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
    // Route: GET /api/admin/foods
    // const response = await api.get('/api/admin/foods', {
    //   params: { page, limit, search, type, tagId, source }
    // });
    // return response.data;

    // Mock pour le développement
    return {
      status: "success",
      data: {
        foods: Array(20)
          .fill(0)
          .map((_, i) => ({
            id_aliment: i + 1,
            nom: `Aliment ${i + 1}`,
            image: `https://example.com/food${i + 1}.jpg`,
            type: i % 2 === 0 ? "produit" : "recette",
            source: i % 3 === 0 ? "admin" : i % 3 === 1 ? "user" : "api",
            calories: 100 + i * 20,
            proteins: 10 + (i % 10),
            carbs: 20 + (i % 15),
            fats: 5 + (i % 10),
            tags: [
              {
                id_tag: (i % 5) + 1,
                nom: `Tag ${(i % 5) + 1}`,
                type: "aliment",
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
      message: "Aliments récupérés avec succès",
    };
  },

  // Récupérer un aliment spécifique
  getFoodById: async (foodId: number): Promise<FoodResponse> => {
    // Route: GET /api/admin/foods/:foodId
    // const response = await api.get(`/api/admin/foods/${foodId}`);
    // return response.data;

    // Mock pour le développement
    return {
      status: "success",
      data: {
        food: {
          id_aliment: foodId,
          nom: "Salade César",
          image: "https://example.com/salade-cesar.jpg",
          type: "recette",
          source: "admin",
          creator: {
            id: 1,
            name: "Admin Admin",
          },
          calories: 470,
          proteins: 40,
          carbs: 25,
          fats: 22,
          barcode: "12345678901234",
          preparationTime: 20,
          description:
            "Une salade César classique avec poulet grillé, croûtons et parmesan",
          ingredients:
            "Laitue romaine, poulet grillé, croûtons, parmesan, sauce César",
          tags: [
            {
              id_tag: 3,
              nom: "Salade",
              type: "aliment",
            },
            {
              id_tag: 6,
              nom: "Repas complet",
              type: "aliment",
            },
          ],
          usageStats: {
            nutritionalFollowUps: 42,
            ratings: {
              total: 15,
              positive: 12,
              negative: 3,
            },
          },
        },
      },
      message: "Détails de l'aliment récupérés avec succès",
    };
  },

  // Créer un nouvel aliment
  createFood: async (foodData: CreateFoodRequest): Promise<FoodResponse> => {
    // Route: POST /api/admin/foods
    // const response = await api.post('/api/admin/foods', foodData);
    // return response.data;

    // Mock pour le développement
    return {
      status: "success",
      data: {
        food: {
          id_aliment: 46,
          nom: foodData.name,
          image: foodData.image || "https://example.com/food-default.jpg",
          type: foodData.type,
          source: "admin",
          creator: {
            id: 1,
            name: "Admin Admin",
          },
          calories: foodData.calories,
          proteins: foodData.proteins,
          carbs: foodData.carbs,
          fats: foodData.fats,
          barcode: foodData.barcode,
          preparationTime: foodData.preparationTime,
          ingredients: foodData.ingredients,
          description: foodData.description,
          tags: foodData.tagIds.map((id) => ({
            id_tag: id,
            nom: `Tag ${id}`,
            type: "aliment",
          })),
        },
      },
      message: "Aliment créé avec succès",
    };
  },

  // Mettre à jour un aliment
  updateFood: async (
    foodId: number,
    foodData: UpdateFoodRequest
  ): Promise<FoodResponse> => {
    // Route: PUT /api/admin/foods/:foodId
    // const response = await api.put(`/api/admin/foods/${foodId}`, foodData);
    // return response.data;

    // Mock pour le développement
    return {
      status: "success",
      data: {
        food: {
          id_aliment: foodId,
          nom: foodData.name || "Aliment modifié",
          image: foodData.image || "https://example.com/food-updated.jpg",
          type: "recette",
          source: "admin",
          creator: {
            id: 1,
            name: "Admin Admin",
          },
          calories: foodData.calories || 300,
          proteins: foodData.proteins || 20,
          carbs: foodData.carbs || 30,
          fats: foodData.fats || 10,
          barcode: "4321098765432",
          preparationTime: foodData.preparationTime || 15,
          ingredients: foodData.ingredients || "Ingrédients mis à jour",
          description: foodData.description || "Description mise à jour",
          tags: (foodData.tagIds || [3, 6]).map((id) => ({
            id_tag: id,
            nom: `Tag ${id}`,
            type: "aliment",
          })),
        },
      },
      message: "Aliment mis à jour avec succès",
    };
  },

  // Supprimer un aliment
  deleteFood: async (
    foodId: number
  ): Promise<{ status: string; message: string }> => {
    // Route: DELETE /api/admin/foods/:foodId
    // const response = await api.delete(`/api/admin/foods/${foodId}`);
    // return response.data;

    // Mock pour le développement
    return {
      status: "success",
      message: "Aliment supprimé avec succès",
    };
  },

  // Récupérer les statistiques des aliments
  getFoodStats: async (): Promise<FoodStatsResponse> => {
    // Route: GET /api/admin/foods/stats
    // const response = await api.get('/api/admin/foods/stats');
    // return response.data;

    // Mock pour le développement
    return {
      status: "success",
      data: {
        stats: {
          total: 245,
          byType: {
            produit: 180,
            recette: 65,
          },
          bySource: {
            admin: 120,
            user: 85,
            api: 40,
          },
          topTags: [
            {
              id: 1,
              name: "Protéiné",
              count: 78,
            },
            {
              id: 4,
              name: "Faible en glucides",
              count: 65,
            },
            {
              id: 3,
              name: "Salade",
              count: 42,
            },
          ],
          mostUsed: [
            {
              id: 5,
              name: "Poulet grillé",
              usageCount: 156,
            },
            {
              id: 12,
              name: "Riz blanc",
              usageCount: 142,
            },
            {
              id: 8,
              name: "Œufs",
              usageCount: 129,
            },
          ],
        },
      },
      message: "Statistiques des aliments récupérées avec succès",
    };
  },
};

export default foodService;
