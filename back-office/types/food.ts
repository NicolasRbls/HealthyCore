import { Tag } from "./tag";

export interface FoodCreator {
  id: number;
  name: string;
}

export interface Food {
  id: number; // Utiliser id au lieu de id_aliment pour la cohérence
  name: string; // Utiliser name au lieu de nom pour la cohérence
  image?: string;
  type: string;
  source: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  preparationTime?: number;
  tags?: {
    id: number;
    name: string;
  }[];
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
  data: FoodWithDetails; // Le backend renvoie directement l'objet, pas enveloppé dans un objet food
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
  userId: number;
}

export interface UpdateFoodRequest {
  name?: string;
  type?: string;
  image?: string;
  calories?: number;
  proteins?: number;
  carbs?: number;
  fats?: number;
  preparationTime?: number;
  ingredients?: string;
  description?: string;
  barcode?: string;
  tagIds?: number[];
}
