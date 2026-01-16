
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
      alert("Your phone does not support notifications.");
      return;
    }

    if (!settings.reminderEnabled) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        updateSettings({ reminderEnabled: true });
      } else {
        alert("Please turn on notifications in your phone settings.");
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
      alert("The automatic key link is not working. Please type your key below.");
    }
  };

  const handleSaveManualKey = () => {
    updateSettings({ manualApiKey: localKey.trim() || null });
    alert("Saved! Your mentor is ready.");
  };

  const updateSettings = (updates: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const isUsingManual = !!settings.manualApiKey;

  return (
    <div className="w-full max-w-md animate-entrance-3d pb-10 px-4 sm:px-0 z-20" style={{ transformStyle: 'preserve-3d' }}>
      
      {/* Header with 3D Depth */}
      <div className="flex justify-between items-end mb-10 border-b border-white/5 pb-6" style={{ transform: 'translateZ(20px)' }}>
        <div>
           <h2 className="text-4xl font-serif-display text-white italic tracking-tight">Settings</h2>
           <p className="text-zinc-600 text-[10px] mt-1 uppercase tracking-[0.4em] font-black">App Control Center</p>
        </div>
        <button onClick={onBack} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all py-2.5 px-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5">Back</button>
      </div>

      <div className="space-y-8" style={{ transformStyle: 'preserve-3d' }}>
        
        {/* API KEY SECTION - 3D GLASS PANEL */}
        <div className="glass-panel-3d rounded-[2.5rem] p-8 animate-float-3d" style={{ animationDelay: '0.2s' }}>
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl shadow-inner">🔑</div>
                <div>
                  <h3 className="text-white font-bold text-sm uppercase tracking-widest">Secret Key</h3>
                  <p className="text-zinc-500 text-[10px] mt-0.5">Connect to Brain</p>
                </div>
              </div>
              <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${ (hasPlatformKey || isUsingManual) ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                {(hasPlatformKey || isUsingManual) ? 'Online' : 'Offline'}
              </div>
           </div>

           <div className="space-y-5">
              <div className="p-5 bg-black/40 rounded-3xl border border-white/5 shadow-inner">
                <p className="text-zinc-500 text-[9px] uppercase font-black tracking-widest mb-4">Type Your Code</p>
                <div className="relative">
                  <input 
                    type={showKey ? "text" : "password"} 
                    value={localKey}
                    onChange={(e) => setLocalKey(e.target.value)}
                    placeholder="Enter key here..."
                    className="w-full bg-black/60 text-white p-4 pr-12 rounded-2xl border border-white/10 focus:outline-none focus:border-indigo-500 transition-all text-xs font-mono tracking-wider"
                  />
                  <button 
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors text-[10px] font-bold"
                  >
                    {showKey ? "Hide" : "Show"}
                  </button>
                </div>
                <Button 
                  onClick={handleSaveManualKey}
                  fullWidth
                  className="mt-4 py-4 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white text-[10px]"
                >
                  Save My Key
                </Button>
              </div>

              <div className="flex items-center gap-4 px-2">
                 <div className="h-[1px] flex-1 bg-white/5"></div>
                 <span className="text-[8px] text-zinc-700 uppercase font-black tracking-[0.5em]">OR</span>
                 <div className="h-[1px] flex-1 bg-white/5"></div>
              </div>

              <Button onClick={handleKeyPortal} fullWidth variant="secondary" className="py-5 text-[10px] bg-white/5 hover:bg-white/10 border-white/10 shadow-xl">
                Automatic Connection
              </Button>
           </div>
           
           <div className="mt-8 flex justify-center gap-8 border-t border-white/5 pt-6">
             <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-indigo-400 text-[9px] uppercase tracking-widest font-black transition-all">
               Get Free Key ↗
             </a>
             <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-indigo-400 text-[9px] uppercase tracking-widest font-black transition-all">
               Billing Info ↗
             </a>
           </div>
        </div>

        {/* NOTIFICATION SETTINGS - 3D GLASS PANEL */}
        <div className="glass-panel-3d rounded-[2.5rem] p-8 animate-float-3d" style={{ animationDelay: '0.4s' }}>
           <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl shadow-inner">🔔</div>
                <div>
                  <h3 className="text-white font-bold text-sm uppercase tracking-widest">Reminders</h3>
                  <p className="text-zinc-500 text-[10px] mt-0.5">Daily Check-in Time</p>
                </div>
             </div>
             <button 
               onClick={handleToggleNotification}
               className={`w-14 h-7 rounded-full transition-all relative ${settings.reminderEnabled ? 'bg-emerald-500/30 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-zinc-800 border border-white/5'}`}
             >
               <div className={`absolute top-1 w-4.5 h-4.5 rounded-full transition-all shadow-lg ${settings.reminderEnabled ? 'left-8 bg-white' : 'left-1 bg-zinc-600'}`}></div>
             </button>
           </div>
           
           {settings.reminderEnabled && (
             <div className="animate-entrance-3d">
               <label className="block text-center text-[9px] text-zinc-600 uppercase tracking-[0.4em] mb-4 font-black">When should I buzz?</label>
               <div className="relative group">
                 <input 
                   type="time" 
                   value={settings.reminderTime}
                   onChange={(e) => updateSettings({ reminderTime: e.target.value })}
                   className="w-full bg-black/40 text-white p-6 rounded-[2rem] border border-white/10 focus:outline-none focus:border-amber-500/40 text-4xl font-serif-display text-center shadow-inner hover:bg-black/60 transition-all cursor-pointer"
                 />
                 <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-amber-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
               </div>
             </div>
           )}
        </div>

        {/* Footer info */}
        <div className="pt-8 text-center space-y-4" style={{ transform: 'translateZ(10px)' }}>
           <p className="text-[9px] uppercase tracking-[0.5em] text-zinc-700 font-black">Version 1.2.0 • Build Neural_09</p>
           <p className="text-zinc-800 text-[8px] leading-relaxed max-w-[250px] mx-auto uppercase tracking-[0.3em] font-bold opacity-30">
             Your data stays on this device. Privacy is our top rule.
           </p>
        </div>
      </div>
    </div>
  );
};
