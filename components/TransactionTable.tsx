import React from 'react';
import { Search, Filter, Info, AlertCircle } from 'lucide-react';
import { CountryGoldHolding } from '../types';

interface TransactionTableProps {
    currentGoldPrice?: number;
}

// Data based on approx World Gold Council holdings (Tonnes)
const baseHoldings = [
  { rank: 1, country: 'United States', holdings: 8133.5, percentage: 69.7, change: 0, flagCode: 'us' },
  { rank: 2, country: 'Germany', holdings: 3352.6, percentage: 67.8, change: -0.2, flagCode: 'de' },
  { rank: 3, country: 'Italy', holdings: 2451.8, percentage: 65.1, change: 0, flagCode: 'it' },
  { rank: 4, country: 'France', holdings: 2436.9, percentage: 60.3, change: 0, flagCode: 'fr' },
  { rank: 5, country: 'Russia', holdings: 2332.7, percentage: 26.2, change: +3.1, flagCode: 'ru' },
  { rank: 6, country: 'China', holdings: 2264.3, percentage: 4.3, change: +10.5, flagCode: 'cn' },
];

const HoldingsTable: React.FC<TransactionTableProps> = ({ currentGoldPrice = 2342.10 }) => {
  // Conversion constant: 1 Tonne = 32,150.7 Troy Ounces
  const TONNE_TO_OZ = 32150.7;

  const holdings: CountryGoldHolding[] = baseHoldings.map(item => {
      // Calculate value in Billions
      const valueRaw = (item.holdings * TONNE_TO_OZ * currentGoldPrice);
      const valueBillion = valueRaw / 1000000000;
      
      return {
          ...item,
          value: `$${valueBillion.toFixed(1)}B`
      };
  });

  return (
    <div className="bg-[#18181b] p-6 rounded-3xl border border-white/5 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
            <h3 className="text-white font-medium text-lg">Top Gold Reserves</h3>
            
            {/* Source Label */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800/50 border border-zinc-700/50">
                <AlertCircle className="w-3 h-3 text-zinc-500" />
                <span className="text-[10px] text-zinc-500 font-medium">Source: World Gold Council (Q4 2024)</span>
            </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
            <div className="relative group flex-1 md:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-3.5 h-3.5 group-focus-within:text-lime-400" />
                <input 
                    type="text" 
                    placeholder="Search country..." 
                    className="bg-[#09090b] text-zinc-300 text-xs pl-9 pr-4 py-2 rounded-xl border border-zinc-800 focus:border-lime-400 focus:outline-none w-full md:w-40 transition-colors placeholder:text-zinc-600"
                />
            </div>
            <button className="flex items-center space-x-2 bg-[#09090b] text-zinc-500 px-3 py-2 rounded-xl border border-zinc-800 hover:text-zinc-300 hover:border-zinc-700 transition-colors shrink-0">
                <span className="text-xs font-medium">Filter</span>
                <Filter className="w-3.5 h-3.5" />
            </button>
        </div>
      </div>

      <div className="overflow-x-auto flex-1 custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
                <tr className="text-zinc-500 text-xs border-b border-zinc-800/50">
                    <th className="pb-3 text-center w-12 font-medium">Rank</th>
                    <th className="pb-3 font-medium">Country</th>
                    <th className="pb-3 font-medium text-right">Holdings</th>
                    <th className="pb-3 font-medium text-right">Value (Live)</th>
                    <th className="pb-3 font-medium text-right">% of Reserves</th>
                    <th className="pb-3 font-medium text-right pr-4">Change</th>
                </tr>
            </thead>
            <tbody className="text-sm">
                {holdings.map((item) => (
                    <tr key={item.country} className="group hover:bg-[#27272a]/30 transition-colors border-b border-zinc-800/30 last:border-0">
                        <td className="py-3 text-center text-zinc-500 text-sm tabular-nums">#{item.rank}</td>
                        <td className="py-3">
                            <div className="flex items-center space-x-3">
                                <img 
                                    src={`https://flagcdn.com/w40/${item.flagCode}.png`} 
                                    alt={item.country} 
                                    className="w-5 h-3.5 object-cover rounded shadow-sm opacity-80 group-hover:opacity-100 transition-opacity" 
                                />
                                <span className="text-zinc-200 font-medium text-sm">{item.country}</span>
                            </div>
                        </td>
                        <td className="py-3 text-right text-zinc-200 font-medium tabular-nums text-sm">
                            {item.holdings.toLocaleString()} <span className="text-zinc-600 text-xs font-normal">T</span>
                        </td>
                        <td className="py-3 text-right text-lime-400/90 font-medium text-sm tabular-nums">{item.value}</td>
                        <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <span className="text-zinc-300 text-sm tabular-nums">{item.percentage}%</span>
                                <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-lime-400/50 group-hover:bg-lime-400 transition-colors" 
                                        style={{ width: `${item.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </td>
                        <td className="py-3 text-right pr-4">
                             {item.change === 0 ? (
                                 <span className="text-zinc-700">-</span>
                             ) : (
                                 <span className={`text-xs font-medium px-2 py-0.5 rounded tabular-nums ${item.change > 0 ? 'text-lime-400 bg-lime-400/10' : 'text-rose-500 bg-rose-500/10'}`}>
                                     {item.change > 0 ? '+' : ''}{item.change} T
                                 </span>
                             )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default HoldingsTable;