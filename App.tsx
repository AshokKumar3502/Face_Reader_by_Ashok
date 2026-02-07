
import React, { useState, useEffect } from 'react';
import { Visualizer } from './components/Visualizer';
import { Button } from './components/Button';
import { VisionMode } from './components/VisionMode';
import { InsightCard } from './components/InsightCard';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { ChatView } from './components/ChatView';
import { LoadingScreen } from './components/LoadingScreen';
import { AppState, InsightData, UserContext } from './types';
import { analyzeInput } from './services/geminiService';
import { saveEntry } from './services/storageService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INTRO);
  const [insight, setInsight] = useState<InsightData | null>(null);
  const [selectedContext, setSelectedContext] = useState<UserContext>('CURRENT');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAnalysis = async (image: string, day?: number, audio?: string) => {
    setAppState(AppState.LOADING);
    setErrorMessage(null);
    try {
      const data = await analyzeInput(image, selectedContext, audio);
      setInsight(data);
      if (data.isHuman) saveEntry(selectedContext, data, image, day);
      setAppState(AppState.RESULT);
    } catch (e: any) {
      console.error(e);
      setErrorMessage("Something went wrong. Let's try again.");
      setAppState(AppState.ERROR);
    }
  };

  const startCheckIn = (ctx: UserContext) => {
    setSelectedContext(ctx);
    setAppState(AppState.VISION_ANALYSIS);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#020203]">
      <div className="bg-noise"></div>

      {appState === AppState.LOADING && <LoadingScreen />}

      {/* FIXED HEADER FOR SETTINGS & NAVIGATION */}
      {appState === AppState.INTRO && (
        <header className="fixed top-0 left-0 right-0 z-[100] p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Neural Sync</span>
          </div>
          
          <button 
            onClick={() => setAppState(AppState.SETTINGS)}
            className="pointer-events-auto flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all hover:scale-105 active:scale-95 group shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            <span className="text-[10px] font-black uppercase tracking-widest">Settings</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform duration-500">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </header>
      )}

      <main className="z-10 w-full max-w-2xl flex flex-col items-center justify-center pt-20" style={{ transformStyle: 'preserve-3d' }}>
        
        {appState === AppState.INTRO && (
          <div className="flex flex-col items-center animate-entrance-3d">
            <div className="mb-14">
              <Visualizer state="idle" />
            </div>
            
            <div className="text-center space-y-4 mb-16" style={{ transform: 'translateZ(40px)' }}>
              <h1 className="text-7xl font-serif-display text-white italic tracking-tighter drop-shadow-2xl">Kosha.</h1>
              <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.8em] ml-[0.8em]">Workplace Behavioral Mentor</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 w-full max-w-xs mx-auto" style={{ transform: 'translateZ(60px)' }}>
              <Button onClick={() => startCheckIn('MORNING')} fullWidth className="py-6 text-[10px] bg-white/5 border-white/5">Morning Check-in</Button>
              <Button onClick={() => startCheckIn('MIDDAY')} fullWidth className="py-6 text-[10px] bg-white/5 border-white/5">Mid-day Sync</Button>
              <Button onClick={() => startCheckIn('EVENING')} fullWidth className="py-6 text-[10px] bg-white/5 border-white/5">End of Day Report</Button>
              
              <div className="flex flex-col items-center gap-6 mt-12">
                <button 
                  onClick={() => setAppState(AppState.HISTORY)} 
                  className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white text-[10px] font-black uppercase tracking-[0.4em] transition-all"
                >
                  View Growth Journal
                </button>
                <button 
                  onClick={() => setAppState(AppState.SETTINGS)} 
                  className="text-zinc-600 hover:text-zinc-400 text-[9px] font-black uppercase tracking-[0.5em] transition-colors flex items-center gap-2"
                >
                  Configure AI Mentorship
                </button>
              </div>
            </div>
          </div>
        )}

        {appState === AppState.VISION_ANALYSIS && (
          <VisionMode context={selectedContext} onCapture={handleAnalysis} onCancel={() => setAppState(AppState.INTRO)} />
        )}
        
        {appState === AppState.RESULT && insight && (
          <InsightCard data={insight} onReset={() => setAppState(AppState.INTRO)} onChat={() => setAppState(AppState.CHAT)} />
        )}
        
        {appState === AppState.HISTORY && <HistoryView onBack={() => setAppState(AppState.INTRO)} />}
        {appState === AppState.SETTINGS && <SettingsView onBack={() => setAppState(AppState.INTRO)} />}
        {appState === AppState.CHAT && insight && <ChatView insight={insight} onBack={() => setAppState(AppState.RESULT)} />}
        
        {appState === AppState.ERROR && (
           <div className="w-full max-w-md glass-panel-3d p-12 rounded-[3rem] text-center">
              <h2 className="text-xl font-serif-display text-white italic mb-4">Sync Error</h2>
              <p className="text-zinc-500 text-sm mb-10 italic">{errorMessage}</p>
              <Button onClick={() => setAppState(AppState.INTRO)} fullWidth variant="secondary">Go Back</Button>
           </div>
        )}
      </main>
    </div>
  );
};

export default App;
