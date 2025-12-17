import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { getSettings, saveSettings, UserSettings } from '../services/storageService';

interface SettingsViewProps {
  onBack: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<UserSettings>(getSettings());
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [apiKeyInput, setApiKeyInput] = useState(settings.customApiKey || '');
  const [keySaved, setKeySaved] = useState(false);

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
        // We do not enable the setting if permission is denied
      }
    } else {
      // Trying to disable
      updateSettings({ reminderEnabled: false });
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ reminderTime: e.target.value });
  };

  const handleSaveKey = () => {
    updateSettings({ customApiKey: apiKeyInput.trim() });
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  const updateSettings = (updates: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const sendTestNotification = () => {
    if (!('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
      new Notification("Serene", {
        body: "This is how your daily reminder will look.",
        icon: "/favicon.ico"
      });
    } else {
      alert("Please enable the reminder toggle first.");
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in pb-10">
      
      {/* CSS Hack for Dark Mode Time Input */}
      <style>{`
        input[type="time"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
      `}</style>

      <div className="flex justify-between items-end mb-10 border-b border-white/5 pb-6">
        <div>
           <h2 className="text-3xl font-serif-display text-white">Settings</h2>
           <p className="text-zinc-500 text-sm mt-1">Customize your experience</p>
        </div>
        <button onClick={onBack} className="text-sm font-medium text-zinc-500 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5">Close</button>
      </div>

      <div className="bg-zinc-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 space-y-10">
        
        {/* Reminder Toggle */}
        <div className="flex items-center justify-between cursor-pointer" onClick={handleToggle}>
          <div>
            <h3 className="text-zinc-200 font-medium text-lg">Daily Reminder</h3>
            <p className="text-zinc-500 text-xs mt-1">Receive a gentle nudge to check in.</p>
          </div>
          <button 
            type="button"
            className={`w-14 h-8 rounded-full transition-all duration-300 relative shadow-inner flex-shrink-0 ${settings.reminderEnabled ? 'bg-teal-500/20 border border-teal-500' : 'bg-zinc-800 border border-zinc-700'}`}
          >
            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all duration-300 shadow-lg ${settings.reminderEnabled ? 'left-7 bg-teal-50' : 'left-1'}`}></div>
          </button>
        </div>

        {/* Time Picker */}
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${settings.reminderEnabled ? 'opacity-100 max-h-48' : 'opacity-40 max-h-48 grayscale pointer-events-none'}`}>
          <label className="block text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-3">
             {settings.reminderEnabled ? "Preferred Time" : "Enable reminders to set time"}
          </label>
          <div className="relative group">
             {/* The Input */}
             <input 
              type="time" 
              value={settings.reminderTime}
              onChange={handleTimeChange}
              disabled={!settings.reminderEnabled}
              className="w-full bg-black/40 text-white p-6 rounded-2xl border border-white/10 focus:outline-none focus:border-teal-500/50 focus:bg-black/60 text-3xl font-serif-display transition-all cursor-pointer shadow-inner"
             />
             
             {/* Decorator Icon for visual cue */}
             <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 group-hover:text-white transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <circle cx="12" cy="12" r="10"></circle>
                   <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
             </div>
          </div>
          <p className="text-zinc-600 text-[10px] mt-3 text-center">
             We will send a browser notification at this time.
          </p>
        </div>

        {/* Test Button */}
        <div className={`transition-all duration-300 ${settings.reminderEnabled ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
           <Button variant="ghost" onClick={sendTestNotification} className="w-full text-xs py-3 border border-white/5 hover:bg-white/5">
             Test Notification
           </Button>
        </div>
      </div>

      {/* API Configuration Section */}
      <div className="mt-8 bg-zinc-900/40 backdrop-blur-xl rounded-[2rem] p-8 border border-white/5 space-y-6">
        <div>
           <h3 className="text-zinc-200 font-medium text-lg">AI Configuration</h3>
           <p className="text-zinc-500 text-xs mt-1">Use your own Gemini API Key for analysis.</p>
        </div>
        
        <div className="space-y-4">
           <div className="relative">
              <input
                 type="password"
                 value={apiKeyInput}
                 onChange={(e) => setApiKeyInput(e.target.value)}
                 placeholder="Paste your API Key here"
                 className="w-full bg-black/40 text-white p-4 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-500/50 focus:bg-black/60 text-sm transition-all"
              />
              {apiKeyInput && (
                 <button 
                    onClick={() => setApiKeyInput('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white"
                 >
                    ✕
                 </button>
              )}
           </div>
           
           <Button 
              onClick={handleSaveKey} 
              fullWidth 
              className={keySaved ? "border-emerald-500/50 text-emerald-400 bg-emerald-900/20" : ""}
           >
              {keySaved ? "Saved Successfully" : "Save API Key"}
           </Button>
           
           <p className="text-zinc-600 text-[10px] text-center leading-relaxed">
              Your key is stored locally on this device. <br/>
              Leave empty to use the default shared key (if available).
           </p>
        </div>
      </div>

      <div className="mt-12 text-center opacity-40 hover:opacity-100 transition-opacity duration-300">
         <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">Privacy First</p>
         <p className="text-zinc-600 text-xs px-8 leading-relaxed max-w-xs mx-auto">
           Data is stored locally on your device.<br/>We do not track you.
         </p>
      </div>

    </div>
  );
};