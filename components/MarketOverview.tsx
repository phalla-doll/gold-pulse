import React, { useState, useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { ArrowUp, ArrowDown, HelpCircle, DollarSign, Activity, Users, BarChart2 } from 'lucide-react';
import { StatMetric } from '../types';
import { trackEvent } from '../services/analytics';

interface MarketOverviewProps {
  metrics: StatMetric[];
  loading?: boolean;
}

const icons = [
  <DollarSign className="w-5 h-5 text-lime-400" />,
  <Activity className="w-5 h-5 text-blue-400" />,
  <Users className="w-5 h-5 text-purple-400" />,
  <BarChart2 className="w-5 h-5 text-orange-400" />
];

const tooltips = [
  "Current global spot price for Gold in US Dollars.",
  "Total estimated value of all above-ground gold reserves globally.",
  "Total number of outstanding derivative contracts not yet settled.",
  "Standard deviation of daily returns over the last 30 days."
];

// Helper for consistent shimmer skeletons
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`relative overflow-hidden bg-zinc-800/50 ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
  </div>
);

type UnitType = 'oz' | 'g' | 'chi';

const MarketOverview: React.FC<MarketOverviewProps> = ({ metrics, loading = false }) => {
  const [unit, setUnit] = useState<UnitType>('chi');

  // Conversion logic derived from metrics to avoid mutating props
  const displayMetrics = useMemo(() => {
    if (loading || metrics.length === 0) return metrics;

    const baseMetric = metrics[0];
    if (!baseMetric) return metrics;

    const rawPrice = parseFloat(baseMetric.value.replace(/[^0-9.]/g, ''));
    
    let convertedPrice = rawPrice;
    let unitLabel = '/ oz';
    let convertedData = [...baseMetric.data];

    if (unit === 'g') {
        const factor = 1 / 31.1035;
        convertedPrice = rawPrice * factor;
        convertedData = baseMetric.data.map(v => v * factor);
        unitLabel = '/ g';
    } else if (unit === 'chi') {
        const factor = 3.75 / 31.1035;
        convertedPrice = rawPrice * factor;
        convertedData = baseMetric.data.map(v => v * factor);
        unitLabel = '/ chi';
    }

    const newMetric: StatMetric = {
        ...baseMetric,
        label: `Gold Price (USD${unitLabel})`,
        value: `$${convertedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        data: convertedData
    };

    return [newMetric, ...metrics.slice(1)];
  }, [metrics, loading, unit]);

  const displayItems = loading ? new Array(4).fill(null) : displayMetrics;

  return (
    <div className="bg-[#18181b] card-noise p-6 md:p-8 rounded-3xl border border-white/5 flex flex-col gap-6 relative overflow-hidden">
      
      {/* Background Gradient Effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-lime-400/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

      {/* Header with Title and Unit Switcher */}
      <div className="flex flex-row justify-between items-center pb-2 relative z-10">
        <h2 className="text-white font-medium text-lg tracking-tight">Market Overview</h2>
        
        <div className="flex items-center gap-3">
             <div className="relative">
                <select 
                    value={unit}
                    onChange={(e) => {
                      const newUnit = e.target.value as UnitType;
                      setUnit(newUnit);
                      trackEvent('change_overview_unit', { unit: newUnit });
                    }}
                    disabled={loading}
                    className="appearance-none bg-[#27272a] hover:bg-[#323238] text-white text-xs font-medium pl-3 pr-8 py-1.5 rounded-lg border border-zinc-800 outline-none focus:ring-1 focus:ring-lime-400/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <option value="oz">Troy Ounce (oz)</option>
                    <option value="g">Gram (g)</option>
                    <option value="chi">Chi / Tael (3.75g)</option>
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
             </div>
        </div>
      </div>

      {/* Grid of Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-zinc-800/30 pt-6 relative z-10">
        {displayItems.map((metric, index) => {
           // Responsive Border & Padding Logic
           let borderClass = "border-zinc-800/50 ";
           let paddingClass = "py-6 px-0 "; // Base padding

           // --- BORDERS ---
           if (index === 0) borderClass += "border-b md:border-r lg:border-b-0 ";
           if (index === 1) borderClass += "border-b md:border-b lg:border-r lg:border-b-0 ";
           if (index === 2) borderClass += "border-b md:border-b-0 md:border-r lg:border-r ";
           if (index === 3) borderClass += ""; // No borders for last item default

           // --- PADDING ---
           // Tablet (md)
           if (index === 0) paddingClass += "md:pr-8 md:pb-8 ";
           if (index === 1) paddingClass += "md:pl-8 md:pb-8 ";
           if (index === 2) paddingClass += "md:pr-8 md:pt-8 ";
           if (index === 3) paddingClass += "md:pl-8 md:pt-8 ";
           
           // Desktop (lg) - Unified vertical padding
           if (index === 0) paddingClass += "lg:py-0 lg:pr-8 lg:pl-0 ";
           if (index === 1) paddingClass += "lg:py-0 lg:px-8 ";
           if (index === 2) paddingClass += "lg:py-0 lg:px-8 ";
           if (index === 3) paddingClass += "lg:py-0 lg:pl-8 lg:pr-0 ";


           if (loading || !metric) {
               return (
                <div key={`skeleton-${index}`} className={`relative flex flex-col justify-between ${borderClass} ${paddingClass}`}>
                    <div className="mb-6 flex justify-between items-start">
                        <Skeleton className="w-10 h-10 rounded-full border border-white/5" />
                    </div>
                    <div className="flex-1 flex flex-col">
                        <Skeleton className="h-3 w-20 rounded mb-3" />
                        <div className="flex justify-between items-end mt-auto">
                            <div>
                                <Skeleton className="h-8 w-32 rounded mb-3" />
                                <Skeleton className="h-6 w-24 rounded" />
                            </div>
                            <div className="w-24 h-12 rounded-lg bg-zinc-800/20 overflow-hidden relative">
                                <Skeleton className="w-full h-full" />
                            </div>
                        </div>
                    </div>
                </div>
               );
           }

           const isPositive = metric.change >= 0;
           const chartData = metric.data.map((val, idx) => ({ value: val, idx }));
           const color = isPositive ? "#a3e635" : "#f43f5e";

           return (
             <div key={index} className={`relative flex flex-col justify-between ${borderClass} ${paddingClass}`}>
                
                {/* Icon */}
                <div className="mb-6 flex justify-between items-start">
                   <div className="w-10 h-10 bg-[#27272a] rounded-full flex items-center justify-center text-zinc-100 border border-white/5 shadow-inner">
                      {icons[index]}
                   </div>
                   
                   <div className="relative group">
                       <HelpCircle className="w-4 h-4 text-zinc-500 cursor-pointer hover:text-zinc-300 transition-colors" />
                       <div className="absolute right-0 top-full mt-2 w-48 p-3 bg-[#09090b] border border-zinc-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none translate-y-2 group-hover:translate-y-0">
                           <div className="absolute -top-1.5 right-0.5 w-3 h-3 bg-[#09090b] border-t border-l border-zinc-800 transform rotate-45"></div>
                           <p className="text-xs text-zinc-400 font-medium leading-snug relative z-10">
                               {tooltips[index]}
                           </p>
                       </div>
                   </div>
                </div>

                <div className="flex-1 flex flex-col">
                    <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider mb-2">{metric.label}</p>
                    
                    <div className="flex justify-between items-end mt-auto">
                        <div>
                            <h3 className="text-3xl font-medium text-white tracking-tight tabular-nums">{metric.value}</h3>
                            <div className={`flex items-center mt-3 text-xs font-medium tabular-nums ${isPositive ? 'text-lime-400' : 'text-rose-500'}`}>
                                <span className={`px-2 py-1 rounded-md flex items-center ${isPositive ? 'bg-lime-400/10' : 'bg-rose-500/10'}`}>
                                    {isPositive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                                    {Math.abs(metric.change)}%
                                </span>
                                <span className="text-zinc-500 ml-2">vs last month</span>
                            </div>
                        </div>

                        <div className="w-24 h-12 pb-1 relative overflow-hidden group">
                             <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={chartData}>
                                <defs>
                                  <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor={color} stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <YAxis domain={['dataMin', 'dataMax']} hide />
                                <Area 
                                  type="monotone" 
                                  dataKey="value" 
                                  stroke={color} 
                                  strokeWidth={2}
                                  fill={`url(#gradient-${index})`}
                                  animationDuration={2000}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
             </div>
           );
        })}
      </div>
    </div>
  );
};

export default MarketOverview;