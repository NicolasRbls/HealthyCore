import apiService from "./api.service";

// Type pour les données utilisateur
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

// Service pour l'administration
const adminService = {
  /**
   * Récupérer tous les utilisateurs (réservé aux administrateurs)
   */
  async getAllUsers(): Promise<User[]> {
    return apiService.get<User[]>("/admin/users");
  },
};

export default adminService;
