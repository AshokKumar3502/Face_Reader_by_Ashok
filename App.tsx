
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

      {/* Persistent Navigation for Intro Screen */}
      {appState === AppState.INTRO && (
        <div className="fixed top-8 right-8 z-50 flex items-center gap-4 animate-fade-in">
          <button 
            onClick={() => setAppState(AppState.SETTINGS)}
            className="p-3 rounded-full bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all hover:scale-110 active:scale-95 group shadow-2xl"
            aria-label="Settings"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black uppercase tracking-[0.3em] text-white whitespace-nowrap">Settings</span>
          </button>
        </div>
      )}

      <main className="z-10 w-full max-w-2xl flex flex-col items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
        
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
              
              <div className="flex flex-col items-center gap-6 mt-10">
                <button 
                  onClick={() => setAppState(AppState.HISTORY)} 
                  className="text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-[0.4em] transition-colors border-b border-transparent hover:border-white/20 pb-1"
                >
                  View My Growth Journey
                </button>
                <button 
                  onClick={() => setAppState(AppState.SETTINGS)} 
                  className="text-zinc-600 hover:text-zinc-300 text-[10px] font-black uppercase tracking-[0.4em] transition-colors"
                >
                  Account & AI Configuration
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
