export interface User {
  id_user: number;
  role: string;
  prenom: string;
  nom: string;
  sexe: string;
  date_de_naissance: Date;
  email: string;
  cree_a: Date;
  mis_a_jour_a: Date;
}

// Version adaptée pour le nouveau format JSON
export interface NewUserDetail {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  birthDate: string;
  age: number;
  metrics?: {
    currentWeight: number;
    currentHeight: number;
    bmi: number;
    targetWeight: number;
    dailyCalories: number;
    sessionsPerWeek: number;
  };
  preferences?: any;
}

export interface UserDetail extends User {
  evolution?: {
    currentWeight: number;
    currentHeight: number;
    currentBMI: number;
    startWeight: number;
    weightChange: number;
    timeOnPlatform: string;
  };
  nutritionSummary?: {
    caloriesGoal: number;
    diet: string;
    macroDistribution: {
      carbs: number;
      protein: number;
      fat: number;
    };
    entriesCount: number;
  };
  exerciseSummary?: {
    weeklyGoal: number;
    completedSessions: number;
    favoriteActivity: string;
    lastSessionDate: Date;
  };
  badgeCount?: number;
}

export interface UserCount {
  totalCount: number;
}

export interface UsersResponse {
  status: string;
  data: {
    users: User[];
    pagination: {
      total: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
  message: string;
}

export interface UserDetailResponse {
  status: string;
  data: {
    user: User;
    evolution: UserDetail["evolution"];
    nutritionSummary: UserDetail["nutritionSummary"];
    exerciseSummary: UserDetail["exerciseSummary"];
    badgeCount: number;
  };
  message: string;
}

// Format de réponse adapté pour le nouveau JSON
export interface NewUserDetailResponse {
  status: string;
  data: NewUserDetail;
  message: string;
}

export interface UserCountResponse {
  status: string;
  data: {
    totalCount: number;
  };
  message: string;
}
