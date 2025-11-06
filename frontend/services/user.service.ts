import apiService from "./api.service";

// Types for the user profile
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
    activities: {
      id: number;
      name: string;
    }[];
  } | null;
}

// Types for badges
export interface Badge {
  id: number;
  name: string;
  image: string;
  description: string;
}

export interface UnlockedBadge extends Badge {
  dateObtained: string;
}

export interface LockedBadge extends Badge {
  condition: string;
}

export interface BadgesResponse {
  unlockedBadges: UnlockedBadge[];
  lockedBadges: LockedBadge[];
}

// Types for evolution tracking
export interface EvolutionEntry {
  date: string;
  weight: number;
  height: number;
  bmi: number;
}

export interface EvolutionStatistics {
  initialWeight: number;
  currentWeight: number;
  weightChange: number;
  weightChangePercentage: number;
  initialBmi: number;
  currentBmi: number;
}

export interface EvolutionResponse {
  evolution: EvolutionEntry[];
  statistics: EvolutionStatistics;
}

// Types for progress statistics
export interface ProgressStats {
  period: string;
  weight: {
    start: number;
    current: number;
    change: number;
    changePercentage: number;
    trend: string;
  };
  nutrition: {
    averageCalories: number;
    averageProteins: number;
    averageCarbs: number;
    averageFats: number;
    goalCompletionRate: number;
  };
  activity: {
    completedSessions: number;
    sessionsPerWeek: number;
    goalCompletionRate: number;
    mostFrequentActivity: string;
  };
  overview: {
    overallProgress: number;
    streakDays: number;
  };
}

// Type for weight update status
export interface WeightUpdateStatus {
  needsUpdate: boolean;
  lastUpdated: string;
  daysSinceLastUpdate: number;
}

// Types for profile update
export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  gender?: string;
  birthDate?: string;
}

// Types for preferences update
export interface PreferencesUpdateData {
  targetWeight?: number;
  sedentaryLevelId?: number;
  nutritionalPlanId?: number;
  dietId?: number;
  sessionsPerWeek?: number;
  activities?: number[];
}

// Service for the user
const userService = {
  /**
   * Get the user profile
   */
  async getUserProfile(): Promise<UserProfile> {
    return apiService.get<UserProfile>("/user/profile");
  },

  /**
   * Get all user badges
   */
  async getUserBadges(): Promise<BadgesResponse> {
    return apiService.get<BadgesResponse>("/user/badges");
  },

  /**
   * Check for new badges
   */
  async checkNewBadges(): Promise<{ newBadges: Badge[] }> {
    return apiService.post<{ newBadges: Badge[] }>("/user/badges/check", {});
  },

  /**
   * Get user evolution history
   * @param startDate Optional start date (YYYY-MM-DD)
   * @param endDate Optional end date (YYYY-MM-DD)
   */
  async getUserEvolution(
    startDate?: string,
    endDate?: string
  ): Promise<EvolutionResponse> {
    let endpoint = "/user/evolution";
    const params = [];

    if (startDate) {
      params.push(`startDate=${startDate}`);
    }
    if (endDate) {
      params.push(`endDate=${endDate}`);
    }

    if (params.length > 0) {
      endpoint += `?${params.join("&")}`;
    }

    return apiService.get<EvolutionResponse>(endpoint);
  },

  /**
   * Add an evolution entry
   * @param data Evolution data to add
   */
  async addEvolutionEntry(data: {
    weight: number;
    height: number;
    date?: string;
  }): Promise<{ evolution: EvolutionEntry }> {
    return apiService.post<{ evolution: EvolutionEntry }>(
      "/user/evolution",
      data
    );
  },

  /**
   * Get progress statistics
   * @param period Period for statistics ("week", "month", "year")
   */
  async getProgressStats(period: string = "month"): Promise<ProgressStats> {
    return apiService.get<ProgressStats>(
      `/user/progress/stats?period=${period}`
    );
  },

  /**
   * Update user profile
   * @param data Profile data to update
   */
  async updateProfile(
    data: ProfileUpdateData
  ): Promise<{ user: UserProfile["user"] }> {
    return apiService.put<{ user: UserProfile["user"] }>(
      "/user/edit-profile",
      data
    );
  },

  /**
   * Update user preferences
   * @param data Preferences data to update
   */
  async updatePreferences(
    data: PreferencesUpdateData
  ): Promise<{ preferences: any }> {
    return apiService.put<{ preferences: any }>("/user/edit-preferences", data);
  },

  /**
   * Check if a weight update is needed
   */
  async checkWeightUpdateStatus(): Promise<WeightUpdateStatus> {
    return apiService.get<WeightUpdateStatus>("/user/weight-update-status");
  },
};

export default userService;
