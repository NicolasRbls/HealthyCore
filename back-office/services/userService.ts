import api from "./api";
import {
  UsersResponse,
  UserDetailResponse,
  UserCountResponse,
} from "@/types/user";

const userService = {
  // Récupérer le nombre total d'utilisateurs
  getUserCount: async (): Promise<UserCountResponse> => {
    // Route: GET /api/admin/users/count
    // const response = await api.get('/api/admin/users/count');
    // return response.data;

    // Mock pour le développement
    return {
      status: "success",
      data: {
        totalCount: 120,
      },
      message: "Nombre total d'utilisateurs récupéré avec succès",
    };
  },

  // Récupérer la liste des utilisateurs avec pagination et recherche
  getUsers: async (
    page = 1,
    limit = 10,
    search = ""
  ): Promise<UsersResponse> => {
    // Route: GET /api/admin/users
    // const response = await api.get('/api/admin/users', {
    //   params: { page, limit, search }
    // });
    // return response.data;

    // Mock pour le développement
    return {
      status: "success",
      data: {
        users: Array(10)
          .fill(0)
          .map((_, i) => ({
            id_user: i + 1,
            prenom: `Prénom${i + 1}`,
            nom: `Nom${i + 1}`,
            email: `user${i + 1}@example.com`,
            sexe: i % 2 === 0 ? "H" : "F",
            date_de_naissance: new Date("1990-01-01"),
            role: "user",
            cree_a: new Date("2023-01-01"),
            mis_a_jour_a: new Date("2023-01-01"),
          })),
        pagination: {
          total: 120,
          totalPages: 12,
          currentPage: page,
          limit,
        },
      },
      message: "Liste des utilisateurs récupérée avec succès",
    };
  },

  // Récupérer les détails d'un utilisateur
  getUserById: async (userId: number): Promise<UserDetailResponse> => {
    // Route: GET /api/admin/users/:userId
    // const response = await api.get(`/api/admin/users/${userId}`);
    // return response.data;

    // Mock pour le développement
    return {
      status: "success",
      data: {
        user: {
          id_user: userId,
          prenom: "Jean",
          nom: "Dupont",
          email: "jean.dupont@example.com",
          sexe: "H",
          date_de_naissance: new Date("1990-05-15"),
          role: "user",
          cree_a: new Date("2023-04-15"),
          mis_a_jour_a: new Date("2023-05-10"),
        },
        evolution: {
          currentWeight: 75.5,
          currentHeight: 180,
          currentBMI: 23.3,
          startWeight: 80,
          weightChange: -4.5,
          timeOnPlatform: "45 jours",
        },
        nutritionSummary: {
          caloriesGoal: 2200,
          diet: "Végétarien",
          macroDistribution: {
            carbs: 50,
            protein: 30,
            fat: 20,
          },
          entriesCount: 65,
        },
        exerciseSummary: {
          weeklyGoal: 4,
          completedSessions: 36,
          favoriteActivity: "Cardio",
          lastSessionDate: new Date("2023-05-08"),
        },
        badgeCount: 5,
      },
      message: "Détails de l'utilisateur récupérés avec succès",
    };
  },

  // Supprimer un utilisateur
  deleteUser: async (
    userId: number,
    adminPassword: string
  ): Promise<{ status: string; message: string }> => {
    // Route: DELETE /api/admin/users/:userId
    // const response = await api.delete(`/api/admin/users/${userId}`, {
    //   data: { adminPassword }
    // });
    // return response.data;

    // Mock pour le développement
    return {
      status: "success",
      message: "Utilisateur supprimé avec succès",
    };
  },
};

export default userService;
