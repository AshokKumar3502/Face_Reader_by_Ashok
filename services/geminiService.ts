import { GoogleGenAI, Type } from "@google/genai";
import { InsightData, UserContext, ChatMessage, JournalEntry, WeeklyInsight } from "../types";
import { getSettings } from "./storageService";

const SYSTEM_INSTRUCTION = `
You are Kosha, a warm, wise, and supportive AI companion.
Your goal is to look at the user and tell them how they are feeling, functioning, and **exactly what to do about it**.

**STRICT LANGUAGE RULES:**
- NO BIG WORDS. Speak like a friend who deeply understands the soul.

**MISSION 1: SOUL & MIND**
Analyze facial vitals and cognitive energy (Stress, Focus, Burnout, etc.).

**MISSION 2: STRESS TRIGGERS**
Identify likely triggers (Social Pressure, Work Overload, Decision Anxiety, Relationship Strain).

**MISSION 3: BEHAVIORAL PROTOCOLS (THE MOST IMPORTANT PART)**
Provide 2-3 specific "Soul Prescriptions" based on their state:
- **BREATH**: If stress or anxiety > 60%. (e.g. Box breathing)
- **REST**: If fatigue or burnout > 60%. (e.g. 15-min digital fast)
- **SOCIAL**: If relationship strain or high social pressure. (e.g. Reach out to one safe person)
- **FOCUS**: If focus is low but alertness is high. (e.g. Pomodoro start)
- **JOURNAL**: If overthinking or mood stability is low. (e.g. Writing one difficult truth)

**OUTPUT FIELDS:**
- **vitals**: Emotional scores.
- **cognitive**: Focus, Burnout, Alertness, Overthinking.
- **stressTriggers**: List of objects {type, impact, description}.
- **behavioralProtocols**: List of objects {type, title, instruction, duration}.
- **hiddenRealization**: A "I didn't realize..." moment.
- **decisionCompass**: Advice on productivity/decisions.
`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    psychProfile: { type: Type.STRING },
    simpleExplanation: { type: Type.STRING },
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
  required: ["psychProfile", "simpleExplanation", "hiddenRealization", "decisionCompass", "relationshipImpact", "currentPattern", "growthPlan", "dailyAction", "emotionalScore", "vitals", "cognitive", "stressTriggers", "behavioralProtocols"]
};

const modelName = 'gemini-3-flash-preview';

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
    'WAKING_UP': "Context: Just woke up.",
    'WORK': "Context: At work.",
    'EVENING': "Context: Evening time.",
    'BEFORE_SLEEP': "Context: Going to sleep."
  };

  const promptText = `
    ${contextMap[context]}
    Analyze this face for Emotional Vitals, Cognitive Energy, likely Stress Triggers, and mandatory Behavioral Protocols.
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
      }
    });

    if (response.text) return JSON.parse(response.text) as InsightData;
    throw new Error("Empty response");
  } catch (error: any) {
    console.error("Analysis Error:", error);
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
      systemInstruction: `${SYSTEM_INSTRUCTION}\nContext: You detected these triggers: ${contextData.stressTriggers.map(t => t.type).join(', ')}. You also suggested: ${contextData.behavioralProtocols.map(p => p.title).join(', ')}.`
    }
  });
  return response.text || "I am listening.";
};

export const generateWeeklyReport = async (entries: JournalEntry[]): Promise<WeeklyInsight> => {
  const ai = getAIClient();
  const historyText = entries.map(e => `Day ${e.dayNumber}: Stress ${e.insight.vitals.stress}, Triggers: ${e.insight.stressTriggers.map(t=>t.type).join(',')}`).join('\n');
  const response = await ai.models.generateContent({
    model: modelName,
    contents: { role: 'user', parts: [{ text: historyText }] },
    config: { 
        systemInstruction: SYSTEM_INSTRUCTION, 
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