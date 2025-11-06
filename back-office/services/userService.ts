import api from "./api";
import { UsersResponse, UserCountResponse, NewUserDetail } from "@/types/user";

const userService = {
  // Récupérer le nombre total d'utilisateurs
  getUserCount: async (): Promise<UserCountResponse> => {
    const response = await api.get("/api/admin/user/count");
    return response.data;
  },

  // Récupérer la liste des utilisateurs avec pagination et recherche
  getUsers: async (
    page = 1,
    limit = 10,
    search = ""
  ): Promise<UsersResponse> => {
    const response = await api.get("/api/admin/user", {
      params: { page, limit, search },
    });
    return response.data;
  },

  // Récupérer les détails d'un utilisateur
  getUserById: async (userId: number): Promise<{ data: NewUserDetail }> => {
    const response = await api.get(`/api/admin/user/${userId}`);
    return response.data;
  },

  // Supprimer un utilisateur
  deleteUser: async (
    userId: number,
    adminPassword: string
  ): Promise<{ status: string; message: string }> => {
    const response = await api.delete(`/api/admin/user/${userId}`, {
      data: { adminPassword },
    });
    return response.data;
  },
};

export default userService;
