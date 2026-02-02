import React, { useState, useEffect } from 'react';
import { Sparkles, ExternalLink, Globe, Clock, AlertTriangle, ZapOff, Lock, RotateCw } from 'lucide-react';
import { NewsItem } from '../types';
import { trackEvent } from '../services/analytics';

interface MarketIntelligenceProps {
  insight: string;
  loading: boolean;
  loadingNews?: boolean;
  news: NewsItem[]; // New prop for live news
  apiKeyConfigured: boolean;
  onConnect: () => void;
  onRefresh?: () => void;
  lastUpdated?: Date | null;
}

// Helper for consistent shimmer skeletons
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`relative overflow-hidden bg-zinc-800/50 ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
  </div>
);

// Helper to parse bold markdown from AI response
const formatInsight = (text: string) => {
  if (!text) return "Analyzing market data...";
  
  // Split by bold markers (**text**)
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="text-lime-100 font-bold">{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
};

const MarketIntelligence: React.FC<MarketIntelligenceProps> = ({ insight, loading, loadingNews = false, news, apiKeyConfigured, onConnect, onRefresh, lastUpdated }) => {
  const isQuotaError = insight.includes('Quota') || insight.includes('Limit Exceeded');
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    if (!lastUpdated) {
        setTimeAgo('');
        return;
    }

    const calculateTimeAgo = () => {
        const now = new Date();
        const diffInSeconds = Math.max(0, Math.floor((now.getTime() - lastUpdated.getTime()) / 1000));
        
        if (diffInSeconds < 60) {
            setTimeAgo(`Updated ${diffInSeconds}s ago`);
        } else if (diffInSeconds < 3600) {
            const mins = Math.floor(diffInSeconds / 60);
            setTimeAgo(`Updated ${mins}m ago`);
        } else {
            const hours = Math.floor(diffInSeconds / 3600);
             setTimeAgo(`Updated ${hours}h ago`);
        }
    };

    calculateTimeAgo();
    // Update every second to keep the seconds counter accurate
    const timer = setInterval(calculateTimeAgo, 1000); 
    return () => clearInterval(timer);
  }, [lastUpdated]);

  return (
    <div className="bg-[#18181b] card-noise p-6 rounded-3xl border border-white/5 h-full relative overflow-hidden flex flex-col">
        {/* Background Gradient Effect - Bottom Right */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-lime-400/5 rounded-full blur-3xl -mr-20 -mb-20 pointer-events-none"></div>

        <div className="flex flex-col h-full relative z-10 min-h-0">
            {/* Analyst Note or Placeholder */}
            {!apiKeyConfigured ? (
                 <div className="mb-6 border border-zinc-800 rounded-xl p-4 bg-zinc-900/30 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-800 rounded-lg">
                            <Sparkles className="w-4 h-4 text-zinc-600" />
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">AI Insight</h4>
                            <p className="text-xs text-zinc-600 mt-0.5">Analysis pending connection...</p>
                        </div>
                    </div>
                 </div>
            ) : (
                <div className={`mb-6 border rounded-xl p-4 transition-all relative overflow-hidden shrink-0 ${
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
                        
                        {/* Refresh Button */}
                        {!isQuotaError && onRefresh && (
                             <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRefresh();
                                    trackEvent('refresh_ai_insight');
                                }}
                                disabled={loading}
                                className={`ml-auto p-1 rounded-md hover:bg-white/10 text-zinc-500 hover:text-zinc-300 transition-all ${loading ? 'animate-spin cursor-not-allowed opacity-70 hover:bg-transparent' : ''}`}
                                aria-label="Refresh Insight"
                                title="Regenerate Analysis"
                             >
                                <RotateCw className="w-3.5 h-3.5" />
                             </button>
                        )}
                    </div>
                    
                    {loading ? (
                        <div className="space-y-2 relative z-10">
                            <Skeleton className="h-3 w-3/4 rounded" />
                            <Skeleton className="h-3 w-1/2 rounded" />
                        </div>
                    ) : (
                        <div className="relative z-10">
                            {isQuotaError ? (
                                <div className="flex flex-col gap-2">
                                    <p className="text-xs text-rose-200/80 leading-relaxed font-medium">
                                        We've hit the Gemini API usage limit for now.
                                    </p>
                                    <a 
                                        href="https://aistudio.google.com/app/plan_information" 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        onClick={() => trackEvent('check_quota_status')}
                                        className="inline-flex items-center gap-1.5 w-fit text-[10px] font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 px-2.5 py-1.5 rounded-lg border border-rose-500/20 transition-colors"
                                    >
                                        Check Quota Status <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            ) : (
                                <div className="max-h-[100px] overflow-y-auto custom-scrollbar pr-2">
                                    <p className="text-xs leading-relaxed font-medium text-zinc-300 break-words whitespace-pre-line">
                                        {formatInsight(insight.trim())}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className="flex justify-between items-center mb-4 shrink-0">
                <h3 className="text-white font-medium text-lg">Live Market Feed</h3>
                <div className="flex items-center gap-2">
                    {apiKeyConfigured && (
                        <>
                        <span className="relative flex h-2 w-2">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${loading || loadingNews || isQuotaError ? 'bg-zinc-500' : 'bg-lime-400'}`}></span>
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${loading || loadingNews || isQuotaError ? 'bg-zinc-500' : 'bg-lime-500'}`}></span>
                        </span>
                        <span className="text-xs text-zinc-500 font-medium hidden md:inline">
                            {loading || loadingNews ? 'Updating...' : (timeAgo || 'Ready to fetch')}
                        </span>
                        </>
                    )}
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar -mr-2 min-h-0">
                {!apiKeyConfigured ? (
                     <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/30 h-full min-h-[200px]">
                        <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
                            <Lock className="w-5 h-5 text-zinc-500" />
                        </div>
                        <h4 className="text-zinc-300 font-medium text-sm mb-1">Live Feed Locked</h4>
                        <p className="text-zinc-500 text-xs mb-4 max-w-[200px] leading-relaxed">
                            Connect your Gemini API key to access real-time market news and analysis.
                        </p>
                        <button 
                            onClick={() => {
                                onConnect();
                                trackEvent('click_connect_api_key', { location: 'news_feed_locked' });
                            }}
                            className="text-xs font-semibold bg-lime-400 hover:bg-lime-500 text-black px-4 py-2 rounded-lg transition-colors shadow-lg shadow-lime-400/10"
                        >
                            Connect API Key
                        </button>
                    </div>
                ) : (
                    <>
                    {loadingNews ? (
                        // Enhanced Skeleton for News Items matching the real layout
                        [...Array(4)].map((_, i) => (
                             <div key={`news-skel-${i}`} className="p-4 rounded-2xl border border-zinc-800 bg-[#09090b]">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        {/* Title Skeleton - 2 lines for realism */}
                                        <Skeleton className="h-3.5 w-[90%] rounded-sm mb-2" />
                                        <Skeleton className="h-3.5 w-[60%] rounded-sm mb-3" />
                                        
                                        <div className="flex items-center gap-3 mt-1">
                                            {/* Source Group */}
                                            <div className="flex items-center gap-1.5">
                                                <Skeleton className="w-3 h-3 rounded-full" />
                                                <Skeleton className="h-2.5 w-14 rounded-sm" />
                                            </div>
                                            {/* Time Group */}
                                            <div className="flex items-center gap-1.5">
                                                <Skeleton className="w-3 h-3 rounded-full" />
                                                <Skeleton className="h-2.5 w-10 rounded-sm" />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Icon Placeholder */}
                                    <Skeleton className="w-4 h-4 rounded-sm opacity-50 shrink-0" />
                                </div>
                             </div>
                        ))
                    ) : news.length === 0 ? (
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
                                    onClick={() => trackEvent('click_news_link', { title: item.title, source: item.source })}
                                    className={`group block p-4 rounded-2xl border transition-all cursor-pointer relative ${
                                        isAlert 
                                        ? 'bg-rose-950/10 border-rose-500/20 hover:border-rose-500/40' 
                                        : 'bg-[#09090b] border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80'
                                    }`}
                                >
                                <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            <span className={`text-sm font-medium leading-snug transition-colors block mb-2 break-words ${
                                                isAlert ? 'text-rose-300 group-hover:text-rose-200' : 'text-zinc-200 group-hover:text-lime-400'
                                            }`}>
                                                {item.title}
                                            </span>
                                            <div className="flex items-center gap-3 flex-wrap">
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
                                            <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-lime-400 transition-colors shrink-0 mt-0.5" />
                                        )}
                                </div>
                                </a>
                            );
                        })
                    )}
                    </>
                )}
            </div>
        </div>
    </div>
  );
};

export default MarketIntelligence;