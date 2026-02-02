import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Maximize2, Clock } from 'lucide-react';
import { PriceDataPoint } from '../types';

interface PriceChartProps {
  range: string;
  data: PriceDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#18181b]/90 p-3 rounded-xl border border-white/10 shadow-2xl backdrop-blur-md">
        <p className="text-zinc-400 text-xs mb-1 font-medium">{label}</p>
        <p className="text-white text-sm font-bold flex items-center gap-2 tabular-nums">
          ${payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

const PriceChart: React.FC<PriceChartProps> = ({ range, data }) => {
  const currentPrice = data.length > 0 ? data[data.length - 1].price : 0;
  const startPrice = data.length > 0 ? data[0].price : 0;
  // Calculate change over the visible period (not just 24h, but the chart range)
  const change = startPrice !== 0 ? ((currentPrice - startPrice) / startPrice) * 100 : 0;

  return (
    <div className="bg-[#18181b] p-6 rounded-3xl border border-white/5 h-full flex flex-col relative overflow-hidden">
      {/* Background Gradient Effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-lime-400/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

      {/* Header */}
      <div className="flex justify-between items-start mb-6 z-10">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <h3 className="text-white font-medium text-lg">Gold Price Action</h3>
             <span className="flex items-center text-[10px] font-medium uppercase tracking-wider text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded-full border border-lime-400/20">
                <div className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse mr-1.5"></div>
                {range === '1D' ? 'Live' : 'Daily Close'}
             </span>
           </div>
           <div className="flex items-baseline gap-3">
             <span className="text-3xl font-medium text-white tracking-tight tabular-nums">
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
             </span>
             <span className={`text-sm font-medium tabular-nums ${change >= 0 ? 'text-lime-400' : 'text-rose-500'}`}>
               {change >= 0 ? '+' : ''}{change.toFixed(2)}%
             </span>
           </div>
           <p className="text-zinc-500 text-xs mt-1 flex items-center gap-1">
             <Clock className="w-3 h-3" /> Updated recently
           </p>
        </div>
        
        <div className="flex items-center gap-2">
             <button className="p-2 hover:bg-[#27272a] rounded-lg text-zinc-500 transition-colors">
                <Maximize2 className="w-4 h-4" />
             </button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 w-full min-h-0 z-10 [&_.recharts-wrapper]:!outline-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a3e635" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#a3e635" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#71717a', fontSize: 10 }} 
                dy={10}
                minTickGap={30}
                tickFormatter={(val) => {
                    // Simple logic to format date vs time based on string length or pattern
                    if (val.includes(':')) return val; // Time
                    const date = new Date(val);
                    return `${date.getMonth() + 1}/${date.getDate()}`; // MM/DD
                }}
            />
            <YAxis 
                domain={['auto', 'auto']} 
                orientation="right"
                mirror={true}
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#71717a', fontSize: 11, dx: -10 }} 
                tickFormatter={(val) => `$${val.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#a3e635" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorPrice)" 
                activeDot={{ r: 6, fill: '#a3e635', stroke: '#18181b', strokeWidth: 2 }}
                animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceChart;