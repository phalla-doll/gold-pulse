import { PriceDataPoint, CountryGoldHolding } from '../types';

const API_ENDPOINT = '/api/gold-prices';

export const fetchDailyGoldPrices = async (range: string = '1M'): Promise<{ data: PriceDataPoint[], currentPrice: number, change: number, history: number[], volatility: number } | null> => {
  try {
    const response = await fetch(`${API_ENDPOINT}?range=${range}`);

    if (!response.ok) {
      console.error("Yahoo Finance API Error:", response.status);
      return null;
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];

    if (!result || !result.timestamp || !result.indicators?.quote?.[0]) {
      console.error("Yahoo Finance API Error: Invalid response structure");
      return null;
    }

    const { meta, timestamp, indicators } = result;
    const quote = indicators.quote[0];

    const formattedData: PriceDataPoint[] = timestamp
      .map((ts: number, i: number) => ({
        time: new Date(ts * 1000).toISOString(),
        price: quote.close[i],
        volume: quote.volume[i] || 0,
      }))
      .filter((d: PriceDataPoint) => d.price !== null);

    if (formattedData.length === 0) {
      console.error("Yahoo Finance API Error: No valid price data");
      return null;
    }

    const currentPrice = meta.regularMarketPrice || formattedData[formattedData.length - 1].price;
    const startPrice = formattedData[0].price;
    const change = ((currentPrice - startPrice) / startPrice) * 100;
    const history = formattedData.map(d => d.price);

    const returns = [];
    for (let i = 1; i < formattedData.length; i++) {
      const r = (formattedData[i].price - formattedData[i - 1].price) / formattedData[i - 1].price;
      returns.push(r);
    }

    let dailyVolatility = 0.8;
    if (returns.length > 0) {
      const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance = returns.reduce((a, b) => a + Math.pow(b - meanReturn, 2), 0) / returns.length;
      dailyVolatility = Math.sqrt(variance) * 100;
      if (range === '1D') dailyVolatility *= 4;
    }

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
export const generateMockHistory = (range: string = '1M'): PriceDataPoint[] => {
  const data: PriceDataPoint[] = [];
  const end = new Date();
  let price = 2330.50;
  
  let count = 30;
  let timeStep = 24 * 60 * 60 * 1000; // 1 day default

  switch (range) {
      case '1D': 
          count = 48; 
          timeStep = 30 * 60 * 1000; // 30 mins
          break;
      case '7D': 
          count = 84; 
          timeStep = 2 * 60 * 60 * 1000; // 2 hours
          break;
      case '1M': 
          count = 30; 
          timeStep = 24 * 60 * 60 * 1000; // 1 day
          break;
      case '6M': 
          count = 126; // Approx trading days
          timeStep = 24 * 60 * 60 * 1000; 
          break;
      case '1Y': 
          count = 52; 
          timeStep = 7 * 24 * 60 * 60 * 1000; // 1 week
          break;
  }

  for (let i = count; i >= 0; i--) {
    const date = new Date(end.getTime() - (i * timeStep));
    
    // Random Walk Logic
    // Smaller moves for intraday, larger for daily/weekly
    const volatility = (range === '1D' || range === '7D') ? 1.5 : 15;
    const move = (Math.random() - 0.48) * volatility; 
    price += move;

    // Generate mock volume
    // Intraday volume often has U-shape (high open/close), but random is fine for mock
    const volume = Math.floor(1000 + Math.random() * 5000 + (Math.abs(move) * 500));

    // Format time label
    let timeLabel = date.toISOString(); 
    // Remove milliseconds for cleaner raw data
    timeLabel = timeLabel.split('.')[0]; 

    data.push({
      time: timeLabel, 
      price: parseFloat(price.toFixed(2)),
      volume: volume
    });
  }
  return data;
};

// Static Data Source for Gold Reserves (Replaces AI Search)
// Source: World Gold Council / IMF Q4 2024 / Q1 2025 Estimates
export const getTopGoldReserves = async (): Promise<CountryGoldHolding[]> => {
    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 800));

    const reserves: CountryGoldHolding[] = [
      { rank: 1, country: 'United States', holdings: 8133.5, percentage: 84.2, change: 0, flagCode: 'us', value: '0' },
      { rank: 2, country: 'Germany', holdings: 3350.3, percentage: 84.0, change: 0, flagCode: 'de', value: '0' },
      { rank: 3, country: 'Italy', holdings: 2451.8, percentage: 79.3, change: 0, flagCode: 'it', value: '0' },
      { rank: 4, country: 'France', holdings: 2437.0, percentage: 81.8, change: 0, flagCode: 'fr', value: '0' },
      { rank: 5, country: 'Russia', holdings: 2326.5, percentage: 47.0, change: 0, flagCode: 'ru', value: '0' },
      { rank: 6, country: 'China', holdings: 2306.3, percentage: 8.6, change: 0, flagCode: 'cn', value: '0' },
      { rank: 7, country: 'Switzerland', holdings: 1039.9, percentage: 15.2, change: 0, flagCode: 'ch', value: '0' },
      { rank: 8, country: 'India', holdings: 880.1, percentage: 17.4, change: 0, flagCode: 'in', value: '0' },
      { rank: 9, country: 'Japan', holdings: 845.9, percentage: 8.6, change: 0, flagCode: 'jp', value: '0' },
      { rank: 10, country: 'Turkey', holdings: 613.1, percentage: 54.6, change: 0, flagCode: 'tr', value: '0' },
      { rank: 11, country: 'Netherlands', holdings: 612.5, percentage: 74.2, change: 0, flagCode: 'nl', value: '0' },
      { rank: 12, country: 'Poland', holdings: 550.2, percentage: 28.4, change: 0, flagCode: 'pl', value: '0' },
      { rank: 13, country: 'Taiwan', holdings: 423.9, percentage: 10.1, change: 0, flagCode: 'tw', value: '0' },
      { rank: 14, country: 'Uzbekistan', holdings: 390.3, percentage: 83.0, change: 0, flagCode: 'uz', value: '0' },
      { rank: 15, country: 'Portugal', holdings: 382.7, percentage: 79.9, change: 0, flagCode: 'pt', value: '0' },
      { rank: 16, country: 'Kazakhstan', holdings: 341.0, percentage: 72.0, change: 0, flagCode: 'kz', value: '0' },
      { rank: 17, country: 'Saudi Arabia', holdings: 323.1, percentage: 10.0, change: 0, flagCode: 'sa', value: '0' },
      { rank: 18, country: 'United Kingdom', holdings: 310.3, percentage: 20.3, change: 0, flagCode: 'gb', value: '0' },
      { rank: 19, country: 'Lebanon', holdings: 286.8, percentage: 82.4, change: 0, flagCode: 'lb', value: '0' },
      { rank: 20, country: 'Spain', holdings: 281.6, percentage: 33.8, change: 0, flagCode: 'es', value: '0' },
    ];
    
    return reserves;
};