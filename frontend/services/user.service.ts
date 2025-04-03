import apiService from "./api.service";

// Types pour le profil utilisateur
export interface UserProfile {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    birthDate: string;
    age: number;
  };
  metrics: {
    currentWeight: number;
    currentHeight: number;
    bmi: number;
    targetWeight: number;
    dailyCalories: number;
    sessionsPerWeek: number;
  } | null;
  preferences: {
    nutritionalPlan: {
      id: number;
      name: string;
      type: string;
    };
    diet: {
      id: number;
      name: string;
    };
    sedentaryLevel: {
      id: number;
      name: string;
    };
  } | null;
}

// Service pour l'utilisateur
const userService = {
  /**
   * Récupérer le profil de l'utilisateur
   */
  async getUserProfile(): Promise<UserProfile> {
    return apiService.get<UserProfile>("/user/profile");
  },
};

export default userService;
