
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { getSettings, saveSettings, UserSettings } from '../services/storageService';

interface SettingsViewProps {
  onBack: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<UserSettings>(getSettings());
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleToggle = async () => {
    if (!('Notification' in window)) {
      alert("This browser does not support desktop notifications.");
      return;
    }

    if (!settings.reminderEnabled) {
      // Trying to enable
      let currentPerm = Notification.permission;
      
      if (currentPerm !== 'granted') {
        try {
          currentPerm = await Notification.requestPermission();
          setPermission(currentPerm);
        } catch (error) {
          console.error("Permission request failed", error);
        }
      }
      
      if (currentPerm === 'granted') {
        updateSettings({ reminderEnabled: true });
      } else {
        alert("Notifications are blocked. Please enable them in your browser settings to receive reminders.");
      }
    } else {
      // Trying to disable
      updateSettings({ reminderEnabled: false });
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ reminderTime: e.target.value });
  };

  const updateSettings = (updates: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const sendTestNotification = () => {
    if (!('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
      new Notification("Kosha", {
        body: "This is how your daily reminder will look.",
        icon: "/favicon.ico"
      });
    } else {
      alert("Please enable the reminder toggle first.");
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in pb-10 px-4 sm:px-0">
      
      <style>{`
        input[type="time"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
      `}</style>

      <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-6">
        <div>
           <h2 className="text-3xl font-serif-display text-white italic">Settings</h2>
           <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest font-black">Architecture & Signal</p>
        </div>
        <button onClick={onBack} className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5">Back</button>
      </div>

      <div className="space-y-6">
        
        {/* API key management removed as per instructions to only use environment-provided keys */}

        {/* NOTIFICATION SETTINGS */}
        <div className="bg-zinc-900/60 backdrop-blur-3xl rounded-3xl p-6 border border-white/10 shadow-2xl">
           <div className="flex items-center justify-between mb-8">
             <div>
                <h3 className="text-zinc-200 font-bold text-sm uppercase tracking-widest">Reminders</h3>
                <p className="text-zinc-500 text-[10px] mt-1">Daily notification frequency</p>
             </div>
             <button 
               onClick={handleToggle}
               className={`w-12 h-6 rounded-full transition-all duration-300 relative ${settings.reminderEnabled ? 'bg-emerald-500/20 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-zinc-800 border border-zinc-700'}`}
             >
               <div className={`absolute top-1 w-3.5 h-3.5 rounded-full transition-all duration-300 ${settings.reminderEnabled ? 'left-7 bg-emerald-50 shadow-[0_0_10px_white]' : 'left-1 bg-zinc-600'}`}></div>
             </button>
           </div>

           <div className={`transition-all duration-500 overflow-hidden ${settings.reminderEnabled ? 'opacity-100 max-h-48 translate-y-0' : 'opacity-20 max-h-0 translate-y-4 pointer-events-none'}`}>
              <div className="relative group">
                 <input 
                  type="time" 
                  value={settings.reminderTime}
                  onChange={handleTimeChange}
                  disabled={!settings.reminderEnabled}
                  className="w-full bg-black/40 text-white p-6 rounded-2xl border border-white/5 focus:outline-none focus:border-emerald-500/30 text-4xl font-serif-display transition-all cursor-pointer shadow-inner text-center"
                 />
                 <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-700">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                       <circle cx="12" cy="12" r="10"></circle>
                       <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                 </div>
              </div>
              <button 
                onClick={sendTestNotification}
                className="w-full mt-6 py-3 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
              >
                Pulse Test
              </button>
           </div>
        </div>

        {/* FOOTER */}
        <div className="pt-10 text-center space-y-4">
           <div className="h-px w-12 bg-white/10 mx-auto"></div>
           <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-600 font-black">Architected by Ashok</p>
           <p className="text-zinc-800 text-[9px] leading-relaxed max-w-[200px] mx-auto uppercase tracking-widest font-bold opacity-60">
             Privacy Protocol Active.<br/>Neural patterns remain local.
           </p>
        </div>
      </div>
    </div>
  );
};
