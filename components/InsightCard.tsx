
import React, { useState, useRef } from 'react';
import { InsightData, Language } from '../types';
import { Button } from './Button';
import { translateInsight } from '../services/geminiService';

interface InsightCardProps {
  data: InsightData;
  onReset: () => void;
  onChat?: () => void;
  onSanctuary?: () => void;
  readonly?: boolean;
}

type ViewMode = 'soul' | 'mind' | 'guidance';

export const InsightCard: React.FC<InsightCardProps> = ({ data, onReset, onChat, onSanctuary, readonly = false }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('soul');
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Translation Cache: Makes language switching INSTANT after the first fetch
  const translationCache = useRef<Record<string, InsightData>>({ en: data });
  const [displayData, setDisplayData] = useState<InsightData>(data);

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'te', label: 'Telugu (వాడుక)' },
    { code: 'hi', label: 'Hindi' },
    { code: 'ta', label: 'Tamil' },
    { code: 'kn', label: 'Kannada' },
  ];

  const handleLanguageChange = async (lang: Language) => {
    if (lang === currentLang || isTranslating) return;

    // Use cached data for instant switching
    if (translationCache.current[lang]) {
      setDisplayData(translationCache.current[lang]);
      setCurrentLang(lang);
      return;
    }

    setIsTranslating(true);
    try {
      const translated = await translateInsight(data, lang);
      translationCache.current[lang] = translated;
      setDisplayData(translated);
      setCurrentLang(lang);
    } catch (e) {
      console.error("Localization Error", e);
    } finally { 
      setIsTranslating(false); 
    }
  };

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

  if (displayData.isHuman === false) {
    return (
      <div className="w-full max-w-lg animate-slide-up px-2 sm:px-0 pb-8">
        <div className="relative overflow-hidden glass-card rounded-[3rem] p-12 text-center border-amber-500/20 shadow-xl">
          <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">⚠️</div>
          <h1 className="text-2xl font-serif-display italic text-white mb-6">Vision Obscured</h1>
          <p className="text-zinc-400 text-sm italic mb-10 leading-relaxed">{displayData.simpleExplanation || "I couldn't detect a clear human signature. Please retry with better lighting or a clearer angle."}</p>
          <Button onClick={onReset} fullWidth className="bg-amber-600 shadow-amber-500/20">Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg animate-slide-up px-2 sm:px-0 pb-12 relative">
      <div className="absolute inset-0 pointer-events-none opacity-50 blur-[120px] z-0" style={auraStyle}></div>

      {/* Language Bridge Selection */}
      <div className="relative z-30 flex justify-center gap-2 mb-6 overflow-x-auto no-scrollbar py-2 px-1">
        {languages.map((l) => (
          <button
            key={l.code}
            onClick={() => handleLanguageChange(l.code)}
            disabled={isTranslating}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${
              currentLang === l.code 
                ? 'bg-white text-black border-white shadow-[0_10px_20px_-5px_rgba(255,255,255,0.4)] scale-105' 
                : 'bg-black/20 text-white/50 border-white/10 hover:border-white/30 hover:text-white'
            } ${isTranslating && currentLang !== l.code ? 'opacity-30 grayscale' : 'active:scale-95'}`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="relative overflow-hidden glass-card rounded-[3rem] p-1 shadow-2xl z-10 transition-all duration-700">
        {isTranslating && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center rounded-[2.9rem] animate-fade-in">
             <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4 shadow-[0_0_15px_white]"></div>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Synthesizing {languages.find(l => l.code === currentLang)?.label}...</p>
          </div>
        )}
        
        <div className="bg-black/40 rounded-[2.9rem] p-8 sm:p-12 backdrop-blur-3xl border border-white/5">
          <div className="mb-10 text-center">
            <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-4">Core Signal</h2>
            <h1 className="text-3xl sm:text-4xl font-serif-display italic text-white leading-tight drop-shadow-2xl">"{displayData.psychProfile}"</h1>
          </div>

          <div className="mb-8 flex gap-2">
             <button onClick={() => setViewMode('soul')} className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border ${viewMode === 'soul' ? 'bg-white/10 text-white border-white/20 shadow-inner' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}>Soul</button>
             <button onClick={() => setViewMode('mind')} className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border ${viewMode === 'mind' ? 'bg-white/10 text-white border-white/20 shadow-inner' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}>Mind</button>
             <button onClick={() => setViewMode('guidance')} className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border ${viewMode === 'guidance' ? 'bg-white/10 text-white border-white/20 shadow-inner' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}>Guidance</button>
          </div>

          <div className="mb-10 min-h-[220px]">
            {viewMode === 'soul' && (
              <div className="space-y-6 animate-fade-in">
                <VitalBar label="Stress Intensity" value={displayData.vitals.stress} colorClass="bg-gradient-to-r from-rose-600 to-rose-400"/>
                <VitalBar label="Inner Equilibrium" value={displayData.vitals.calmness} colorClass="bg-gradient-to-r from-emerald-500 to-teal-400"/>
                <VitalBar label="Emotional Burnout" value={displayData.vitals.fatigue} colorClass="bg-gradient-to-r from-indigo-500 to-violet-400"/>
              </div>
            )}
            {viewMode === 'guidance' && (
              <div className="space-y-4 animate-fade-in">
                {displayData.behavioralProtocols.map((p, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 rounded-[2rem] p-6 hover:bg-white/10 transition-colors">
                    <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-emerald-400"></span> {p.title}
                    </h5>
                    <p className="text-zinc-300 text-xs italic leading-relaxed font-medium">{p.instruction}</p>
                    {p.type === 'BREATH' && onSanctuary && (
                       <button onClick={onSanctuary} className="mt-5 w-full py-4 bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-[0.3em] rounded-2xl border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-all shadow-lg active:scale-95">Enter Sanctuary</button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {viewMode === 'mind' && (
              <div className="space-y-6 animate-fade-in">
                <VitalBar label="Neural Focus" value={displayData.cognitive.focus} colorClass="bg-gradient-to-r from-cyan-500 to-blue-400"/>
                <VitalBar label="Cognitive Alertness" value={displayData.cognitive.alertness} colorClass="bg-gradient-to-r from-amber-400 to-orange-500"/>
                <VitalBar label="Thought Overload" value={displayData.cognitive.overthinking} colorClass="bg-gradient-to-r from-purple-500 to-fuchsia-400"/>
              </div>
            )}
          </div>

          <div className="mb-2 p-8 bg-amber-500/5 border border-amber-500/20 rounded-[2.5rem] shadow-2xl relative group overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -z-10 group-hover:bg-amber-500/10 transition-all"></div>
             <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-4">Hidden Realization</div>
             <p className="text-white text-lg sm:text-2xl italic leading-relaxed font-semibold tracking-tight">"{displayData.hiddenRealization}"</p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 px-4 sm:px-0 relative z-20">
        {onChat && !readonly && (
          <Button onClick={onChat} fullWidth className="bg-white text-black py-6 text-[11px] shadow-[0_20px_40px_-10px_rgba(255,255,255,0.3)] hover:scale-[1.02]">
             Talk to Kosha
          </Button>
        )}
        <Button onClick={onReset} variant="secondary" fullWidth className="py-4 font-black uppercase tracking-[0.3em] opacity-40 hover:opacity-100 border-white/5">
          End Session
        </Button>
      </div>
    </div>
  );
};
