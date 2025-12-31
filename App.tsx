
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAnalysis = async (image: string, day?: number, audio?: string) => {
    setAppState(AppState.LOADING);
    setErrorMessage(null);
    
    const timeout = setTimeout(() => {
      if (appState === AppState.LOADING) {
        setErrorMessage("Connection lost. Please try again.");
        setAppState(AppState.ERROR);
      }
    }, 30000);

    try {
      const data = await analyzeInput(image, 'CURRENT', audio);
      clearTimeout(timeout);
      setInsight(data);
      if (data.isHuman) saveEntry('CURRENT', data, image, day);
      setAppState(AppState.RESULT);
    } catch (e: any) {
      clearTimeout(timeout);
      console.error(e);
      setErrorMessage("Sorry, I can't connect right now.");
      setAppState(AppState.ERROR);
    }
  };

  const startSanctuary = () => {
    setAppState(AppState.SANCTUARY);
    setTimeout(() => {
      if (appState === AppState.SANCTUARY) setAppState(AppState.RESULT);
    }, 45000);
  };

  const showSettings = (appState === AppState.INTRO || appState === AppState.RESULT);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#08080a]">
      <div className="bg-noise pointer-events-none opacity-10"></div>

      {showSettings && (
        <button 
          onClick={() => setAppState(AppState.SETTINGS)}
          className="fixed top-8 right-8 z-[60] w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        </button>
      )}

      {appState === AppState.LOADING && <LoadingScreen />}

      <main className="z-10 w-full max-w-lg flex flex-col items-center justify-center">
        {(appState === AppState.INTRO || appState === AppState.SANCTUARY) && (
          <div className="mb-10 transition-all duration-1000">
            <Visualizer state={appState === AppState.SANCTUARY ? 'breathing' : (appState === AppState.INTRO ? 'idle' : 'peaceful')} />
          </div>
        )}

        {appState === AppState.SANCTUARY && (
          <div className="text-center animate-fade-in">
             <h2 className="text-4xl font-serif-display text-white italic mb-6">Relax</h2>
             <p className="text-zinc-500 text-[10px] uppercase tracking-[0.5em] mb-12">Breathe with the light</p>
             <Button variant="ghost" onClick={() => setAppState(AppState.RESULT)}>Back</Button>
          </div>
        )}

        {appState === AppState.INTRO && (
          <div className="text-center animate-slide-up space-y-16 py-10">
            <div className="space-y-4">
              <h1 className="text-7xl font-serif-display text-white italic tracking-tighter drop-shadow-2xl">Kosha.</h1>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">Simple mirror for your mind</p>
            </div>
            <div className="space-y-4 w-full max-w-xs mx-auto">
              <Button onClick={() => setAppState(AppState.VISION_ANALYSIS)} fullWidth className="py-6">How do I feel now?</Button>
              <Button variant="ghost" onClick={() => setAppState(AppState.HISTORY)} fullWidth>See Past Days</Button>
            </div>
          </div>
        )}

        {appState === AppState.VISION_ANALYSIS && <VisionMode context={'CURRENT'} onCapture={handleAnalysis} onCancel={() => setAppState(AppState.INTRO)} />}
        
        {appState === AppState.RESULT && insight && (
          <InsightCard 
            data={insight} 
            onReset={() => setAppState(AppState.INTRO)} 
            onChat={() => setAppState(AppState.CHAT)} 
            onSanctuary={startSanctuary} 
          />
        )}
        
        {appState === AppState.HISTORY && <HistoryView onBack={() => setAppState(AppState.INTRO)} />}
        {appState === AppState.SETTINGS && <SettingsView onBack={() => setAppState(AppState.INTRO)} />}
        {appState === AppState.CHAT && insight && <ChatView insight={insight} onBack={() => setAppState(AppState.RESULT)} />}
        
        {appState === AppState.ERROR && (
           <div className="w-full max-w-sm glass-card p-12 rounded-[3rem] text-center">
              <h2 className="text-2xl font-serif-display text-white italic mb-4">Error</h2>
              <p className="text-zinc-500 text-xs mb-10">{errorMessage || "Something went wrong."}</p>
              <Button onClick={() => setAppState(AppState.INTRO)} fullWidth>Go Back</Button>
           </div>
        )}
      </main>
    </div>
  );
};

export default App;
