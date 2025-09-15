// Types Supabase générés (temporaire - sera remplacé par les types auto-générés)

import type {
  UserProfile,
  DailySymptom,
  Recipe,
  UserRecipeTracking,
  MoodEntry,
  BreathingSession,
  BreathingTechnique,
  ActivitySession,
  UserActivityTracking,
  UserNutritionPreferences
} from './database';

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<UserProfile>;
      };
      daily_symptoms: {
        Row: DailySymptom;
        Insert: Omit<DailySymptom, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<DailySymptom, 'id' | 'user_id'>>;
      };
      recipes: {
        Row: Recipe;
        Insert: Omit<Recipe, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Recipe, 'id'>>;
      };
      user_recipe_tracking: {
        Row: UserRecipeTracking;
        Insert: Omit<UserRecipeTracking, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<UserRecipeTracking, 'id' | 'user_id'>>;
      };
      mood_entries: {
        Row: MoodEntry;
        Insert: Omit<MoodEntry, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<MoodEntry, 'id' | 'user_id'>>;
      };
      breathing_sessions: {
        Row: BreathingSession;
        Insert: Omit<BreathingSession, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<BreathingSession, 'id' | 'user_id'>>;
      };
      breathing_techniques: {
        Row: BreathingTechnique;
        Insert: Omit<BreathingTechnique, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<BreathingTechnique, 'id'>>;
      };
      activity_sessions: {
        Row: ActivitySession;
        Insert: Omit<ActivitySession, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<ActivitySession, 'id'>>;
      };
      user_activity_tracking: {
        Row: UserActivityTracking;
        Insert: Omit<UserActivityTracking, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<UserActivityTracking, 'id' | 'user_id'>>;
      };
      user_nutrition_preferences: {
        Row: UserNutritionPreferences;
        Insert: Omit<UserNutritionPreferences, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<UserNutritionPreferences, 'id' | 'user_id'>>;
      };
    };
    Views: {
      [_key in never]: never;
    };
    Functions: {
      [_key in never]: never;
    };
    Enums: {
      [_key in never]: never;
    };
  };
}