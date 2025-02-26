import * as SecureStore from "expo-secure-store";

// Interface pour les erreurs API
interface ApiErrorData {
  message?: string;
  code?: string;
  errors?: Record<string, string>;
}

// Interface pour la réponse API
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: string;
}

// Récupérer l'URL de l'API depuis les variables d'environnement
const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.56.1:5000/api";

// Service API utilisant fetch
const apiService = {
  /**
   * Méthode utilitaire pour gérer les requêtes avec gestion des tokens
   * @param endpoint - Chemin de l'endpoint
   * @param method - Méthode HTTP
   * @param body - Corps de la requête
   * @param requiresAuth - Indique si la requête nécessite une authentification
   * @param config - Configuration supplémentaire pour la requête
   */
  async request<T = any>(
    endpoint: string,
    method: string,
    body?: any,
    requiresAuth: boolean = true,
    config: RequestInit = {}
  ): Promise<T> {
    try {
      // Préparation des headers
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...config.headers,
      };

      // Ajout du token si authentification requise
      if (requiresAuth) {
        const token = await SecureStore.getItemAsync("token");
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
      }

      // Configuration de la requête
      const requestConfig: RequestInit = {
        method,
        headers,
        ...config,
      };

      // Ajout du body si présent
      if (body) {
        requestConfig.body = JSON.stringify(body);
      }

      // Exécution de la requête
      const response = await fetch(`${API_URL}${endpoint}`, requestConfig);

      // Gestion des erreurs de réponse
      if (!response.ok) {
        const errorData: ApiErrorData = await response.json();
        throw {
          status: response.status,
          message: errorData.message || "Une erreur est survenue",
          code: errorData.code || "UNKNOWN_ERROR",
          errors: errorData.errors || null,
        };
      }

      // Parsing de la réponse
      const responseData: ApiResponse<T> = await response.json();
      return responseData.data;
    } catch (error) {
      console.error(`Request error to ${endpoint}:`, error);
      throw error;
    }
  },

  /**
   * Effectue une requête GET
   * @param endpoint - Chemin de l'endpoint
   * @param config - Configuration supplémentaire
   * @param requiresAuth - Indique si la requête nécessite une authentification
   */
  async get<T = any>(
    endpoint: string,
    config: RequestInit = {},
    requiresAuth: boolean = true
  ): Promise<T> {
    return this.request<T>(endpoint, "GET", undefined, requiresAuth, config);
  },

  /**
   * Effectue une requête POST
   * @param endpoint - Chemin de l'endpoint
   * @param body - Données à envoyer
   * @param config - Configuration supplémentaire
   * @param requiresAuth - Indique si la requête nécessite une authentification
   */
  async post<T = any>(
    endpoint: string,
    body: any,
    config: RequestInit = {},
    requiresAuth: boolean = true
  ): Promise<T> {
    return this.request<T>(endpoint, "POST", body, requiresAuth, config);
  },

  /**
   * Effectue une requête PUT
   * @param endpoint - Chemin de l'endpoint
   * @param body - Données à envoyer
   * @param config - Configuration supplémentaire
   * @param requiresAuth - Indique si la requête nécessite une authentification
   */
  async put<T = any>(
    endpoint: string,
    body: any,
    config: RequestInit = {},
    requiresAuth: boolean = true
  ): Promise<T> {
    return this.request<T>(endpoint, "PUT", body, requiresAuth, config);
  },

  /**
   * Effectue une requête DELETE
   * @param endpoint - Chemin de l'endpoint
   * @param config - Configuration supplémentaire
   * @param requiresAuth - Indique si la requête nécessite une authentification
   */
  async delete<T = any>(
    endpoint: string,
    config: RequestInit = {},
    requiresAuth: boolean = true
  ): Promise<T> {
    return this.request<T>(endpoint, "DELETE", undefined, requiresAuth, config);
  },
};

export default apiService;
