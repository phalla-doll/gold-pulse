import React from 'react';
import { BarChart, Bar, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface VolumeChartProps {
  range: string;
}

const data = [
  { day: 'Mo', volume: 40 },
  { day: 'Tu', volume: 55 },
  { day: 'We', volume: 45 },
  { day: 'Th', volume: 85, active: true }, // Highlighted
  { day: 'Fr', volume: 60 },
  { day: 'Sa', volume: 30 },
  { day: 'Su', volume: 35 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-800 p-2 rounded-lg border border-white/10 shadow-xl">
          <p className="text-zinc-200 text-xs font-bold">{label}</p>
          <p className="text-lime-400 text-xs tabular-nums">Vol: {payload[0].value}K</p>
        </div>
      );
    }
    return null;
  };

const VolumeChart: React.FC<VolumeChartProps> = ({ range }) => {
  return (
    <div className="bg-[#18181b] p-6 rounded-3xl border border-white/5 h-full flex flex-col">
       <div className="flex justify-between items-start mb-6">
        <div>
           <h3 className="text-white font-medium text-lg">Volume Overview</h3>
           <div className="flex space-x-6 mt-2">
                <div>
                    <span className="text-zinc-500 text-[10px] block uppercase tracking-wider">In Flow</span>
                    <span className="text-white text-lg font-semibold tabular-nums">24M</span>
                </div>
                <div>
                    <span className="text-zinc-500 text-[10px] block uppercase tracking-wider">Out Flow</span>
                    <span className="text-white text-lg font-semibold tabular-nums">19M</span>
                </div>
           </div>
        </div>
        <div className="bg-[#27272a] px-2 py-1 rounded text-xs text-zinc-400 font-medium">
            {range}
        </div>
      </div>

      <div className="flex-1 w-full relative min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
            <Bar dataKey="volume" radius={[4, 4, 4, 4]}>
              {data.map((entry, index) => (
                <Cell 
                    key={`cell-${index}`} 
                    fill={entry.active ? '#a3e635' : '#3f3f46'} 
                    className="hover:opacity-80 transition-opacity"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-between text-zinc-500 text-xs font-medium mt-4 px-2">
         {data.map(d => <span key={d.day}>{d.day}</span>)}
      </div>
    </div>
  );
};

export default VolumeChart;