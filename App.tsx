import React, { useState, useEffect } from 'react';
import { LayoutGrid, Bell, Sparkles } from 'lucide-react';
import StatsOverview from './components/StatsOverview';
import PriceChart from './components/PriceChart';
import VolumeChart from './components/VolumeChart';
import TransactionTable from './components/TransactionTable';
import NewsList from './components/NewsList';
import { StatMetric } from './types';
import { getMarketInsight } from './services/geminiService';

// Mock Data for Top Stats
const statsData: StatMetric[] = [
  { label: 'Gold Price (USD)', value: '$2,342.10', change: 2.5, data: [2200, 2250, 2230, 2300, 2320, 2290, 2342] },
  { label: 'Market Cap (T)', value: '14.2 T', change: -4.1, data: [14.5, 14.4, 14.3, 14.1, 14.0, 14.1, 14.2] },
  { label: 'Open Interest', value: '452K', change: -2.6, data: [400, 420, 410, 430, 450, 440, 452] },
  { label: 'Daily Volatility', value: '1.2%', change: 6.2, data: [0.8, 0.9, 1.1, 1.0, 1.3, 1.1, 1.2] },
];

const App: React.FC = () => {
  const [insight, setInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [selectedRange, setSelectedRange] = useState('1M');

  // Function to simulate getting AI insight
  const fetchInsight = async () => {
    setLoadingInsight(true);
    
    // Prepare context data
    const summary = "Gold hovering at $2342, slight dip in Market Cap, High Open Interest.";
    const priceHistory = statsData[0].data;
    const recentEvents = [
        "Fed Interest Rate Decision today",
        "Goldman Sachs Commodity Outlook released",
        "Geopolitical tensions rising in key regions"
    ];

    const result = await getMarketInsight(
        "$2,342.10", 
        2.5, 
        summary, 
        priceHistory, 
        recentEvents
    );
    
    setInsight(result);
    setLoadingInsight(false);
  };

  useEffect(() => {
    // Initial fetch
    fetchInsight();
  }, []);

  return (
    <div className="bg-black min-h-screen text-zinc-100 font-sans p-4 md:p-8 flex justify-center">
      {/* Main Container - max-width constrained for dashboard look */}
      <div className="w-full max-w-[1600px] flex flex-col gap-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-lime-400 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(163,230,53,0.3)]">
                <LayoutGrid className="text-black w-6 h-6" />
             </div>
             <div>
                <h1 className="text-xl font-medium tracking-tight">Gold Market Overview</h1>
                <p className="text-zinc-500 text-xs">Global Spot & Futures</p>
             </div>
          </div>

          <div className="flex bg-[#09090b] p-1 rounded-xl border border-zinc-800">
           {['1D', '7D', '1M', '6M', '1Y'].map((range) => (
              <button
                  key={range}
                  onClick={() => setSelectedRange(range)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedRange === range ? 'bg-[#27272a] text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                  {range}
              </button>
           ))}
          </div>
        </header>

        {/* Top Stats Overview Card */}
        <StatsOverview metrics={statsData} />

        {/* Middle Row: Price Chart & Volume */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
            <div className="lg:col-span-2 h-full">
                <PriceChart />
            </div>
            <div className="h-full">
                <VolumeChart />
            </div>
        </div>

        {/* Bottom Row: Transactions & News */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
            <div className="lg:col-span-2 h-full">
                <TransactionTable />
            </div>
            <div className="h-full">
                <NewsList />
            </div>
        </div>

      </div>
    </div>
  );
};

export default App;