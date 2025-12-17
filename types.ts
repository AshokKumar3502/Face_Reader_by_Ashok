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

export type UserContext = 'WAKING_UP' | 'WORK' | 'FAMILY' | 'SOCIAL' | 'BEFORE_SLEEP';

export interface InsightData {
  psychProfile: string;    // Deep observation
  simpleExplanation: string; // New: Detailed simple explanation
  relationshipImpact: string; // How this mood affects others
  currentPattern: string;  // e.g., "Your stress peaks in the afternoon"
  growthPlan: string;      // Mentor advice
  dailyAction: string;     // Simple task
  emotionalScore: number;  // 0-100 (Peace/Balance level)
}

export interface JournalEntry {
  id: string;
  timestamp: number;
  dayNumber: number;
  context: UserContext;
  insight: InsightData;
  image: string; // Base64 image data
}

export interface AnalysisRequest {
  image: string; // Base64
  context: UserContext;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}