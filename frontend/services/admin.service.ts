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

// Type pour la mise à jour d'un utilisateur
export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
}

// Service pour l'administration
const adminService = {
  /**
   * Récupérer tous les utilisateurs (réservé aux administrateurs)
   */
  async getAllUsers(): Promise<User[]> {
    return apiService.get<User[]>("/admin/users");
  },

  /**
   * Récupérer un utilisateur spécifique par son ID
   * @param userId - ID de l'utilisateur
   */
  async getUserById(userId: number): Promise<User> {
    return apiService.get<User>(`/admin/users/${userId}`);
  },

  /**
   * Mettre à jour les informations d'un utilisateur
   * @param userId - ID de l'utilisateur à modifier
   * @param userData - Données mises à jour
   */
  async updateUser(userId: number, userData: UpdateUserData): Promise<User> {
    return apiService.put<User>(`/admin/users/${userId}`, userData);
  },

  /**
   * Supprimer un utilisateur par son ID
   * @param userId - ID de l'utilisateur à supprimer
   */
  async deleteUser(userId: number): Promise<{ message: string }> {
    return apiService.delete<{ message: string }>(`/admin/users/${userId}`);
  },
};

export default adminService;
