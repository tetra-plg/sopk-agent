// Types communs pour l'application SOPK

export interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  totalPages: number;
}

// Types pour les suggestions
export interface NutritionSuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  prepTime: number;
  benefits: string[];
  ingredients: string;
  instructions: string;
  adaptedFor: string[];
}

export interface ActivitySuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  intensity: number;
  benefits: string[];
  equipment: string[];
}

// Types pour les statistiques
export interface WeeklyStats {
  averageMood: number;
  averageFatigue: number;
  averagePain: number;
  totalSessions: number;
  completionRate: number;
}

export interface MonthlyStats extends WeeklyStats {
  cycleData: {
    averageCycleLength: number;
    regularityScore: number;
  };
  progressMetrics: {
    moodImprovement: number;
    energyImprovement: number;
    symptomReduction: number;
  };
}

// Types pour les formulaires
export interface JournalFormData {
  date: string;
  periodFlow: number;
  fatigueLevel: number;
  painLevel: number;
  moodScore?: number;
  notes?: string;
}

export interface MoodFormData {
  date: string;
  time: string;
  moodScore: number;
  energyLevel?: number;
  stressLevel?: number;
  notes?: string;
  tags: string[];
}

export interface SessionFeedback {
  sessionId: string;
  sessionType: 'breathing' | 'activity';
  duration: number;
  beforeRating?: number;
  afterRating?: number;
  satisfactionRating: number;
  willRepeat?: boolean;
  notes?: string;
}

// Types pour les préférences utilisateur
export interface NotificationSettings {
  dailyReminder: boolean;
  weeklySupport: boolean;
  newFeatures: boolean;
  quietHours?: {
    start: string;
    end: string;
  };
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  units: 'metric' | 'imperial';
  privacy: {
    shareAnonymousData: boolean;
    analyticsEnabled: boolean;
  };
}

// Forward declarations pour éviter les imports circulaires
export interface AuthContextType {
  user: any | null;
  userProfile: any | null; // UserProfile sera typé plus tard
  loading: boolean;
  signIn: (email: string, password: string) => Promise<ApiResponse>;
  signUp: (email: string, password: string, userData: any) => Promise<ApiResponse>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<ApiResponse>; // Partial<UserProfile> plus tard
}

export interface DashboardContextType {
  todaySymptoms: any | null; // DailySymptom sera typé plus tard
  recentMood: any | null; // MoodEntry sera typé plus tard
  suggestions: {
    nutrition: NutritionSuggestion[];
    activity: ActivitySuggestion[];
  };
  loading: boolean;
  refreshDashboard: () => Promise<void>;
}

// Types pour les erreurs
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Types pour les événements analytics
export interface AnalyticsEvent {
  eventName: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp: string;
}

// Note: Les types database sont importés via index.ts pour éviter les duplicatas