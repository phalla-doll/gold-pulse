import React, { useState } from 'react';
import { Calendar, Video, MessageCircle, ArrowRight, TrendingUp, BarChart2, ChevronDown, Sparkles } from 'lucide-react';

interface NewsListProps {
  insight: string;
  loading: boolean;
}

const events = [
    {
        id: 1,
        title: 'Fed Interest Rate Decision',
        time: 'Today, 14:00 PM',
        type: 'Event',
        category: 'Macro',
        icon: <Calendar className="w-3.5 h-3.5 text-blue-400" />,
        color: 'bg-blue-400/10',
        summary: 'Rates expected to hold. Market pricing in 2 cuts this year.',
        tickers: ['XAU', 'USD']
    },
    {
        id: 2,
        title: 'Goldman Sachs Commodity Outlook',
        time: 'Tomorrow, 09:00 AM',
        type: 'Meeting',
        category: 'Macro',
        icon: <Video className="w-3.5 h-3.5 text-lime-400" />,
        color: 'bg-lime-400/10',
        summary: 'Outlook on industrial metals and gold safe-haven demand.',
        tickers: ['GS']
    },
    {
        id: 3,
        title: 'Newmont Corp Q1 Earnings',
        time: 'Mar 23, 16:30 PM',
        type: 'Earnings',
        category: 'Earnings',
        icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />,
        color: 'bg-emerald-400/10',
        summary: 'Consensus EPS $0.42. Focus on production costs.',
        tickers: ['NEM', 'GDX']
    },
    {
        id: 4,
        title: 'ECB President Speech',
        time: 'Mar 24, 10:30 AM',
        type: 'Alert',
        category: 'Macro',
        icon: <MessageCircle className="w-3.5 h-3.5 text-orange-400" />,
        color: 'bg-orange-400/10',
        summary: 'Speech on Eurozone inflation dynamics.',
        tickers: ['EUR/USD']
    },
    {
        id: 5,
        title: 'Barrick Gold Quarterly Report',
        time: 'Mar 25, 08:00 AM',
        type: 'Report',
        category: 'Earnings',
        icon: <BarChart2 className="w-3.5 h-3.5 text-purple-400" />,
        color: 'bg-purple-400/10',
        summary: 'Q1 production numbers and forward guidance update.',
        tickers: ['GOLD']
    }
];

const NewsList: React.FC<NewsListProps> = ({ insight, loading }) => {
  const [activeTab, setActiveTab] = useState('All');

  const filteredEvents = activeTab === 'All' 
    ? events 
    : events.filter(evt => evt.category === activeTab);

  const tabs = ['All', 'Earnings', 'Macro'];

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
            <h3 className="text-white font-medium text-lg">Market Events</h3>
            <div className="flex bg-[#27272a] p-0.5 rounded-lg">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1 text-[10px] font-medium rounded-md transition-all ${
                            activeTab === tab 
                            ? 'bg-[#09090b] text-white shadow-sm' 
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar -mr-2">
            {filteredEvents.map((evt) => (
                <div key={evt.id} className="p-4 rounded-2xl bg-[#09090b] border border-zinc-800 hover:border-zinc-700 transition-all group cursor-pointer hover:bg-zinc-900/50">
                   <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <span className="text-zinc-200 text-sm font-medium leading-tight group-hover:text-lime-400 transition-colors block mb-1">{evt.title}</span>
                            <p className="text-zinc-500 text-[10px]">{evt.time}</p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-transform duration-300 group-hover:rotate-180" />
                   </div>
                   
                   {/* Expandable Section */}
                   <div className="max-h-0 overflow-hidden group-hover:max-h-24 transition-all duration-300 ease-in-out">
                      <div className="pt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                          <p className="text-zinc-400 text-xs leading-relaxed mb-2">{evt.summary}</p>
                          <div className="flex flex-wrap gap-2">
                            {evt.tickers.map((t) => (
                                <span key={t} className="text-[10px] font-medium text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700/50">
                                    {t}
                                </span>
                            ))}
                          </div>
                      </div>
                   </div>
                </div>
            ))}
            {filteredEvents.length === 0 && (
                <div className="text-center py-8 text-zinc-500 text-xs">
                    No events found for {activeTab}.
                </div>
            )}
        </div>
    </div>
  );
};

export default NewsList;