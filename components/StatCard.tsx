import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { ArrowUp, ArrowDown, HelpCircle } from 'lucide-react';
import { StatMetric } from '../types';

interface StatCardProps {
  metric: StatMetric;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ metric, icon }) => {
  const isPositive = metric.change >= 0;
  
  // Transform simple array to object array for Recharts
  const chartData = metric.data.map((val, idx) => ({ value: val, idx }));

  return (
    <div className="bg-[#18181b] p-6 rounded-3xl flex flex-col justify-between h-48 border border-[#27272a] hover:border-zinc-700 transition-colors">
      <div className="flex justify-between items-start">
        <div className="p-3 bg-[#27272a] rounded-full text-zinc-100">
          {icon}
        </div>
        <HelpCircle className="w-5 h-5 text-zinc-600 cursor-pointer hover:text-zinc-400" />
      </div>

      <div className="mt-4">
        <p className="text-zinc-400 text-xs uppercase tracking-wider mb-1">{metric.label}</p>
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-4xl font-medium text-white tracking-tight">{metric.value}</h3>
            <div className={`flex items-center mt-2 text-xs font-medium ${isPositive ? 'text-lime-400' : 'text-rose-500'}`}>
              {isPositive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
              <span className={`px-1.5 py-0.5 rounded ${isPositive ? 'bg-lime-400/10' : 'bg-rose-500/10'}`}>
                {Math.abs(metric.change)}%
              </span>
              <span className="text-zinc-500 ml-2">vs last 24h</span>
            </div>
          </div>
          
          <div className="w-20 h-10">
             <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`gradient-${metric.label}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isPositive ? "#a3e635" : "#f43f5e"} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={isPositive ? "#a3e635" : "#f43f5e"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={isPositive ? "#a3e635" : "#f43f5e"} 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill={`url(#gradient-${metric.label})`} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;