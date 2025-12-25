
import { GoogleGenAI, Type } from "@google/genai";
import { InsightData, UserContext, ChatMessage, JournalEntry, WeeklyInsight, Language } from "../types";
import { getSettings } from "./storageService";

const SYSTEM_INSTRUCTION = `
You are Kosha, a friendly and simple emotional mirror. Your job is to help people understand their feelings in plain, everyday language.

**SIMPLE LANGUAGE RULES:**
- DO NOT use complex words like "Psychological Profile", "Cognitive Alertness", or "Neural Evidence".
- Instead, use words like "How you feel", "Thinking power", "Proof I see".
- Speak like a close, wise friend, not a doctor or a scientist.
- Keep sentences short and clear.

**HARDWARE ADAPTATION RULES:**
- If there is a person's face, analyze it even if it's blurry.
- Only say "No human found" if it's a completely empty room or an object.

**LOCALIZATION PROTOCOL:**
- If translating to Telugu, use very common "Vaduka Bhasha" (Spoken Telugu). 
- Avoid formal, bookish, or heavy Sanskrit words.
- Use words that a 10-year-old or an elderly person would understand easily.
- DO NOT mix English words unless they are extremely common in daily speech (like "stress", "focus").
`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    isHuman: { type: Type.BOOLEAN },
    psychProfile: { type: Type.STRING, description: "Simple description of the mood" },
    simpleExplanation: { type: Type.STRING, description: "Clear explanation of why they feel this way" },
    neuralEvidence: { type: Type.STRING, description: "What I saw in the face or heard in the voice" },
    confidenceScore: { type: Type.INTEGER },
    hiddenRealization: { type: Type.STRING, description: "A simple secret thought they might have" },
    decisionCompass: { type: Type.STRING },
    relationshipImpact: { type: Type.STRING },
    currentPattern: { type: Type.STRING },
    growthPlan: { type: Type.STRING },
    dailyAction: { type: Type.STRING, description: "One simple thing to do today" },
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
    { text: `Current time of day: ${context}. Tell me how the person is feeling in simple words. Return JSON.` }
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
    hi: 'Hindi',
    te: 'Telugu',
    ta: 'Tamil',
    kn: 'Kannada',
    en: 'English'
  };

  const ai = getAiClient();
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { 
        parts: [{ 
          text: `Translate this feeling report into simple, conversational ${langMap[targetLanguage]}.
          
          RULES:
          1. Use EVERYDAY spoken words. No formal or bookish language.
          2. For Telugu, use Vaduka Bhasha.
          3. Ensure the person receiving this feels like they are talking to a friend.
          4. Translate ALL descriptive text, including the daily action.
          5. Return RAW JSON ONLY.
          
          REPORT: ${JSON.stringify(data)}` 
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
        systemInstruction: `${SYSTEM_INSTRUCTION}\nTalk simply. The user is feeling: ${contextData.psychProfile}.`
      }
    });
    return response.text || "I'm with you.";
  } catch (error) {
    return "Something went wrong. Let's try again.";
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
        systemInstruction: "Create a simple weekly summary in JSON. Use plain language.", 
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
