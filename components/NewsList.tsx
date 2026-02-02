import React, { useState } from 'react';
import { Sparkles, ExternalLink, Globe, Clock } from 'lucide-react';
import { NewsItem } from '../types';

interface NewsListProps {
  insight: string;
  loading: boolean;
  news: NewsItem[]; // New prop for live news
}

const NewsList: React.FC<NewsListProps> = ({ insight, loading, news }) => {
  const [activeTab, setActiveTab] = useState('Latest');

  return (
    <div className="bg-[#18181b] p-6 rounded-3xl border border-white/5 h-full flex flex-col">
        {/* Analyst Note - High Priority */}
        <div className="mb-6 bg-gradient-to-r from-lime-900/10 to-transparent border border-lime-400/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-lime-400" />
                <h4 className="text-lime-400 text-xs font-semibold uppercase tracking-wider">AI Market Insight</h4>
            </div>
            {loading ? (
                <div className="animate-pulse space-y-2">
                    <div className="h-3 bg-zinc-800 rounded w-3/4"></div>
                    <div className="h-3 bg-zinc-800 rounded w-1/2"></div>
                </div>
            ) : (
                <p className="text-zinc-300 text-xs leading-relaxed font-medium">
                    {insight || "Analyzing market data..."}
                </p>
            )}
        </div>

        <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-medium text-lg">Live Market Feed</h3>
            <div className="flex items-center gap-2">
                 <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-500"></span>
                </span>
                <span className="text-xs text-zinc-500 font-medium">Updated via Google Search</span>
            </div>
        </div>

        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar -mr-2">
            {news.length === 0 && !loading ? (
                 <div className="text-center py-8 text-zinc-500 text-xs">
                    No recent news found.
                </div>
            ) : (
                news.map((item) => (
                    <a 
                        key={item.id} 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group block p-4 rounded-2xl bg-[#09090b] border border-zinc-800 hover:border-lime-400/30 hover:bg-zinc-900/80 transition-all cursor-pointer relative overflow-hidden"
                    >
                       <div className="flex justify-between items-start gap-3">
                            <div className="flex-1">
                                <span className="text-zinc-200 text-sm font-medium leading-snug group-hover:text-lime-400 transition-colors block mb-1.5">
                                    {item.title}
                                </span>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 text-zinc-500">
                                        <Globe className="w-3 h-3" />
                                        <span className="text-[10px] font-medium uppercase tracking-wider">{item.source}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-zinc-600">
                                        <Clock className="w-3 h-3" />
                                        <span className="text-[10px]">{item.time}</span>
                                    </div>
                                </div>
                            </div>
                            {item.url && (
                                <ExternalLink className="w-4 h-4 text-zinc-700 group-hover:text-lime-400 transition-colors shrink-0" />
                            )}
                       </div>
                    </a>
                ))
            )}
        </div>
    </div>
  );
};

export default NewsList;