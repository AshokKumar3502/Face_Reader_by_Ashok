
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { getSettings, saveSettings, UserSettings } from '../services/storageService';

interface SettingsViewProps {
  onBack: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<UserSettings>(getSettings());
  const [isKeyLinked, setIsKeyLinked] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        const linked = await aistudio.hasSelectedApiKey();
        setIsKeyLinked(linked);
      }
    };
    checkKey();
  }, []);

  const handleLinkKey = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      await aistudio.openSelectKey();
      setIsKeyLinked(true);
    }
  };

  const handleManualKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ customApiKey: e.target.value });
  };

  const handleToggle = async () => {
    if (!('Notification' in window)) {
      alert("Notifications not supported.");
      return;
    }

    if (!settings.reminderEnabled) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        updateSettings({ reminderEnabled: true });
      } else {
        alert("Please enable notifications in your browser.");
      }
    } else {
      updateSettings({ reminderEnabled: false });
    }
  };

  const updateSettings = (updates: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  return (
    <div className="w-full max-w-md animate-fade-in pb-10 px-4 sm:px-0">
      
      <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-6">
        <div>
           <h2 className="text-3xl font-serif-display text-white italic">Settings</h2>
           <p className="text-zinc-500 text-[10px] mt-1 uppercase tracking-widest font-black">Architecture & Signal</p>
        </div>
        <button onClick={onBack} className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">Back</button>
      </div>

      <div className="space-y-6">
        
        {/* API KEY MANAGEMENT */}
        <div className="bg-white/5 backdrop-blur-3xl rounded-3xl p-6 border border-white/10 shadow-2xl">
           <div className="flex items-center justify-between mb-4">
             <div>
                <h3 className="text-white font-bold text-sm uppercase tracking-widest">Neural Key</h3>
                <p className="text-zinc-500 text-[10px] mt-1">Manual API Connection</p>
             </div>
             <div className={`w-2 h-2 rounded-full ${settings.customApiKey || isKeyLinked ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`}></div>
           </div>
           
           <div className="space-y-4">
             <div className="relative">
                <input 
                  type="password"
                  value={settings.customApiKey}
                  onChange={handleManualKeyChange}
                  placeholder="Paste your Gemini API key here..."
                  className="w-full bg-black/40 text-white p-4 rounded-xl border border-white/10 focus:outline-none focus:border-white/30 text-xs transition-all placeholder-zinc-600"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3m-3-3l-2.5-2.5"/></svg>
                </div>
             </div>

             <div className="flex items-center gap-3">
               <div className="h-px flex-1 bg-white/5"></div>
               <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">OR</span>
               <div className="h-px flex-1 bg-white/5"></div>
             </div>

             <Button onClick={handleLinkKey} variant="secondary" fullWidth className="py-3 border-white/5 hover:bg-white/5">
                {isKeyLinked ? 'Key Linked via Google' : 'Link via Official Selector'}
             </Button>
           </div>
           
           <div className="mt-6 text-center">
             <a 
               href="https://aistudio.google.com/app/apikey" 
               target="_blank" 
               rel="noreferrer"
               className="text-[9px] text-zinc-500 uppercase tracking-widest hover:text-white transition-colors"
             >
               Get a new API Key
             </a>
           </div>
        </div>

        {/* NOTIFICATION SETTINGS */}
        <div className="bg-zinc-900/60 backdrop-blur-3xl rounded-3xl p-6 border border-white/10 shadow-2xl">
           <div className="flex items-center justify-between mb-4">
             <div>
                <h3 className="text-zinc-200 font-bold text-sm uppercase tracking-widest">Daily Reminders</h3>
                <p className="text-zinc-500 text-[10px] mt-1">Notification frequency</p>
             </div>
             <button 
               onClick={handleToggle}
               className={`w-12 h-6 rounded-full transition-all relative ${settings.reminderEnabled ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-zinc-800'}`}
             >
               <div className={`absolute top-1 w-3.5 h-3.5 rounded-full transition-all ${settings.reminderEnabled ? 'left-7 bg-emerald-50' : 'left-1 bg-zinc-600'}`}></div>
             </button>
           </div>
           
           {settings.reminderEnabled && (
             <input 
               type="time" 
               value={settings.reminderTime}
               onChange={(e) => updateSettings({ reminderTime: e.target.value })}
               className="w-full bg-black/40 text-white p-4 rounded-xl border border-white/5 focus:outline-none text-2xl font-serif-display text-center"
             />
           )}
        </div>

        {/* FOOTER */}
        <div className="pt-10 text-center space-y-4">
           <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-600 font-black">Architected by Ashok</p>
           <p className="text-zinc-800 text-[8px] leading-relaxed max-w-[200px] mx-auto uppercase tracking-widest font-bold opacity-60">
             Privacy Protocol Active.<br/>Neural patterns remain local.
           </p>
        </div>
      </div>
    </div>
  );
};
