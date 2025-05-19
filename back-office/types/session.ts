import { Tag } from "./tag";

export interface Session {
  id_seance: number;
  nom: string;
  id_user?: number;
  exercices_seances?: any[];
  id?: number;
  name?: string;
}
export interface SessionExercise {
  exerciseId: number;
  order: number;
  repetitions?: number;
  sets?: number;
  duration: number;
}

export interface SessionWithExercises {
  id: number;
  nom: string;
  createdBy?: {
    id?: number;
    name?: string;
  };
  tags?: Tag[];
  exercises?: {
    id: number;
    orderInSession: number;
    name: string;
    description?: string;
    repetitions?: number;
    sets?: number;
    duration: number;
  }[];
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

export interface CreateSessionRequest {
  name: string;
  tagIds: number[];
  exercises: SessionExercise[];
}

export interface UpdateSessionRequest {
  name: string;
  tagIds: number[];
  exercises: SessionExercise[];
}
