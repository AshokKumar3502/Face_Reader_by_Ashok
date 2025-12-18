
import { GoogleGenAI, Type } from "@google/genai";
import { InsightData, UserContext, ChatMessage, JournalEntry, WeeklyInsight } from "../types";

// Fixed: UserContext was being used as a value here. Replaced with string representations of its values.
const SYSTEM_INSTRUCTION = `
You are Kosha, a high-precision Self Understanding Assistant.
Your goal is to help users understand their inner state by analyzing their outer expression.

**CORE LANGUAGE RULE: NO CLINICAL JARGON.**
- Speak like a kind, wise friend. 
- Use simple terms like "tired eyes," "stressed," or "overwhelmed."

**MISSION:**
1. **Facial Scan**: Analyze biometrics from the image.
2. **Contextualization**: Connect the face to the user's environment (WAKING_UP, WORK, EVENING, or BEFORE_SLEEP).
3. **Actionable Insights**: Provide simple behavioral protocols (Breath, Rest, Social, Focus, Journal).
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

const MODEL_NAME = 'gemini-3-flash-preview';

export const analyzeInput = async (image: string, context: UserContext): Promise<InsightData> => {
  // Always use new GoogleGenAI({ apiKey: process.env.API_KEY }) as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const base64Data = image.split(',')[1] || image;
  
  const contextMap: Record<UserContext, string> = {
    'WAKING_UP': "I just woke up.",
    'WORK': "I am at work.",
    'EVENING': "I am relaxing in the evening.",
    'BEFORE_SLEEP': "I am going to sleep."
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
          { text: `Context: ${contextMap[context]}. Analyze my face and return JSON.` }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      }
    });

    if (!response.text) throw new Error("AI returned an empty response.");
    return JSON.parse(response.text) as InsightData;
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    const msg = error.message || "Unknown API Error";
    if (msg.includes('401')) throw new Error("INVALID_KEY");
    if (msg.includes('429')) throw new Error("QUOTA_EXCEEDED");
    throw new Error(msg);
  }
};

export const getChatResponse = async (history: ChatMessage[], contextData: InsightData): Promise<string> => {
  // Always use new GoogleGenAI({ apiKey: process.env.API_KEY }) as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const contents = history.map(msg => ({ 
    role: msg.role === 'model' ? 'model' : 'user', 
    parts: [{ text: msg.text }] 
  }));

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: contents,
      config: { 
        systemInstruction: `${SYSTEM_INSTRUCTION}\nBase your response on this detected state: ${contextData.neuralEvidence}`
      }
    });
    return response.text || "I'm listening...";
  } catch (error: any) {
    return `Connection error: ${error.message || 'Please check your connection.'}`;
  }
};

export const generateWeeklyReport = async (entries: JournalEntry[]): Promise<WeeklyInsight> => {
  // Always use new GoogleGenAI({ apiKey: process.env.API_KEY }) as per guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const historyText = entries.map(e => `Day ${e.dayNumber}: Stress ${e.insight.vitals.stress}, Vibe: ${e.insight.psychProfile}`).join('\n');
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts: [{ text: historyText }] },
      config: { 
          systemInstruction: "Synthesize these daily entries into a weekly theme.", 
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
    
    if (!response.text) throw new Error("Empty response from AI");
    return JSON.parse(response.text) as WeeklyInsight;
  } catch (error) {
    throw error;
  }
};
