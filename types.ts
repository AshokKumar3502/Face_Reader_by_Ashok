export enum AppState {
  INTRO = 'INTRO',
  CONTEXT_SELECT = 'CONTEXT_SELECT',
  VISION_ANALYSIS = 'VISION_ANALYSIS',
  LOADING = 'LOADING',
  RESULT = 'RESULT',
  ERROR = 'ERROR',
  HISTORY = 'HISTORY',
  SETTINGS = 'SETTINGS',
  CHAT = 'CHAT'
}

export type UserContext = 'WAKING_UP' | 'WORK' | 'EVENING' | 'BEFORE_SLEEP';

export interface EmotionalMetrics {
  stress: number;    // 0-100
  calmness: number;  // 0-100
  anxiety: number;   // 0-100
  fatigue: number;   // 0-100
  stability: number; // 0-100
}

export interface CognitiveMetrics {
  focus: number;     // 0-100
  burnout: number;   // 0-100
  alertness: number; // 0-100
  overthinking: number; // 0-100
}

export interface StressTrigger {
  type: string;        // e.g., "Social Pressure"
  impact: 'High' | 'Medium' | 'Subtle';
  description: string; // One sentence why
}

export interface BehavioralProtocol {
  type: 'BREATH' | 'REST' | 'SOCIAL' | 'FOCUS' | 'JOURNAL';
  title: string;
  instruction: string;
  duration?: string; // e.g., "5 mins"
}

export interface InsightData {
  psychProfile: string;
  simpleExplanation: string;
  neuralEvidence: string; // Specific clinical facial cues detected
  confidenceScore: number; // 0-100 Accuracy rating
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

export interface AnalysisRequest {
  image: string;
  context: UserContext;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}