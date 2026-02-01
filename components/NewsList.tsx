import React, { useState } from 'react';
import { Calendar, Video, MessageCircle, ArrowRight, TrendingUp, BarChart2 } from 'lucide-react';

const events = [
    {
        id: 1,
        title: 'Fed Interest Rate Decision',
        time: 'Today, 14:00 PM',
        type: 'Event',
        category: 'Macro',
        icon: <Calendar className="w-4 h-4 text-blue-400" />,
        color: 'bg-blue-400/10'
    },
    {
        id: 2,
        title: 'Goldman Sachs Commodity Outlook',
        time: 'Tomorrow, 09:00 AM',
        type: 'Meeting',
        category: 'Macro',
        icon: <Video className="w-4 h-4 text-lime-400" />,
        color: 'bg-lime-400/10'
    },
    {
        id: 3,
        title: 'Newmont Corp Q1 Earnings',
        time: 'Mar 23, 16:30 PM',
        type: 'Earnings',
        category: 'Earnings',
        icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
        color: 'bg-emerald-400/10'
    },
    {
        id: 4,
        title: 'ECB President Speech',
        time: 'Mar 24, 10:30 AM',
        type: 'Alert',
        category: 'Macro',
        icon: <MessageCircle className="w-4 h-4 text-orange-400" />,
        color: 'bg-orange-400/10'
    },
    {
        id: 5,
        title: 'Barrick Gold Quarterly Report',
        time: 'Mar 25, 08:00 AM',
        type: 'Report',
        category: 'Earnings',
        icon: <BarChart2 className="w-4 h-4 text-purple-400" />,
        color: 'bg-purple-400/10'
    }
];

const NewsList: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');

  const filteredEvents = activeTab === 'All' 
    ? events 
    : events.filter(evt => evt.category === activeTab);

  const tabs = ['All', 'Earnings', 'Macro'];

  return (
    <div className="bg-[#18181b] p-6 rounded-3xl border border-[#27272a] h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-medium text-lg">Market Events ({filteredEvents.length})</h3>
            <div className="bg-[#27272a] p-2 rounded-lg cursor-pointer hover:bg-zinc-700 transition-colors">
                <Calendar className="w-4 h-4 text-zinc-400" />
            </div>
        </div>

        <div className="bg-[#27272a] p-1 rounded-xl flex mb-6">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 text-xs font-medium py-2 rounded-lg transition-all ${
                        activeTab === tab 
                        ? 'bg-[#09090b] text-white shadow-sm' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>

        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
            {filteredEvents.map((evt) => (
                <div key={evt.id} className="p-4 rounded-2xl bg-[#09090b] border border-zinc-800 hover:border-zinc-700 transition-all group cursor-pointer">
                   <div className="flex justify-between items-start mb-2">
                        <span className="text-zinc-200 text-sm font-medium leading-tight">{evt.title}</span>
                   </div>
                   <p className="text-zinc-500 text-xs mb-4">{evt.time}</p>
                   
                   <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
                        <div className="flex items-center space-x-2">
                             <div className={`p-1.5 rounded-full ${evt.color}`}>
                                {evt.icon}
                             </div>
                             <span className="text-zinc-400 text-xs">{evt.type}</span>
                        </div>
                        
                        <div className="flex -space-x-2">
                            <img className="w-6 h-6 rounded-full border-2 border-[#09090b]" src={`https://picsum.photos/24/24?random=${evt.id}`} alt="" />
                            <div className="w-6 h-6 rounded-full border-2 border-[#09090b] bg-zinc-800 flex items-center justify-center">
                                <ArrowRight className="w-3 h-3 text-zinc-400 group-hover:text-lime-400 transition-colors" />
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
        
        <div className="mt-4 pt-4 border-t border-zinc-800">
             <h4 className="text-zinc-200 text-sm font-medium mb-1">Analyst Note</h4>
             <p className="text-zinc-500 text-xs leading-relaxed">
                Geopolitical tensions remain the primary driver for XAU this week. Watch the $2,350 resistance level closely.
             </p>
        </div>
    </div>
  );
};

export default NewsList;