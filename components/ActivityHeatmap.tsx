import React from 'react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIMES = ['19:00', '17:00', '15:00', '13:00', '11:00', '09:00', '07:00'];

const ActivityHeatmap: React.FC = () => {
  // Generate pseudo-random heatmap data
  // Higher intensity in the middle of the day (market hours)
  const getIntensity = (dayIndex: number, timeIndex: number) => {
    if (dayIndex > 4) return 0.1; // Weekends quiet
    if (timeIndex >= 2 && timeIndex <= 4) return Math.random() * 0.5 + 0.5; // High activity mid-day
    return Math.random() * 0.3;
  };

  return (
    <div className="bg-[#18181b] p-6 rounded-3xl border border-[#27272a] h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h3 className="text-white font-medium text-lg">Market Volatility Heatmap</h3>
           <div className="flex items-center mt-1 space-x-2">
             <span className="text-2xl font-semibold text-white">82%</span>
             <span className="text-lime-400 text-xs font-medium bg-lime-400/10 px-1.5 py-0.5 rounded">High Activity</span>
             <span className="text-zinc-500 text-xs">vs last week</span>
           </div>
        </div>
        
        <select className="bg-[#27272a] text-zinc-400 text-xs rounded-lg px-3 py-2 border-none outline-none focus:ring-1 focus:ring-lime-400">
            <option>This Week</option>
            <option>Last Week</option>
        </select>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex flex-1">
            {/* Y-Axis Labels */}
            <div className="flex flex-col justify-between text-zinc-500 text-xs font-medium pr-4 py-2">
                {TIMES.map(time => (
                    <span key={time}>{time}</span>
                ))}
            </div>

            {/* Grid */}
            <div className="flex-1 grid grid-cols-7 gap-1">
                {DAYS.map((day, dIdx) => (
                    <div key={day} className="flex flex-col gap-1">
                        {TIMES.map((_, tIdx) => {
                            const intensity = getIntensity(dIdx, tIdx);
                            let bgClass = 'bg-[#27272a]'; // Default inactive
                            if (intensity > 0.8) bgClass = 'bg-white';
                            else if (intensity > 0.6) bgClass = 'bg-zinc-300';
                            else if (intensity > 0.4) bgClass = 'bg-zinc-500';
                            else if (intensity > 0.2) bgClass = 'bg-zinc-700';
                            
                            return (
                                <div 
                                    key={`${dIdx}-${tIdx}`} 
                                    className={`flex-1 rounded-sm ${bgClass} hover:opacity-80 transition-opacity cursor-pointer`}
                                    title={`Volatility: ${Math.round(intensity * 100)}%`}
                                ></div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
        
        {/* X-Axis Labels */}
        <div className="pl-10 grid grid-cols-7 text-center text-zinc-500 text-xs font-medium mt-3">
             {DAYS.map(day => <span key={day}>{day}</span>)}
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;