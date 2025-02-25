import * as SecureStore from "expo-secure-store";

const API_URL = "http://192.168.80.206:5000/api";

const apiService = {
  async get<T = any>(
    endpoint: string,
    requiresAuth: boolean = true
  ): Promise<T> {
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (requiresAuth) {
        const token = await SecureStore.getItemAsync("token");

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "API error");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`GET request error to ${endpoint}:`, error);
      throw error;
    }
  },

  async post<T = any>(
    endpoint: string,
    body: any,
    requiresAuth: boolean = true
  ): Promise<T> {
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (requiresAuth) {
        const token = await SecureStore.getItemAsync("token");

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "API error");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`POST request error to ${endpoint}:`, error);
      throw error;
    }
  },
};

export default apiService;
