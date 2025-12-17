import { GoogleGenAI, Type } from "@google/genai";
import { InsightData, UserContext, ChatMessage } from "../types";
import { getSettings } from "./storageService";

// PROMPT ENGINEERING:
// This system instruction creates a "Wise Friend" persona.
// It prioritizes simple, emotional language over clinical/medical accuracy in the text output.

const SYSTEM_INSTRUCTION = `
You are Serene, a warm, wise, and supportive AI companion.
Your goal is to look at the user and tell them how they are feeling using **extremely simple, everyday English**.

**STRICT LANGUAGE RULES:**
1. **NO BIG WORDS.** Do not use words like "cortisol", "micro-expressions", "cognitive", "physiological", "dissociation", or "asymmetry".
2. **SPEAK LIKE A FRIEND.** Imagine you are talking to a friend who is tired. Be gentle, clear, and direct.
3. **EXPLAIN VISUALS SIMPLY.** 
   - BAD: "Contraction of the corrugator supercilii suggests tension."
   - GOOD: "Your eyebrows are pulled together, showing you are worried."
   - BAD: "The zygomaticus major is inactive."
   - GOOD: "You are not really smiling."

**YOUR ANALYSIS TASK:**
1. **psychProfile**: A short, simple headline about their mood. (e.g., "You are trying to be strong.")
2. **simpleExplanation**: Explain *exactly* what you see in plain English. (e.g., "I see tight lines around your mouth. You are holding back words you want to say.")
3. **relationshipImpact**: How this feeling affects friends/family. Keep it simple. (e.g., "You might be pushing people away without meaning to.")
4. **currentPattern**: 1-3 simple words. (e.g., "Hidden Sadness", "Quietly Stressed").
5. **growthPlan**: One simple, kind sentence of advice.
6. **dailyAction**: A very small, easy thing to do right now.

**GOAL:**
Make the user feel seen and understood immediately. Simplicity is love.
`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    psychProfile: { 
      type: Type.STRING, 
      description: "A simple, deep truth about their mood. No jargon." 
    },
    simpleExplanation: {
      type: Type.STRING, 
      description: "What you see on their face, described in very plain English." 
    },
    relationshipImpact: { 
      type: Type.STRING, 
      description: "How this mood affects others. Simple language." 
    },
    currentPattern: { 
      type: Type.STRING, 
      description: "1-3 simple words describing the mood." 
    },
    growthPlan: { 
      type: Type.STRING, 
      description: "A kind, simple sentence of advice." 
    },
    dailyAction: { 
      type: Type.STRING, 
      description: "A tiny, easy task to do now." 
    },
    emotionalScore: { 
      type: Type.INTEGER, 
      description: "Score 0-100 (0=Stressed, 100=Peaceful)." 
    }
  },
  required: ["psychProfile", "simpleExplanation", "relationshipImpact", "currentPattern", "growthPlan", "dailyAction", "emotionalScore"]
};

// Fallback Key - Used if no custom key is provided
const DEFAULT_API_KEY = 'AIzaSyB5K_AYfNec_pdlbVKzVL1U3WtDXX9hcHA';
const modelName = 'gemini-2.5-flash';

// Helper to get the correct client instance
const getAIClient = () => {
  const settings = getSettings();
  
  // Safe Environment Variable Access
  // In pure browser environments (like Vercel static), 'process' might not be defined.
  let envKey = '';
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env) {
       // @ts-ignore
       envKey = process.env.API_KEY;
    }
  } catch (e) {
    // Ignore reference errors
  }

  // Prioritize custom key, then env key (if any), then hardcoded fallback
  const apiKey = settings.customApiKey || envKey || DEFAULT_API_KEY;
  
  if (!apiKey) {
    throw new Error("No API Key found. Please add your key in Settings.");
  }
  
  return new GoogleGenAI({ apiKey });
};

export const analyzeInput = async (
  image: string,
  context: UserContext
): Promise<InsightData> => {
  
  const contextMap: Record<UserContext, string> = {
    'WAKING_UP': "Context: Just woke up.",
    'WORK': "Context: At work.",
    'FAMILY': "Context: With family.",
    'SOCIAL': "Context: With friends.",
    'BEFORE_SLEEP': "Context: Before bed."
  };

  const promptText = `
    ${contextMap[context]}
    
    TASK: Look at this face and tell me the emotional truth.
    
    1. Is the smile real or fake?
    2. Are the eyes sad or happy?
    3. Is the jaw tight (stressed) or loose (relaxed)?
    
    OUTPUT INSTRUCTIONS:
    - Use VERY SIMPLE English.
    - No complex words.
    - Speak directly to the user's heart.
    - Be kind but accurate.
  `;

  try {
    // Initialize client dynamically to pick up latest settings
    const ai = getAIClient();
    const base64Data = image.split(',')[1] || image;
    
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data
            }
          },
          { text: promptText }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.6,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as InsightData;
    } else {
      throw new Error("Serene could not connect.");
    }
  } catch (error: any) {
    console.error("Serene Connection Error:", error);
    
    // Provide a helpful error message if it's an API key issue
    if (error.message?.includes('API key') || error.toString().includes('403')) {
       return {
          psychProfile: "Key Configuration Error",
          simpleExplanation: "The API Key seems to be invalid or expired. Please check your Key in Settings.",
          relationshipImpact: "None",
          currentPattern: "Auth Error",
          growthPlan: "Update your API Key in Settings.",
          dailyAction: "Check Settings",
          emotionalScore: 0
       };
    }

    return {
      psychProfile: "I am having trouble seeing you clearly right now.",
      simpleExplanation: "My connection was interrupted. Please check your internet and try again.",
      relationshipImpact: "Unknown.",
      currentPattern: "Connection Error",
      growthPlan: "Please try again.",
      dailyAction: "Retry analysis.",
      emotionalScore: 0
    };
  }
};

export const getChatResponse = async (
  history: ChatMessage[], 
  contextData: InsightData
): Promise<string> => {
  
  const chatSystemInstruction = `
    ${SYSTEM_INSTRUCTION}
    
    **CURRENT SESSION:**
    You analyzed the user:
    - Insight: "${contextData.psychProfile}"
    - Proof: "${contextData.simpleExplanation}"
    - Pattern: "${contextData.currentPattern}"

    **CHAT RULES:**
    1. You are chatting with the user now.
    2. Keep using VERY SIMPLE English.
    3. Be kind, supportive, and short (1-3 sentences).
    4. Ask easy questions to help them feel better.
  `;

  try {
    const ai = getAIClient();
    const contents = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        systemInstruction: chatSystemInstruction,
      }
    });

    return response.text || "I am listening.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm having trouble connecting right now. Please check your API Key in Settings or try again.";
  }
};