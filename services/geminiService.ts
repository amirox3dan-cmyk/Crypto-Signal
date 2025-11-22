
import { GoogleGenAI, Type } from "@google/genai";
import { CoinData, AIAnalysisResponse } from '../types';

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeMarketData = async (coins: CoinData[]): Promise<AIAnalysisResponse | null> => {
  try {
    const marketSnapshot = coins.map(c => `${c.name} (${c.symbol}): $${c.price.toFixed(2)} (${c.change24h > 0 ? '+' : ''}${c.change24h.toFixed(2)}%)`).join('\n');

    const prompt = `
      Analyze the following cryptocurrency market data and generate trading signals.
      Act as a professional technical analyst.
      
      Market Data:
      ${marketSnapshot}
      
      For each coin, determine if it's a BUY, SELL, or HOLD.
      Provide 2 entry levels, 3 target prices, and 1 stop loss.
      Provide a short reasoning in Persian (Farsi).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are an expert crypto trading analyst speaking Persian.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            signals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  symbol: { type: Type.STRING },
                  action: { type: Type.STRING, enum: ["BUY", "SELL", "HOLD"] },
                  entry: { 
                    type: Type.ARRAY, 
                    items: { type: Type.NUMBER }
                  },
                  target: { 
                    type: Type.ARRAY, 
                    items: { type: Type.NUMBER } 
                  },
                  stopLoss: { type: Type.NUMBER },
                  reason: { type: Type.STRING },
                  confidenceScore: { type: Type.NUMBER }
                },
                required: ["symbol", "action", "entry", "target", "stopLoss", "reason", "confidenceScore"]
              }
            }
          }
        }
      }
    });

    const responseText = response.text;
    if (!responseText) return null;

    return JSON.parse(responseText) as AIAnalysisResponse;

  } catch (error) {
    console.error("Error analyzing market with Gemini:", error);
    return null;
  }
};
