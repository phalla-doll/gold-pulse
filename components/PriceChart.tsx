import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Maximize2, Clock, ChevronDown } from 'lucide-react';
import { PriceDataPoint } from '../types';

interface PriceChartProps {
  range: string;
  data: PriceDataPoint[];
}

const CustomTooltip = ({ active, payload, label, unitLabel }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#18181b]/90 p-3 rounded-xl border border-white/10 shadow-2xl backdrop-blur-md">
        <p className="text-zinc-400 text-xs mb-1 font-medium">{label}</p>
        <p className="text-white text-sm font-bold flex items-center gap-2 tabular-nums">
          ${payload[0].value.toFixed(2)} <span className="text-xs font-normal text-zinc-500">{unitLabel}</span>
        </p>
      </div>
    );
  }
  return null;
};

type UnitType = 'oz' | 'g' | 'chi';

const PriceChart: React.FC<PriceChartProps> = ({ range, data }) => {
  const [unit, setUnit] = useState<UnitType>('oz');

  const { processedData, currentPrice, unitLabel } = useMemo(() => {
     let factor = 1;
     let label = '/oz';

     if (unit === 'g') {
         factor = 1 / 31.1035;
         label = '/g';
     } else if (unit === 'chi') {
         factor = 3.75 / 31.1035;
         label = '/chi';
     }

     // Deep copy and transform
     const processed = data.map(d => ({
         ...d,
         price: d.price * factor
     }));

     const curr = processed.length > 0 ? processed[processed.length - 1].price : 0;
     
     return { processedData: processed, currentPrice: curr, unitLabel: label };
  }, [data, unit]);

  const startPrice = processedData.length > 0 ? processedData[0].price : 0;
  // Calculate change over the visible period based on the displayed unit values (math remains same percentage wise)
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
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-lg text-zinc-500 font-normal">{unitLabel}</span>
             </span>
             <span className={`text-sm font-medium tabular-nums ${change >= 0 ? 'text-lime-400' : 'text-rose-500'}`}>
               {change >= 0 ? '+' : ''}{change.toFixed(2)}%
             </span>
           </div>
           <p className="text-zinc-500 text-xs mt-1 flex items-center gap-1">
             <Clock className="w-3 h-3" /> Updated recently
           </p>
        </div>
        
        <div className="flex items-center gap-3">
             {/* Unit Switcher */}
             <div className="relative">
                <select 
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as UnitType)}
                    className="appearance-none bg-[#27272a] hover:bg-[#323238] text-white text-xs font-medium pl-3 pr-8 py-1.5 rounded-lg border border-zinc-800 outline-none focus:ring-1 focus:ring-lime-400/50 transition-all cursor-pointer"
                >
                    <option value="oz">oz</option>
                    <option value="g">gram</option>
                    <option value="chi">chi</option>
                </select>
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                    <ChevronDown className="w-3 h-3" />
                </div>
             </div>

             <button className="p-2 hover:bg-[#27272a] rounded-lg text-zinc-500 transition-colors">
                <Maximize2 className="w-4 h-4" />
             </button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 w-full min-h-0 z-10 [&_.recharts-wrapper]:!outline-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={processedData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
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
                    if (val.includes(':')) return val; 
                    const date = new Date(val);
                    return `${date.getMonth() + 1}/${date.getDate()}`; 
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
            <Tooltip content={<CustomTooltip unitLabel={unitLabel} />} />
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