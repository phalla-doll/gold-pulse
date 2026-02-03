import React, { useEffect, useState } from 'react';
import { Search, Info, Globe } from 'lucide-react';
import { CountryGoldHolding } from '../types';
import { getTopGoldReserves } from '../services/marketDataService';

interface GlobalReservesTableProps {
    currentGoldPrice?: number;
    loading?: boolean;
}

// Helper for consistent shimmer skeletons
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`relative overflow-hidden bg-zinc-800/50 ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
  </div>
);

const GlobalReservesTable: React.FC<GlobalReservesTableProps> = ({ currentGoldPrice = 2342.10, loading = false }) => {
  const [holdingsData, setHoldingsData] = useState<CountryGoldHolding[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  // Conversion constant: 1 Tonne = 32,150.7 Troy Ounces
  const TONNE_TO_OZ = 32150.7;

  useEffect(() => {
    const loadData = async () => {
        setIsFetching(true);
        try {
            const data = await getTopGoldReserves();
            setHoldingsData(data);
        } catch (e) {
            console.error("Failed to load reserves", e);
        } finally {
            setIsFetching(false);
        }
    };
    loadData();
  }, []);

  const displayHoldings: CountryGoldHolding[] = holdingsData.map(item => {
      // Calculate value in Billions based on LIVE price
      const valueRaw = (item.holdings * TONNE_TO_OZ * currentGoldPrice);
      const valueBillion = valueRaw / 1000000000;
      
      return {
          ...item,
          value: `$${valueBillion.toFixed(1)}B`
      };
  });

  const isLoading = loading || isFetching;

  return (
    <div className="bg-[#18181b] card-noise p-6 rounded-3xl border border-white/5 h-full relative overflow-hidden flex flex-col">
      {/* Background Gradient Effect - Top Left */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-lime-400/5 rounded-full blur-3xl -ml-32 -mt-32 pointer-events-none"></div>

      <div className="flex flex-col h-full relative z-10 min-h-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 shrink-0">
            <div className="flex items-center gap-2">
                <h3 className="text-white font-medium text-lg">Top Gold Reserves</h3>
                
                {/* Tooltip Wrapper */}
                <div className="relative group">
                    <Info className="w-4 h-4 text-zinc-500 cursor-pointer hover:text-zinc-300 transition-colors" />
                    
                    {/* Floating Tooltip Popup */}
                    <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-[#09090b] border border-zinc-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none translate-y-2 group-hover:translate-y-0">
                        {/* Arrow Pointer */}
                        <div className="absolute -top-1.5 left-1 w-3 h-3 bg-[#09090b] border-t border-l border-zinc-800 transform rotate-45"></div>
                        {/* Content */}
                        <p className="text-xs text-zinc-400 font-medium leading-snug relative z-10">
                            Official central bank gold holdings. Values are dynamically calculated based on the current live spot price.
                            <br/><br/>
                            <span className="text-zinc-500">Source: World Gold Council (Latest Reports)</span>
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto justify-end">
                <div className="relative group flex-1 md:flex-none">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-3.5 h-3.5 group-focus-within:text-lime-400" />
                    <input 
                        type="text" 
                        placeholder="Search country..." 
                        className="bg-[#09090b] text-zinc-300 text-xs pl-9 pr-4 py-2 rounded-xl border border-zinc-800 focus:border-lime-400 focus:outline-none w-full md:w-40 transition-colors placeholder:text-zinc-600"
                    />
                </div>
            </div>
          </div>

          <div className="overflow-x-auto flex-1 custom-scrollbar -mr-2 pr-2">
            <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="sticky top-0 z-20 backdrop-blur-md">
                    <tr className="text-zinc-500 text-xs border-b border-zinc-800/50">
                        <th className="py-3 text-center w-12 font-medium">Rank</th>
                        <th className="py-3 font-medium">Country</th>
                        <th className="py-3 font-medium text-right">Holdings</th>
                        <th className="py-3 font-medium text-right">Value (Live)</th>
                        <th className="py-3 font-medium text-right">% of Reserves</th>
                        <th className="py-3 font-medium text-right pr-4">Change</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {isLoading ? (
                        // Skeleton Rows
                        [...Array(6)].map((_, i) => (
                            <tr key={`skel-${i}`} className="border-b border-zinc-800/30 last:border-0">
                                <td className="py-3 text-center">
                                    <Skeleton className="w-4 h-4 mx-auto rounded-sm" />
                                </td>
                                <td className="py-3">
                                    <div className="flex items-center space-x-3">
                                        <Skeleton className="w-5 h-3.5 rounded-sm" />
                                        <Skeleton className="w-24 h-4 rounded-sm" />
                                    </div>
                                </td>
                                <td className="py-3 text-right">
                                     <div className="flex justify-end">
                                        <Skeleton className="w-16 h-4 rounded-sm" />
                                     </div>
                                </td>
                                <td className="py-3 text-right">
                                    <div className="flex justify-end">
                                        <Skeleton className="w-16 h-4 rounded-sm bg-zinc-800/70" />
                                    </div>
                                </td>
                                <td className="py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Skeleton className="w-8 h-4 rounded-sm" />
                                        <Skeleton className="w-16 h-1 rounded-full" />
                                    </div>
                                </td>
                                <td className="py-3 text-right pr-4">
                                     <div className="flex justify-end">
                                        <Skeleton className="w-12 h-5 rounded-md" />
                                     </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        displayHoldings.map((item) => (
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
                        ))
                    )}
                </tbody>
            </table>
          </div>
          
          {/* Footer Note */}
          <div className="mt-4 pt-4 border-t border-zinc-800/50 flex justify-between items-center text-[10px] text-zinc-600 shrink-0">
              <div className="flex items-center gap-1.5">
                  <Globe className="w-3 h-3" />
                  <span>World Gold Council Data</span>
              </div>
              <span>Values calculated @ {currentGoldPrice.toLocaleString('en-US', {style:'currency', currency:'USD'})}</span>
          </div>
      </div>
    </div>
  );
};

export default GlobalReservesTable;