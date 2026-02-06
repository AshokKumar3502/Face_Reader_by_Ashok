
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { getSettings, saveSettings, UserSettings } from '../services/storageService';

interface SettingsViewProps {
  onBack: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<UserSettings>(getSettings());
  const [hasPlatformKey, setHasPlatformKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      if (window.aistudio?.hasSelectedApiKey) {
        // @ts-ignore
        const result = await window.aistudio.hasSelectedApiKey();
        setHasPlatformKey(result);
      }
    };
    checkKey();
    // Check periodically for changes
    const interval = setInterval(checkKey, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleNotification = async () => {
    if (!('Notification' in window)) {
      alert("This device cannot show messages.");
      return;
    }

    if (!settings.reminderEnabled) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        updateSettings({ reminderEnabled: true });
      } else {
        alert("Please allow messages in your phone settings.");
      }
    } else {
      updateSettings({ reminderEnabled: false });
    }
  };

  const handleOpenKeySelector = async () => {
    // @ts-ignore
    if (window.aistudio?.openSelectKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      // Assume success as per guidelines to avoid race condition
      setHasPlatformKey(true);
    } else {
      alert("Cannot open key selector. Ensure you are in the AI Studio environment.");
    }
  };

  const updateSettings = (updates: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  return (
    <div className="w-full max-w-md animate-entrance-3d pb-10 px-4 sm:px-0 z-20" style={{ transformStyle: 'preserve-3d' }}>
      
      {/* 3D Header */}
      <div className="flex justify-between items-end mb-10 border-b border-white/5 pb-6" style={{ transform: 'translateZ(30px)' }}>
        <div>
           <h2 className="text-4xl font-serif-display text-white italic tracking-tight">Settings</h2>
           <p className="text-zinc-600 text-[10px] mt-1 uppercase tracking-[0.4em] font-black">Mentor Control</p>
        </div>
        <button onClick={onBack} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all py-2.5 px-5 rounded-xl bg-white/5 border border-white/5">Back</button>
      </div>

      <div className="space-y-8" style={{ transformStyle: 'preserve-3d' }}>
        
        {/* GEMINI API KEY - GUIDELINE COMPLIANT PORTAL */}
        <div className="glass-panel-3d rounded-[2.5rem] p-8 animate-float-3d" style={{ animationDelay: '0.1s' }}>
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl shadow-inner">💎</div>
                <div>
                  <h3 className="text-white font-bold text-sm uppercase tracking-widest">Gemini Engine</h3>
                  <p className="text-zinc-500 text-[10px] mt-0.5">Neural Connection</p>
                </div>
              </div>
              <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${hasPlatformKey ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                {hasPlatformKey ? 'Connected' : 'Disconnected'}
              </div>
           </div>

           <div className="space-y-4">
              <p className="text-zinc-400 text-[11px] leading-relaxed italic mb-4">
                To talk to your mentor, you must link your Gemini API Key from Google AI Studio.
              </p>
              
              <Button onClick={handleOpenKeySelector} fullWidth className="py-6 bg-indigo-600 text-white shadow-xl">
                 {hasPlatformKey ? "Change Gemini Key" : "Set Gemini API Key"}
              </Button>
              
              <div className="flex justify-center gap-6 mt-4 opacity-50">
                 <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[9px] uppercase font-black tracking-widest text-white hover:text-indigo-400">Get Free Key ↗</a>
                 <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-[9px] uppercase font-black tracking-widest text-white hover:text-indigo-400">Billing Help ↗</a>
              </div>
           </div>
        </div>

        {/* NOTIFICATIONS */}
        <div className="glass-panel-3d rounded-[2.5rem] p-8 animate-float-3d" style={{ animationDelay: '0.3s' }}>
           <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl shadow-inner">🔔</div>
                <div>
                  <h3 className="text-white font-bold text-sm uppercase tracking-widest">Check-ins</h3>
                  <p className="text-zinc-500 text-[10px] mt-0.5">Daily Reminder</p>
                </div>
             </div>
             <button 
               onClick={handleToggleNotification}
               className={`w-14 h-7 rounded-full transition-all relative ${settings.reminderEnabled ? 'bg-emerald-500/30 border border-emerald-500/50' : 'bg-zinc-800 border border-white/5'}`}
             >
               <div className={`absolute top-1 w-4.5 h-4.5 rounded-full transition-all shadow-lg ${settings.reminderEnabled ? 'left-8 bg-white' : 'left-1 bg-zinc-600'}`}></div>
             </button>
           </div>
           
           {settings.reminderEnabled && (
             <div className="animate-entrance-3d">
               <input 
                 type="time" 
                 value={settings.reminderTime}
                 onChange={(e) => updateSettings({ reminderTime: e.target.value })}
                 className="w-full bg-black/40 text-white p-6 rounded-[2rem] border border-white/10 text-4xl font-serif-display text-center"
               />
               <p className="mt-4 text-[9px] text-center text-zinc-600 uppercase tracking-widest font-black">Click time to change</p>
             </div>
           )}
        </div>

        {/* MENTOR STYLE */}
        <div className="glass-panel-3d rounded-[2.5rem] p-8 animate-float-3d" style={{ animationDelay: '0.5s' }}>
           <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl shadow-inner">🌿</div>
              <div>
                <h3 className="text-white font-bold text-sm uppercase tracking-widest">Mentor Tone</h3>
                <p className="text-zinc-500 text-[10px] mt-0.5">Kind vs Strict</p>
              </div>
           </div>
           <div className="grid grid-cols-2 gap-3">
              <button className="py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white/10 transition-all">Gentle</button>
              <button className="py-4 rounded-2xl bg-white/10 border border-white/30 text-[10px] font-bold text-white uppercase tracking-widest">Professional</button>
           </div>
        </div>

        <div className="pt-8 text-center">
           <p className="text-zinc-800 text-[8px] leading-relaxed uppercase tracking-[0.3em] font-bold opacity-40">
             Privacy First: All data stays in your browser.
           </p>
        </div>
      </div>
    </div>
  );
};
