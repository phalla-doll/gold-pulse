import React, { useState } from 'react';
import { X, Key, ShieldCheck, Lock } from 'lucide-react';
import { trackEvent } from '../services/analytics';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [key, setKey] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#18181b] rounded-2xl border border-zinc-800 w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={() => { onClose(); trackEvent('close_api_key_modal'); }} 
          className="absolute right-4 top-4 text-zinc-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-lime-400/10 rounded-full border border-lime-400/20">
            <Key className="w-6 h-6 text-lime-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Configure API Key</h2>
            <p className="text-zinc-500 text-xs">Powered by Google Gemini</p>
          </div>
        </div>

        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          To enable live AI insights and news analysis, please enter your Gemini API Key.
        </p>

        <form onSubmit={(e) => { 
            e.preventDefault(); 
            trackEvent('submit_api_key');
            onSave(key); 
        }}>
            <div className="relative mb-6">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                    type="password" 
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="Enter your API Key"
                    className="w-full bg-[#09090b] border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-lime-400 transition-colors placeholder:text-zinc-600 shadow-inner"
                    autoFocus
                />
            </div>

            <div className="flex items-start gap-3 mb-6 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
                <ShieldCheck className="w-5 h-5 text-lime-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-zinc-500 leading-normal">
                    <strong className="text-zinc-400 block mb-0.5">Local Storage Only</strong>
                    Your key is stored securely in your browser's local storage. It is <strong>never</strong> sent to our servers, only directly to Google's API.
                </p>
            </div>

            <button 
                type="submit" 
                disabled={!key.trim()}
                className="w-full bg-lime-400 hover:bg-lime-500 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-lime-400/20"
            >
                Save & Connect
            </button>
            
            <div className="mt-4 text-center">
                 <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noreferrer" 
                    onClick={() => trackEvent('click_get_api_key_external')}
                    className="text-xs text-zinc-600 hover:text-lime-400 transition-colors underline decoration-dotted"
                 >
                    Don't have a key? Get one here
                 </a>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyModal;