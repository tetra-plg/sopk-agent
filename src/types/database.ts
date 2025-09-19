// Types de base de données pour SOPK Agent
// Correspondent aux tables Supabase

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

// Interface pour les instructions de techniques de respiration
export interface BreathingInstructions {
  phases: {
    name: 'preparation' | 'breathing' | 'completion';
    duration_seconds: number;
    instructions: string[];
    breath_pattern?: {
      inhale_seconds: number;
      hold_seconds?: number;
      exhale_seconds: number;
      pause_seconds?: number;
    };
  }[];
  tips?: string[];
  warnings?: string[];
}

// Interface pour les instructions d'activité physique
export interface ActivityInstructions {
  phases: {
    name: 'warmup' | 'main' | 'cooldown';
    duration_minutes: number;
    exercises: {
      name: string;
      description: string;
      duration?: string;
      repetitions?: number;
      sets?: number;
      rest_between_sets?: number;
    }[];
  }[];
  safety_notes?: string[];
  progression_tips?: string[];
}

// Interface pour les préférences de notification
export interface NotificationPreferences {
  daily_reminder: boolean;
  weekly_summary: boolean;
  new_features: boolean;
  recipe_suggestions: boolean;
  activity_reminders: boolean;
  breathing_reminders: boolean;
}

export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  preferred_name: string | null;
  date_of_birth: string | null;
  sopk_diagnosis_year: number | null;
  current_symptoms: string[];
  severity_level: 'mild' | 'moderate' | 'severe' | null;
  timezone: string;
  language_preference: string;
  primary_goals: string[];
  notification_preferences: NotificationPreferences;
  created_at: string;
  updated_at: string;
}

export interface DailySymptom {
  id: string;
  user_id: string;
  date: string;
  period_flow: number;
  fatigue_level: number;
  pain_level: number;
  mood_score: number | null;
  mood_emoji: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string | null;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
  prep_time_minutes: number;
  cook_time_minutes: number;
  total_time_minutes: number; // Colonne calculée
  servings: number;
  difficulty: 'beginner' | 'easy' | 'medium' | 'advanced';
  glycemic_index_category: 'low' | 'medium' | 'high' | null;
  nutritional_info: NutritionalInfo | null;
  sopk_benefits: string[];
  allergen_info: string[];
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  equipment_needed: string[];
  variations: RecipeVariation[] | null;
  storage_tips: string | null;
  season: string[];
  dietary_tags: string[];
  symptom_targets?: string[];
  cycle_phases?: string[];
  cycle_phases?: string[];
  main_nutrients?: string[];
  mood_boosting?: boolean;
  tips?: string;
  created_at: string;
}

export interface UserRecipeTracking {
  id: string;
  user_id: string;
  recipe_id: string;
  date_cooked: string;
  servings_made: number;
  difficulty_rating: number | null;
  taste_rating: number | null;
  will_cook_again: boolean | null;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null;
  preparation_time_actual: number | null;
  notes: string | null;
  created_at: string;
}

export interface MoodEntry {
  id: string;
  user_id: string;
  date: string;
  time: string | null;
  mood_emoji: string;
  mood_score: number | null;
  energy_level: number | null;
  stress_level: number | null;
  notes: string | null;
  tags: string[];
  context_triggers: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface BreathingSession {
  id: string;
  user_id: string;
  technique_id: string;
  date: string;
  duration_seconds: number;
  stress_before: number | null;
  stress_after: number | null;
  satisfaction_rating: number | null;
  notes: string | null;
  completed: boolean;
  interruption_reason: string | null;
  feeling_after: string | null;
  created_at: string;
  updated_at: string;
}

export interface BreathingTechnique {
  id: string;
  name: string;
  description: string;
  instructions: BreathingInstructions;
  duration_minutes: number;
  duration_seconds: number;
  pattern: number[];
  difficulty_level: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  benefits: string[];
  icon: string;
  color: string;
  sopk_benefits: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivitySession {
  id: string;
  title: string;
  description: string | null;
  category: string;
  duration_minutes: number;
  difficulty: 'beginner' | 'easy' | 'medium' | 'advanced';
  intensity_level: number | null;
  estimated_calories_burned: number | null;
  sopk_benefits: string[] | null;
  symptom_targets: string[] | null;
  contraindications: string[] | null;
  instructions: ActivityInstructions;
  equipment_needed: string[] | null;
  audio_guide_url: string | null;
  video_preview_url: string | null;
  easy_modifications: string[] | null;
  advanced_variations: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserActivityTracking {
  id: string;
  user_id: string;
  session_id: string;
  date_completed: string;
  duration_actual_minutes: number | null;
  // Niveaux avant/après
  pre_energy_level: number | null; // 1-10
  post_energy_level: number | null; // 1-10
  pre_pain_level: number | null; // 0-10
  post_pain_level: number | null; // 0-10
  pre_mood_score: number | null; // 1-10
  post_mood_score: number | null; // 1-10
  // Feedback
  difficulty_felt: 'too_easy' | 'just_right' | 'too_hard' | null;
  difficulty_felt_rating: number | null; // 1-5
  enjoyment_rating: number | null; // 1-5
  modifications_used: string[] | null;
  // Champs techniques
  duration_seconds: number | null;
  completion_percentage: number | null; // 0-100
  session_notes: string | null;
  created_at: string;
}

export interface UserNutritionPreferences {
  id: string;
  user_id: string;
  dietary_restrictions: string[];
  allergies: string[];
  preferred_cuisines: string[];
  disliked_ingredients: string[];
  meal_prep_time_preference: number | null;
  cooking_skill_level: 'beginner' | 'intermediate' | 'advanced' | null;
  preferred_meal_complexity: 'very_easy' | 'easy' | 'medium' | null;
  max_prep_time_minutes: number | null;
  nutrition_goals: string[]; // Objectifs nutritionnels unifiés
  created_at: string;
  updated_at: string;
}