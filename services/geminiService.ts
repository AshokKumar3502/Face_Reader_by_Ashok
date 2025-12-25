
import { GoogleGenAI, Type } from "@google/genai";
import { InsightData, UserContext, ChatMessage, JournalEntry, WeeklyInsight, Language } from "../types";
import { getSettings } from "./storageService";

const SYSTEM_INSTRUCTION = `
You are Kosha, a sophisticated emotional mirror. You help users understand their inner state using multimodal inputs.

**HARDWARE ADAPTATION RULES:**
- User images may have low lighting or noise. If there is even a suggestion of a human presence, analyze it.
- Never trigger "isHuman: false" unless the image is clearly an empty room or a static object with no person.
- If quality is poor, provide the most empathetic guess and suggest "Better lighting" in the explanation.

**LOCALIZATION PROTOCOL:**
- When translating to Telugu, Hindi, Tamil, or Kannada, use SIMPLE, COMMON, and CONVERSATIONAL everyday language.
- For Telugu specifically, use "Vaduka Bhasha" (spoken style). Avoid "Grandhika Bhasha" (formal/bookish style).
- Use words that common people use in daily life, not overly poetic or Sanskrit-heavy words.
- Do NOT translate: hex codes, numbers, property names.
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

const getAiClient = () => {
  const settings = getSettings();
  const apiKey = settings.manualApiKey || process.env.API_KEY || '';
  return new GoogleGenAI({ apiKey });
};

export const analyzeInput = async (image: string, context: UserContext, audio?: string): Promise<InsightData> => {
  const ai = getAiClient();
  const base64Image = image.split(',')[1] || image;
  
  const parts: any[] = [
    { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
    { text: `Current state: ${context}. Analyze this neural reflection and provide the profile in JSON.` }
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

    if (!response.text) throw new Error("SIGNAL_TIMEOUT");
    return JSON.parse(response.text) as InsightData;
  } catch (error: any) {
    console.error("Neural Bridge Fail:", error);
    throw error;
  }
};

export const translateInsight = async (data: InsightData, targetLanguage: Language): Promise<InsightData> => {
  if (targetLanguage === 'en') return data;
  
  const langMap: Record<Language, string> = {
    hi: 'Hindi (हिंदी)',
    te: 'Telugu (తెలుగు)',
    ta: 'Tamil (தமிழ்)',
    kn: 'Kannada (కನ್ನಡ)',
    en: 'English'
  };

  const ai = getAiClient();
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { 
        parts: [{ 
          text: `Translate the descriptions in this JSON profile into ${langMap[targetLanguage]}.
          
          CRITICAL INSTRUCTIONS:
          1. Use SIMPLE, COMMON, and EVERYDAY spoken language.
          2. For Telugu, use "Vaduka Bhasha" (conversational style). Avoid formal or bookish words. 
          3. Imagine you are explaining this to a close friend in a casual chat.
          4. Only translate descriptive text.
          5. Leave all numeric scores and hex auraColors unchanged.
          6. Return RAW JSON ONLY.
          
          PROFILE: ${JSON.stringify(data)}` 
        }] 
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });

    return JSON.parse(response.text || '{}') as InsightData;
  } catch (error) {
    console.error("Localization engine bottleneck:", error);
    return data;
  }
};

export const getChatResponse = async (history: ChatMessage[], contextData: InsightData): Promise<string> => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: history.map(msg => ({ role: msg.role === 'model' ? 'model' : 'user', parts: [{ text: msg.text }] })),
      config: { 
        systemInstruction: `${SYSTEM_INSTRUCTION}\nUser Context: ${contextData.psychProfile}. Be a wise, gentle companion. Use simple, friendly language.`
      }
    });
    return response.text || "I'm with you.";
  } catch (error) {
    return "Neural signal lost. Reconnecting...";
  }
};

export const generateWeeklyReport = async (entries: JournalEntry[]): Promise<WeeklyInsight> => {
  const ai = getAiClient();
  const historyText = entries.map(e => `Day ${e.dayNumber}: ${e.insight.psychProfile}`).join('\n');
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts: [{ text: `Synthesize this emotional timeline into a meta-analysis:\n${historyText}` }] },
      config: { 
        systemInstruction: "Create a profound, supportive weekly summary in JSON. Use simple language.", 
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
    return JSON.parse(response.text || '{}') as WeeklyInsight;
  } catch (error) { throw error; }
};
