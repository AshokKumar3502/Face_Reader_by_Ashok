
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

// UI Labels Dictionary for Simple Language
const UI_LABELS: Record<Language, Record<string, string>> = {
  en: {
    soul: 'Feelings', mind: 'Thinking', guidance: 'Tips',
    stress: 'Stress / Worry', calm: 'Peace / Calm', fatigue: 'Tiredness',
    focus: 'Focus', alertness: 'Energy', overthinking: 'Too many thoughts',
    coreSignal: 'Current Mood', hiddenRealization: 'A Deep Thought',
    dailyAction: 'Small task for today', sanctuary: 'Relax Now', back: 'Go Back'
  },
  te: {
    soul: 'మనసు', mind: 'ఆలోచన', guidance: 'సలహాలు',
    stress: 'చింత / ఒత్తిడి', calm: 'ప్రశాంతత', fatigue: 'అలసట',
    focus: 'ఏకాగ్రత', alertness: 'ఉత్సాహం', overthinking: 'ఎక్కువ ఆలోచనలు',
    coreSignal: 'మీ మూడ్', hiddenRealization: 'ఒక ముఖ్యమైన మాట',
    dailyAction: 'ఈరోజు చిన్న పని', sanctuary: 'విశ్రాంతి తీసుకోండి', back: 'వెనక్కి'
  },
  hi: {
    soul: 'मन की बात', mind: 'सोच', guidance: 'सुझाव',
    stress: 'तनाव / चिंता', calm: 'शांति', fatigue: 'थकान',
    focus: 'ध्यान', alertness: 'स्फूर्ति', overthinking: 'ज़्यादा सोच',
    coreSignal: 'आपका मिजाज', hiddenRealization: 'एक गहरी बात',
    dailyAction: 'आज का छोटा काम', sanctuary: 'आराम करें', back: 'पीछे'
  },
  ta: {
    soul: 'மனம்', mind: 'சிந்தனை', guidance: 'ஆலோசனை',
    stress: 'மன அழுத்தம்', calm: 'அமைதி', fatigue: 'சோர்வு',
    focus: 'கவனம்', alertness: 'சுறுசுறுப்பு', overthinking: 'அதிக சிந்தனை',
    coreSignal: 'உங்கள் நிலை', hiddenRealization: 'ஒரு முக்கிய விஷயம்',
    dailyAction: 'இன்றைய சிறு வேலை', sanctuary: 'ஓய்வு எடுங்கள்', back: 'பின்னால்'
  },
  kn: {
    soul: 'ಮನಸ್ಸು', mind: 'ಯೋಚನೆ', guidance: 'ಸಲಹೆಗಳು',
    stress: 'ಒತ್ತಡ / ಚಿಂತೆ', calm: 'ನೆಮ್ಮದಿ', fatigue: 'ಆಯಾಸ',
    focus: 'ಗಮನ', alertness: 'ಉತ್ಸಾಹ', overthinking: 'ಹೆಚ್ಚು ಯೋಚನೆ',
    coreSignal: 'ನಿಮ್ಮ ಸ್ಥಿತಿ', hiddenRealization: 'ಒಂದು ಮುಖ್ಯ ಮಾತು',
    dailyAction: 'ಇಂದಿನ ಸಣ್ಣ ಕೆಲಸ', sanctuary: 'ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ', back: 'ಹಿಂದಕ್ಕೆ'
  }
};

