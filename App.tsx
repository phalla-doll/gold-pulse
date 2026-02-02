import React, { useState, useEffect } from 'react';
import { Key } from 'lucide-react'; // Import Key icon
import StatsOverview from './components/StatsOverview';
import PriceChart from './components/PriceChart';
import VolumeChart from './components/VolumeChart';
import TransactionTable from './components/TransactionTable';
import NewsList from './components/NewsList';
import ApiKeyModal from './components/ApiKeyModal'; // Import Modal
import { StatMetric, PriceDataPoint, NewsItem } from './types';
import { getMarketInsight, getLiveGoldNews, isAIConfigured, saveConfig } from './services/geminiService'; // Import auth helpers
import { fetchDailyGoldPrices, generateMockHistory } from './services/marketDataService';
import { trackEvent } from './services/analytics';

// Constants for calculations
const EST_GLOBAL_SUPPLY_OZ = 6830000000; 

// Initial Mock Data Structure
const initialStats: StatMetric[] = [
  { label: 'Gold Price (USD)', value: '$2,342.10', change: 2.5, data: [2200, 2250, 2230, 2300, 2320, 2290, 2342] },
  { label: 'Market Cap (T)', value: '16.0 T', change: 2.5, data: [15.5, 15.6, 15.8, 15.9, 16.0, 15.9, 16.0] },
  { label: 'Open Interest', value: '452K', change: -2.6, data: [400, 420, 410, 430, 450, 440, 452] },
  { label: 'Daily Volatility', value: '1.2%', change: 6.2, data: [0.8, 0.9, 1.1, 1.0, 1.3, 1.1, 1.2] },
];

