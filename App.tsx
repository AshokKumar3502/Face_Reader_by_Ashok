
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
              <button onClick={() => setAppState(AppState.HISTORY)} className="mt-8 text-zinc-600 hover:text-zinc-300 text-[10px] font-bold uppercase tracking-[0.4em] transition-colors">See Past Growth</button>
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
