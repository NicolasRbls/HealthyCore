import { Tag } from "./tag";

export interface Exercise {
  id: number;
  name: string;
  description: string;
  gif?: string;
  equipment?: string;
  tags?: Tag[];
}

export interface ExerciseWithUsage extends Exercise {
  usageStats?: {
    sessions: number;
    programs: number;
  };
}

export interface ExercisesResponse {
  status: string;
  data: {
    exercises: Exercise[];
    pagination: {
      total: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
  message: string;
}

export interface ExerciseResponse {
  status: string;
  data: {
    exercise: ExerciseWithUsage;
  };
  message: string;
}

export interface CreateExerciseRequest {
  name: string;
  description: string;
  equipment?: string;
  gif?: string;
  tagIds: number[];
}

export interface UpdateExerciseRequest {
  name?: string;
  description?: string;
  equipment?: string;
  gif?: string;
  tagIds?: number[];
}