const App: React.FC = () => {
  const [insight, setInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingNews, setLoadingNews] = useState(false);
  const [selectedRange, setSelectedRange] = useState('1M');
  
  // API Key State
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);

  // State for dynamic data
  const [statsData, setStatsData] = useState<StatMetric[]>(initialStats);
  const [chartData, setChartData] = useState<PriceDataPoint[]>([]);
  const [currentGoldPrice, setCurrentGoldPrice] = useState<number>(2342.10);
  const [currentHistory, setCurrentHistory] = useState<number[]>([]);
  const [currentChange, setCurrentChange] = useState<number>(0);
  const [currentPriceStr, setCurrentPriceStr] = useState<string>('');
  
  // State for News
  const [news, setNews] = useState<NewsItem[]>([]);

  // Check API Key on mount
  useEffect(() => {
    setApiKeyConfigured(isAIConfigured());
  }, []);

  // 1. Fetch Market Data
  const fetchData = async (range: string) => {
    setLoadingStats(true);
    
    // Attempt to fetch real data
    const apiResult = await fetchDailyGoldPrices(range);
    
    let priceData: PriceDataPoint[] = [];
    let currentPriceNum = 2342.10;
    let priceStr = "$2,342.10";
    let change = 2.5;
    let priceHistory: number[] = [];
    let volatility = 1.2;

    if (apiResult) {
       // Use Real Data
       priceData = apiResult.data;
       currentPriceNum = apiResult.currentPrice;
       priceStr = `$${currentPriceNum.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
       change = apiResult.change;
       priceHistory = apiResult.history;
       volatility = apiResult.volatility || 1.2;
    } else {
       // Fallback: Generate consistent mock history based on range
       priceData = generateMockHistory(range);
       const latest = priceData[priceData.length-1].price;
       const first = priceData[0].price;
       const mockChange = ((latest - first) / first) * 100;
       
       currentPriceNum = latest;
       priceHistory = priceData.map(d => d.price);
       priceStr = `$${latest.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
       change = mockChange;
       // Mock volatility
       volatility = 0.85;
    }

    setCurrentGoldPrice(currentPriceNum);
    setCurrentHistory(priceHistory);
    setCurrentChange(change);
    setCurrentPriceStr(priceStr);

    // Calculate Dynamic Market Cap based on Price
    const marketCapValue = (currentPriceNum * EST_GLOBAL_SUPPLY_OZ);
    const marketCapTrillions = (marketCapValue / 1000000000000).toFixed(1) + " T";
    const marketCapHistory = priceHistory.map(p => (p * EST_GLOBAL_SUPPLY_OZ) / 1000000000000);

    // Volatility Data 
    const volatilityHistory = new Array(7).fill(0).map(() => Math.abs(volatility + (Math.random() - 0.5) * 0.2));

    // Update Stats
    setStatsData(prev => {
         const newStats = [...prev];
         newStats[0] = { ...newStats[0], value: priceStr, change: parseFloat(change.toFixed(2)), data: priceHistory };
         newStats[1] = { ...newStats[1], value: marketCapTrillions, change: parseFloat(change.toFixed(2)), data: marketCapHistory };
         newStats[3] = { ...newStats[3], value: `${volatility.toFixed(2)}%`, change: parseFloat(((volatility - 1.0) * 10).toFixed(1)), data: volatilityHistory };
         return newStats;
    });

    setChartData(priceData);
    setLoadingStats(false);
  };

  // Function to simulate getting AI insight
  const fetchInsight = async (price: string, change: number, history: number[]) => {
    if (!isAIConfigured()) return;

    setLoadingInsight(true);
    
    const summary = `Gold closing at ${price}, ${change > 0 ? 'up' : 'down'} ${Math.abs(change).toFixed(2)}% over the selected period.`;
    const recentEvents = ["Fed Interest Rate Decision upcoming", "Global central bank accumulation"];

    const result = await getMarketInsight(price, change, summary, history, recentEvents);
    setInsight(result);
    setLoadingInsight(false);
  };

  const fetchNews = async () => {
      if (!isAIConfigured()) return;
      setLoadingNews(true);
      const liveNews = await getLiveGoldNews();
      setNews(liveNews);
      setLoadingNews(false);
  };

  // Fetch Data when Range Changes
  useEffect(() => {
    fetchData(selectedRange);
  }, [selectedRange]);

  // Fetch AI content once data is loaded AND key is present
  useEffect(() => {
      if (currentHistory.length > 0 && apiKeyConfigured) {
          fetchInsight(currentPriceStr, currentChange, currentHistory);
          fetchNews();
      }
  }, [currentHistory, apiKeyConfigured]);

  const handleSaveConfig = (key: string, provider: 'gemini' | 'openrouter', model?: string) => {
      saveConfig(key, provider, model);
      setApiKeyConfigured(true);
      setIsApiKeyModalOpen(false);
      trackEvent('api_key_configured', { provider });
      
      // Trigger refresh of AI components immediately
      if (currentHistory.length > 0) {
        setLoadingInsight(true);
        // Small delay to ensure state propagates
        setTimeout(() => {
            fetchInsight(currentPriceStr, currentChange, currentHistory);
            fetchNews();
        }, 100);
      }
  };

  return (
    <div className="bg-black min-h-screen text-zinc-100 font-sans p-4 md:p-8 overflow-x-hidden">
      <ApiKeyModal 
        isOpen={isApiKeyModalOpen} 
        onClose={() => setIsApiKeyModalOpen(false)} 
        onSave={handleSaveConfig} 
      />

      {/* Main Container */}
      <div className="w-full max-w-[1600px] mx-auto flex flex-col gap-4 md:gap-6">
        
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-2">
          {/* Title Section */}
          <div>
             <h1 className="text-3xl font-medium tracking-tight text-white mb-2">Gold Monitoring Dashboard</h1>
             <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-500"></span>
                </span>
                <p className="text-zinc-400 text-xs font-medium tracking-wide uppercase">Global Spot & Futures • Live Data Integration</p>
             </div>
          </div>

          {/* Controls Section */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
             
             {/* Range Selector */}
             <div className="w-full sm:w-auto bg-[#09090b] p-1.5 rounded-xl border border-zinc-800 flex relative z-0">
                {['1D', '7D', '1M', '6M', '1Y'].map((range) => (
                    <button
                        key={range}
                        onClick={() => {
                          setSelectedRange(range);
                          trackEvent('select_time_range', { range });
                        }}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 relative z-10 ${
                            selectedRange === range 
                            ? 'bg-[#27272a] text-white shadow-sm ring-1 ring-white/10' 
                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                        }`}
                    >
                        {range}
                    </button>
                ))}
             </div>

             {/* Divider (Desktop) */}
             <div className="hidden sm:block w-px h-8 bg-zinc-800"></div>

             {/* API Key Button */}
             <button
                onClick={() => {
                  setIsApiKeyModalOpen(true);
                  trackEvent('click_connect_api_key', { location: 'header' });
                }}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border transition-all text-xs font-semibold tracking-wide whitespace-nowrap shadow-sm ${
                    apiKeyConfigured 
                    ? 'bg-lime-400/10 text-lime-400 border-lime-400/20 hover:bg-lime-400/20 hover:border-lime-400/30' 
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                }`}
             >
                <Key className={`w-3.5 h-3.5 ${apiKeyConfigured ? 'text-lime-400' : 'text-zinc-500'}`} />
                {apiKeyConfigured ? 'AI Enabled' : 'Connect AI'}
             </button>
          </div>
        </header>

        {/* Top Stats Overview Card */}
        <StatsOverview metrics={statsData} loading={loadingStats} />

        {/* Middle Row: Price Chart & Volume */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:h-[400px]">
            <div className="lg:col-span-2 h-[300px] lg:h-full">
                <PriceChart range={selectedRange} data={chartData} />
            </div>
            <div className="h-[300px] lg:h-full">
                <VolumeChart range={selectedRange} data={chartData} />
            </div>
        </div>

        {/* Bottom Row: Transactions & News */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:h-[450px]">
            <div className="lg:col-span-2 h-full min-h-[400px]">
                <TransactionTable currentGoldPrice={currentGoldPrice} loading={loadingStats} />
            </div>
            <div className="h-full min-h-[400px]">
                <NewsList 
                    insight={insight} 
                    loading={loadingInsight} 
                    loadingNews={loadingNews}
                    news={news} 
                    apiKeyConfigured={apiKeyConfigured}
                    onConnect={() => setIsApiKeyModalOpen(true)}
                />
            </div>
        </div>

      </div>
    </div>
  );
};

export default App;