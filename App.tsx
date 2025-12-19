
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
import { saveEntry, getCurrentDay, shouldSendNotification, markNotificationSent } from './services/storageService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INTRO);
  const [insight, setInsight] = useState<InsightData | null>(null);
  const [context, setContext] = useState<UserContext>('WAKING_UP');
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [errorType, setErrorType] = useState<'AUTH' | 'GENERAL' | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    setCurrentDay(getCurrentDay());
  }, [appState]);

  useEffect(() => {
    const checkNotification = () => {
      if (shouldSendNotification() && Notification.permission === 'granted') {
        new Notification("Kosha", {
          body: "It is time to check in with yourself.",
          icon: "/favicon.ico"
        });
        markNotificationSent();
      }
    };
    checkNotification();
    const interval = setInterval(checkNotification, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAnalysis = async (base64Image: string, manualDayNumber?: number) => {
    setAppState(AppState.LOADING);
    setErrorType(null);
    setErrorDetails(null);
    try {
      const data = await analyzeInput(base64Image, context);
      setInsight(data);
      
      // ONLY save to history if it's a real human face
      if (data.isHuman) {
        saveEntry(context, data, base64Image, manualDayNumber);
      }
      
      setAppState(AppState.RESULT);
    } catch (error: any) {
      console.error("Application Error:", error);
      if (error.message === 'AUTH_ERROR') {
        setErrorType('AUTH');
        setErrorDetails("The connection to Google AI was rejected. Please verify your API Key in Settings.");
      } else {
        setErrorType('GENERAL');
        setErrorDetails(error.message || "Unknown Connection Failure");
      }
      setAppState(AppState.ERROR);
    }
  };

  const handleFixConnection = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      await aistudio.openSelectKey();
      setAppState(AppState.CONTEXT_SELECT);
    } else {
      setAppState(AppState.SETTINGS);
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[100vw] h-[100vw] bg-fuchsia-600/30 rounded-full blur-[140px] animate-float opacity-60"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[100vw] h-[100vw] bg-cyan-500/30 rounded-full blur-[140px] animate-float-delayed opacity-60"></div>
      </div>

      {appState === AppState.LOADING && <LoadingScreen />}

      {!isUtilityView && appState !== AppState.LOADING && (
        <header className="absolute top-0 left-0 right-0 p-6 sm:p-8 md:p-10 flex justify-between items-center z-40">
          <div className="flex items-center gap-3">
             <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_15px_white] animate-pulse"></div>
             <div className="flex flex-col">
                <span className="font-serif-display text-white text-lg font-black tracking-widest">KOSHA</span>
                <span className="text-[8px] text-white/40 font-black uppercase tracking-widest -mt-1">Self Understanding</span>
             </div>
          </div>
          <button onClick={() => setAppState(AppState.SETTINGS)} className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
        </header>
      )}

      <main className="z-10 w-full max-w-lg flex flex-col items-center justify-center py-16">
        
        {(appState === AppState.INTRO || appState === AppState.CONTEXT_SELECT || appState === AppState.CHAT) && (
          <div className={`mb-10 ${appState === AppState.CHAT ? 'opacity-0 scale-50 pointer-events-none' : ''}`}>
            <Visualizer state={getVisualizerState()} />
          </div>
        )}

        {appState === AppState.INTRO && (
          <div className="text-center animate-slide-up space-y-12">
            <div>
              <h1 className="text-5xl sm:text-7xl font-serif-display text-white mb-6 tracking-tighter italic">KOSHA.</h1>
              <p className="text-white/80 text-lg font-medium">The mirror to your inner world.</p>
            </div>
            <div className="space-y-4 px-4">
              <Button onClick={() => setAppState(AppState.CONTEXT_SELECT)} className="w-full py-6">Start Reflection</Button>
              <Button onClick={() => setAppState(AppState.HISTORY)} variant="ghost" className="w-full text-white/50">History</Button>
            </div>
          </div>
        )}

        {appState === AppState.CONTEXT_SELECT && (
          <div className="w-full animate-slide-up bg-white/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10">
            <h2 className="text-3xl font-serif-display text-center text-white mb-10 italic">Your Current Moment?</h2>
            <div className="grid grid-cols-1 gap-4">
              {['WAKING_UP', 'WORK', 'EVENING', 'BEFORE_SLEEP'].map(id => (
                <Button key={id} variant="secondary" onClick={() => {setContext(id as UserContext); setAppState(AppState.VISION_ANALYSIS)}} className="py-5 capitalize">
                  {id.replace('_', ' ').toLowerCase()}
                </Button>
              ))}
            </div>
            <button onClick={() => setAppState(AppState.INTRO)} className="w-full text-center mt-8 text-white/30 text-xs uppercase tracking-widest">Cancel</button>
          </div>
        )}

        {appState === AppState.VISION_ANALYSIS && (
          <VisionMode context={context} onCapture={handleAnalysis} onCancel={() => setAppState(AppState.CONTEXT_SELECT)} />
        )}

        {appState === AppState.RESULT && insight && (
          <InsightCard data={insight} onReset={() => setAppState(AppState.INTRO)} onChat={() => (insight.isHuman ? setAppState(AppState.CHAT) : undefined)} />
        )}

        {appState === AppState.HISTORY && <HistoryView onBack={() => setAppState(AppState.INTRO)} />}
        {appState === AppState.SETTINGS && <SettingsView onBack={() => setAppState(AppState.INTRO)} />}
        {appState === AppState.CHAT && insight && <ChatView insight={insight} onBack={() => setAppState(AppState.RESULT)} />}

        {appState === AppState.ERROR && (
          <div className="text-center p-10 glass-card rounded-[3rem] border border-red-500/40 animate-slide-up mx-2 w-full max-w-sm">
            <div className="text-6xl mb-6">{errorType === 'AUTH' ? '🔑' : '⚠️'}</div>
            <h3 className="text-white font-serif-display text-2xl mb-4 italic">
              {errorType === 'AUTH' ? 'Connection Blocked' : 'Signal Distorted'}
            </h3>
            <p className="text-white/60 mb-10 text-xs uppercase tracking-widest font-bold bg-red-500/10 p-4 rounded-xl border border-red-500/20">
               {errorDetails || "Unknown Connection Failure"}
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={handleFixConnection} variant="primary" className="w-full">
                {errorType === 'AUTH' ? 'Relink API Key' : 'Try Again'}
              </Button>
              <Button onClick={() => setAppState(AppState.SETTINGS)} variant="secondary" className="w-full">Open Settings</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
