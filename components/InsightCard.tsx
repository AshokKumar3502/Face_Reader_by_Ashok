
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

  const languages: { code: Language; label: string; name: string }[] = [
    { code: 'en', label: 'English', name: 'English' },
    { code: 'hi', label: 'हिन्दी', name: 'Hindi' },
    { code: 'te', label: 'తెలుగు', name: 'Telugu' },
    { code: 'ta', label: 'தமிழ்', name: 'Tamil' },
    { code: 'kn', label: 'ಕನ್ನಡ', name: 'Kannada' },
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
      alert("Translation currently unavailable. Please try again later.");
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

  const getModeLabel = (mode: ViewMode) => {
    switch(mode) {
      case 'soul': return currentLang === 'en' ? 'Your feelings' : (currentLang === 'hi' ? 'भावनाएं' : (currentLang === 'te' ? 'అనుభూతులు' : (currentLang === 'ta' ? 'உணர்வுகள்' : 'ಭಾವನೆಗಳು')));
      case 'mind': return currentLang === 'en' ? 'Your energy level' : (currentLang === 'hi' ? 'ऊर्जा स्तर' : (currentLang === 'te' ? 'శక్తి స్థాయి' : (currentLang === 'ta' ? 'ஆற்றல் நிலை' : 'ಶಕ್ತಿ ಮಟ್ಟ')));
      case 'triggers': return currentLang === 'en' ? 'Why you feel this way' : (currentLang === 'hi' ? 'कारण' : (currentLang === 'te' ? 'కారణాలు' : (currentLang === 'ta' ? 'காரணங்கள்' : 'ಕಾರಣಗಳು')));
      case 'guidance': return currentLang === 'en' ? 'Daily plan' : (currentLang === 'hi' ? 'दैनिक योजना' : (currentLang === 'te' ? 'రోజువారీ ప్రణాళిక' : (currentLang === 'ta' ? 'தினசரி திட்டம்' : 'ದಿನಚರಿ')));
    }
  };

  if (displayData.isHuman === false) {
    return (
      <div className="w-full max-w-lg animate-slide-up px-2 sm:px-0 pb-8">
        <div className="relative overflow-hidden glass-card rounded-[3rem] p-12 text-center border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.1)]">
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-8 text-3xl animate-pulse">📵</div>
          <h1 className="text-2xl sm:text-3xl font-serif-display italic text-white mb-6">"Vision Obscured"</h1>
          <p className="text-zinc-400 text-sm italic mb-10 leading-relaxed">
            {displayData.simpleExplanation || "I see shadows or an object, but no soul to mirror. Ensure you are in good light and looking directly at the lens."}
          </p>
          <div className="flex flex-col gap-3">
             <Button onClick={onReset} variant="primary" fullWidth className="py-5 font-black uppercase tracking-widest bg-amber-600 hover:bg-amber-500 border-amber-400/30">Retry Analysis</Button>
             <Button onClick={onReset} variant="secondary" fullWidth className="py-4 opacity-60">Back to Start</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg animate-slide-up px-2 sm:px-0 pb-12 relative">
      <div className="absolute inset-0 pointer-events-none opacity-50 blur-[120px] z-0" style={auraStyle}></div>

      {/* Language Bridge UI */}
      <div className="relative z-30 flex justify-center gap-2 mb-8 overflow-x-auto no-scrollbar py-2 px-1">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            disabled={isTranslating}
            className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border ${
              currentLang === lang.code 
                ? 'bg-white text-black border-white shadow-[0_10px_20px_-5px_rgba(255,255,255,0.4)] scale-105' 
                : 'bg-black/20 text-white/50 border-white/10 hover:border-white/40 backdrop-blur-md'
            } ${isTranslating ? 'opacity-30 cursor-not-allowed' : 'active:scale-95'}`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      <div className="relative overflow-hidden glass-card rounded-[3rem] p-1 shadow-2xl z-10 transition-all duration-700">
        {isTranslating && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center rounded-[2.9rem] animate-fade-in">
             <div className="w-10 h-10 border-[3px] border-white/20 border-t-white rounded-full animate-spin mb-6 shadow-[0_0_20px_white]"></div>
             <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white/90">Localizing Soul-Signal...</p>
             <p className="text-[9px] text-white/40 mt-2 uppercase tracking-widest">{languages.find(l => l.code === currentLang)?.name} Logic Engaged</p>
          </div>
        )}
        
        <div className="bg-black/40 rounded-[2.9rem] p-8 sm:p-12 backdrop-blur-3xl border border-white/5">
          
          <div className="mb-10 text-center">
            <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-6 drop-shadow-sm">Current Pattern</h2>
            <h1 className="text-3xl sm:text-5xl font-serif-display italic text-white leading-tight tracking-tight drop-shadow-2xl">
              "{displayData.psychProfile}"
            </h1>
          </div>

          <div className="mb-10 relative z-20">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl px-7 py-5 flex items-center justify-between transition-all group"
            >
               <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    viewMode === 'soul' ? 'bg-fuchsia-400 shadow-[0_0_10px_#e879f9]' : 
                    viewMode === 'mind' ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : 
                    viewMode === 'triggers' ? 'bg-rose-400 shadow-[0_0_10px_#fb7185]' : 'bg-emerald-400 shadow-[0_0_10px_#34d399]'}`}></div>
                  <span className="text-[11px] font-black text-white uppercase tracking-[0.25em]">{getModeLabel(viewMode)}</span>
               </div>
               <svg width="14" height="14" viewBox="0 0 12 12" fill="none" className={`transition-transform duration-500 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                  <path d="M2 4L6 8L10 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-zinc-900/95 border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-50 backdrop-blur-3xl animate-fade-in">
                 {(['soul', 'mind', 'triggers', 'guidance'] as ViewMode[]).map(mode => (
                    <button key={mode} onClick={() => { setViewMode(mode); setIsDropdownOpen(false); }} className={`w-full text-left px-8 py-5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors ${viewMode === mode ? 'bg-white/20 text-white' : 'text-zinc-500'}`}>
                      {mode}
                    </button>
                 ))}
              </div>
            )}
          </div>

          <div className="mb-10 min-h-[220px]">
            {viewMode === 'soul' && (
              <div className="space-y-6 animate-fade-in">
                <VitalBar label="Stress Intensity" value={displayData.vitals.stress} colorClass="bg-gradient-to-r from-rose-600 to-rose-400"/>
                <VitalBar label="Inner Equilibrium" value={displayData.vitals.calmness} colorClass="bg-gradient-to-r from-teal-500 to-emerald-400"/>
                <VitalBar label="Emotional Burnout" value={displayData.vitals.fatigue} colorClass="bg-gradient-to-r from-indigo-500 to-violet-400"/>
              </div>
            )}
            
            {viewMode === 'guidance' && (
              <div className="space-y-4 animate-fade-in">
                {displayData.behavioralProtocols.map((protocol, i) => (
                  <div key={i} className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-6 transition-all hover:bg-emerald-500/10">
                    <div className="flex justify-between items-center mb-2">
                       <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{protocol.title}</h5>
                       {protocol.duration && <span className="text-[9px] font-black text-emerald-600 uppercase">{protocol.duration}</span>}
                    </div>
                    <p className="text-white text-xs leading-relaxed font-medium mb-4">{protocol.instruction}</p>
                    {protocol.type === 'BREATH' && onSanctuary && (
                       <button onClick={onSanctuary} className="w-full py-4 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-all shadow-lg active:scale-95">Enter Sanctuary</button>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {viewMode === 'triggers' && (
              <div className="space-y-4 animate-fade-in">
                {displayData.stressTriggers.map((trigger, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 rounded-3xl p-6 hover:bg-white/10 transition-colors">
                    <div className="flex justify-between items-center mb-3">
                       <h5 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">{trigger.type}</h5>
                       <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${trigger.impact === 'High' ? 'bg-red-500/20 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-blue-500/20 text-blue-400'}`}>
                         {trigger.impact}
                       </span>
                    </div>
                    <p className="text-zinc-400 text-xs italic leading-relaxed">{trigger.description}</p>
                  </div>
                ))}
              </div>
            )}

            {viewMode === 'mind' && (
              <div className="space-y-6 animate-fade-in">
                <VitalBar label="Neural Focus" value={displayData.cognitive.focus} colorClass="bg-gradient-to-r from-cyan-500 to-blue-400"/>
                <VitalBar label="Cognitive Alertness" value={displayData.cognitive.alertness} colorClass="bg-gradient-to-r from-lime-500 to-emerald-400"/>
                <VitalBar label="Thought Overload" value={displayData.cognitive.overthinking} colorClass="bg-gradient-to-r from-purple-500 to-fuchsia-400"/>
              </div>
            )}
          </div>

          <div className="mb-10 p-7 bg-indigo-500/5 border border-indigo-500/20 rounded-[2rem] relative group">
             <div className="absolute -top-3 left-8 px-4 py-1 bg-indigo-500 rounded-full text-[9px] font-black text-white uppercase tracking-[0.3em] shadow-xl group-hover:scale-110 transition-transform">Biometric Cue</div>
             <p className="text-zinc-300 text-xs italic leading-relaxed font-medium">{displayData.neuralEvidence}</p>
          </div>

          <div className="mb-2 p-8 bg-amber-500/5 border border-amber-500/20 rounded-[2.5rem] shadow-2xl">
             <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-4">Deep Insight</div>
             <p className="text-white text-lg sm:text-xl italic leading-relaxed font-semibold tracking-tight">"{displayData.hiddenRealization}"</p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 px-4 sm:px-0">
        {onChat && !readonly && (
          <Button onClick={onChat} fullWidth className="bg-white text-black py-6 text-xs font-black shadow-[0_20px_40px_-10px_rgba(255,255,255,0.3)]">
             Talk to your Assistant
          </Button>
        )}
        <Button onClick={onReset} variant="secondary" fullWidth className="py-4 font-black uppercase tracking-[0.3em] opacity-40 hover:opacity-100 border-white/5">
          End Session
        </Button>
      </div>
    </div>
  );
};
