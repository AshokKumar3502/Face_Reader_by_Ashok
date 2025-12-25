
import React, { useState } from 'react';
import { InsightData, BehavioralProtocol, Language } from '../types';
import { Button } from './Button';
import { translateInsight } from '../services/geminiService';

interface InsightCardProps {
  data: InsightData;
  onReset: () => void;
  onChat?: () => void;
  onSanctuary?: () => void;
  readonly?: boolean;
}

type ViewMode = 'soul' | 'mind' | 'triggers' | 'guidance';

export const InsightCard: React.FC<InsightCardProps> = ({ data, onReset, onChat, onSanctuary, readonly = false }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('soul');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [displayData, setDisplayData] = useState<InsightData>(data);
  const [isTranslating, setIsTranslating] = useState(false);

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
  ];

  const handleLanguageChange = async (lang: Language) => {
    if (lang === currentLang || isTranslating) return;
    
    if (lang === 'en') {
      setDisplayData(data);
      setCurrentLang('en');
      return;
    }

    setIsTranslating(true);
    try {
      const translated = await translateInsight(data, lang);
      setDisplayData(translated);
      setCurrentLang(lang);
    } catch (e) {
      console.error("Translation failed", e);
    } finally {
      setIsTranslating(false);
    }
  };

  // Generative Aura background style
  const auraStyle = {
    background: displayData.auraColors ? `radial-gradient(at 0% 0%, ${displayData.auraColors[0]} 0, transparent 50%), 
                 radial-gradient(at 100% 100%, ${displayData.auraColors[1]} 0, transparent 50%),
                 radial-gradient(at 50% 50%, ${displayData.auraColors[2]}22 0, transparent 100%)` : 'transparent'
  };

  const VitalBar = ({ label, value, colorClass }: { label: string, value: number, colorClass: string }) => (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] uppercase tracking-widest font-black">
        <span className="text-white/60">{label}</span>
        <span className="text-white">{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
        <div className={`h-full transition-all duration-1000 ease-out ${colorClass}`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );

  const getModeLabel = (mode: ViewMode) => {
    switch(mode) {
      case 'soul': return currentLang === 'en' ? 'Your feelings' : 'भावनाएं';
      case 'mind': return currentLang === 'en' ? 'Your energy level' : 'ऊर्जा स्तर';
      case 'triggers': return currentLang === 'en' ? 'Why you feel this way' : 'कारण';
      case 'guidance': return currentLang === 'en' ? 'Daily plan' : 'दैनिक योजना';
    }
  };

  if (displayData.isHuman === false) {
    return (
      <div className="w-full max-w-lg animate-slide-up px-2 sm:px-0 pb-8">
        <div className="relative overflow-hidden glass-card rounded-[3rem] p-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-serif-display italic text-white mb-6">"Vision Obscured"</h1>
          <p className="text-zinc-400 text-sm italic mb-8">{displayData.simpleExplanation}</p>
          <Button onClick={onReset} variant="secondary" fullWidth>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg animate-slide-up px-2 sm:px-0 pb-8 relative">
      {/* GENERIC AURA OVERLAY */}
      <div className="absolute inset-0 pointer-events-none opacity-40 blur-[100px] z-0" style={auraStyle}></div>

      {/* Language Selector Bridge */}
      <div className="relative z-30 flex justify-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            disabled={isTranslating}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
              currentLang === lang.code 
                ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]' 
                : 'bg-white/5 text-white/50 border-white/10 hover:border-white/30'
            } ${isTranslating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isTranslating && currentLang !== lang.code && currentLang === 'en' ? '...' : lang.label}
          </button>
        ))}
      </div>

      <div className="relative overflow-hidden glass-card rounded-3xl sm:rounded-[3rem] p-1 shadow-2xl z-10 transition-all duration-500">
        {isTranslating && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center rounded-[2.9rem] animate-fade-in">
             <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Synthesizing {languages.find(l => l.code === currentLang)?.label}...</p>
          </div>
        )}
        
        <div className="bg-black/40 rounded-[1.4rem] sm:rounded-[2.9rem] p-6 sm:p-10 backdrop-blur-3xl">
          
          <div className="mb-6 text-center">
            <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Your Soul Vibe</h2>
            <h1 className="text-2xl sm:text-4xl font-serif-display italic text-white leading-tight drop-shadow-2xl">"{displayData.psychProfile}"</h1>
          </div>

          <div className="mb-8 relative z-20">
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 flex items-center justify-between transition-all">
               <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{getModeLabel(viewMode)}</span>
               <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={isDropdownOpen ? 'rotate-180' : ''}><path d="M2 4L6 8L10 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50">
                 {(['soul', 'mind', 'triggers', 'guidance'] as ViewMode[]).map(mode => (
                    <button key={mode} onClick={() => { setViewMode(mode); setIsDropdownOpen(false); }} className={`w-full text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 ${viewMode === mode ? 'bg-white/10 text-white' : 'text-zinc-500'}`}>
                      {getModeLabel(mode)}
                    </button>
                 ))}
              </div>
            )}
          </div>

          <div className="mb-8 min-h-[200px]">
            {viewMode === 'soul' && <div className="space-y-5 animate-fade-in"><VitalBar label="Stress" value={displayData.vitals.stress} colorClass="bg-red-500"/><VitalBar label="Peace" value={displayData.vitals.calmness} colorClass="bg-teal-400"/></div>}
            {viewMode === 'guidance' && (
              <div className="space-y-4 animate-fade-in">
                {displayData.behavioralProtocols.map((protocol, i) => (
                  <div key={i} className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5">
                    <h5 className="text-xs font-black text-emerald-300 uppercase tracking-widest mb-1">{protocol.title}</h5>
                    <p className="text-white text-xs leading-relaxed">{protocol.instruction}</p>
                    {protocol.type === 'BREATH' && onSanctuary && (
                       <button onClick={onSanctuary} className="mt-4 w-full py-3 bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-all">Start Sanctuary Session</button>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {viewMode === 'triggers' && (
              <div className="space-y-4 animate-fade-in">
                {displayData.stressTriggers.map((trigger, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4">
                    <div className="flex justify-between items-center mb-2">
                       <h5 className="text-[10px] font-black text-white uppercase tracking-widest">{trigger.type}</h5>
                       <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${trigger.impact === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                         {trigger.impact}
                       </span>
                    </div>
                    <p className="text-zinc-400 text-xs italic leading-relaxed">{trigger.description}</p>
                  </div>
                ))}
              </div>
            )}

            {viewMode === 'mind' && (
              <div className="space-y-5 animate-fade-in">
                <VitalBar label="Focus" value={displayData.cognitive.focus} colorClass="bg-cyan-400"/>
                <VitalBar label="Burnout Risk" value={displayData.cognitive.burnout} colorClass="bg-rose-400"/>
              </div>
            )}
          </div>

          <div className="mb-8 p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl relative">
             <div className="absolute -top-3 left-6 px-3 py-1 bg-indigo-500 rounded-full text-[8px] font-black text-white uppercase tracking-[0.2em] shadow-lg">Observation</div>
             <p className="text-zinc-300 text-xs italic leading-relaxed font-medium">{displayData.neuralEvidence}</p>
          </div>

          <div className="mb-8 p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
             <div className="text-[8px] font-black text-amber-500 uppercase tracking-[0.2em] mb-2">The Hidden Truth</div>
             <p className="text-white text-base italic leading-relaxed font-semibold">{displayData.hiddenRealization}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {onChat && <Button onClick={onChat} fullWidth className="bg-white text-black py-5">Talk to your Assistant</Button>}
        <Button onClick={onReset} variant="secondary" fullWidth>Finish Session</Button>
      </div>
    </div>
  );
};
