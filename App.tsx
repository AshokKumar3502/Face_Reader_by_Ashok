import React, { useState, useEffect } from 'react';
import { Visualizer } from './components/Visualizer';
import { Button } from './components/Button';
import { VisionMode } from './components/VisionMode';
import { InsightCard } from './components/InsightCard';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { ChatView } from './components/ChatView';
import { AppState, InsightData, UserContext } from './types';
import { analyzeInput } from './services/geminiService';
import { saveEntry, getCurrentDay, shouldSendNotification, markNotificationSent } from './services/storageService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INTRO);
  const [insight, setInsight] = useState<InsightData | null>(null);
  const [context, setContext] = useState<UserContext>('WAKING_UP');
  const [currentDay, setCurrentDay] = useState<number>(1);

  useEffect(() => {
    setCurrentDay(getCurrentDay());
  }, [appState]);

  useEffect(() => {
    const checkNotification = () => {
      if (shouldSendNotification() && Notification.permission === 'granted') {
        new Notification("Serene", {
          body: "It is time to check in with yourself. How are you feeling right now?",
          icon: "/favicon.ico"
        });
        markNotificationSent();
      }
    };
    checkNotification();
    const interval = setInterval(checkNotification, 60000);
    return () => clearInterval(interval);
  }, []);

  const startJourney = () => {
    setAppState(AppState.CONTEXT_SELECT);
  };

  const handleContextSelect = (ctx: UserContext) => {
    setContext(ctx);
    setAppState(AppState.VISION_ANALYSIS);
  };

  const handleAnalysis = async (base64Image: string, manualDayNumber?: number) => {
    setAppState(AppState.LOADING);
    try {
      const data = await analyzeInput(base64Image, context);
      setInsight(data);
      saveEntry(context, data, base64Image, manualDayNumber);
      setAppState(AppState.RESULT);
    } catch (error) {
      console.error(error);
      setAppState(AppState.ERROR);
    }
  };

  const getVisualizerState = () => {
    switch (appState) {
      case AppState.INTRO: return 'idle';
      case AppState.CONTEXT_SELECT: return 'waiting';
      case AppState.VISION_ANALYSIS: return 'peaceful';
      case AppState.LOADING: return 'analyzing';
      case AppState.RESULT: return 'peaceful';
      case AppState.CHAT: return 'waiting';
      default: return 'idle';
    }
  };

  const isUtilityView = appState === AppState.HISTORY || appState === AppState.SETTINGS;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Living Background Blobs - Professional & Dynamic */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         {/* Brighter, more vibrant colors */}
         <div className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] bg-indigo-500/40 rounded-full blur-[120px] animate-float mix-blend-screen"></div>
         <div className="absolute bottom-[-20%] right-[-20%] w-[80vw] h-[80vw] bg-teal-400/30 rounded-full blur-[120px] animate-float-delayed mix-blend-screen"></div>
         <div className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] bg-fuchsia-600/20 rounded-full blur-[100px] animate-pulse-slow mix-blend-screen"></div>
      </div>

      {/* Header - Glassmorphism */}
      {!isUtilityView && (
        <header className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center z-40 animate-fade-in">
          <div className="flex items-center gap-3">
             <div className="w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.9)] animate-pulse"></div>
             <span className="font-serif-display tracking-[0.2em] text-white text-sm font-bold drop-shadow-md">SERENE</span>
          </div>
          
          <div className="flex items-center gap-4">
             <button onClick={() => setAppState(AppState.SETTINGS)} className="w-10 h-10 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-zinc-100 hover:text-white hover:bg-white/20 hover:scale-105 transition-all shadow-lg backdrop-blur-md">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                   <circle cx="12" cy="12" r="3"></circle>
                </svg>
             </button>
             <div className="text-[10px] text-white font-bold uppercase tracking-widest border border-white/20 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md shadow-lg ring-1 ring-white/10">
               Day {currentDay}
             </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="z-10 w-full max-w-lg flex flex-col items-center gap-8 min-h-[60vh] justify-center transition-all duration-500">
        
        {/* Visualizer - The Heart of the UI */}
        {(appState === AppState.INTRO || appState === AppState.LOADING || appState === AppState.CONTEXT_SELECT || appState === AppState.CHAT) && (
          <div className={`mb-6 animate-fade-in pointer-events-none transform transition-all duration-700 ${appState === AppState.CHAT ? 'absolute top-20 opacity-30 scale-50' : ''}`}>
            <Visualizer state={getVisualizerState()} />
          </div>
        )}

        {/* --- INTRO --- */}
        {appState === AppState.INTRO && (
          <div className="text-center animate-slide-up space-y-12 w-full max-w-sm">
            <div>
              <h1 className="text-5xl md:text-6xl font-serif-display text-white mb-6 leading-tight drop-shadow-2xl tracking-tight">
                Know<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-indigo-300">Yourself.</span>
              </h1>
              <p className="text-zinc-300 max-w-xs mx-auto text-lg leading-relaxed font-light drop-shadow-md">
                The mirror that sees your quiet truths.
              </p>
            </div>
            
            <div className="space-y-5">
              <Button onClick={startJourney} className="px-12 w-full shadow-teal-500/20 py-5 text-base">
                Start Check-in
              </Button>
              <Button onClick={() => setAppState(AppState.HISTORY)} variant="ghost" className="w-full text-zinc-400 hover:text-white">
                Open Journal
              </Button>
            </div>
          </div>
        )}

        {/* --- STATE: HISTORY --- */}
        {appState === AppState.HISTORY && (
          <HistoryView onBack={() => setAppState(AppState.INTRO)} />
        )}

        {/* --- STATE: SETTINGS --- */}
        {appState === AppState.SETTINGS && (
          <SettingsView onBack={() => setAppState(AppState.INTRO)} />
        )}

        {/* --- STATE: CHAT --- */}
        {appState === AppState.CHAT && insight && (
          <ChatView insight={insight} onBack={() => setAppState(AppState.RESULT)} />
        )}

        {/* --- STATE: CONTEXT SELECT --- */}
        {appState === AppState.CONTEXT_SELECT && (
          <div className="w-full animate-slide-up">
            <h2 className="text-3xl font-serif-display text-center text-white mb-10 drop-shadow-lg">
              Current Moment
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <Button variant="secondary" onClick={() => handleContextSelect('WAKING_UP')} className="py-6 text-lg border-white/10 hover:border-teal-400/50 hover:bg-teal-900/20">
                Morning Quiet
              </Button>
              <Button variant="secondary" onClick={() => handleContextSelect('WORK')} className="py-6 text-lg border-white/10 hover:border-indigo-400/50 hover:bg-indigo-900/20">
                Work Flow
              </Button>
              <Button variant="secondary" onClick={() => handleContextSelect('FAMILY')} className="py-6 text-lg border-white/10 hover:border-rose-400/50 hover:bg-rose-900/20">
                Family Time
              </Button>
              <Button variant="secondary" onClick={() => handleContextSelect('SOCIAL')} className="py-6 text-lg border-white/10 hover:border-amber-400/50 hover:bg-amber-900/20">
                Social Energy
              </Button>
              <Button variant="secondary" onClick={() => handleContextSelect('BEFORE_SLEEP')} className="py-6 text-lg border-white/10 hover:border-purple-400/50 hover:bg-purple-900/20">
                Evening Rest
              </Button>
            </div>
            <button 
              onClick={() => setAppState(AppState.INTRO)}
              className="w-full text-center mt-8 text-zinc-500 text-xs uppercase tracking-widest hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* --- STATE: CAMERA --- */}
        {appState === AppState.VISION_ANALYSIS && (
          <VisionMode 
            context={context}
            onCapture={handleAnalysis} 
            onCancel={() => setAppState(AppState.CONTEXT_SELECT)}
          />
        )}

        {/* --- STATE: LOADING --- */}
        {appState === AppState.LOADING && (
          <div className="text-center space-y-4 animate-fade-in">
            <p className="text-xs uppercase tracking-[0.3em] text-white font-bold animate-pulse drop-shadow-glow">
              Connecting to Serene AI...
            </p>
          </div>
        )}

        {/* --- STATE: RESULT --- */}
        {appState === AppState.RESULT && insight && (
          <InsightCard 
            data={insight} 
            onReset={() => setAppState(AppState.INTRO)} 
            onChat={() => setAppState(AppState.CHAT)}
          />
        )}

        {/* --- STATE: ERROR --- */}
        {appState === AppState.ERROR && (
          <div className="text-center p-10 bg-zinc-900/80 backdrop-blur-xl rounded-[2rem] border border-red-500/20 shadow-2xl animate-slide-up">
            <div className="text-4xl mb-4">🌪️</div>
            <h3 className="text-white font-serif-display text-xl mb-2">Connection Interrupted</h3>
            <p className="text-zinc-400 mb-8 text-sm leading-relaxed">
              We couldn't reach the analysis engine.<br/>Please check your internet connection.
            </p>
            <Button onClick={() => setAppState(AppState.CONTEXT_SELECT)} variant="secondary" className="w-full">
              Try Again
            </Button>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;