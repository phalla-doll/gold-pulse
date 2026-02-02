import { PriceDataPoint } from '../types';

// REPLACE THIS WITH YOUR REAL API KEY FROM TWELVE DATA
const TWELVE_DATA_API_KEY = '6fbdc412ae924882bf727ae84fa452b6'; 

export const fetchDailyGoldPrices = async (): Promise<{ data: PriceDataPoint[], currentPrice: number, change: number, history: number[], volatility: number } | null> => {
  if (!TWELVE_DATA_API_KEY) {
    console.warn("Twelve Data API Key not set. Using fallback mock data.");
    return null; // Triggers fallback in UI
  }

  try {
    // Fetch Daily data (30 days)
    const response = await fetch(
      `https://api.twelvedata.com/time_series?symbol=XAU/USD&interval=1day&outputsize=30&apikey=${TWELVE_DATA_API_KEY}`
    );

    const result = await response.json();

    if (result.status === 'error' || !result.values) {
      console.error("Twelve Data API Error:", result.message);
      return null;
    }

    // Twelve Data returns newest first, so we reverse for the chart
    const reversedData = result.values.reverse();

    const formattedData: PriceDataPoint[] = reversedData.map((item: any) => ({
      time: item.datetime, // YYYY-MM-DD
      price: parseFloat(item.close),
      volume: item.volume ? parseInt(item.volume) : undefined
    }));

    const currentPrice = formattedData[formattedData.length - 1].price;
    const previousPrice = formattedData[formattedData.length - 2].price;
    
    // Calculate 24h Change (vs previous close)
    const change = ((currentPrice - previousPrice) / previousPrice) * 100;

    // Sparkline history (just the numbers)
    const history = formattedData.map(d => d.price);

    // Calculate Volatility (Standard Deviation of daily returns)
    const returns = [];
    for (let i = 1; i < formattedData.length; i++) {
        const r = (formattedData[i].price - formattedData[i-1].price) / formattedData[i-1].price;
        returns.push(r);
    }
    const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - meanReturn, 2), 0) / returns.length;
    const dailyVolatility = Math.sqrt(variance) * 100; // as percentage

    return {
      data: formattedData,
      currentPrice,
      change,
      history,
      volatility: dailyVolatility
    };

  } catch (error) {
    console.error("Failed to fetch market data:", error);
    return null;
  }
};

// Fallback generator if API fails or no key
export const generateMockHistory = (): PriceDataPoint[] => {
  const data: PriceDataPoint[] = [];
  const today = new Date();
  let price = 2330.50;

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    // Random daily movement
    const move = (Math.random() - 0.45) * 35; 
    price += move;

    // Generate mock volume correlated with price movement size
    const volume = Math.floor(20000 + Math.random() * 30000 + (Math.abs(move) * 1000));

    data.push({
      time: date.toISOString().split('T')[0], // YYYY-MM-DD
      price: parseFloat(price.toFixed(2)),
      volume: volume
    });
  }
  return data;
};