import React from 'react';
import { BarChart, Bar, Cell, ResponsiveContainer } from 'recharts';
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

const StatsOverview: React.FC<StatsOverviewProps> = ({ metrics }) => {
  return (
    <div className="bg-[#18181b] p-8 rounded-3xl border border-[#27272a] flex flex-col">
      {/* Grid of Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800/50">
        {metrics.map((metric, index) => {
           const isPositive = metric.change >= 0;
           
           // Calculate min/max for normalization logic
           const min = Math.min(...metric.data);
           const max = Math.max(...metric.data);
           const range = max - min || 1;

           // For standard BarCharts, values close to each other with a high baseline (like stock price)
           // look like uniform blocks. We normalize the display data to accentuate the variance,
           // mimicking the "sparkline" feel but with bars.
           // Rule: If the baseline is much larger than the variance, shift the baseline.
           const shouldNormalize = min > range * 2;

           const chartData = metric.data.map((val, idx) => ({ 
             value: shouldNormalize ? (val - min) + (range * 0.2) : val, 
             idx 
           }));

           return (
             <div key={index} className="relative flex flex-col justify-between pt-8 lg:pt-0 pb-8 lg:pb-0 px-0 lg:px-8 first:pl-0 last:pr-0 first:pt-0 last:pb-0 lg:first:pt-0 lg:last:pb-0">
                
                {/* Icon */}
                <div className="mb-6">
                   <div className="w-10 h-10 bg-[#27272a] rounded-full flex items-center justify-center text-zinc-100">
                      {icons[index]}
                   </div>
                </div>

                <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                        <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">{metric.label}</p>
                        <HelpCircle className="w-3 h-3 text-zinc-600 cursor-pointer hover:text-zinc-400" />
                    </div>
                    
                    <div className="flex justify-between items-end mt-auto">
                        <div>
                            <h3 className="text-4xl font-medium text-white tracking-tight">{metric.value}</h3>
                            <div className={`flex items-center mt-3 text-xs font-medium ${isPositive ? 'text-lime-400' : 'text-rose-500'}`}>
                                <span className={`px-2 py-1 rounded-md flex items-center ${isPositive ? 'bg-lime-400/10' : 'bg-rose-500/10'}`}>
                                    {isPositive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                                    {Math.abs(metric.change)}%
                                </span>
                                <span className="text-zinc-500 ml-2">vs last month</span>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="w-24 h-12 pb-1">
                             <ResponsiveContainer width="100%" height="100%" className="focused:ring-0">
                              <BarChart data={chartData}>
                                <Bar 
                                  dataKey="value" 
                                  radius={[2, 2, 0, 0]}
                                  barSize={5}
                                >
                                  {chartData.map((_, i) => (
                                    <Cell key={`cell-${i}`} fill={isPositive ? "#a3e635" : "#f43f5e"} />
                                  ))}
                                </Bar>
                              </BarChart>
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