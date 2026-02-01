import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// Note: We use process.env.API_KEY as per instructions.
// If the key is missing, the service will handle the error gracefully.
const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getMarketInsight = async (
  currentPrice: string,
  change: number,
  marketDataSummary: string,
  priceHistory: number[] = [],
  recentEvents: string[] = []
): Promise<string> => {
  if (!ai) {
    return "API Key not configured. Please check your environment variables.";
  }

  try {
    const prompt = `
      You are a senior financial analyst specializing in commodities.
      Analyze the following Gold Market data snapshot:
      
      MARKET DATA:
      - Current Price: ${currentPrice}
      - 24h Change: ${change}%
      - Recent Activity: ${marketDataSummary}
      - 7-Day Price Trend (Close): ${priceHistory.join(' -> ')}
      
      NEWS & EVENTS CONTEXT:
      ${recentEvents.length > 0 ? recentEvents.map(e => `- ${e}`).join('\n') : 'No major news events provided.'}

      TASK:
      Provide a concise, 2-sentence executive summary of the market sentiment. 
      1. Identify the correlation between the recent price trend and the provided news/events.
      2. State if the sentiment is bullish, bearish, or neutral and name the primary catalyst.
      
      Keep it professional, direct, and actionable for a dashboard widget.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }, // Fast response needed for UI
        maxOutputTokens: 100,
      }
    });

    return response.text || "No insight generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate market insight at this time.";
  }
};