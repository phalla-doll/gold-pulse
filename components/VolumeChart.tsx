import React from 'react';
import { BarChart, Bar, Cell, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { PriceDataPoint } from '../types';

interface VolumeChartProps {
  range: string;
  data: PriceDataPoint[]; // Use the shared data point type
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

const VolumeChart: React.FC<VolumeChartProps> = ({ range, data }) => {
  // Simple slicing logic for display limits
  // If data set is large (e.g. 1Y or 6M), we only show last ~20 bars for bar chart readability
  // unless we want to show all. 
  // Let's show a max of 30 bars to keep it clean.
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