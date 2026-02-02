import { GoogleGenAI } from "@google/genai";
import { NewsItem } from "../types";

type AIProvider = 'gemini' | 'openrouter';

let ai: GoogleGenAI | null = null;
let openRouterKey: string = '';
let openRouterModel: string = 'google/gemini-2.0-flash-lite-preview-02-05:free'; // Default free model
let activeProvider: AIProvider = 'gemini';

const STORAGE_KEY_GEMINI = 'gemini_api_key';
const STORAGE_KEY_OPENROUTER = 'openrouter_api_key';
const STORAGE_KEY_PROVIDER = 'ai_provider';
const STORAGE_KEY_MODEL = 'openrouter_model';

// Initialize AI Clients based on stored config
const initializeAI = (): boolean => {
    const storedProvider = localStorage.getItem(STORAGE_KEY_PROVIDER) as AIProvider | null;
    activeProvider = storedProvider === 'openrouter' ? 'openrouter' : 'gemini';

    if (activeProvider === 'gemini') {
        const apiKey = process.env.API_KEY || localStorage.getItem(STORAGE_KEY_GEMINI) || '';
        if (apiKey) {
            try {
                ai = new GoogleGenAI({ apiKey });
                return true;
            } catch (e) {
                console.error("Failed to initialize Gemini client", e);
                return false;
            }
        }
    } else {
        const apiKey = localStorage.getItem(STORAGE_KEY_OPENROUTER) || '';
        const model = localStorage.getItem(STORAGE_KEY_MODEL);
        if (apiKey) {
            openRouterKey = apiKey;
            if (model) openRouterModel = model;
            return true;
        }
    }
    return false;
};

// Attempt initialization on module load
initializeAI();

export const isAIConfigured = (): boolean => {
    if (activeProvider === 'gemini') return !!ai;
    return !!openRouterKey;
};

export const saveConfig = (key: string, provider: 'gemini' | 'openrouter', model?: string) => {
    localStorage.setItem(STORAGE_KEY_PROVIDER, provider);
    
    if (provider === 'gemini') {
        localStorage.setItem(STORAGE_KEY_GEMINI, key);
    } else {
        localStorage.setItem(STORAGE_KEY_OPENROUTER, key);
        if (model) localStorage.setItem(STORAGE_KEY_MODEL, model);
    }
    
    initializeAI();
};

export const removeApiKey = () => {
    localStorage.removeItem(STORAGE_KEY_GEMINI);
    localStorage.removeItem(STORAGE_KEY_OPENROUTER);
    localStorage.removeItem(STORAGE_KEY_PROVIDER);
    localStorage.removeItem(STORAGE_KEY_MODEL);
    ai = null;
    openRouterKey = '';
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
  if (!isAIConfigured()) {
    return "AI Insights require configuration. Click the key icon in the header.";
  }

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

  try {
    if (activeProvider === 'gemini' && ai) {
        const response = await retryWithBackoff(async () => {
             return await ai!.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
                config: {
                    thinkingConfig: { thinkingBudget: 0 },
                    maxOutputTokens: 120,
                }
            });
        });
        return response.text || "No insight generated.";
    } else if (activeProvider === 'openrouter' && openRouterKey) {
        // Some free models on OpenRouter (like DeepSeek or Z.AI) are reasoning models.
        // They need more tokens to "think" before outputting content, otherwise they truncate.
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${openRouterKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": window.location.origin,
            },
            body: JSON.stringify({
                model: openRouterModel,
                messages: [{ role: "user", content: prompt }],
                // Increased limit to accommodate chain-of-thought/reasoning tokens
                max_tokens: 512 
            })
        });
        
        const data = await response.json();
        if (data.error) throw new Error(data.error.message || 'OpenRouter Error');

        const choice = data.choices?.[0];
        const msg = choice?.message;

        if (!msg) return "No insight generated.";

        // Priority 1: Standard content
        if (msg.content && msg.content.trim()) {
            return msg.content;
        }

        // Priority 2: Explicit reasoning field (e.g. DeepSeek R1, Z.AI)
        if (msg.reasoning && msg.reasoning.trim()) {
            return msg.reasoning;
        }

        // Priority 3: Nested reasoning details (e.g. some experimental models)
        if (Array.isArray(msg.reasoning_details)) {
             const textDetail = msg.reasoning_details.find((d: any) => d.text && d.type === 'reasoning.text');
             if (textDetail && textDetail.text) return textDetail.text;
        }
        
        return "No insight generated.";
    }
  } catch (error: any) {
    console.error("AI Insight Error:", error);
    if (error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
        return "Quota Exceeded. API usage limit reached.";
    }
    return "Unable to generate market insight.";
  }
  return "AI not configured correctly.";
};

export const getLiveGoldNews = async (): Promise<NewsItem[]> => {
    if (!isAIConfigured()) return [];

    try {
        if (activeProvider === 'gemini' && ai) {
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

        } else if (activeProvider === 'openrouter' && openRouterKey) {
            // OpenRouter fallback (no grounding/search tool standard guarantee)
            // We ask the model to provide URLs if it knows them (e.g. Perplexity)
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${openRouterKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": window.location.origin,
                },
                body: JSON.stringify({
                    model: openRouterModel,
                    messages: [{ 
                        role: "user", 
                        content: `List 5 recent news headlines relevant to Gold (XAUUSD) or the US Economy.
                        Return a strict JSON array of objects with keys: "title", "time", "source", and "url" (if known).
                        Do not include markdown formatting.` 
                    }]
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message || 'OpenRouter Error');
            
            let content = data.choices?.[0]?.message?.content || '[]';
            // Clean markdown code blocks if present
            content = content.replace(/```json/g, '').replace(/```/g, '').trim();
            
            const newsData = JSON.parse(content);
            return newsData.map((item: any, index: number) => ({
                id: `or-news-${index}`,
                title: item.title,
                time: item.time || 'Recent',
                source: item.source || 'Market News',
                url: item.url,
                type: 'News'
            }));
        }

    } catch (error: any) {
        console.error("News Fetch Error:", error);
        if (error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
            return [{
                id: 'quota-error',
                title: 'Live News Unavailable: Quota Exceeded',
                source: 'System',
                time: 'Now',
                type: 'Alert',
                url: activeProvider === 'gemini' ? 'https://aistudio.google.com/app/plan_information' : 'https://openrouter.ai/activity'
            }];
        }
        return [];
    }
    return [];
};