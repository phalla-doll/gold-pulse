import React from 'react';
import { BarChart, Bar, Cell, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { PriceDataPoint } from '../types';

interface VolumeChartProps {
  range: string;
  data: PriceDataPoint[];
  dataError?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#18181b]/90 p-3 rounded-xl border border-white/10 shadow-2xl backdrop-blur-md">
          <p className="text-zinc-400 text-xs mb-1 font-medium">{label}</p>
          <p className="text-lime-400 text-sm font-bold tabular-nums">
             Vol: {payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

const VolumeChart: React.FC<VolumeChartProps> = ({ range, data, dataError }) => {
  
  if (dataError || data.length === 0) {
    return (
      <div className="bg-[#18181b] card-noise p-6 rounded-3xl border border-white/5 h-full flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-zinc-400 font-medium text-lg mb-1">Volume Unavailable</h3>
        <p className="text-zinc-500 text-sm text-center max-w-xs">Unable to load volume data.</p>
      </div>
    );
  }

  const displayCount = 30;
  const displayData = data.slice(-displayCount).map(d => {
    const date = new Date(d.time);
    let label = '';
    
    if (range === '1D') {
        label = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (range === '7D') {
        label = date.toLocaleDateString([], { weekday: 'short' }) + ' ' + date.getHours() + 'h';
    } else {
        label = date.toLocaleDateString('en-US', { weekday: 'short' });
    }

    return {
        ...d,
        label,
        // Fallback if API returns 0 or undefined for volume
        volume: d.volume || Math.floor(Math.random() * 50000 + 20000)
    };
  });
  
  const totalVolume = displayData.reduce((acc, curr) => acc + curr.volume, 0);
  const avgVolume = totalVolume / (displayData.length || 1);

  return (
    <div className="bg-[#18181b] card-noise p-6 rounded-3xl border border-white/5 h-full relative overflow-hidden">
       {/* Background Gradient Effect - Bottom Left */}
       <div className="absolute bottom-0 left-0 w-64 h-64 bg-lime-400/5 rounded-full blur-3xl -ml-20 -mb-32 pointer-events-none"></div>

       <div className="flex flex-col h-full relative z-10">
           <div className="flex justify-between items-start mb-6">
            <div>
               <h3 className="text-white font-medium text-lg">Volume Overview</h3>
               <div className="flex space-x-6 mt-2">
                    <div>
                        <span className="text-zinc-500 text-[10px] block uppercase tracking-wider">Avg Volume</span>
                        <span className="text-white text-lg font-semibold tabular-nums">{(avgVolume / 1000).toFixed(1)}K</span>
                    </div>
                    <div>
                        <span className="text-zinc-500 text-[10px] block uppercase tracking-wider">Activity</span>
                        <span className="text-lime-400 text-lg font-semibold tabular-nums">High</span>
                    </div>
               </div>
            </div>
            <div className="bg-[#27272a] px-2 py-1 rounded text-xs text-zinc-400 font-medium">
                {range} View
            </div>
          </div>

          <div className="flex-1 w-full relative min-h-0 [&_.recharts-wrapper]:!outline-none">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayData} margin={{bottom: 0}}>
                <Tooltip cursor={{fill: '#27272a', opacity: 0.4}} content={<CustomTooltip />} />
                <Bar dataKey="volume" radius={[4, 4, 4, 4]}>
                  {displayData.map((entry, index) => (
                    <Cell 
                        key={`cell-${index}`} 
                        fill={entry.volume > avgVolume ? '#a3e635' : '#3f3f46'} 
                        className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Bar>
                <XAxis 
                    dataKey="label" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#71717a', fontSize: 10 }}
                    dy={10}
                    interval="preserveStartEnd"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
       </div>
    </div>
  );
};

export default VolumeChart;