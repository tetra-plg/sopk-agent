
// =====================================================
// INTERFACES SPÉCIALISÉES POUR REMPLACER LES CHAMPS ANY
// =====================================================

// Interface pour les informations nutritionnelles
export interface NutritionalInfo {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar?: number;
    sodium?: number;
    cholesterol?: number;
    vitamins?: Record<string, number>;
    minerals?: Record<string, number>;
  }
  
  // Interface pour les ingrédients de recettes
  export interface RecipeIngredient {
    name: string;
    quantity: string;
    unit?: string;
    category?: 'protein' | 'vegetables' | 'grains' | 'dairy' | 'fats' | 'spices' | 'other';
    optional?: boolean;
    substitutions?: string[];
  }
  
  // Interface pour les instructions de recettes
  export interface RecipeInstruction {
    step: number;
    instruction: string;
    duration_minutes?: number;
    tips?: string;
    temperature?: string;
    equipment?: string[];
  }
  
  // Interface pour les variations de recettes
  export interface RecipeVariation {
    name: string;
    description: string;
    modifications: {
      ingredient_changes?: { original: string; replacement: string }[];
      instruction_changes?: { step: number; modification: string }[];
      time_adjustment?: number;
    };
  }