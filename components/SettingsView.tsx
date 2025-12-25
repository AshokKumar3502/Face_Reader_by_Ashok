
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { getSettings, saveSettings, UserSettings } from '../services/storageService';

interface SettingsViewProps {
  onBack: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<UserSettings>(getSettings());
  const [hasPlatformKey, setHasPlatformKey] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [localKey, setLocalKey] = useState(settings.manualApiKey || '');

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
  }, []);

  const handleToggleNotification = async () => {
    if (!('Notification' in window)) {
      alert("Notifications not supported.");
      return;
    }

    if (!settings.reminderEnabled) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        updateSettings({ reminderEnabled: true });
      } else {
        alert("Please enable notifications in your browser settings.");
      }
    } else {
      updateSettings({ reminderEnabled: false });
    }
  };

  const handleKeyPortal = async () => {
    // @ts-ignore
    if (window.aistudio?.openSelectKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setHasPlatformKey(true);
    } else {
      alert("Platform selection bridge unavailable. Please use the Hardcore Mode input below.");
    }
  };

  const handleSaveManualKey = () => {
    updateSettings({ manualApiKey: localKey.trim() || null });
    alert("Neural Link Updated. Your manual key is now active.");
  };

  const updateSettings = (updates: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const isUsingManual = !!settings.manualApiKey;

  return (
    <div className="w-full max-w-md animate-fade-in pb-10 px-4 sm:px-0 z-20">
      
      <div className="flex justify-between items-end mb-10 border-b border-white/5 pb-6">
        <div>
           <h2 className="text-3xl font-serif-display text-white italic tracking-tight">Configuration</h2>
           <p className="text-zinc-600 text-[10px] mt-1 uppercase tracking-[0.3em] font-black">Neural Engine Settings</p>
        </div>
        <button onClick={onBack} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors py-2 px-4 rounded-lg bg-white/5">Back</button>
      </div>

      <div className="space-y-6">
        
        {/* API KEY PORTAL */}
        <div className="bg-zinc-900/60 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/10 transition-all"></div>
           
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl">🧠</div>
                <div>
                  <h3 className="text-white font-bold text-sm uppercase tracking-widest">Neural Link</h3>
                  <p className="text-zinc-500 text-[10px] mt-0.5">Gemini Engine Status</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${ (hasPlatformKey || isUsingManual) ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                {(hasPlatformKey || isUsingManual) ? 'Connected' : 'Sync Required'}
              </div>
           </div>

           <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-zinc-400 text-[10px] uppercase font-black tracking-widest mb-3">Hardcore Key Entry</p>
                <div className="relative">
                  <input 
                    type={showKey ? "text" : "password"} 
                    value={localKey}
                    onChange={(e) => setLocalKey(e.target.value)}
                    placeholder="Paste your API key here..."
                    className="w-full bg-black/40 text-white p-4 pr-12 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-500 transition-all text-xs font-mono"
                  />
                  <button 
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                  >
                    {showKey ? "Hide" : "Show"}
                  </button>
                </div>
                <button 
                  onClick={handleSaveManualKey}
                  className="w-full mt-3 py-3 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all"
                >
                  Save Neural Link
                </button>
              </div>

              <div className="text-center py-2">
                <span className="text-[9px] text-zinc-700 uppercase font-black tracking-widest">— OR —</span>
              </div>

              <Button onClick={handleKeyPortal} fullWidth variant="secondary" className="py-5 text-[10px]">
                Sync via AI Studio Bridge
              </Button>
           </div>
           
           <div className="mt-8 flex justify-center gap-6 opacity-40 hover:opacity-100 transition-opacity">
             <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-white text-[9px] uppercase tracking-widest font-black transition-colors">
               Get Key ↗
             </a>
             <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-white text-[9px] uppercase tracking-widest font-black transition-colors">
               Billing Guide ↗
             </a>
           </div>
        </div>

        {/* NOTIFICATION SETTINGS */}
        <div className="bg-zinc-900/60 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl">
           <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl">🔔</div>
                <div>
                  <h3 className="text-white font-bold text-sm uppercase tracking-widest">Daily Alerts</h3>
                  <p className="text-zinc-500 text-[10px] mt-0.5">Morning check-in sync</p>
                </div>
             </div>
             <button 
               onClick={handleToggleNotification}
               className={`w-12 h-6 rounded-full transition-all relative ${settings.reminderEnabled ? 'bg-emerald-500/30 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-zinc-800 border border-white/5'}`}
             >
               <div className={`absolute top-1 w-3.5 h-3.5 rounded-full transition-all shadow-md ${settings.reminderEnabled ? 'left-7 bg-white' : 'left-1 bg-zinc-600'}`}></div>
             </button>
           </div>
           
           {settings.reminderEnabled && (
             <div className="animate-slide-up">
               <label className="block text-center text-[9px] text-zinc-600 uppercase tracking-[0.3em] mb-4 font-black opacity-60">Scheduled Sync Time</label>
               <input 
                 type="time" 
                 value={settings.reminderTime}
                 onChange={(e) => updateSettings({ reminderTime: e.target.value })}
                 className="w-full bg-black/40 text-white p-6 rounded-2xl border border-white/5 focus:outline-none text-3xl font-serif-display text-center shadow-inner hover:border-white/10 transition-colors"
               />
             </div>
           )}
        </div>

        <div className="pt-10 text-center space-y-4">
           <p className="text-[9px] uppercase tracking-[0.5em] text-zinc-700 font-black">Architected by Ashok • v1.0.9</p>
           <p className="text-zinc-800 text-[8px] leading-relaxed max-w-[220px] mx-auto uppercase tracking-[0.3em] font-bold opacity-40">
             Biometric patterns processed locally via direct neural override.
           </p>
        </div>
      </div>
    </div>
  );
};
