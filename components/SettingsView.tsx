
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { getSettings, saveSettings, UserSettings } from '../services/storageService';

interface SettingsViewProps {
  onBack: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<UserSettings>(getSettings());
  const [hasPlatformKey, setHasPlatformKey] = useState(false);
  const [manualKey, setManualKey] = useState(settings.manualApiKey || '');
  const [showKey, setShowKey] = useState(false);

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
    // Check periodically for changes in platform state
    const interval = setInterval(checkKey, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleNotification = async () => {
    if (!('Notification' in window)) {
      alert("This device does not support messages.");
      return;
    }

    if (!settings.reminderEnabled) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        updateSettings({ reminderEnabled: true });
      } else {
        alert("Please allow messages in your settings.");
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
      setHasPlatformKey(true);
    } else {
      alert("Please use this app in AI Studio to set a key.");
    }
  };

  const handleSaveManualKey = () => {
    updateSettings({ manualApiKey: manualKey.trim() || null });
    alert("API Key saved successfully.");
  };

  const updateSettings = (updates: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  return (
    <div className="w-full max-w-md animate-entrance-3d pb-10 px-4 sm:px-0 z-20" style={{ transformStyle: 'preserve-3d' }}>
      
      {/* 3D Header Section */}
      <div className="flex justify-between items-end mb-10 border-b border-white/5 pb-8" style={{ transform: 'translateZ(40px)' }}>
        <div>
           <h2 className="text-4xl font-serif-display text-white italic tracking-tight">Settings</h2>
           <p className="text-zinc-500 text-[10px] mt-2 uppercase tracking-[0.4em] font-black">App Controls</p>
        </div>
        <button onClick={onBack} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all py-3 px-6 rounded-xl bg-white/5 border border-white/5">Go Back</button>
      </div>

      <div className="space-y-8" style={{ transformStyle: 'preserve-3d' }}>
        
        {/* GEMINI CONNECTION SECTION */}
        <div className="glass-panel-3d rounded-[3rem] p-8 animate-float-3d" style={{ animationDelay: '0.1s' }}>
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl">💎</div>
                <div>
                  <h3 className="text-white font-bold text-sm uppercase tracking-widest">AI Link</h3>
                  <p className="text-zinc-500 text-[10px] mt-0.5">Gemini Brain Engine</p>
                </div>
              </div>
              <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${ (hasPlatformKey || !!settings.manualApiKey) ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                {(hasPlatformKey || !!settings.manualApiKey) ? 'Active' : 'Offline'}
              </div>
           </div>

           <div className="space-y-6">
              <div className="space-y-3">
                 <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-2">Manual Key Input</label>
                 <div className="relative">
                    <input 
                       type={showKey ? "text" : "password"} 
                       value={manualKey}
                       onChange={(e) => setManualKey(e.target.value)}
                       placeholder="Paste your Gemini API key..."
                       className="w-full bg-black/40 text-white p-5 rounded-2xl border border-white/10 focus:outline-none focus:border-indigo-500/50 transition-all text-sm font-mono"
                    />
                    <button 
                       onClick={() => setShowKey(!showKey)}
                       className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-zinc-600 hover:text-white uppercase tracking-widest p-2"
                    >
                       {showKey ? 'Hide' : 'Show'}
                    </button>
                 </div>
                 <Button onClick={handleSaveManualKey} fullWidth variant="secondary" className="py-4 text-[10px]">
                    Save Manual Key
                 </Button>
              </div>

              <div className="relative py-4">
                 <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                 <div className="relative flex justify-center"><span className="bg-black/80 px-4 text-[9px] text-zinc-700 font-black uppercase tracking-[0.5em]">OR</span></div>
              </div>

              <Button onClick={handleOpenKeySelector} fullWidth className="py-6 bg-indigo-600 text-white shadow-[0_20px_40px_rgba(79,70,229,0.3)]">
                 {hasPlatformKey ? "Refresh Key Portal" : "Auto-Select Gemini Key"}
              </Button>
              
              <div className="flex justify-center gap-6 mt-4 opacity-30">
                 <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[9px] uppercase font-black tracking-widest text-white hover:text-indigo-400 transition-colors">Get Key ↗</a>
                 <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-[9px] uppercase font-black tracking-widest text-white hover:text-indigo-400 transition-colors">Billing ↗</a>
              </div>
           </div>
        </div>

        {/* DAILY REMINDERS SECTION */}
        <div className="glass-panel-3d rounded-[3rem] p-8 animate-float-3d" style={{ animationDelay: '0.3s' }}>
           <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl">🔔</div>
                <div>
                  <h3 className="text-white font-bold text-sm uppercase tracking-widest">Reminders</h3>
                  <p className="text-zinc-500 text-[10px] mt-0.5">Daily Evolution Nudge</p>
                </div>
             </div>
             <button 
               onClick={handleToggleNotification}
               className={`w-14 h-7 rounded-full transition-all relative ${settings.reminderEnabled ? 'bg-emerald-500/30 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-zinc-800 border border-white/5'}`}
             >
               <div className={`absolute top-1 w-5 h-5 rounded-full transition-all shadow-lg ${settings.reminderEnabled ? 'left-8 bg-white' : 'left-1 bg-zinc-600'}`}></div>
             </button>
           </div>
           
           {settings.reminderEnabled ? (
             <div className="animate-entrance-3d">
               <label className="block text-center text-[9px] text-zinc-600 uppercase tracking-[0.4em] mb-4 font-black">Sync me at</label>
               <input 
                 type="time" 
                 value={settings.reminderTime}
                 onChange={(e) => updateSettings({ reminderTime: e.target.value })}
                 className="w-full bg-black/40 text-white p-8 rounded-[2rem] border border-white/10 text-5xl font-serif-display text-center shadow-inner hover:bg-black/60 transition-all cursor-pointer"
               />
             </div>
           ) : (
             <p className="text-center text-zinc-600 text-[11px] italic">Notifications are currently dormant.</p>
           )}
        </div>

        {/* FOOTER INFO */}
        <div className="pt-8 text-center space-y-4" style={{ transform: 'translateZ(10px)' }}>
           <p className="text-[9px] uppercase tracking-[0.5em] text-zinc-800 font-black">Private & Encrypted • Kosha V1.2.1</p>
           <p className="text-zinc-800 text-[8px] leading-relaxed max-w-[240px] mx-auto uppercase tracking-[0.3em] font-bold opacity-30">
             Your journal entries and API keys never leave this device.
           </p>
        </div>
      </div>
    </div>
  );
};
