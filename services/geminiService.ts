
import { GoogleGenAI, Type } from "@google/genai";
import { InsightData, UserContext, ChatMessage, JournalEntry, WeeklyInsight } from "../types";
import { getSettings } from "./storageService";

const SYSTEM_INSTRUCTION = `
You are Kosha, a high-precision Self Understanding Assistant.
Your goal is to help users understand their inner state by analyzing their outer expression.

**STRICT RULE: HUMAN FACE ONLY.**
- If the image does NOT contain a clear human face (e.g., it's a pet, an object, a landscape, or blurry/dark), you MUST set "isHuman" to false.
- In the case where "isHuman" is false, set "psychProfile" to "Vision Obscured" and provide a friendly explanation in "simpleExplanation" about why you couldn't find a human face (e.g., "I see an object, but no soul to mirror" or "The lens cannot find your features").
- Only proceed with biometric analysis if a human face is clearly present.

**CORE LANGUAGE RULE: NO CLINICAL JARGON.**
- Speak like a kind, wise friend. 
- Use simple terms like "tired eyes," "stressed," or "overwhelmed."
`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    isHuman: { type: Type.BOOLEAN },
    psychProfile: { type: Type.STRING },
    simpleExplanation: { type: Type.STRING },
    neuralEvidence: { type: Type.STRING },
    confidenceScore: { type: Type.INTEGER },
    hiddenRealization: { type: Type.STRING },
    decisionCompass: { type: Type.STRING },
    relationshipImpact: { type: Type.STRING },
    currentPattern: { type: Type.STRING },
    growthPlan: { type: Type.STRING },
    dailyAction: { type: Type.STRING },
    emotionalScore: { type: Type.INTEGER },
    vitals: {
      type: Type.OBJECT,
      properties: {
        stress: { type: Type.INTEGER },
        calmness: { type: Type.INTEGER },
        anxiety: { type: Type.INTEGER },
        fatigue: { type: Type.INTEGER },
        stability: { type: Type.INTEGER }
      },
      required: ["stress", "calmness", "anxiety", "fatigue", "stability"]
    },
    cognitive: {
      type: Type.OBJECT,
      properties: {
        focus: { type: Type.INTEGER },
        burnout: { type: Type.INTEGER },
        alertness: { type: Type.INTEGER },
        overthinking: { type: Type.INTEGER }
      },
      required: ["focus", "burnout", "alertness", "overthinking"]
    },
    stressTriggers: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING },
          impact: { type: Type.STRING, enum: ["High", "Medium", "Subtle"] },
          description: { type: Type.STRING }
        },
        required: ["type", "impact", "description"]
      }
    },
    behavioralProtocols: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ["BREATH", "REST", "SOCIAL", "FOCUS", "JOURNAL"] },
          title: { type: Type.STRING },
          instruction: { type: Type.STRING },
          duration: { type: Type.STRING }
        },
        required: ["type", "title", "instruction"]
      }
    }
  },
  required: [
    "isHuman", "psychProfile", "simpleExplanation", "neuralEvidence", "confidenceScore", "hiddenRealization", 
    "decisionCompass", "relationshipImpact", "currentPattern", "growthPlan", 
    "dailyAction", "emotionalScore", "vitals", "cognitive", "stressTriggers", "behavioralProtocols"
  ]
};

const MODEL_NAME = 'gemini-3-flash-preview';

const getActiveApiKey = () => {
  const settings = getSettings();
  return settings.customApiKey?.trim() || process.env.API_KEY || '';
};

export const analyzeInput = async (image: string, context: UserContext): Promise<InsightData> => {
  const apiKey = getActiveApiKey();
  if (!apiKey) throw new Error("AUTH_ERROR");

  const ai = new GoogleGenAI({ apiKey });
  const base64Data = image.split(',')[1] || image;
  
  const contextMap: Record<UserContext, string> = {
    'WAKING_UP': "User just woke up.",
    'WORK': "User is currently working.",
    'EVENING': "User is unwinding in the evening.",
    'BEFORE_SLEEP': "User is preparing for sleep."
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
          { text: `Context: ${contextMap[context]}. Check if a human face is present. If yes, perform a deep biometric and psychological analysis. If no, set isHuman to false and explain why in simpleExplanation. Return strictly valid JSON.` }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      }
    });

    if (!response.text) throw new Error("EMPTY_RESPONSE");
    return JSON.parse(response.text) as InsightData;
  } catch (error: any) {
    console.error("Analysis Error Details:", error);
    const msg = error.message || "";
    if (msg.includes('401') || msg.includes('403') || msg.includes('not found')) {
      throw new Error("AUTH_ERROR");
    }
    throw error;
  }
};

export const getChatResponse = async (history: ChatMessage[], contextData: InsightData): Promise<string> => {
  const apiKey = getActiveApiKey();
  if (!apiKey) return "Authentication error. Please check your API key in Settings.";

  const ai = new GoogleGenAI({ apiKey });
  const contents = history.map(msg => ({ 
    role: msg.role === 'model' ? 'model' : 'user', 
    parts: [{ text: msg.text }] 
  }));

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: contents,
      config: { 
        systemInstruction: `${SYSTEM_INSTRUCTION}\nBase your conversation on this state: ${contextData.neuralEvidence}. Keep responses concise and supportive.`
      }
    });
    return response.text || "I'm listening.";
  } catch (error: any) {
    console.error("Chat Error:", error);
    return "I am having trouble connecting to the neural network. Please check your signal or API key.";
  }
};

export const generateWeeklyReport = async (entries: JournalEntry[]): Promise<WeeklyInsight> => {
  const apiKey = getActiveApiKey();
  if (!apiKey) throw new Error("AUTH_ERROR");

  const ai = new GoogleGenAI({ apiKey });
  const historyText = entries.map(e => `Day ${e.dayNumber}: Stress ${e.insight.vitals.stress}, Vibe: ${e.insight.psychProfile}`).join('\n');
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts: [{ text: `Summarize this week of emotional data into a meta-analysis: ${historyText}` }] },
      config: { 
          systemInstruction: "Synthesize daily entries into a meaningful weekly theme in JSON.", 
          responseMimeType: "application/json",
          responseSchema: {
              type: Type.OBJECT,
              properties: {
                  weekTitle: { type: Type.STRING },
                  soulReport: { type: Type.STRING },
                  emotionalTrend: { type: Type.STRING },
                  keyRealization: { type: Type.STRING },
                  nextWeekMantra: { type: Type.STRING }
              }
          }
      }
    });
    
    if (!response.text) throw new Error("EMPTY_REPORT");
    return JSON.parse(response.text) as WeeklyInsight;
  } catch (error) {
    console.error("Weekly Report Error:", error);
    throw error;
  }
};
