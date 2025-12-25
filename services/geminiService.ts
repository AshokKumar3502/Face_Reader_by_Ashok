
import { GoogleGenAI, Type } from "@google/genai";
import { InsightData, UserContext, ChatMessage, JournalEntry, WeeklyInsight, Language } from "../types";

const SYSTEM_INSTRUCTION = `
You are Kosha, a high-precision Self Understanding Assistant.
Your goal is to help users understand their inner state by analyzing their outer expression (Face) and inner voice (Prosody).

**STRICT RULE: HUMAN FACE ONLY.**
- If the image does NOT contain a clear human face, you MUST set "isHuman" to false.

**AURAS:**
- Based on the emotional metrics, generate a list of 3 hex colors representing their "Aura".
- Stress/Anxiety: Warm/Sharp colors (#FF4B2B, #FF416C).
- Calm/Peace: Cool/Deep colors (#00d2ff, #3a7bd5, #00c6ff).
- Fatigue: Muted/Deep colors (#2c3e50, #4ca1af).

**MULTIMODAL ANALYSIS:**
- If audio is provided, listen for stress, fatigue, or masking in the user's voice.
- Combine facial biometric data with vocal prosody for the final insight.
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
    auraColors: { type: Type.ARRAY, items: { type: Type.STRING } },
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
    "dailyAction", "emotionalScore", "vitals", "cognitive", "stressTriggers", "behavioralProtocols", "auraColors"
  ]
};

const MODEL_NAME = 'gemini-3-flash-preview';

export const analyzeInput = async (image: string, context: UserContext, audio?: string): Promise<InsightData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const base64Image = image.split(',')[1] || image;
  
  const parts: any[] = [
    { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
    { text: `Context: ${context}. Check for a human face. Analyze metrics and vocal tone if provided. Return strictly JSON.` }
  ];

  if (audio) {
    const base64Audio = audio.split(',')[1] || audio;
    parts.push({ inlineData: { mimeType: 'audio/webm', data: base64Audio } });
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts },
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
    throw error;
  }
};

export const translateInsight = async (data: InsightData, targetLanguage: Language): Promise<InsightData> => {
  if (targetLanguage === 'en') return data;
  
  const langMap: Record<Language, string> = {
    hi: 'Hindi',
    te: 'Telugu',
    ta: 'Tamil',
    kn: 'Kannada',
    en: 'English'
  };

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts: [{ text: `Translate the following JSON insight into ${langMap[targetLanguage]}. Keep the tone friendly and wise. Translate all descriptive strings but keep numeric values and enum keys like "isHuman", "vitals", "cognitive", "type", and "impact" exactly the same. Return valid JSON only.\n\nJSON: ${JSON.stringify(data)}` }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });

    if (!response.text) throw new Error("EMPTY_TRANSLATION");
    return JSON.parse(response.text) as InsightData;
  } catch (error) {
    console.error("Translation Error:", error);
    return data; // Fallback to original
  }
};

export const getChatResponse = async (history: ChatMessage[], contextData: InsightData): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: history.map(msg => ({ role: msg.role === 'model' ? 'model' : 'user', parts: [{ text: msg.text }] })),
      config: { systemInstruction: `${SYSTEM_INSTRUCTION}\nUser state: ${contextData.neuralEvidence}.` }
    });
    return response.text || "I'm here.";
  } catch (error) {
    return "The neural link is unstable.";
  }
};

export const generateWeeklyReport = async (entries: JournalEntry[]): Promise<WeeklyInsight> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const historyText = entries.map(e => `Day ${e.dayNumber}: ${e.insight.psychProfile}`).join('\n');
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts: [{ text: `Generate meta-analysis for:\n${historyText}` }] },
      config: { 
        systemInstruction: "Synthesize weekly soul patterns into JSON.", 
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
    return JSON.parse(response.text) as WeeklyInsight;
  } catch (error) { throw error; }
};
