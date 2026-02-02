import { GoogleGenAI, Type } from "@google/genai";
import { NewsItem } from "../types";

// Initialize Gemini Client
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
      You are a senior financial analyst.
      Analyze the following Gold Market data:
      
      DATA:
      - Price: ${currentPrice}
      - 24h Change: ${change}%
      - Trend: ${priceHistory.slice(-5).join(' -> ')}
      
      TASK:
      Provide a 1-sentence executive summary of the market sentiment (Bullish/Bearish/Neutral) and the key driver.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        maxOutputTokens: 80,
      }
    });

    return response.text || "No insight generated.";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Unable to generate market insight at this time.";
  }
};

export const getLiveGoldNews = async (): Promise<NewsItem[]> => {
    if (!ai) {
        console.warn("No API Key for News");
        return [];
    }

    try {
        // We use Search Grounding to get real news.
        // We ask for JSON format to easily parse into our UI.
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Find the top 5 most recent and relevant news headlines regarding Gold (XAUUSD), US Economy, or Fed Interest Rates from the last 48 hours.
            
            Return a JSON array of objects with these properties:
            - title: string (The headline)
            - time: string (e.g. "2 hours ago", "Today")
            - source: string (Publisher name)
            
            Strictly return ONLY the JSON array.`,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
            }
        });

        const rawText = response.text;
        let newsData: any[] = [];
        
        try {
            newsData = JSON.parse(rawText || '[]');
        } catch (e) {
            console.error("Failed to parse news JSON", e);
            return [];
        }

        // Extract grounding metadata to get URLs
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        
        // Map pseudo-JSON to our type, trying to link to sources if possible
        // Note: In a real complex app we would match the grounding chunk to the specific text span.
        // For this simple dashboard, we will just grab the first available relevant URL or leave it blank.
        
        return newsData.map((item, index) => {
            // Simple heuristic to assign a source URL from chunks if available
            const matchingChunk = groundingChunks.find((c: any) => 
                c.web?.title?.includes(item.source) || c.web?.title?.includes(item.title)
            );
            
            return {
                id: `news-${index}`,
                title: item.title,
                time: item.time,
                source: item.source,
                url: matchingChunk?.web?.uri || groundingChunks[index]?.web?.uri, // Fallback to index match
                type: 'News'
            };
        });

    } catch (error) {
        console.error("Gemini News Error:", error);
        return [];
    }
};