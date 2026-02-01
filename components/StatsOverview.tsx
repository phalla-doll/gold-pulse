import React from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { ArrowUp, ArrowDown, HelpCircle, DollarSign, Activity, Users, BarChart2 } from 'lucide-react';
import { StatMetric } from '../types';

interface StatsOverviewProps {
  metrics: StatMetric[];
}

const icons = [
  <DollarSign className="w-5 h-5 text-lime-400" />,
  <Activity className="w-5 h-5 text-blue-400" />,
  <Users className="w-5 h-5 text-purple-400" />,
  <BarChart2 className="w-5 h-5 text-orange-400" />
];

const tooltips = [
  "Current global spot price for 1 Troy Ounce of Gold in US Dollars.",
  "Total estimated value of all above-ground gold reserves globally.",
  "Total number of outstanding derivative contracts not yet settled.",
  "Standard deviation of daily returns over the last 30 days."
];

const StatsOverview: React.FC<StatsOverviewProps> = ({ metrics }) => {
  return (
    <div className="bg-[#18181b] p-8 rounded-3xl border border-white/5 flex flex-col">
      {/* Grid of Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800/50">
        {metrics.map((metric, index) => {
           const isPositive = metric.change >= 0;
           
           // Transform for AreaChart
           const chartData = metric.data.map((val, idx) => ({ value: val, idx }));
           const color = isPositive ? "#a3e635" : "#f43f5e";

           return (
             <div key={index} className="relative flex flex-col justify-between pt-8 lg:pt-0 pb-8 lg:pb-0 px-0 lg:px-8 first:pl-0 last:pr-0 first:pt-0 last:pb-0 lg:first:pt-0 lg:last:pb-0">
                
                {/* Icon */}
                <div className="mb-6 flex justify-between items-start">
                   <div className="w-10 h-10 bg-[#27272a] rounded-full flex items-center justify-center text-zinc-100 border border-white/5">
                      {icons[index]}
                   </div>
                   
                   {/* Tooltip Wrapper */}
                   <div className="relative group">
                       <HelpCircle className="w-4 h-4 text-zinc-500 cursor-pointer hover:text-zinc-300 transition-colors" />
                       
                       {/* Floating Tooltip Popup */}
                       <div className="absolute right-0 top-full mt-2 w-48 p-3 bg-[#09090b] border border-zinc-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none translate-y-2 group-hover:translate-y-0">
                           {/* Arrow Pointer */}
                           <div className="absolute -top-1.5 right-0.5 w-3 h-3 bg-[#09090b] border-t border-l border-zinc-800 transform rotate-45"></div>
                           {/* Content */}
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

                        {/* Sparkline Chart */}
                        <div className="w-24 h-12 pb-1">
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

export default StatsOverview;