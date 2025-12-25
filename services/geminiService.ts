
import { GoogleGenAI, Type } from "@google/genai";
import { InsightData, UserContext, ChatMessage, JournalEntry, WeeklyInsight, Language } from "../types";
import { getSettings } from "./storageService";

const SYSTEM_INSTRUCTION = `
You are Kosha, a friendly companion. Your job is to help people understand their mood in the simplest way possible.

**LANGUAGE PROTOCOL:**
- If the user selects a language (Telugu, Hindi, Tamil, Kannada), you MUST use the NATIVE SCRIPT of that language.
- DO NOT use English letters for local languages.
- Use "Vaduka Bhasha" (Spoken daily language). No formal or textbook words.
- Use words a child or a grandmother would use at home.
- Keep explanations short, warm, and helpful.

**UI INTEGRATION:**
- Your JSON output fields (psychProfile, simpleExplanation, dailyAction, etc.) must be in the target language's native script.
- Metrics (vitals/cognitive) remain numbers (0-100).

**HARDWARE RULES:**
- Analyze faces even if the light is low or the image is a bit blurry.
- Only say "No human found" if it's literally an empty room.
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
    { text: `Current time: ${context}. Describe how the user feels in very simple words. Return JSON.` }
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
    hi: 'Hindi (हिन्दी)',
    te: 'Telugu (తెలుగు)',
    ta: 'Tamil (தமிழ்)',
    kn: 'Kannada (ಕನ್ನಡ)',
    en: 'English'
  };

  const ai = getAiClient();
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { 
        parts: [{ 
          text: `Translate this JSON into simple, common, everyday spoken ${langMap[targetLanguage]}.
          
          STRICT RULES:
          1. Use NATIVE SCRIPT ONLY.
          2. Use "Vaduka Bhasha" (Spoken Style). Avoid formal words.
          3. Imagine you are talking to a family member.
          4. Translate ALL text fields.
          5. Keep numeric values and hex colors as they are.
          6. Return RAW JSON ONLY.
          
          DATA: ${JSON.stringify(data)}` 
        }] 
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });

    return JSON.parse(response.text || '{}') as InsightData;
  } catch (error) {
    console.error("Translation fail:", error);
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
        systemInstruction: `${SYSTEM_INSTRUCTION}\nAlways reply in the user's preferred language using simple home-style words.`
      }
    });
    return response.text || "...";
  } catch (error) {
    return "Error.";
  }
};

export const generateWeeklyReport = async (entries: JournalEntry[]): Promise<WeeklyInsight> => {
  const ai = getAiClient();
  const historyText = entries.map(e => `Day ${e.dayNumber}: ${e.insight.psychProfile}`).join('\n');
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts: [{ text: `Summarize this week simply:\n${historyText}` }] },
      config: { 
        systemInstruction: "Create a simple weekly summary in JSON. Use plain language and native script if possible.", 
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
