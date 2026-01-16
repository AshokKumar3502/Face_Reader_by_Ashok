
export enum AppState {
  INTRO = 'INTRO',
  VISION_ANALYSIS = 'VISION_ANALYSIS',
  LOADING = 'LOADING',
  RESULT = 'RESULT',
  ERROR = 'ERROR',
  HISTORY = 'HISTORY',
  SETTINGS = 'SETTINGS',
  CHAT = 'CHAT',
  SANCTUARY = 'SANCTUARY'
}

export type Language = 'en' | 'hi' | 'te' | 'ta' | 'kn';

export type UserContext = 'MORNING' | 'MIDDAY' | 'EVENING' | 'CURRENT';

export interface WorkplaceMetrics {
  greeting: number;
  listening: number;
  professionalism: number;
  conflictResolution: number;
  patience: number;
}

export interface BehavioralInsight {
  tone: 'Polite' | 'Aggressive' | 'Neutral' | 'Professional';
  trendVsYesterday: string;
  improvementArea: string;
  positiveReinforcement: string;
  practicalTip: string;
}

export interface InsightData {
  isHuman: boolean;
  psychProfile: string; // Brief behavioral summary
  simpleExplanation: string;
  neuralEvidence: string;
  confidenceScore: number;
  workplaceMetrics: WorkplaceMetrics;
  behavioralInsight: BehavioralInsight;
  auraColors: string[];
  vitals: {
    stress: number;
    calmness: number;
    anxiety: number;
    fatigue: number;
  };
}

export interface WeeklyInsight {
  weekTitle: string;
  soulReport: string;
  emotionalTrend: string;
  keyRealization: string;
  nextWeekMantra: string;
}

export interface JournalEntry {
  id: string;
  timestamp: number;
  dayNumber: number;
  context: UserContext;
  insight: InsightData;
  image: string; 
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
