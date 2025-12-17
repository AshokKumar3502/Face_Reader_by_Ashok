import React from 'react';
import { InsightData } from '../types';
import { Button } from './Button';

interface InsightCardProps {
  data: InsightData;
  onReset: () => void;
  onChat?: () => void;
  readonly?: boolean;
}

export const InsightCard: React.FC<InsightCardProps> = ({ data, onReset, onChat, readonly = false }) => {
  return (
    <div className="w-full max-w-lg animate-slide-up px-2 sm:px-0 pb-8 sm:pb-12">
      
      {/* High Saturation Status Bar */}
      {!readonly && (
         <div className="flex justify-center mb-4 sm:mb-6">
           <div className="px-5 sm:px-6 py-2 rounded-full rainbow-gradient text-white text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl ring-2 ring-white/20">
             Truth Decoded
           </div>
         </div>
      )}

      {/* Main Glass Card */}
      <div className="relative overflow-hidden glass-card rounded-3xl sm:rounded-[3rem] p-1 shadow-2xl">
        {/* Glow behind card */}
        <div className="absolute -top-40 -left-40 w-60 h-60 sm:w-80 sm:h-80 bg-fuchsia-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-40 -right-40 w-60 h-60 sm:w-80 sm:h-80 bg-cyan-600/20 rounded-full blur-[100px]"></div>

        <div className="bg-black/40 rounded-[1.4rem] sm:rounded-[2.9rem] p-6 sm:p-10 relative z-10 backdrop-blur-3xl">
          
          {/* Header - Vibrant Metrics */}
          <div className="flex justify-between items-center mb-6 sm:mb-10 border-b border-white/10 pb-6 sm:pb-8">
            <div>
              <h2 className="text-[9px] sm:text-[10px] font-black text-white/50 uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-1 sm:mb-2">Psych Profile</h2>
              <div className="text-[10px] sm:text-xs text-cyan-400 font-mono font-bold">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
            </div>
            <div className="text-right">
              <div className="text-4xl sm:text-5xl font-serif-display bg-gradient-to-br from-white via-cyan-200 to-indigo-400 bg-clip-text text-transparent drop-shadow-lg leading-none">{data.emotionalScore}</div>
              <div className="text-[9px] sm:text-[10px] text-indigo-400 font-black uppercase tracking-widest mt-1 sm:mt-2">Soul Clarity</div>
            </div>
          </div>

          {/* Core Insight - Large Vivid Typography */}
          <div className="mb-8 sm:mb-12 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif-display italic text-white leading-tight drop-shadow-2xl px-2">
              "{data.psychProfile}"
            </h1>
          </div>

          {/* High Contrast Evidence Box */}
          {data.simpleExplanation && (
            <div className="bg-white/5 rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 border border-white/10 mb-8 sm:mb-10 shadow-inner group hover:bg-white/10 transition-colors">
              <h4 className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-black text-fuchsia-400 uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-3 sm:mb-4">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,1)]"></span>
                Visual Evidence
              </h4>
              <p className="text-white text-base sm:text-lg leading-relaxed font-medium">
                {data.simpleExplanation}
              </p>
            </div>
          )}

          {/* Vibrant Metric Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-5 mb-8 sm:mb-10">
            <div className="bg-indigo-900/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-indigo-500/30 shadow-lg group">
              <h4 className="text-[8px] sm:text-[10px] text-indigo-300 uppercase font-black mb-2 sm:mb-3 tracking-widest">Mental Pattern</h4>
              <p className="text-white text-sm sm:text-base font-bold drop-shadow-sm">{data.currentPattern}</p>
            </div>
            <div className="bg-emerald-900/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-emerald-500/30 shadow-lg group">
              <h4 className="text-[8px] sm:text-[10px] text-emerald-300 uppercase font-black mb-2 sm:mb-3 tracking-widest">Impact Layer</h4>
              <p className="text-white text-sm sm:text-base font-bold leading-tight drop-shadow-sm">{data.relationshipImpact}</p>
            </div>
          </div>

          {/* Actionable Plan */}
          <div className="relative bg-gradient-to-br from-indigo-600/40 via-purple-600/40 to-fuchsia-600/40 rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-8 border border-white/20 overflow-hidden shadow-2xl">
             <div className="relative z-10">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-xl sm:rounded-2xl backdrop-blur-md flex items-center justify-center text-xl sm:text-2xl shadow-lg">🌱</div>
                  <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-[0.2em] drop-shadow-md">Growth Plan</h3>
                </div>
                <p className="text-white text-base sm:text-lg italic mb-6 sm:mb-8 border-l-4 border-white/50 pl-4 sm:pl-6 font-semibold">
                  "{data.growthPlan}"
                </p>
                
                <div className="bg-white/10 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 border border-white/20 shadow-xl">
                   <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-2xl">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-black rounded-full"></div>
                   </div>
                   <div>
                      <h4 className="text-[8px] sm:text-[10px] text-white/70 uppercase font-black mb-0.5 tracking-widest">Daily Action</h4>
                      <p className="text-white text-sm sm:text-base font-black leading-tight">{data.dailyAction}</p>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>

      <div className="mt-8 sm:mt-10 flex flex-col gap-3 sm:gap-4 px-2 sm:px-0">
        {onChat && !readonly && (
          <Button onClick={onChat} fullWidth className="bg-white text-black py-5 sm:py-6 text-sm sm:text-base font-black shadow-2xl">
             Deep Chat with Kosha
          </Button>
        )}
        <Button onClick={onReset} variant="secondary" fullWidth className="py-4 sm:py-5 font-black border-white/30 text-xs sm:text-sm">
          {readonly ? "Seal Journal" : "Return to Home"}
        </Button>
      </div>
    </div>
  );
};
