// Types spécifiques au module stress et bien-être

// Types déjà disponibles via index.ts

export interface StressMetrics {
  averageStressLevel: number;
  moodTrend: 'improving' | 'stable' | 'declining';
  breathingSessionsThisWeek: number;
  stressReductionRate: number;
  topTriggers: string[];
  bestTechniques: string[];
}

export interface MoodPattern {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  averageScore: number;
  commonTriggers: string[];
  improvements: string[];
  cycleCorrelation?: {
    phase: string;
    impact: number;
  };
}

export interface BreathingTechniqueProgress {
  techniqueId: string;
  techniqueName: string;
  sessionsCompleted: number;
  averageDuration: number;
  averageImprovement: number;
  lastUsed: string;
  effectiveness: number;
}

export interface WellnessGoal {
  type: 'stress_reduction' | 'mood_improvement' | 'sleep_quality' | 'anxiety_management';
  targetScore: number;
  currentScore: number;
  timeframe: 'weekly' | 'monthly';
  activities: string[];
}

export interface RelaxationSession {
  id: string;
  type: 'breathing' | 'meditation' | 'progressive_muscle' | 'visualization';
  technique: BreathingTechnique | MeditationTechnique;
  startTime: string;
  duration: number;
  completed: boolean;
  feedback?: SessionFeedback;
}

export interface MeditationTechnique {
  id: string;
  name: string;
  description: string;
  category: 'mindfulness' | 'loving_kindness' | 'body_scan' | 'mantra';
  duration: number;
  audioUrl?: string;
  instructions: string[];
  benefits: string[];
}

export interface SessionFeedback {
  stressBefore: number;
  stressAfter: number;
  difficultyRating: number;
  enjoymentRating: number;
  calmnessBefore: number;
  calmnessAfter: number;
  wouldRecommend: boolean;
  notes?: string;
}

export interface MoodInsight {
  pattern: string;
  confidence: number;
  suggestion: string;
  relatedFactors: string[];
  timeframe: string;
}

export interface StressAlert {
  level: 'low' | 'medium' | 'high';
  triggers: string[];
  suggestedActions: string[];
  timestamp: string;
  acknowledged: boolean;
}

// Types pour les services stress
export interface GetMoodEntriesParams {
  startDate?: string;
  endDate?: string;
  limit?: number;
  tags?: string[];
  minScore?: number;
  maxScore?: number;
}

export interface MoodAnalysisParams {
  period: 'week' | 'month' | 'quarter';
  includeCorrelations?: boolean;
  includeInsights?: boolean;
}