import React, { useState } from 'react';
import { InsightData, BehavioralProtocol } from '../types';
import { Button } from './Button';

interface InsightCardProps {
  data: InsightData;
  onReset: () => void;
  onChat?: () => void;
  readonly?: boolean;
}

type ViewMode = 'soul' | 'mind' | 'triggers' | 'guidance';

export const InsightCard: React.FC<InsightCardProps> = ({ data, onReset, onChat, readonly = false }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('soul');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const VitalBar = ({ label, value, colorClass }: { label: string, value: number, colorClass: string }) => (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] uppercase tracking-widest font-black">
        <span className="text-white/60">{label}</span>
        <span className="text-white">{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
        <div 
          className={`h-full transition-all duration-1000 ease-out ${colorClass}`}
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );

  const getModeLabel = (mode: ViewMode) => {
    switch(mode) {
      case 'soul': return 'Soul Vitals';
      case 'mind': return 'Mind Energy';
      case 'triggers': return 'Stress Triggers';
      case 'guidance': return 'Behavioral Protocols';
    }
  };

  const getProtocolIcon = (type: string) => {
    switch(type) {
        case 'BREATH': return '🫁';
        case 'REST': return '🔋';
        case 'SOCIAL': return '🫂';
        case 'FOCUS': return '🎯';
        case 'JOURNAL': return '✍️';
        default: return '✨';
    }
  };

  return (
    <div className="w-full max-w-lg animate-slide-up px-2 sm:px-0 pb-8 sm:pb-12">
      
      {!readonly && (
         <div className="flex justify-center mb-4 sm:mb-6">
           <div className="px-5 sm:px-6 py-2 rounded-full rainbow-gradient text-white text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl ring-2 ring-white/20">
             Guidance protocol active
           </div>
         </div>
      )}

      <div className="relative overflow-hidden glass-card rounded-3xl sm:rounded-[3rem] p-1 shadow-2xl">
        <div className="bg-black/40 rounded-[1.4rem] sm:rounded-[2.9rem] p-6 sm:p-10 relative z-10 backdrop-blur-3xl">
          
          {/* Main Insight */}
          <div className="mb-6 text-center">
            <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Mirror Result</h2>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif-display italic text-white leading-tight drop-shadow-2xl">
              "{data.psychProfile}"
            </h1>
          </div>

          {/* DECISION COMPASS */}
          <div className="mb-6 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-5 flex items-center gap-4 group">
             <div className="w-10 h-10 rounded-full bg-cyan-400 flex items-center justify-center text-black shadow-lg shrink-0 font-black">🧭</div>
             <p className="text-white text-xs sm:text-sm font-bold italic leading-tight">
                {data.decisionCompass}
             </p>
          </div>

          {/* VIEW SELECTOR DROPDOWN */}
          <div className="mb-8 relative z-20">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl px-6 py-4 flex items-center justify-between transition-all group"
            >
               <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    viewMode === 'soul' ? 'bg-fuchsia-400' : 
                    viewMode === 'mind' ? 'bg-cyan-400' : 
                    viewMode === 'triggers' ? 'bg-rose-400' : 'bg-emerald-400'}`}></div>
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{getModeLabel(viewMode)}</span>
               </div>
               <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                  <path d="M2 4L6 8L10 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl animate-fade-in backdrop-blur-3xl">
                 {(['soul', 'mind', 'triggers', 'guidance'] as ViewMode[]).map(mode => (
                    <button 
                      key={mode}
                      onClick={() => { setViewMode(mode); setIsDropdownOpen(false); }}
                      className={`w-full text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-colors ${viewMode === mode ? 'text-white bg-white/10' : 'text-zinc-500'}`}
                    >
                      {getModeLabel(mode)}
                    </button>
                 ))}
              </div>
            )}
          </div>

          {/* CONTENT MODULES */}
          <div className="mb-8 min-h-[220px]">
            {viewMode === 'soul' && (
              <div className="grid grid-cols-1 gap-5 animate-fade-in">
                <VitalBar label="Stress Level" value={data.vitals.stress} colorClass="bg-red-500" />
                <VitalBar label="Calmness" value={data.vitals.calmness} colorClass="bg-teal-400" />
                <VitalBar label="Anxiety" value={data.vitals.anxiety} colorClass="bg-orange-400" />
                <VitalBar label="Emotional Fatigue" value={data.vitals.fatigue} colorClass="bg-indigo-400" />
              </div>
            )}

            {viewMode === 'mind' && (
              <div className="grid grid-cols-1 gap-5 animate-fade-in">
                <VitalBar label="Focus Level" value={data.cognitive.focus} colorClass="bg-cyan-400" />
                <VitalBar label="Alertness" value={data.cognitive.alertness} colorClass="bg-lime-400" />
                <VitalBar label="Overthinking" value={data.cognitive.overthinking} colorClass="bg-purple-400" />
                <VitalBar label="Burnout Risk" value={data.cognitive.burnout} colorClass="bg-rose-400" />
              </div>
            )}

            {viewMode === 'triggers' && (
              <div className="space-y-4 animate-fade-in">
                {data.stressTriggers.map((trigger, i) => (
                  <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-5 group hover:bg-white/10 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                       <h5 className="text-xs font-black text-white uppercase tracking-widest">{trigger.type}</h5>
                       <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                          trigger.impact === 'High' ? 'bg-red-500/20 text-red-400' : 
                          trigger.impact === 'Medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                       }`}>
                         {trigger.impact} Impact
                       </span>
                    </div>
                    <p className="text-zinc-400 text-xs italic leading-relaxed">
                      {trigger.description}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {viewMode === 'guidance' && (
              <div className="space-y-4 animate-fade-in">
                {data.behavioralProtocols.map((protocol, i) => (
                  <div key={i} className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">{getProtocolIcon(protocol.type)}</div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg">{getProtocolIcon(protocol.type)}</span>
                        <h5 className="text-xs font-black text-emerald-300 uppercase tracking-widest">{protocol.title}</h5>
                    </div>
                    <p className="text-white text-xs leading-relaxed mb-3 font-medium">
                      {protocol.instruction}
                    </p>
                    {protocol.duration && (
                        <div className="inline-flex items-center gap-1.5 text-[8px] font-black text-emerald-500/60 uppercase tracking-widest border border-emerald-500/20 rounded-full px-3 py-1 bg-black/20">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            {protocol.duration} Session
                        </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* HIDDEN TRUTH */}
          <div className="mb-8 p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl relative">
             <div className="absolute -top-3 left-6 px-3 py-1 bg-amber-500 rounded-full text-[8px] font-black text-black uppercase tracking-[0.2em] shadow-lg">Hidden Truth</div>
             <p className="text-white text-base italic leading-relaxed font-semibold">
               {data.hiddenRealization}
             </p>
          </div>

          {/* Simple Explanation */}
          <div className="mb-8 space-y-3">
             <h4 className="text-[10px] font-black text-white/30 uppercase tracking-widest">Visual Evidence</h4>
             <p className="text-white/80 text-xs sm:text-sm leading-relaxed border-l border-white/10 pl-4">
                {data.simpleExplanation}
             </p>
          </div>

          {/* Action Layer */}
          <div className="bg-gradient-to-br from-indigo-600/20 to-fuchsia-600/20 rounded-2xl p-6 border border-white/10">
             <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-3">Suggested Path</h4>
             <p className="text-white text-sm font-bold mb-2">"{data.growthPlan}"</p>
             <div className="flex items-center gap-3 text-white/40 text-[10px] uppercase font-black tracking-widest">
                <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">✓</span>
                {data.dailyAction}
             </div>
          </div>

        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 px-2 sm:px-0">
        {onChat && !readonly && (
          <Button onClick={onChat} fullWidth className="bg-white text-black py-5 text-xs font-black shadow-2xl uppercase tracking-[0.2em]">
             Ask About Guidance
          </Button>
        )}
        <Button onClick={onReset} variant="secondary" fullWidth className="py-4 font-black text-[10px] uppercase tracking-widest">
          {readonly ? "Close Entry" : "Back to Mirror"}
        </Button>
      </div>
    </div>
  );
};