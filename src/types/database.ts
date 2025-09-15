// Types de base de données pour SOPK Agent
// Correspondent aux tables Supabase

export interface UserProfile {
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
  notification_preferences: Record<string, any>;
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
  notes: string | null;
  created_at: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string | null;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  difficulty: 'beginner' | 'easy' | 'medium' | 'advanced';
  glycemic_index_category: 'low' | 'medium' | 'high' | null;
  sopk_benefits: string[];
  dietary_tags: string[];
  symptom_targets: string[] | null;
  cycle_phases: string[] | null;
  main_nutrients: string[] | null;
  estimated_calories: number | null;
  mood_boosting: boolean;
  season: string[];
  ingredients: any; // JSON field
  instructions: any; // JSON field
  tips: string | null;
  nutritional_info: Record<string, any> | null;
  is_simple_suggestion: boolean | null;
  ingredients_simple: string | null;
  preparation_steps_simple: string | null;
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
  would_make_again: boolean | null;
  meal_type: string | null;
  notes: string | null;
  created_at: string;
}

export interface MoodEntry {
  id: string;
  user_id: string;
  date: string;
  time: string;
  mood_score: number;
  energy_level: number | null;
  stress_level: number | null;
  notes: string | null;
  tags: string[];
  created_at: string;
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
  created_at: string;
}

export interface BreathingTechnique {
  id: string;
  name: string;
  description: string;
  instructions: any; // JSON field
  duration_minutes: number;
  difficulty_level: number;
  benefits: string[];
  created_at: string;
}

export interface ActivitySession {
  id: string;
  title: string;
  description: string | null;
  category: string;
  duration_minutes: number;
  difficulty: 'beginner' | 'easy' | 'medium' | 'advanced';
  intensity_level: number;
  sopk_benefits: string[];
  symptom_targets: string[];
  contraindications: string[];
  instructions: any; // JSON field
  equipment_needed: string[];
  audio_guide_url: string | null;
  video_preview_url: string | null;
  easy_modifications: string[];
  advanced_variations: string[];
  created_at: string;
}

export interface UserActivityTracking {
  id: string;
  user_id: string;
  session_id: string;
  date: string;
  duration_actual_minutes: number | null;
  difficulty_felt: string | null;
  energy_before: number | null;
  energy_after: number | null;
  enjoyment_rating: number | null;
  will_repeat: boolean | null;
  notes: string | null;
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
  cooking_skill_level: string | null;
  goals: string[];
  created_at: string;
  updated_at: string;
}