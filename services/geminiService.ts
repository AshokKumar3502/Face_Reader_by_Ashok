
import { GoogleGenAI, Type } from "@google/genai";
import { InsightData, UserContext, ChatMessage, JournalEntry, WeeklyInsight, Language } from "../types";

const SYSTEM_INSTRUCTION = `
You are Kosha, a high-precision Self Understanding Assistant.
Your goal is to help users understand their inner state by analyzing their outer expression (Face) and inner voice (Prosody).

**HUMAN DETECTION GUIDELINE:**
- Attempt to identify a human face. If the image is extremely blurry, too dark, or clearly of an object/pet with no human features, set "isHuman" to false. 
- If a face is partially visible or in poor lighting but discernable, prioritize analysis.
- If "isHuman" is false, provide a kind, poetic reason in "simpleExplanation" (e.g., "I see a silhouette, but the soul's mirror remains dark. Please find better light.").

**AURAS:**
- Generate 3 hex colors representing their "Aura" based on emotional metrics.

**MULTIMODAL:**
- If audio is provided, combine vocal tone analysis (stress, hesitation) with facial biometrics.
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
    { text: `Current Context: ${context}. Step 1: Verification. Step 2: Full biometric analysis. Use the system instructions to decode the soul vibe.` }
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
    console.error("Deep Analysis Failure:", error);
    throw error;
  }
};

export const translateInsight = async (data: InsightData, targetLanguage: Language): Promise<InsightData> => {
  if (targetLanguage === 'en') return data;
  
  const langMap: Record<Language, string> = {
    hi: 'Hindi (हिंदी)',
    te: 'Telugu (తెలుగు)',
    ta: 'Tamil (தமிழ்)',
    kn: 'Kannada (ಕನ್ನಡ)',
    en: 'English'
  };

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { 
        parts: [{ 
          text: `You are a professional translator specializing in psychological and emotional nuances. 
          Translate the following JSON insight into ${langMap[targetLanguage]}. 
          RULES:
          1. Keep all numeric values, boolean keys, and auraColors EXACTLY the same.
          2. Translate only the human-readable string descriptions.
          3. Use the formal script for the target language.
          4. Maintain the kind, supportive, and poetic tone of the original text.
          5. Ensure the resulting JSON is strictly valid.
          
          DATA TO TRANSLATE: ${JSON.stringify(data)}` 
        }] 
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });

    if (!response.text) throw new Error("TRANSLATION_EMPTY");
    return JSON.parse(response.text) as InsightData;
  } catch (error) {
    console.error("Localization engine failed:", error);
    return data;
  }
};

export const getChatResponse = async (history: ChatMessage[], contextData: InsightData): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: history.map(msg => ({ role: msg.role === 'model' ? 'model' : 'user', parts: [{ text: msg.text }] })),
      config: { 
        systemInstruction: `${SYSTEM_INSTRUCTION}\nBase conversation on this biometric pattern: ${contextData.neuralEvidence}. User profile is "${contextData.psychProfile}".`
      }
    });
    return response.text || "I'm listening closely to your heart.";
  } catch (error) {
    return "The neural bridge is flickering. I'm here, but my signal is weak.";
  }
};

export const generateWeeklyReport = async (entries: JournalEntry[]): Promise<WeeklyInsight> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const historyText = entries.map(e => `Day ${e.dayNumber}: ${e.insight.psychProfile} - Stress: ${e.insight.vitals.stress}`).join('\n');
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts: [{ text: `Synthesize this emotional history into a meta-analysis:\n${historyText}` }] },
      config: { 
        systemInstruction: "You are a master of emotional synthesis. Create a JSON report summarizing the week's soul trajectory.", 
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
