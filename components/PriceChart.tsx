import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Maximize2, MoreHorizontal, TrendingUp, Clock } from 'lucide-react';

// Generate realistic intraday gold price data (Hourly)
const generateData = () => {
  const data = [];
  let price = 2332.50; // Starting price
  for (let i = 0; i < 24; i++) {
    // Random movement with slight upward drift
    const move = (Math.random() - 0.4) * 3; 
    price += move;
    
    // Create time label like 09:00, 10:00
    const hour = i.toString().padStart(2, '0') + ":00";
    
    data.push({
      time: hour,
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 5000) + 1000
    });
  }
  return data;
};

const data = generateData();
const currentPrice = data[data.length - 1].price;
const startPrice = data[0].price;
const change = ((currentPrice - startPrice) / startPrice) * 100;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#18181b] p-3 rounded-xl border border-zinc-700 shadow-2xl backdrop-blur-md">
        <p className="text-zinc-400 text-xs mb-1 font-medium">{label}</p>
        <p className="text-white text-sm font-bold flex items-center gap-2">
          ${payload[0].value.toFixed(2)}
          <span className="text-lime-400 text-xs font-normal">
            {(Math.random() * 0.5).toFixed(2)}%
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const PriceChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState('24H');

  return (
    <div className="bg-[#18181b] p-6 rounded-3xl border border-[#27272a] h-full flex flex-col relative overflow-hidden">
      {/* Background Gradient Effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-lime-400/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

      {/* Header */}
      <div className="flex justify-between items-start mb-6 z-10">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <h3 className="text-white font-medium text-lg">Gold Price Action</h3>
             <span className="flex items-center text-xs text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded-full border border-lime-400/20">
                <div className="w-1.5 h-1.5 bg-lime-400 rounded-full animate-pulse mr-1.5"></div>
                Live
             </span>
           </div>
           <div className="flex items-baseline gap-3">
             <span className="text-3xl font-medium text-white tracking-tight">${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
             <span className={`text-sm font-medium ${change >= 0 ? 'text-lime-400' : 'text-rose-500'}`}>
               {change >= 0 ? '+' : ''}{change.toFixed(2)}%
             </span>
           </div>
           <p className="text-zinc-500 text-xs mt-1 flex items-center gap-1">
             <Clock className="w-3 h-3" /> Updated 2m ago
           </p>
        </div>
        
        <div className="flex items-center gap-2">
             <div className="flex bg-[#27272a] p-1 rounded-lg">
                {['1H', '24H', '1W', '1M'].map((t) => (
                    <button 
                        key={t}
                        onClick={() => setTimeRange(t)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${timeRange === t ? 'bg-[#18181b] text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        {t}
                    </button>
                ))}
             </div>
             <button className="p-2 hover:bg-[#27272a] rounded-lg text-zinc-500 transition-colors">
                <Maximize2 className="w-4 h-4" />
             </button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 w-full min-h-0 z-10 [&_.recharts-wrapper]:!outline-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
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
                tick={{ fill: '#71717a', fontSize: 11 }} 
                dy={10}
                minTickGap={30}
            />
            <YAxis 
                domain={['auto', 'auto']} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#71717a', fontSize: 11 }} 
                tickFormatter={(val) => `$${val}`}
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
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceChart;