// Types spécifiques au module nutrition

// Types déjà disponibles via index.ts
import type { Recipe } from './database';

export interface RecipeFilters {
  category?: string[];
  difficulty?: string[];
  prepTime?: number;
  dietary?: string[];
  symptoms?: string[];
  cyclePhase?: string;
}

export interface NutritionAnalytics {
  weeklyMeals: number;
  favoriteCategories: string[];
  averageRating: number;
  nutritionScore: number;
  goalProgress: {
    lowGI: number;
    antiInflammatory: number;
    balanced: number;
  };
}

export interface MealPlan {
  id: string;
  userId: string;
  weekStart: string;
  meals: {
    [day: string]: {
      breakfast?: Recipe;
      lunch?: Recipe;
      dinner?: Recipe;
      snacks?: Recipe[];
    };
  };
  shoppingList: ShoppingListItem[];
  createdAt: string;
}

export interface ShoppingListItem {
  id: string;
  ingredient: string;
  quantity: string;
  category: string;
  purchased: boolean;
  recipeIds: string[];
}

export interface NutritionGoal {
  type: 'weight_management' | 'hormone_balance' | 'energy_boost' | 'inflammation_reduction';
  target: number;
  current: number;
  unit: string;
  deadline?: string;
}

export interface RecipeRating {
  recipeId: string;
  userId: string;
  rating: number;
  review?: string;
  difficultyFelt: 'easier' | 'as_expected' | 'harder';
  wouldMakeAgain: boolean;
  tags: string[];
}

export interface IngredientSubstitution {
  original: string;
  substitute: string;
  reason: 'allergy' | 'preference' | 'availability' | 'diet';
  ratio: string;
}

// Types pour les services nutrition
export interface GetRecipesParams {
  filters?: RecipeFilters;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'rating' | 'prep_time' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export interface GetSuggestionsParams {
  symptoms?: string[];
  cyclePhase?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
  energyLevel?: number;
  preferences?: {
    maxPrepTime?: number;
    dietary?: string[];
    excludeIngredients?: string[];
  };
}