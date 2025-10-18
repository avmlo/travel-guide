import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "./env";

let genAI: GoogleGenerativeAI | null = null;

function getGeminiClient() {
  if (!genAI) {
    const apiKey = ENV.geminiApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export async function generateWithGemini(prompt: string, systemInstruction?: string) {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp",
    systemInstruction: systemInstruction
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}

export async function chatWithGemini(messages: Array<{ role: string; content: string }>, systemInstruction?: string) {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp",
    systemInstruction: systemInstruction
  });

  // Convert messages to Gemini format
  const history = messages.slice(0, -1).map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  const chat = model.startChat({ history });
  const lastMessage = messages[messages.length - 1];
  const result = await chat.sendMessage(lastMessage.content);
  
  return result.response.text();
}

export async function generateStructuredWithGemini<T>(
  prompt: string,
  schema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  },
  systemInstruction?: string
): Promise<T> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp",
    systemInstruction: systemInstruction,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema as any
    }
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  
  return JSON.parse(text) as T;
}

