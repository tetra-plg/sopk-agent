// Types spécifiques au module cycle menstruel

// Types déjà disponibles via index.ts

export interface CyclePhase {
  name: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  startDay: number;
  endDay: number;
  description: string;
  commonSymptoms: string[];
  recommendations: {
    nutrition: string[];
    activity: string[];
    selfCare: string[];
  };
}

export interface CycleData {
  currentPhase: CyclePhase;
  dayOfCycle: number;
  cycleLength: number;
  nextPeriodPredicted: string;
  ovulationPredicted: string;
  reliability: number; // 0-1 based on data consistency
}

export interface CycleStats {
  averageCycleLength: number;
  cycleVariability: number;
  averagePeriodLength: number;
  commonSymptoms: {
    symptom: string;
    frequency: number;
    averageIntensity: number;
    typicalPhase: string;
  }[];
  irregularityScore: number;
}

export interface SymptomTrend {
  symptom: 'fatigue' | 'pain' | 'mood' | 'flow';
  currentValue: number;
  trend: 'improving' | 'stable' | 'worsening';
  weekOverWeek: number;
  monthOverMonth: number;
  cycleCorrelation: {
    phase: string;
    correlation: number;
  }[];
}

export interface PeriodPrediction {
  predictedStart: string;
  confidenceLevel: number;
  earliestPossible: string;
  latestPossible: string;
  basedOnCycles: number;
}

export interface SymptomPattern {
  symptom: string;
  pattern: 'cyclical' | 'random' | 'trending';
  peakPhase?: string;
  averageIntensity: number;
  correlations: {
    factor: string;
    strength: number;
  }[];
}

export interface CycleInsight {
  type: 'pattern' | 'anomaly' | 'improvement' | 'concern';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  suggestions?: string[];
  relatedSymptoms?: string[];
}

export interface FertilityWindow {
  fertileStart: string;
  fertileEnd: string;
  ovulationDay: string;
  probability: number;
  signs: {
    temperature?: number;
    cervicalMucus?: string;
    position?: string;
    symptoms?: string[];
  };
}

// Types pour les formulaires et saisie
export interface SymptomEntry {
  date: string;
  periodFlow: number; // 0-5
  fatigueLevel: number; // 1-5
  painLevel: number; // 1-5
  moodScore?: number; // 1-10
  additionalSymptoms?: {
    acne: boolean;
    bloating: boolean;
    cravings: boolean;
    insomnia: boolean;
    anxiety: boolean;
    headache: boolean;
  };
  notes?: string;
}

export interface CycleSettings {
  averageCycleLength: number;
  averagePeriodLength: number;
  trackingStart: string;
  notifications: {
    periodReminder: boolean;
    ovulationReminder: boolean;
    fertilityWindow: boolean;
    symptomLogging: boolean;
  };
  privacyLevel: 'basic' | 'detailed' | 'medical';
}

// Types pour les services cycle
export interface GetSymptomsParams {
  startDate?: string;
  endDate?: string;
  symptoms?: string[];
  minIntensity?: number;
  includeNotes?: boolean;
}

export interface CycleAnalysisParams {
  months: number;
  includeCorrelations?: boolean;
  includePredictions?: boolean;
  includeInsights?: boolean;
}