import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import * as SecureStore from "expo-secure-store";

// Étendre les types d'Axios pour inclure requiresAuth
declare module "axios" {
  export interface AxiosRequestConfig {
    requiresAuth?: boolean;
  }
  // Ajout du type pour InternalAxiosRequestConfig
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

// Interface pour les erreurs API
interface ApiErrorData {
  message?: string;
  code?: string;
  errors?: Record<string, string>;
}

// Récupérer l'URL de l'API depuis les variables d'environnement
const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.56.1:5000/api";

// Création d'une instance axios avec la configuration de base
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 secondes de timeout
});

// Intercepteur pour ajouter le token à chaque requête si nécessaire
axiosInstance.interceptors.request.use(
  async (config) => {
    if (config.requiresAuth !== false) {
      const token = await SecureStore.getItemAsync("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorData>) => {
    const originalRequest = error.config;

    // Si erreur 401 (non autorisé) et pas déjà en train de rafraichir
    if (error.response?.status === 401 && !originalRequest?._retry) {
      // Ici on pourrait implémenter un système de refresh token si nécessaire

      // Pour l'instant, on redirige simplement vers la déconnexion
      // Cette logique pourrait être gérée par un listener d'événement
      if (error.response.data?.code === "TOKEN_EXPIRED") {
        // On pourrait émettre un événement ici pour que le contexte d'auth gère la déconnexion
        console.log(
          "Session expirée, redirection vers la page de connexion..."
        );
      }
    }

    // Format d'erreur standardisé
    const errorResponse = {
      status: error.response?.status || 500,
      message: error.response?.data?.message || "Une erreur est survenue",
      code: error.response?.data?.code || "UNKNOWN_ERROR",
      errors: error.response?.data?.errors || null,
      originalError: error,
    };

    return Promise.reject(errorResponse);
  }
);

// Types pour les méthodes API
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: string;
}

// Service API
const apiService = {
  /**
   * Effectue une requête GET
   * @param endpoint - Chemin de l'endpoint
   * @param config - Configuration Axios additionnelle
   * @param requiresAuth - Indique si la requête nécessite une authentification
   */
  async get<T = any>(
    endpoint: string,
    config: AxiosRequestConfig = {},
    requiresAuth: boolean = true
  ): Promise<T> {
    try {
      const response: AxiosResponse<ApiResponse<T>> = await axiosInstance.get(
        endpoint,
        {
          ...config,
          requiresAuth,
        }
      );
      return response.data.data;
    } catch (error) {
      console.error(`GET request error to ${endpoint}:`, error);
      throw error;
    }
  },

  // Reste des méthodes...
  // (post, put, delete conservent la même structure avec les mêmes corrections)
};

export default apiService;
