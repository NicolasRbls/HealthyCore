import { Tag } from "./tag";

export interface SessionInProgram {
  id: number;
  orderInProgram: number;
  name: string;
  exerciseCount: number;
}

export interface ProgramCreator {
  id: number;
  name: string;
}

export interface Program {
  id_programme: number;
  nom: string;
  image?: string;
  duration: number;
  createdBy?: ProgramCreator;
  sessionCount?: number;
  tags?: Tag[];
}

export interface ProgramWithSessions extends Program {
  sessions?: SessionInProgram[];
  usageStats?: {
    users: number;
  };
}

export interface ProgramsResponse {
  status: string;
  data: {
    programs: Program[];
    pagination: {
      total: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
  message: string;
}

export interface ProgramResponse {
  status: string;
  data: {
    program: ProgramWithSessions;
  };
  message: string;
}

export interface ProgramSession {
  sessionId: number;
  order: number;
}

export interface CreateProgramRequest {
  name: string;
  image?: string;
  duration: number;
  tagIds: number[];
  sessions: ProgramSession[];
}

export interface UpdateProgramRequest {
  name?: string;
  image?: string;
  duration?: number;
  tagIds?: number[];
  sessions?: ProgramSession[];
}
