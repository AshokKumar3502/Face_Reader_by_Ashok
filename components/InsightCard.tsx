
import React, { useState, useRef } from 'react';
import { InsightData, Language } from '../types';
import { Button } from './Button';
import { translateInsight } from '../services/geminiService';

interface InsightCardProps {
  data: InsightData;
  onReset: () => void;
  onChat?: () => void;
}

const UI_LABELS: Record<Language, Record<string, string>> = {
  en: {
    greeting: 'Greeting Score', listening: 'Good Listening', pro: 'Office Manners',
    conflict: 'Conflict Help', patience: 'Patience',
    tone: 'Your Tone', trend: 'Last 3 Days Check',
    tip: 'Daily Tip', correction: 'Try This', back: 'Go Back',
    talking: 'Talk to Mentor', translating: 'Wait a moment...'
  },
  te: {
    greeting: 'పలకరింపు', listening: 'వినడం', pro: 'మర్యాద',
    conflict: 'సమస్యల పరిష్కారం', patience: 'ఓపిక',
    tone: 'మీ శైలి', trend: 'గత 3 రోజుల పరిశీలన',
    tip: 'చిట్కా', correction: 'ఇలా చేయండి', back: 'వెనక్కి',
    talking: 'మెంటార్ తో మాట్లాడండి', translating: 'మారుస్తున్నాము...'
  },
  hi: {
    greeting: 'अभिवादन', listening: 'सुनना', pro: 'शिष्टाचार',
    conflict: 'विवाद सुलझाना', patience: 'धैर्य',
    tone: 'आपका स्वर', trend: '3 दिन की रिपोर्ट',
    tip: 'सुझाव', correction: 'कोशिश करें', back: 'पीछे',
    talking: 'मेंटर से बात करें', translating: 'अनुवाद हो रहा है...'
  },
  ta: {
    greeting: 'வாழ்த்து', listening: 'கவனித்தல்', pro: 'ஒழுக்கம்',
    conflict: 'பிரச்சனை தீர்வு', patience: 'பொறுமை',
    tone: 'உங்கள் தொனி', trend: '3 நாள் அறிக்கை',
    tip: 'ஆலோசனை', correction: 'முயற்சிக்கவும்', back: 'பின்னால்',
    talking: 'ஆலோசகருடன் பேசுங்கள்', translating: 'மொழிமாற்றம்...'
  },
  kn: {
    greeting: 'ಅಭಿವಾದನ', listening: 'ಆಲಿಸುವಿಕೆ', pro: 'ಮರ್ಯಾದೆ',
    conflict: 'ಸಮಸ್ಯೆಗಳ ಪರಿಹಾರ', patience: 'ಸಹನೆ',
    tone: 'ನಿಮ್ಮ ಧ್ವನಿ', trend: '3 ದಿನಗಳ ವರದಿ',
    tip: 'ಸಲಹೆ', correction: 'ಹೀಗೆ ಮಾಡಿ', back: 'ಹಿಂದಕ್ಕೆ',
    talking: 'ಮಾರ್ಗದರ್ಶಕರೊಂದಿಗೆ ಮಾತನಾಡಿ', translating: 'ಅನುವಾದವಾಗುತ್ತಿದೆ...'
  }
};

export const InsightCard: React.FC<InsightCardProps> = ({ data, onReset, onChat }) => {
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [displayData, setDisplayData] = useState<InsightData>(data);
  const labels = UI_LABELS[currentLang] || UI_LABELS.en;

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
  ];

  const handleLanguageChange = async (lang: Language) => {
    if (lang === currentLang || isTranslating) return;
    setIsTranslating(true);
    try {
      const translated = await translateInsight(data, lang);
      setDisplayData(translated);
      setCurrentLang(lang);
    } catch (e) { console.error(e); } finally { setIsTranslating(false); }
  };

  const Metric = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-lg animate-entrance-3d px-4 pb-20 relative">
      {/* Aura background based on model output */}
      <div className="absolute inset-0 pointer-events-none opacity-20 blur-[120px]" style={{ background: displayData.auraColors?.[0] || 'indigo' }}></div>

      <div className="relative z-30 flex justify-center gap-2 mb-8 overflow-x-auto no-scrollbar py-2">
        {languages.map((l) => (
          <button key={l.code} onClick={() => handleLanguageChange(l.code)} disabled={isTranslating} className={`px-5 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all ${currentLang === l.code ? 'bg-white text-black border-white' : 'bg-black/40 text-white/40 border-white/5 hover:border-white/20'}`}>
            {l.label}
          </button>
        ))}
      </div>

      <div className="relative glass-panel-3d rounded-[3rem] p-1 shadow-2xl animate-float-3d">
        {isTranslating && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-3xl flex items-center justify-center rounded-[2.9rem]">
             <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/60 animate-pulse">{labels.translating}</p>
          </div>
        )}
        
        <div className="bg-black/40 rounded-[2.9rem] p-8 sm:p-12">
          <div className="mb-10 text-center">
            <h2 className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.4em] mb-4">{labels.tone}: {displayData.behavioralInsight.tone}</h2>
            <h1 className="text-2xl sm:text-3xl font-serif-display italic text-white leading-tight">"{displayData.psychProfile}"</h1>
          </div>

          <div className="grid grid-cols-1 gap-6 mb-10">
            <Metric label={labels.greeting} value={displayData.workplaceMetrics.greeting} color="bg-emerald-500" />
            <Metric label={labels.listening} value={displayData.workplaceMetrics.listening} color="bg-blue-500" />
            <Metric label={labels.patience} value={displayData.workplaceMetrics.patience} color="bg-amber-500" />
          </div>

          <div className="space-y-4 mb-10">
             <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl">
                <h4 className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-2">{labels.trend}</h4>
                <p className="text-zinc-300 text-sm italic">"{displayData.behavioralInsight.trendVsYesterday}"</p>
             </div>
             <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl">
                <h4 className="text-[9px] font-bold text-amber-500 uppercase tracking-widest mb-2">{labels.tip}</h4>
                <p className="text-zinc-100 text-sm font-medium italic">"{displayData.behavioralInsight.practicalTip}"</p>
             </div>
          </div>

          <div className="flex flex-col gap-4">
            {onChat && <Button onClick={onChat} fullWidth className="bg-white text-black py-6 text-[11px]">{labels.talking}</Button>}
            <Button onClick={onReset} variant="ghost" fullWidth className="py-4 opacity-40 hover:opacity-100">{labels.back}</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
