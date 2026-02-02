import React, { useState, useEffect, useMemo } from 'react';
import { X, Key, ShieldCheck, Lock, Globe, Server, CheckCircle2 } from 'lucide-react';
import { trackEvent } from '../services/analytics';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string, provider: 'gemini' | 'openrouter', model?: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [provider, setProvider] = useState<'gemini' | 'openrouter'>('gemini');
  const [key, setKey] = useState('');
  const [model, setModel] = useState('google/gemini-2.0-flash-lite-preview-02-05:free');

  // Reset inputs when opening (or could load from localStorage if we wanted persistence in UI)
  useEffect(() => {
    if (isOpen) {
        const storedProvider = localStorage.getItem('ai_provider');
        if (storedProvider === 'openrouter') {
            setProvider('openrouter');
            setKey(localStorage.getItem('openrouter_api_key') || '');
            setModel(localStorage.getItem('openrouter_model') || 'google/gemini-2.0-flash-lite-preview-02-05:free');
        } else {
            setProvider('gemini');
            setKey(localStorage.getItem('gemini_api_key') || '');
        }
    }
  }, [isOpen]);

  const isValidFormat = useMemo(() => {
    if (!key) return false;
    const trimmedKey = key.trim();
    if (provider === 'gemini') {
        // Gemini keys typically start with AIza and are ~39 chars
        return trimmedKey.startsWith('AIza') && trimmedKey.length >= 39;
    } else {
        // OpenRouter keys typically start with sk-or-
        return trimmedKey.startsWith('sk-or-') && trimmedKey.length > 30;
    }
  }, [key, provider]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#18181b] card-noise rounded-2xl border border-zinc-800 w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={() => { onClose(); trackEvent('close_api_key_modal'); }} 
          className="absolute right-4 top-4 text-zinc-500 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4 relative z-10">
          <div className={`p-3 rounded-full border ${provider === 'gemini' ? 'bg-lime-400/10 border-lime-400/20' : 'bg-blue-400/10 border-blue-400/20'}`}>
            <Key className={`w-6 h-6 ${provider === 'gemini' ? 'text-lime-400' : 'text-blue-400'}`} />
          </div>
          <div>
            <h2 className="text-xl font-medium text-white mb-1">Configure AI Provider</h2>
            <p className="text-zinc-500 text-xs">Enable live market insights</p>
          </div>
        </div>

        {/* Provider Switcher */}
        <div className="flex bg-zinc-900 p-1 rounded-xl mb-6 border border-zinc-800 relative z-10">
            <button
                onClick={() => setProvider('gemini')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
                    provider === 'gemini' 
                    ? 'bg-[#27272a] text-white shadow-sm border border-zinc-700' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
                <div className="w-2 h-2 rounded-full bg-lime-400"></div>
                Google Gemini
            </button>
            <button
                onClick={() => setProvider('openrouter')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${
                    provider === 'openrouter' 
                    ? 'bg-[#27272a] text-white shadow-sm border border-zinc-700' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
                <Globe className="w-3 h-3 text-blue-400" />
                OpenRouter
            </button>
        </div>

        <form onSubmit={(e) => { 
            e.preventDefault(); 
            trackEvent('submit_api_key', { provider });
            onSave(key, provider, model); 
        }} className="relative z-10">
            
            <div className="space-y-4 mb-6">
                <div className="relative group">
                    <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${isValidFormat ? 'text-lime-400' : 'text-zinc-500'}`} />
                    <input 
                        type="password" 
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder={provider === 'gemini' ? "Enter Gemini API Key (starts with AIza...)" : "Enter OpenRouter Key (starts with sk-or-...)"}
                        className={`w-full bg-[#09090b] border rounded-xl py-3 pl-10 pr-10 text-sm text-white focus:outline-none transition-all duration-200 placeholder:text-zinc-600 shadow-inner ${
                            isValidFormat 
                            ? 'border-lime-400/50 focus:border-lime-400 focus:ring-1 focus:ring-lime-400/20' 
                            : 'border-zinc-800 focus:border-zinc-600'
                        }`}
                        autoFocus
                    />
                    {isValidFormat && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-in fade-in zoom-in duration-200">
                            <CheckCircle2 className="w-4 h-4 text-lime-400" />
                        </div>
                    )}
                </div>

                {provider === 'openrouter' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="relative">
                            <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input 
                                type="text" 
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                placeholder="Model ID (e.g. google/gemini-pro)"
                                className="w-full bg-[#09090b] border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-400/50 transition-colors placeholder:text-zinc-600 shadow-inner"
                            />
                        </div>
                        <p className="text-[10px] text-zinc-600 mt-1.5 ml-1">
                            Recommended: <code>google/gemini-2.0-flash-lite-preview-02-05:free</code>
                        </p>
                    </div>
                )}
            </div>

            <div className="flex items-start gap-3 mb-6 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
                <ShieldCheck className={`w-5 h-5 mt-0.5 shrink-0 ${provider === 'gemini' ? 'text-lime-400' : 'text-blue-400'}`} />
                <p className="text-[11px] text-zinc-500 leading-normal">
                    <strong className="text-zinc-400 block mb-0.5">Local Storage Only</strong>
                    Your keys are stored locally. Live news search works best with Gemini models.
                </p>
            </div>

            <button 
                type="submit" 
                disabled={!key.trim()}
                className={`w-full font-medium py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    provider === 'gemini' 
                    ? 'bg-lime-400 hover:bg-lime-500 text-black shadow-lime-400/20' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20'
                }`}
            >
                Save & Connect
            </button>
            
            <div className="mt-4 text-center">
                 <a 
                    href={provider === 'gemini' ? "https://aistudio.google.com/app/apikey" : "https://openrouter.ai/keys"}
                    target="_blank" 
                    rel="noreferrer" 
                    className={`text-xs transition-colors underline decoration-dotted ${provider === 'gemini' ? 'text-zinc-600 hover:text-lime-400' : 'text-zinc-600 hover:text-blue-400'}`}
                 >
                    {provider === 'gemini' ? "Get Gemini API Key" : "Get OpenRouter Key"}
                 </a>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyModal;