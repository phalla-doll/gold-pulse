import React from 'react';
import { Sparkles, ExternalLink, Globe, Clock, AlertTriangle, ZapOff } from 'lucide-react';
import { NewsItem } from '../types';

interface NewsListProps {
  insight: string;
  loading: boolean;
  news: NewsItem[]; // New prop for live news
}

const NewsList: React.FC<NewsListProps> = ({ insight, loading, news }) => {
  const isQuotaError = insight.includes('Quota') || insight.includes('Limit Exceeded');

  return (
    <div className="bg-[#18181b] p-6 rounded-3xl border border-white/5 h-full flex flex-col">
        {/* Analyst Note - High Priority */}
        <div className={`mb-6 border rounded-xl p-4 transition-all relative overflow-hidden ${
            isQuotaError 
            ? 'bg-rose-950/20 border-rose-500/30' 
            : 'bg-gradient-to-r from-lime-900/10 to-transparent border-lime-400/20'
        }`}>
            {isQuotaError && (
                 <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            )}

            <div className="flex items-center gap-2 mb-2 relative z-10">
                {isQuotaError ? (
                    <ZapOff className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                    <Sparkles className="w-3.5 h-3.5 text-lime-400" />
                )}
                <h4 className={`text-xs font-semibold uppercase tracking-wider ${isQuotaError ? 'text-rose-400' : 'text-lime-400'}`}>
                    {isQuotaError ? 'System Alert' : 'AI Market Insight'}
                </h4>
            </div>
            
            {loading ? (
                <div className="animate-pulse space-y-2 relative z-10">
                    <div className="h-3 bg-zinc-800 rounded w-3/4"></div>
                    <div className="h-3 bg-zinc-800 rounded w-1/2"></div>
                </div>
            ) : (
                <div className="relative z-10">
                    {isQuotaError ? (
                        <div className="flex flex-col gap-2">
                             <p className="text-xs text-rose-200/80 leading-relaxed font-medium">
                                We've hit the Gemini API usage limit for now.
                            </p>
                            <a href="https://aistudio.google.com/app/plan_information" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 w-fit text-[10px] font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 px-2.5 py-1.5 rounded-lg border border-rose-500/20 transition-colors">
                                Check Quota Status <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    ) : (
                        <p className="text-xs leading-relaxed font-medium text-zinc-300">
                            {insight || "Analyzing market data..."}
                        </p>
                    )}
                </div>
            )}
        </div>

        <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-medium text-lg">Live Market Feed</h3>
            <div className="flex items-center gap-2">
                 <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${loading || isQuotaError ? 'bg-zinc-500' : 'bg-lime-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${loading || isQuotaError ? 'bg-zinc-500' : 'bg-lime-500'}`}></span>
                </span>
                <span className="text-xs text-zinc-500 font-medium hidden md:inline">Updated via Google Search</span>
            </div>
        </div>

        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar -mr-2">
            {news.length === 0 && !loading ? (
                 <div className="text-center py-8 text-zinc-500 text-xs">
                    {isQuotaError ? "News feed temporarily unavailable." : "No recent news found."}
                </div>
            ) : (
                news.map((item) => {
                    const isAlert = item.type === 'Alert';
                    return (
                        <a 
                            key={item.id} 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`group block p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                                isAlert 
                                ? 'bg-rose-950/10 border-rose-500/20 hover:border-rose-500/40' 
                                : 'bg-[#09090b] border-zinc-800 hover:border-lime-400/30 hover:bg-zinc-900/80'
                            }`}
                        >
                           <div className="flex justify-between items-start gap-3">
                                <div className="flex-1">
                                    <span className={`text-sm font-medium leading-snug transition-colors block mb-1.5 ${
                                        isAlert ? 'text-rose-300 group-hover:text-rose-200' : 'text-zinc-200 group-hover:text-lime-400'
                                    }`}>
                                        {item.title}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <div className={`flex items-center gap-1.5 ${isAlert ? 'text-rose-500/70' : 'text-zinc-500'}`}>
                                            {isAlert ? <AlertTriangle className="w-3 h-3"/> : <Globe className="w-3 h-3" />}
                                            <span className="text-[10px] font-medium uppercase tracking-wider">{item.source}</span>
                                        </div>
                                        <div className={`flex items-center gap-1.5 ${isAlert ? 'text-rose-500/70' : 'text-zinc-600'}`}>
                                            <Clock className="w-3 h-3" />
                                            <span className="text-[10px]">{item.time}</span>
                                        </div>
                                    </div>
                                </div>
                                {item.url && !isAlert && (
                                    <ExternalLink className="w-4 h-4 text-zinc-700 group-hover:text-lime-400 transition-colors shrink-0" />
                                )}
                           </div>
                        </a>
                    );
                })
            )}
        </div>
    </div>
  );
};

export default NewsList;