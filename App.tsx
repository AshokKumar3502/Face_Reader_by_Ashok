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

  useEffect(() => {
    setCurrentDay(getCurrentDay());
  }, [appState]);

  useEffect(() => {
    const checkNotification = () => {
      if (shouldSendNotification() && Notification.permission === 'granted') {
        new Notification("Kosha", {
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
      
      {/* Hyper-Saturated Ambient Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[100vw] h-[100vw] bg-fuchsia-600/30 rounded-full blur-[140px] animate-float mix-blend-screen opacity-60"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[100vw] h-[100vw] bg-cyan-500/30 rounded-full blur-[140px] animate-float-delayed mix-blend-screen opacity-60"></div>
         <div className="absolute top-[20%] left-[20%] w-[60vw] h-[60vw] bg-amber-400/20 rounded-full blur-[120px] animate-pulse-slow mix-blend-screen opacity-40"></div>
      </div>

      {/* --- UNIQUE LOADING STATE --- */}
      {appState === AppState.LOADING && <LoadingScreen />}

      {/* Header - Transparent High Visibility */}
      {!isUtilityView && appState !== AppState.LOADING && (
        <header className="absolute top-0 left-0 right-0 p-10 flex justify-between items-center z-40 animate-fade-in">
          <div className="flex items-center gap-4">
             <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_20px_white] animate-pulse"></div>
             <span className="font-serif-display tracking-[0.4em] text-white text-lg font-black drop-shadow-xl">KOSHA</span>
          </div>
          
          <div className="flex items-center gap-5">
             <button onClick={() => setAppState(AppState.SETTINGS)} className="w-12 h-12 rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur-xl flex items-center justify-center text-white hover:bg-white hover:text-black hover:scale-110 transition-all shadow-2xl">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                   <circle cx="12" cy="12" r="3"></circle>
                </svg>
             </button>
             <div className="text-[11px] text-black font-black uppercase tracking-widest bg-white px-6 py-2.5 rounded-2xl shadow-2xl">
               Level {currentDay}
             </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="z-10 w-full max-w-lg flex flex-col items-center gap-8 min-h-[60vh] justify-center transition-all duration-500">
        
        {/* Visualizer */}
        {(appState === AppState.INTRO || appState === AppState.CONTEXT_SELECT || appState === AppState.CHAT) && (
          <div className={`mb-10 animate-fade-in pointer-events-none transform transition-all duration-1000 ${appState === AppState.CHAT ? 'absolute top-10 opacity-20 scale-50' : ''}`}>
            <Visualizer state={getVisualizerState()} />
          </div>
        )}

        {/* --- INTRO --- */}
        {appState === AppState.INTRO && (
          <div className="text-center animate-slide-up space-y-12 w-full max-w-sm relative">
            <div>
              <h1 className="text-6xl md:text-7xl font-serif-display text-white mb-8 leading-none drop-shadow-2xl tracking-tighter">
                KOSHA.<br/><span className="bg-gradient-to-r from-fuchsia-400 via-white to-cyan-400 bg-clip-text text-transparent italic">Soul Mirror.</span>
              </h1>
              <p className="text-white text-xl font-medium drop-shadow-lg opacity-90">
                Decode the spectrum of your soul.
              </p>
            </div>
            
            <div className="space-y-6">
              <Button onClick={startJourney} className="px-12 w-full py-6 text-lg">
                Enter The Light
              </Button>
              <Button onClick={() => setAppState(AppState.HISTORY)} variant="ghost" className="w-full text-white/60 hover:text-white font-black uppercase tracking-widest text-xs">
                History of Truth
              </Button>
            </div>

            <div className="absolute -bottom-24 left-0 right-0">
               <p className="text-xs uppercase tracking-[0.4em] text-white/40 font-black">Developed by Ashok</p>
            </div>
          </div>
        )}

        {appState === AppState.HISTORY && <HistoryView onBack={() => setAppState(AppState.INTRO)} />}
        {appState === AppState.SETTINGS && <SettingsView onBack={() => setAppState(AppState.INTRO)} />}
        {appState === AppState.CHAT && insight && <ChatView insight={insight} onBack={() => setAppState(AppState.RESULT)} />}
        
        {appState === AppState.CONTEXT_SELECT && (
          <div className="w-full animate-slide-up bg-white/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 shadow-2xl">
            <h2 className="text-4xl font-serif-display text-center text-white mb-10 italic">
              Where are you?
            </h2>
            <div className="grid grid-cols-1 gap-5">
              {[
                {id: 'WAKING_UP', label: 'Wake up', color: 'hover:bg-amber-500/30'},
                {id: 'WORK', label: 'Work', color: 'hover:bg-cyan-500/30'},
                {id: 'EVENING', label: 'Evening', color: 'hover:bg-rose-500/30'},
                {id: 'BEFORE_SLEEP', label: 'Going to sleep', color: 'hover:bg-indigo-500/30'}
              ].map(item => (
                <Button 
                  key={item.id}
                  variant="secondary" 
                  onClick={() => handleContextSelect(item.id as UserContext)} 
                  className={`py-6 text-xl font-serif-display italic border-white/5 ${item.color}`}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {appState === AppState.VISION_ANALYSIS && (
          <VisionMode 
            context={context}
            onCapture={handleAnalysis} 
            onCancel={() => setAppState(AppState.CONTEXT_SELECT)}
          />
        )}

        {appState === AppState.RESULT && insight && (
          <InsightCard 
            data={insight} 
            onReset={() => setAppState(AppState.INTRO)} 
            onChat={() => setAppState(AppState.CHAT)}
          />
        )}

        {appState === AppState.ERROR && (
          <div className="text-center p-10 glass-card rounded-[3rem] border border-red-500/40 animate-slide-up">
            <div className="text-6xl mb-6">💥</div>
            <h3 className="text-white font-serif-display text-2xl mb-4">Signal Lost</h3>
            <p className="text-white/70 mb-10 text-base">
              The chromatic bridge collapsed.<br/>Reconnect your light.
            </p>
            <Button onClick={() => setAppState(AppState.CONTEXT_SELECT)} variant="primary" className="w-full">
              Try Reconnecting
            </Button>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;