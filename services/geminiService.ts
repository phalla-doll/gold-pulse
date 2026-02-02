import { GoogleGenAI } from "@google/genai";
import { NewsItem } from "../types";

let ai: GoogleGenAI | null = null;
const STORAGE_KEY = 'gemini_api_key';

// Initialize Gemini Client with fallback to Local Storage
const initializeAI = (): boolean => {
    // Priority: 1. Env Variable (if built-in), 2. Local Storage
    const apiKey = process.env.API_KEY || localStorage.getItem(STORAGE_KEY) || '';
    
    if (apiKey) {
        try {
            ai = new GoogleGenAI({ apiKey });
            return true;
        } catch (e) {
            console.error("Failed to initialize Gemini client", e);
            return false;
        }
    }
    return false;
};

// Attempt initialization on module load
initializeAI();

export const isGeminiConfigured = (): boolean => {
    return !!ai;
};

export const saveApiKey = (key: string) => {
    localStorage.setItem(STORAGE_KEY, key);
    initializeAI();
};

export const removeApiKey = () => {
    localStorage.removeItem(STORAGE_KEY);
    ai = null;
    // Re-check env var just in case
    initializeAI();
};

// Helper: Exponential Backoff
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function retryWithBackoff<T>(
    operation: () => Promise<T>, 
    retries = 3, 
    delay = 2000, 
    factor = 2
): Promise<T> {
    try {
        return await operation();
    } catch (error: any) {
        const isQuotaError = 
            error?.status === 429 || 
            error?.code === 429 ||
            error?.message?.includes('429') || 
            error?.message?.includes('RESOURCE_EXHAUSTED') ||
            error?.message?.includes('quota');

        if (isQuotaError && retries > 0) {
            console.warn(`Quota hit, retrying in ${delay}ms... (${retries} attempts left)`);
            await wait(delay);
            return retryWithBackoff(operation, retries - 1, delay * factor, factor);
        }
        throw error;
    }
}

export const getMarketInsight = async (
  currentPrice: string,
  change: number,
  marketDataSummary: string,
  priceHistory: number[] = [],
  recentEvents: string[] = []
): Promise<string> => {
  if (!ai) {
    return "AI Insights require a Gemini API Key. Click the key icon in the header to configure.";
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

    const response = await retryWithBackoff(async () => {
         // Force non-null assertion because we check !ai at start, 
         // but retry wrapper context implies it might be lost if we were stricter. 
         // For this logic, ai is stable.
         return await ai!.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 0 },
                maxOutputTokens: 80,
            }
        });
    });

    return response.text || "No insight generated.";
  } catch (error: any) {
    console.error("Gemini Insight Error:", error);
    if (error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
        return "Quota Exceeded. API usage limit reached.";
    }
    return "Unable to generate market insight.";
  }
};

export const getLiveGoldNews = async (): Promise<NewsItem[]> => {
    if (!ai) {
        return [];
    }

    try {
        const response = await retryWithBackoff(async () => {
            return await ai!.models.generateContent({
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
        });

        const rawText = response.text;
        let newsData: any[] = [];
        
        try {
            newsData = JSON.parse(rawText || '[]');
        } catch (e) {
            console.error("Failed to parse news JSON", e);
            return [];
        }

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        
        return newsData.map((item, index) => {
            const matchingChunk = groundingChunks.find((c: any) => 
                c.web?.title?.includes(item.source) || c.web?.title?.includes(item.title)
            );
            
            return {
                id: `news-${index}`,
                title: item.title,
                time: item.time,
                source: item.source,
                url: matchingChunk?.web?.uri || groundingChunks[index]?.web?.uri, 
                type: 'News'
            };
        });

    } catch (error: any) {
        console.error("Gemini News Error:", error);
        if (error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
            return [{
                id: 'quota-error',
                title: 'Live News Unavailable: Quota Exceeded',
                source: 'System',
                time: 'Now',
                type: 'Alert',
                url: 'https://aistudio.google.com/app/plan_information'
            }];
        }
        return [];
    }
};