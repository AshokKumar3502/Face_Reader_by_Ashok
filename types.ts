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

export interface InsightData {
  psychProfile: string;    // Deep observation
  simpleExplanation: string; // New: Detailed simple explanation
  relationshipImpact: string; // How this mood affects others
  currentPattern: string;  // e.g., "Your stress peaks in the afternoon"
  growthPlan: string;      // Mentor advice
  dailyAction: string;     // Simple task
  emotionalScore: number;  // 0-100 (Peace/Balance level)
}

export interface WeeklyInsight {
  weekTitle: string;       // e.g., "The Week of Hidden Courage"
  soulReport: string;      // Narrative summary of the week
  emotionalTrend: string;  // e.g., "Rising Anxiety", "Finding Peace"
  keyRealization: string;  // The hidden truth connecting the days
  nextWeekMantra: string;  // Simple phrase to carry forward
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