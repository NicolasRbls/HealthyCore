import apiService from "./api.service";

// Types pour les données d'authentification
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Service d'authentification
const authService = {
  /**
   * Inscription d'un nouvel utilisateur
   * @param userData - Données d'inscription complètes
   */
  async register(userData: any): Promise<AuthResponse> {
    return apiService.post<AuthResponse>("/auth/register", userData, {}, false);
  },

  /**
   * Connexion d'un utilisateur
   * @param email - Email de l'utilisateur
   * @param password - Mot de passe de l'utilisateur
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    return apiService.post<AuthResponse>(
      "/auth/login",
      { email, password },
      {},
      false
    );
  },

  /**
   * Déconnexion de l'utilisateur
   */
  async logout(): Promise<void> {
    try {
      // Appel à l'API pour informer le serveur de la déconnexion
      await apiService.post<{ message: string }>("/auth/logout", {});
      // Le token sera supprimé par le contexte d'authentification
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      // On continue malgré l'erreur pour assurer que l'utilisateur est déconnecté localement
    }
  },

  /**
   * Vérification de la validité du token
   */
  async verifyToken(): Promise<{ valid: boolean; user: User }> {
    return apiService.get<{ valid: boolean; user: User }>("/auth/verify-token");
  },

  /**
   * Récupération des informations de l'utilisateur connecté
   */
  async getProfile(): Promise<{ user: User }> {
    return apiService.get<{ user: User }>("/auth/me");
  },
};

export default authService;