export const InsightCard: React.FC<InsightCardProps> = ({ data, onReset, onChat, onSanctuary, readonly = false }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('soul');
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [isTranslating, setIsTranslating] = useState(false);
  
  const translationCache = useRef<Record<string, InsightData>>({ en: data });
  const [displayData, setDisplayData] = useState<InsightData>(data);

  const labels = UI_LABELS[currentLang] || UI_LABELS.en;

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'te', label: 'Telugu' },
    { code: 'hi', label: 'Hindi' },
    { code: 'ta', label: 'Tamil' },
    { code: 'kn', label: 'Kannada' },
  ];

  const handleLanguageChange = async (lang: Language) => {
    if (lang === currentLang || isTranslating) return;
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
      console.error(e);
    } finally { setIsTranslating(false); }
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
        <div className="relative overflow-hidden glass-card rounded-[3rem] p-12 text-center border-amber-500/20">
          <h1 className="text-2xl font-serif-display italic text-white mb-6">Cannot see you clearly</h1>
          <p className="text-zinc-400 text-sm italic mb-10 leading-relaxed">Please try in a brighter place or show your face better.</p>
          <Button onClick={onReset} fullWidth>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg animate-slide-up px-2 sm:px-0 pb-12 relative">
      <div className="absolute inset-0 pointer-events-none opacity-50 blur-[120px] z-0" style={auraStyle}></div>

      {/* Language Selector */}
      <div className="relative z-30 flex justify-center gap-2 mb-6 overflow-x-auto no-scrollbar py-2">
        {languages.map((l) => (
          <button
            key={l.code}
            onClick={() => handleLanguageChange(l.code)}
            disabled={isTranslating}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border shrink-0 ${
              currentLang === l.code ? 'bg-white text-black border-white' : 'bg-black/20 text-white/50 border-white/10'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="relative overflow-hidden glass-card rounded-[3rem] p-1 shadow-2xl z-10">
        {isTranslating && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center rounded-[2.9rem]">
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Translating...</p>
          </div>
        )}
        
        <div className="bg-black/40 rounded-[2.9rem] p-8 sm:p-12 backdrop-blur-3xl border border-white/5">
          <div className="mb-10 text-center">
            <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-4">{labels.coreSignal}</h2>
            <h1 className="text-3xl sm:text-4xl font-serif-display italic text-white leading-tight">"{displayData.psychProfile}"</h1>
          </div>

          <div className="mb-8 flex gap-2">
             <button onClick={() => setViewMode('soul')} className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl border ${viewMode === 'soul' ? 'bg-white/10 text-white' : 'text-zinc-500'}`}>{labels.soul}</button>
             <button onClick={() => setViewMode('mind')} className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl border ${viewMode === 'mind' ? 'bg-white/10 text-white' : 'text-zinc-500'}`}>{labels.mind}</button>
             <button onClick={() => setViewMode('guidance')} className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl border ${viewMode === 'guidance' ? 'bg-white/10 text-white' : 'text-zinc-500'}`}>{labels.guidance}</button>
          </div>

          <div className="mb-10 min-h-[220px]">
            {viewMode === 'soul' && (
              <div className="space-y-6 animate-fade-in">
                <VitalBar label={labels.stress} value={displayData.vitals.stress} colorClass="bg-red-500"/>
                <VitalBar label={labels.calm} value={displayData.vitals.calmness} colorClass="bg-emerald-500"/>
                <VitalBar label={labels.fatigue} value={displayData.vitals.fatigue} colorClass="bg-indigo-500"/>
              </div>
            )}
            {viewMode === 'mind' && (
              <div className="space-y-6 animate-fade-in">
                <VitalBar label={labels.focus} value={displayData.cognitive.focus} colorClass="bg-cyan-500"/>
                <VitalBar label={labels.alertness} value={displayData.cognitive.alertness} colorClass="bg-amber-400"/>
                <VitalBar label={labels.overthinking} value={displayData.cognitive.overthinking} colorClass="bg-purple-500"/>
              </div>
            )}
            {viewMode === 'guidance' && (
              <div className="space-y-4 animate-fade-in">
                {displayData.behavioralProtocols.map((p, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 rounded-[2rem] p-6">
                    <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">{p.title}</h5>
                    <p className="text-zinc-300 text-xs italic leading-relaxed">{p.instruction}</p>
                    {p.type === 'BREATH' && onSanctuary && (
                       <button onClick={onSanctuary} className="mt-5 w-full py-4 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-2xl">{labels.sanctuary}</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mb-2 p-8 bg-amber-500/5 border border-amber-500/20 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
             <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-4">{labels.hiddenRealization}</div>
             <p className="text-white text-lg sm:text-2xl italic leading-relaxed font-semibold">"{displayData.hiddenRealization}"</p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 px-4 sm:px-0 relative z-20">
        {onChat && !readonly && (
          <Button onClick={onChat} fullWidth className="bg-white text-black py-6">
             Talk to Kosha
          </Button>
        )}
        <Button onClick={onReset} variant="secondary" fullWidth className="py-4 opacity-40 hover:opacity-100">
          {labels.back}
        </Button>
      </div>
    </div>
  );
};
