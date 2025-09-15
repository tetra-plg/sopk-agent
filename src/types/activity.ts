// Types spécifiques au module activité physique

import { ActivitySession } from './database';

// Types déjà disponibles via index.ts

export interface ActivityFilters {
  category?: string[];
  difficulty?: string[];
  duration?: {
    min?: number;
    max?: number;
  };
  intensity?: {
    min?: number;
    max?: number;
  };
  equipment?: string[];
  symptoms?: string[];
  cyclePhase?: string;
}

export interface ActivityProgress {
  totalSessions: number;
  totalMinutes: number;
  averageRating: number;
  favoriteCategories: string[];
  weeklyGoal: {
    target: number;
    completed: number;
    streak: number;
  };
  improvements: {
    energy: number;
    strength: number;
    flexibility: number;
    mood: number;
  };
}

export interface SessionPlan {
  warmup: ExercisePhase[];
  main: ExercisePhase[];
  cooldown: ExercisePhase[];
  totalDuration: number;
  equipment: string[];
}

export interface ExercisePhase {
  name: string;
  description: string;
  duration: number; // en secondes
  repetitions?: number;
  restTime?: number;
  modifications?: {
    easier: string;
    harder: string;
  };
  breathing?: string;
}

export interface SessionTimer {
  isRunning: boolean;
  currentPhase: number;
  phaseTime: number;
  totalTime: number;
  isPaused: boolean;
}

export interface ActivityGoal {
  type: 'weekly_sessions' | 'total_minutes' | 'streak_days' | 'specific_category';
  target: number;
  current: number;
  period: 'weekly' | 'monthly';
  category?: string;
}

export interface FitnessMetrics {
  restingHeartRate?: number;
  flexibility: {
    hamstring: number;
    shoulder: number;
    spine: number;
  };
  strength: {
    core: number;
    lower: number;
    upper: number;
  };
  endurance: {
    cardio: number;
    muscular: number;
  };
  lastUpdated: string;
}

// Types pour les services activité
export interface GetSessionsParams {
  filters?: ActivityFilters;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'duration' | 'difficulty' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export interface SessionRecommendation {
  session: ActivitySession;
  matchScore: number;
  reasons: string[];
  adaptations?: string[];
}

export interface SessionFeedbackData {
  sessionId: string;
  userId: string;
  date: string;
  completed: boolean;
  durationActual?: number;
  energyBefore: number;
  energyAfter: number;
  difficultyFelt: 'too_easy' | 'just_right' | 'too_hard';
  enjoyment: number;
  willRepeat: boolean;
  notes?: string;
  modifications?: string[];
}