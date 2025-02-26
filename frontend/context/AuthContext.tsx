import React, { createContext, useState, useContext, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import authService, { User } from "../services/auth.service";
import { useRegistration } from "./RegistrationContext";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier le token au démarrage
    const checkToken = async () => {
      try {
        setLoading(true);
        const token = await SecureStore.getItemAsync("token");

        if (!token) {
          setLoading(false);
          return;
        }

        const response = await authService.verifyToken();

        if (response.valid) {
          setIsAuthenticated(true);
          setUser(response.user);
        }
      } catch (err: any) {
        console.error("Token verification error:", err);
        // Supprimer le token invalide
        await SecureStore.deleteItemAsync("token");
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.login(email, password);

      await SecureStore.setItemAsync("token", response.token);
      setIsAuthenticated(true);
      setUser(response.user);

      // Redirection vers le dashboard en fonction du rôle
      if (response.user.role === "admin") {
        router.replace("/admin/dashboard" as any);
      } else {
        router.replace("/user/dashboard" as any);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Identifiants incorrects. Veuillez réessayer.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await SecureStore.deleteItemAsync("token");
      setIsAuthenticated(false);
      setUser(null);

      // Redirection vers la page d'accueil
      router.replace("/welcome" as any);
    } catch (err: any) {
      console.error("Logout error:", err);
      setError(
        err.message || "Une erreur est survenue lors de la déconnexion."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.register(userData);

      await SecureStore.setItemAsync("token", response.token);
      setIsAuthenticated(true);
      setUser(response.user);

      // Redirection vers le dashboard (toujours user pour les nouveaux inscrits)
      router.replace("/user/dashboard" as any);
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Une erreur est survenue lors de l'inscription.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        error,
        login,
        logout,
        register,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
