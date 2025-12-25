
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
import { saveEntry, getCurrentDay } from './services/storageService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INTRO);
  const [insight, setInsight] = useState<InsightData | null>(null);
  const [context, setContext] = useState<UserContext>('WAKING_UP');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAnalysis = async (image: string, day?: number, audio?: string) => {
    setAppState(AppState.LOADING);
    setErrorMessage(null);
    
    // Safety timeout for the loading screen
    const timeout = setTimeout(() => {
      if (appState === AppState.LOADING) {
        setErrorMessage("Analysis is taking longer than expected. Please check your signal.");
        setAppState(AppState.ERROR);
      }
    }, 25000);

    try {
      const data = await analyzeInput(image, context, audio);
      clearTimeout(timeout);
      setInsight(data);
      if (data.isHuman) saveEntry(context, data, image, day);
      setAppState(AppState.RESULT);
    } catch (e: any) {
      clearTimeout(timeout);
      console.error(e);
      setErrorMessage(e.message || "Failed to establish neural link.");
      setAppState(AppState.ERROR);
    }
  };

  const startSanctuary = () => {
    setAppState(AppState.SANCTUARY);
    // Auto-exit after 45 seconds of breathing
    setTimeout(() => {
      if (appState === AppState.SANCTUARY) setAppState(AppState.RESULT);
    }, 45000);
  };

  const getVisualizerState = () => {
    if (appState === AppState.SANCTUARY) return 'breathing';
    if (appState === AppState.VISION_ANALYSIS) return 'peaceful';
    if (appState === AppState.LOADING) return 'analyzing';
    if (appState === AppState.RESULT) return 'peaceful';
    return 'idle';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#08080a]">
      
      {/* Dynamic Background Noise */}
      <div className="bg-noise pointer-events-none opacity-10"></div>

      {appState === AppState.LOADING && <LoadingScreen />}

      <main className="z-10 w-full max-w-lg flex flex-col items-center justify-center">
        {(appState === AppState.INTRO || appState === AppState.CONTEXT_SELECT || appState === AppState.SANCTUARY) && (
          <div className="mb-10 transition-all duration-1000">
            <Visualizer state={getVisualizerState()} />
          </div>
        )}

        {appState === AppState.SANCTUARY && (
          <div className="text-center animate-fade-in">
             <h2 className="text-4xl font-serif-display text-white italic mb-6">Breathing Sanctuary</h2>
             <p className="text-zinc-500 text-[10px] uppercase tracking-[0.5em] mb-12">Synchronize your heartbeat with the light</p>
             <Button variant="ghost" onClick={() => setAppState(AppState.RESULT)} className="mt-16 py-4 opacity-40 hover:opacity-100 uppercase tracking-widest text-[9px] font-black">Exit Session</Button>
          </div>
        )}

        {appState === AppState.INTRO && (
          <div className="text-center animate-slide-up space-y-16 py-10">
            <div className="space-y-4">
              <h1 className="text-7xl font-serif-display text-white italic tracking-tighter drop-shadow-2xl">KOSHA.</h1>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">The Digital Mirror to your Soul</p>
            </div>
            <div className="space-y-4 w-full max-w-xs mx-auto">
              <Button onClick={() => setAppState(AppState.CONTEXT_SELECT)} fullWidth className="py-6 shadow-[0_20px_40px_-10px_rgba(79,70,229,0.3)]">Begin Reflection</Button>
              <Button variant="ghost" onClick={() => setAppState(AppState.HISTORY)} fullWidth className="py-4 text-white/40 hover:text-white transition-all">Past Entries</Button>
            </div>
          </div>
        )}

        {appState === AppState.CONTEXT_SELECT && (
          <div className="w-full glass-card p-10 rounded-[3.5rem] animate-slide-up border border-white/5 shadow-2xl">
            <h2 className="text-3xl font-serif-display text-white text-center mb-10 italic">Your Presence Now?</h2>
            <div className="grid gap-4">
              {(['WAKING_UP', 'WORK', 'EVENING', 'BEFORE_SLEEP'] as UserContext[]).map(id => (
                <Button 
                  key={id} 
                  variant="secondary" 
                  onClick={() => { setContext(id); setAppState(AppState.VISION_ANALYSIS); }} 
                  fullWidth
                  className="py-5 capitalize text-xs tracking-widest font-bold border-white/5 hover:border-white/20"
                >
                  {id.replace('_', ' ').toLowerCase()}
                </Button>
              ))}
            </div>
            <button onClick={() => setAppState(AppState.INTRO)} className="w-full mt-8 text-[9px] font-black text-white/20 uppercase tracking-widest hover:text-white/60 transition-colors">Cancel</button>
          </div>
        )}

        {appState === AppState.VISION_ANALYSIS && <VisionMode context={context} onCapture={handleAnalysis} onCancel={() => setAppState(AppState.CONTEXT_SELECT)} />}
        
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
           <div className="w-full max-w-sm glass-card p-12 rounded-[3rem] text-center animate-slide-up border-red-500/20">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">📡</div>
              <h2 className="text-2xl font-serif-display text-white italic mb-4">Signal Lost</h2>
              <p className="text-zinc-500 text-xs mb-10 leading-relaxed font-medium">
                {errorMessage || "We encountered a glitch in the neural network. Please check your connection and try again."}
              </p>
              <Button onClick={() => setAppState(AppState.INTRO)} fullWidth className="py-5 bg-red-600 hover:bg-red-500 shadow-lg border-red-400/30">Back to Safety</Button>
           </div>
        )}
      </main>
    </div>
  );
};

export default App;
