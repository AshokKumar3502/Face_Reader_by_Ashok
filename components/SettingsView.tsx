
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { getSettings, saveSettings, UserSettings } from '../services/storageService';

interface SettingsViewProps {
  onBack: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<UserSettings>(getSettings());

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
        
        {/* API KEY MANAGEMENT UI REMOVED AS PER GUIDELINES */}

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
