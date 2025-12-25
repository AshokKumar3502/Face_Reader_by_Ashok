
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

  const handleAnalysis = async (image: string, day?: number, audio?: string) => {
    setAppState(AppState.LOADING);
    try {
      const data = await analyzeInput(image, context, audio);
      setInsight(data);
      if (data.isHuman) saveEntry(context, data, image, day);
      setAppState(AppState.RESULT);
    } catch (e: any) {
      console.error(e);
      setAppState(AppState.ERROR);
    }
  };

  const startSanctuary = () => {
    setAppState(AppState.SANCTUARY);
    setTimeout(() => setAppState(AppState.RESULT), 60000); // 1 minute session
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
      {appState === AppState.LOADING && <LoadingScreen />}

      <main className="z-10 w-full max-w-lg flex flex-col items-center">
        {(appState === AppState.INTRO || appState === AppState.CONTEXT_SELECT || appState === AppState.SANCTUARY) && (
          <div className="mb-10 transition-all">
            <Visualizer state={getVisualizerState()} />
          </div>
        )}

        {appState === AppState.SANCTUARY && (
          <div className="text-center animate-fade-in">
             <h2 className="text-3xl font-serif-display text-white italic mb-4">Sanctuary</h2>
             <p className="text-zinc-500 text-[10px] uppercase tracking-[0.4em] mb-12">Match your breath to the light</p>
             <Button variant="ghost" onClick={() => setAppState(AppState.RESULT)} className="mt-20">End Session</Button>
          </div>
        )}

        {appState === AppState.INTRO && (
          <div className="text-center animate-slide-up space-y-12">
            <h1 className="text-6xl font-serif-display text-white italic tracking-tighter">KOSHA.</h1>
            <div className="space-y-4 w-full max-w-xs mx-auto">
              <Button onClick={() => setAppState(AppState.CONTEXT_SELECT)} fullWidth>Open Mirror</Button>
              <Button variant="ghost" onClick={() => setAppState(AppState.HISTORY)} fullWidth>History</Button>
            </div>
          </div>
        )}

        {appState === AppState.CONTEXT_SELECT && (
          <div className="w-full glass-card p-10 rounded-[3rem] animate-slide-up">
            <h2 className="text-2xl font-serif-display text-white text-center mb-8 italic">Your Current Moment?</h2>
            <div className="grid gap-3">
              {['WAKING_UP', 'WORK', 'EVENING', 'BEFORE_SLEEP'].map(id => (
                <Button key={id} variant="secondary" onClick={() => { setContext(id as UserContext); setAppState(AppState.VISION_ANALYSIS); }} fullWidth>{id.replace('_', ' ').toLowerCase()}</Button>
              ))}
            </div>
          </div>
        )}

        {appState === AppState.VISION_ANALYSIS && <VisionMode context={context} onCapture={handleAnalysis} onCancel={() => setAppState(AppState.INTRO)} />}
        {appState === AppState.RESULT && insight && <InsightCard data={insight} onReset={() => setAppState(AppState.INTRO)} onChat={() => setAppState(AppState.CHAT)} onSanctuary={startSanctuary} />}
        {appState === AppState.HISTORY && <HistoryView onBack={() => setAppState(AppState.INTRO)} />}
        {appState === AppState.SETTINGS && <SettingsView onBack={() => setAppState(AppState.INTRO)} />}
        {appState === AppState.CHAT && insight && <ChatView insight={insight} onBack={() => setAppState(AppState.RESULT)} />}
      </main>
    </div>
  );
};

// Fixed error: Added missing default export
export default App;
