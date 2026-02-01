import React from 'react';
import { BarChart, Bar, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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
        <div className="bg-zinc-800 p-2 rounded-lg border border-zinc-700 shadow-xl">
          <p className="text-zinc-200 text-xs font-bold">{label}</p>
          <p className="text-lime-400 text-xs">Vol: {payload[0].value}K</p>
        </div>
      );
    }
    return null;
  };

const VolumeChart: React.FC = () => {
  return (
    <div className="bg-[#18181b] p-6 rounded-3xl border border-[#27272a] h-full flex flex-col">
       <div className="flex justify-between items-center mb-6">
        <div>
           <h3 className="text-white font-medium text-lg">Volume Overview</h3>
           <div className="flex space-x-6 mt-2">
                <div>
                    <span className="text-zinc-500 text-xs block uppercase">In Flow</span>
                    <span className="text-white text-lg font-semibold">24M</span>
                </div>
                <div>
                    <span className="text-zinc-500 text-xs block uppercase">Out Flow</span>
                    <span className="text-white text-lg font-semibold">19M</span>
                </div>
           </div>
        </div>
        
        <select className="bg-[#27272a] text-zinc-400 text-xs rounded-lg px-3 py-2 border-none outline-none focus:ring-1 focus:ring-lime-400">
            <option>This Week</option>
            <option>Monthly</option>
        </select>
      </div>

      <div className="flex-1 w-full relative">
        {/* Custom floating label for the active bar similar to reference */}
        <div className="absolute top-[20%] left-[50%] transform -translate-x-1/2 z-10 hidden md:block">
             <div className="bg-white text-black text-[10px] font-bold px-2 py-1 rounded mb-1 text-center">
                Thursday
                <br/>
                <span className="text-xs">85,128</span>
             </div>
             <div className="w-2 h-2 bg-white rounded-full mx-auto border-2 border-lime-400"></div>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
            <Bar dataKey="volume" radius={[6, 6, 6, 6]}>
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