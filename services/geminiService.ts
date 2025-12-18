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
2. **Translate to Truth**: Turn those biometric cues into simple, honest observations about the user's current situation.
3. **The 'Why'**: Connect their face to their context (e.g., "At Work") to explain the source of their stress.
4. **Action**: Provide 100% simple behavioral protocols that help them feel better immediately.

**OUTPUT FIELDS:**
- **psychProfile**: A very simple summary of their vibe (e.g., "You're holding it all together, but just barely").
- **simpleExplanation**: What you see on their face in plain words (e.g., "I see you're biting your lip and your eyes look heavy").
- **neuralEvidence**: The specific simple observation that led to your analysis (e.g., "The way you're frowning even when trying to smile tells me you're exhausted").
- **confidenceScore**: 0-100 percentage.
- **hiddenRealization**: Something they are ignoring but you can see.
- **decisionCompass**: A simple "Yes/No/Wait" piece of advice.
- **behavioralProtocols**: Simple guides (Breath, Rest, Social, Focus, Journal).
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

const modelName = 'gemini-3-pro-preview';

const getAIClient = () => {
  const settings = getSettings();
  let envKey = '';
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env) {
       // @ts-ignore
       envKey = process.env.API_KEY;
    }
  } catch (e) {}
  const apiKey = envKey || settings.customApiKey;
  if (!apiKey) throw new Error("No API Key found. Please add your key in Settings.");
  return new GoogleGenAI({ apiKey });
};

export const analyzeInput = async (image: string, context: UserContext): Promise<InsightData> => {
  const contextMap: Record<UserContext, string> = {
    'WAKING_UP': "I just woke up.",
    'WORK': "I am currently at work.",
    'EVENING': "I am relaxing in the evening.",
    'BEFORE_SLEEP': "I am about to go to sleep."
  };

  const promptText = `
    Analyze my face as my Self Understanding Assistant.
    Context: ${contextMap[context]}
    Use simple English only. Tell me what my face says about my current situation.
  `;

  try {
    const ai = getAIClient();
    const base64Data = image.split(',')[1] || image;
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        role: 'user',
        parts: [{ inlineData: { mimeType: 'image/jpeg', data: base64Data } }, { text: promptText }]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });

    if (response.text) return JSON.parse(response.text) as InsightData;
    throw new Error("Empty response");
  } catch (error: any) {
    console.error("Self Understanding Analysis Failure:", error);
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
      systemInstruction: `${SYSTEM_INSTRUCTION}\nAlways be simple and helpful. Here is what you saw on their face: ${contextData.neuralEvidence}. Use this to guide the conversation.`
    }
  });
  return response.text || "I'm here to help you understand yourself.";
};

export const generateWeeklyReport = async (entries: JournalEntry[]): Promise<WeeklyInsight> => {
  const ai = getAIClient();
  const historyText = entries.map(e => `Day ${e.dayNumber}: Context ${e.context}, Stress ${e.insight.vitals.stress}, Vibe: ${e.insight.psychProfile}`).join('\n');
  const response = await ai.models.generateContent({
    model: modelName,
    contents: { role: 'user', parts: [{ text: historyText }] },
    config: { 
        systemInstruction: "You are the Kosha Self Understanding Assistant. Look at the user's week and give them a very simple theme for how they've been doing.", 
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
        },
        thinkingConfig: { thinkingBudget: 2000 }
    }
  });
  return response.text ? JSON.parse(response.text) : null;
};