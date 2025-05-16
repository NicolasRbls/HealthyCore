import { Tag } from "./tag";

export interface ExerciseInSession {
  id: number;
  orderInSession: number;
  name: string;
  description: string;
  repetitions?: number;
  sets?: number;
  duration: number;
}

export interface SessionCreator {
  id: number;
  name: string;
}

export interface Session {
  id_seance: number;
  nom: string;
  createdBy?: SessionCreator;
  exerciseCount?: number;
  tags?: Tag[];
}

export interface SessionWithExercises extends Session {
  exercises?: ExerciseInSession[];
  usageStats?: {
    programs: number;
    users: number;
  };
}

export interface SessionsResponse {
  status: string;
  data: {
    sessions: Session[];
    pagination: {
      total: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
  message: string;
}

export interface SessionResponse {
  status: string;
  data: {
    session: SessionWithExercises;
  };
  message: string;
}

export interface SessionExercise {
  exerciseId: number;
  order: number;
  repetitions?: number;
  sets?: number;
  duration: number;
}

export interface CreateSessionRequest {
  name: string;
  tagIds: number[];
  exercises: SessionExercise[];
}

export interface UpdateSessionRequest {
  name?: string;
  tagIds?: number[];
  exercises?: SessionExercise[];
}
