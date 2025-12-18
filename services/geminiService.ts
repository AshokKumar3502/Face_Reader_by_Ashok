import { GoogleGenAI, Type } from "@google/genai";
import { InsightData, UserContext, ChatMessage, JournalEntry, WeeklyInsight } from "../types";
import { getSettings } from "./storageService";

const SYSTEM_INSTRUCTION = `
You are Kosha, a high-precision Self Understanding Assistant.
Your goal is to help users understand their inner state by analyzing their outer expression.

**CORE LANGUAGE RULE: NO CLINICAL JARGON.**
- Do NOT use words like "orbicularis oculi," "sympathetic nervous system," "bilateral," or "cognitive overload."
- INSTEAD, use words like "tired eyes," "stressed," "both sides," or "too much on your mind."
- Speak like a kind, wise friend who values clear communication.

**MISSION:**
1. **Facial Scan**: Look at the eyes, brow, mouth, and jaw for high-accuracy biometric cues.
2. **Translate to Truth**: Turn those biometric cues into simple, honest observations.
3. **The 'Why'**: Connect their face to their context (e.g., "At Work") to explain the source of their stress.
4. **Action**: Provide 100% simple behavioral protocols that help them feel better immediately.
`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
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
    "psychProfile", "simpleExplanation", "neuralEvidence", "confidenceScore", "hiddenRealization", 
    "decisionCompass", "relationshipImpact", "currentPattern", "growthPlan", 
    "dailyAction", "emotionalScore", "vitals", "cognitive", "stressTriggers", "behavioralProtocols"
  ]
};

// Switching to a more resilient model for general users to prevent timeouts
const modelName = 'gemini-1.5-flash-latest'; 

const getAIClient = () => {
  const settings = getSettings();
  
  // Explicitly prioritize the manually entered key if it exists
  const manualKey = settings.customApiKey?.trim();
  let envKey = '';
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
       // @ts-ignore
       envKey = process.env.API_KEY;
    }
  } catch (e) {}

  const finalKey = manualKey || envKey;

  if (!finalKey) {
    throw new Error("KEY_MISSING");
  }
  
  return new GoogleGenAI({ apiKey: finalKey });
};

export const analyzeInput = async (image: string, context: UserContext): Promise<InsightData> => {
  const contextMap: Record<UserContext, string> = {
    'WAKING_UP': "I just woke up.",
    'WORK': "I am currently at work.",
    'EVENING': "I am relaxing in the evening.",
    'BEFORE_SLEEP': "I am about to go to sleep."
  };

  try {
    const ai = getAIClient();
    const base64Data = image.split(',')[1] || image;
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        role: 'user',
        parts: [{ inlineData: { mimeType: 'image/jpeg', data: base64Data } }, { text: `Analyze my face. Context: ${contextMap[context]}` }]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });

    if (response.text) return JSON.parse(response.text) as InsightData;
    throw new Error("EMPTY_RESPONSE");
  } catch (error: any) {
    console.error("Self Understanding Analysis Failure:", error);
    // Pass specific error messages up to help debugging
    if (error.message?.includes('401') || error.message?.includes('API_KEY_INVALID')) {
       throw new Error("INVALID_KEY");
    }
    throw error;
  }
};

export const getChatResponse = async (history: ChatMessage[], contextData: InsightData): Promise<string> => {
  const ai = getAIClient();
  const contents = history.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] }));
  const response = await ai.models.generateContent({
    model: modelName,
    contents: contents,
    config: { 
      systemInstruction: `${SYSTEM_INSTRUCTION}\nAlways be simple and helpful. Context from their face: ${contextData.neuralEvidence}.`
    }
  });
  return response.text || "I'm here to help.";
};

export const generateWeeklyReport = async (entries: JournalEntry[]): Promise<WeeklyInsight> => {
  const ai = getAIClient();
  const historyText = entries.map(e => `Day ${e.dayNumber}: Stress ${e.insight.vitals.stress}`).join('\n');
  const response = await ai.models.generateContent({
    model: modelName,
    contents: { role: 'user', parts: [{ text: historyText }] },
    config: { 
        systemInstruction: "Summarize the user's week in simple English.", 
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
  return response.text ? JSON.parse(response.text) : null;
};