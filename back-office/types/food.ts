import { Tag } from "./tag";

export interface FoodCreator {
  id: number;
  name: string;
}

export interface Food {
  id_aliment: number;
  nom: string;
  image?: string;
  type: string; // "produit" ou "recette"
  source: string; // "admin", "user", "api"
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  tags?: Tag[];
}

export interface FoodWithDetails extends Food {
  creator?: FoodCreator;
  barcode?: string;
  preparationTime?: number;
  description?: string;
  ingredients?: string;
  usageStats?: {
    nutritionalFollowUps: number;
    ratings: {
      total: number;
      positive: number;
      negative: number;
    };
  };
}

export interface FoodsResponse {
  status: string;
  data: {
    foods: Food[];
    pagination: {
      total: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
  message: string;
}

export interface FoodResponse {
  status: string;
  data: {
    food: FoodWithDetails;
  };
  message: string;
}

export interface FoodStatsResponse {
  status: string;
  data: {
    stats: {
      total: number;
      byType: {
        produit: number;
        recette: number;
      };
      bySource: {
        admin: number;
        user: number;
        api: number;
      };
      topTags: {
        id: number;
        name: string;
        count: number;
      }[];
      mostUsed: {
        id: number;
        name: string;
        usageCount: number;
      }[];
    };
  };
  message: string;
}

export interface CreateFoodRequest {
  name: string;
  type: string;
  image?: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  preparationTime?: number;
  ingredients?: string;
  description?: string;
  barcode?: string;
  tagIds: number[];
}

export interface UpdateFoodRequest {
  name?: string;
  image?: string;
  calories?: number;
  proteins?: number;
  carbs?: number;
  fats?: number;
  preparationTime?: number;
  ingredients?: string;
  description?: string;
  tagIds?: number[];
}
