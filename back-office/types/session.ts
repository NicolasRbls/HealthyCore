import { Tag } from "./tag";

export interface Session {
  id: number;
  name: string;
  createdBy?: {
    id?: number;
    name?: string;
  };
  exerciseCount?: number;
  tags?: {
    id: number;
    name: string;
  }[];
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
  nom: string; // Utilisation du nom de propriété backend pour compatibilité
  createdBy?: {
    id?: number;
    name?: string;
  };
  tags?: Tag[]; // Utilisation de l'interface Tag pour compatibilité
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
