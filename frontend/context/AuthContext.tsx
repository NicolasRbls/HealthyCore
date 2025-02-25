import React, { createContext, useState, useContext, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import authService from "../services/auth.service";
import { router } from "expo-router";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Vérifier le token au démarrage
    const checkToken = async () => {
      try {
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
      } catch (error) {
        console.error("Token verification error:", error);
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
      const response = await authService.login(email, password);

      await SecureStore.setItemAsync("token", response.token);
      setIsAuthenticated(true);
      setUser(response.user);

      // Redirection vers le dashboard
      router.replace("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
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
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);

      await SecureStore.setItemAsync("token", response.token);
      setIsAuthenticated(true);
      setUser(response.user);

      // Redirection vers le dashboard
      router.replace("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, loading, login, logout, register }}
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
