
import { GoogleGenAI, Type } from "@google/genai";
import { InsightData, UserContext, ChatMessage, JournalEntry, WeeklyInsight, Language } from "../types";
import { getSettings, getJournal } from "./storageService";

const SYSTEM_INSTRUCTION = `
You are the Workplace Behavioral Architect. You are a calm, kind mentor.
Your goal: Help users behave better in the office.

**SIMPLE ENGLISH RULE:**
- Use ONLY very simple English (Grade 4 level).
- No big corporate words.
- Be clear, supportive, and non-judgmental.

**CORE TASKS:**
1. Analyze if the user is polite, aggressive, or professional.
2. Score their Greeting, Listening, and Patience (0-100).
3. Give 1 tiny tip for work.
4. Give 1 nice thought.
5. Compare today to their last 3 days of work. Tell them how they are improving in simple words.

**LOCAL LANGUAGE RULE:**
- If the user picks a local language (te, hi, ta, kn), use ONLY that language's NATIVE SCRIPT.
- Use simple home-style words.

**OUTPUT:**
- Return RAW JSON ONLY. No extra text.
`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    isHuman: { type: Type.BOOLEAN },
    psychProfile: { type: Type.STRING, description: "A very simple summary of how the person acts at work." },
    simpleExplanation: { type: Type.STRING },
    neuralEvidence: { type: Type.STRING },
    confidenceScore: { type: Type.INTEGER },
    workplaceMetrics: {
      type: Type.OBJECT,
      properties: {
        greeting: { type: Type.INTEGER },
        listening: { type: Type.INTEGER },
        professionalism: { type: Type.INTEGER },
        conflictResolution: { type: Type.INTEGER },
        patience: { type: Type.INTEGER }
      },
      required: ["greeting", "listening", "professionalism", "conflictResolution", "patience"]
    },
    behavioralInsight: {
      type: Type.OBJECT,
      properties: {
        tone: { type: Type.STRING, enum: ["Polite", "Aggressive", "Neutral", "Professional"] },
        trendVsYesterday: { type: Type.STRING },
        improvementArea: { type: Type.STRING },
        positiveReinforcement: { type: Type.STRING },
        practicalTip: { type: Type.STRING }
      },
      required: ["tone", "trendVsYesterday", "improvementArea", "positiveReinforcement", "practicalTip"]
    },
    auraColors: { type: Type.ARRAY, items: { type: Type.STRING } },
    vitals: {
      type: Type.OBJECT,
      properties: {
        stress: { type: Type.INTEGER },
        calmness: { type: Type.INTEGER },
        anxiety: { type: Type.INTEGER },
        fatigue: { type: Type.INTEGER }
      },
      required: ["stress", "calmness", "anxiety", "fatigue"]
    }
  },
  required: ["isHuman", "psychProfile", "simpleExplanation", "neuralEvidence", "confidenceScore", "workplaceMetrics", "behavioralInsight", "auraColors", "vitals"]
};

/**
 * Returns a new instance of GoogleGenAI.
 * Prioritizes manually entered key from settings, falling back to process.env.API_KEY.
 */
const getAiClient = () => {
  const settings = getSettings();
  const apiKey = settings.manualApiKey || process.env.API_KEY || '';
  return new GoogleGenAI({ apiKey });
};

export const analyzeInput = async (image: string, context: UserContext, audio?: string): Promise<InsightData> => {
  const ai = getAiClient();
  const base64Image = image.split(',')[1] || image;
  
  const history = getJournal().slice(-5);
  const historyText = history.map(h => `[Date: ${new Date(h.timestamp).toDateString()}] Note: ${h.insight.psychProfile}`).join("\n");

  const parts: any[] = [
    { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
    { text: `Workplace Context: ${context}. 
    History for 3-day trend check:
    ${historyText}
    
    Task: Look at the face and voice.
    1. Score Greeting, Listening, and Patience.
    2. How does today compare to the last 3 days? Use simple words.
    3. Give a simple tip for office behavior.
    Respond in JSON only.` }
  ];

  if (audio) {
    const base64Audio = audio.split(',')[1] || audio;
    parts.push({ inlineData: { mimeType: 'audio/webm', data: base64Audio } });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      }
    });

    if (!response.text) throw new Error("TIMEOUT");
    return JSON.parse(response.text) as InsightData;
  } catch (error: any) {
    console.error("AI Error:", error);
    throw error;
  }
};

export const translateInsight = async (data: InsightData, targetLanguage: Language): Promise<InsightData> => {
  if (targetLanguage === 'en') return data;
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { 
        parts: [{ 
          text: `Translate ALL text in this JSON to simple ${targetLanguage}. Use native script. Simple home-style words. JSON: ${JSON.stringify(data)}` 
        }] 
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });
    return JSON.parse(response.text || '{}') as InsightData;
  } catch (error) { return data; }
};

export const getChatResponse = async (history: ChatMessage[], contextData: InsightData): Promise<string> => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: history.map(msg => ({ role: msg.role === 'model' ? 'model' : 'user', parts: [{ text: msg.text }] })),
      config: { 
        systemInstruction: `You are the Workplace Mentor. Speak in very simple English. Help the user fix their behavior at work. Be kind.`
      }
    });
    return response.text || "...";
  } catch (error) { return "Sorry, I can't talk right now."; }
};

export const generateWeeklyReport = async (entries: JournalEntry[]): Promise<WeeklyInsight> => {
  const ai = getAiClient();
  const historyText = entries.map(e => 
    `[Day ${e.dayNumber}] ${e.insight.psychProfile} - Tone: ${e.insight.behavioralInsight.tone}`
  ).join("\n");

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ 
      parts: [{ 
        text: `Analyze this person's workplace behavior history and provide a summary report:
        ${historyText}
        
        Requirements:
        1. Use very simple English (Grade 4 level).
        2. Be kind and encouraging.
        3. Identify trends and key realizations.
        4. Provide a supportive mantra.` 
      }] 
    }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          weekTitle: { type: Type.STRING },
          soulReport: { type: Type.STRING },
          emotionalTrend: { type: Type.STRING },
          keyRealization: { type: Type.STRING },
          nextWeekMantra: { type: Type.STRING }
        },
        required: ["weekTitle", "soulReport", "emotionalTrend", "keyRealization", "nextWeekMantra"]
      }
    }
  });

  return JSON.parse(response.text || '{}') as WeeklyInsight;
};
