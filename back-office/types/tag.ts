export interface Tag {
  id_tag: number;
  nom: string;
  type: string;
}

export interface TagWithUsage extends Tag {
  usageStats?: {
    aliments: number;
    exercices: number;
    programmes: number;
    seances: number;
    total: number;
  };
}

export interface TagsResponse {
  status: string;
  data: {
    tags: Tag[];
    pagination: {
      total: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
  message: string;
}

export interface TagResponse {
  status: string;
  data: {
    tag: TagWithUsage;
  };
  message: string;
}

export interface CreateTagRequest {
  name: string;
  type: string;
}

export interface UpdateTagRequest {
  name?: string;
  type?: string;
}
