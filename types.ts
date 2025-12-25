
export enum AppState {
  INTRO = 'INTRO',
  CONTEXT_SELECT = 'CONTEXT_SELECT',
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

export type UserContext = 'WAKING_UP' | 'WORK' | 'EVENING' | 'BEFORE_SLEEP';

export interface EmotionalMetrics {
  stress: number;
  calmness: number;
  anxiety: number;
  fatigue: number;
  stability: number;
}

export interface CognitiveMetrics {
  focus: number;
  burnout: number;
  alertness: number;
  overthinking: number;
}

export interface StressTrigger {
  type: string;
  impact: 'High' | 'Medium' | 'Subtle';
  description: string;
}

export interface BehavioralProtocol {
  type: 'BREATH' | 'REST' | 'SOCIAL' | 'FOCUS' | 'JOURNAL';
  title: string;
  instruction: string;
  duration?: string;
}

export interface InsightData {
  isHuman: boolean;
  psychProfile: string;
  simpleExplanation: string;
  neuralEvidence: string;
  confidenceScore: number;
  relationshipImpact: string;
  currentPattern: string;
  growthPlan: string;
  dailyAction: string;
  emotionalScore: number;
  hiddenRealization: string;
  decisionCompass: string;
  vitals: EmotionalMetrics;
  cognitive: CognitiveMetrics;
  stressTriggers: StressTrigger[];
  behavioralProtocols: BehavioralProtocol[];
  auraColors: string[];
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
