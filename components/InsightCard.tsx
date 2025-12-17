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
    <div className="w-full max-w-lg animate-slide-up pb-12">
      
      {/* High Saturation Status Bar */}
      {!readonly && (
         <div className="flex justify-center mb-6">
           <div className="px-6 py-2 rounded-full rainbow-gradient text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl ring-2 ring-white/20">
             Truth Decoded
           </div>
         </div>
      )}

      {/* Main Glass Card */}
      <div className="relative overflow-hidden glass-card rounded-[3rem] p-1 shadow-2xl">
        {/* Glow behind card */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-fuchsia-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-cyan-600/20 rounded-full blur-[100px]"></div>

        <div className="bg-black/40 rounded-[2.9rem] p-8 md:p-10 relative z-10 backdrop-blur-3xl">
          
          {/* Header - Vibrant Metrics */}
          <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-8">
            <div>
              <h2 className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] mb-2">Psych Profile</h2>
              <div className="text-xs text-cyan-400 font-mono font-bold">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-serif-display bg-gradient-to-br from-white via-cyan-200 to-indigo-400 bg-clip-text text-transparent drop-shadow-lg leading-none">{data.emotionalScore}</div>
              <div className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mt-2">Soul Clarity</div>
            </div>
          </div>

          {/* Core Insight - Large Vivid Typography */}
          <div className="mb-12 text-center">
            <h1 className="text-3xl md:text-4xl font-serif-display italic text-white leading-tight drop-shadow-2xl">
              "{data.psychProfile}"
            </h1>
          </div>

          {/* High Contrast Evidence Box */}
          {data.simpleExplanation && (
            <div className="bg-white/5 rounded-[2rem] p-8 border border-white/10 mb-10 shadow-inner group hover:bg-white/10 transition-colors">
              <h4 className="flex items-center gap-3 text-[10px] font-black text-fuchsia-400 uppercase tracking-[0.3em] mb-4">
                <span className="w-3 h-3 rounded-full bg-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,1)]"></span>
                Visual Evidence
              </h4>
              <p className="text-white text-lg leading-relaxed font-medium">
                {data.simpleExplanation}
              </p>
            </div>
          )}

          {/* Vibrant Metric Grid */}
          <div className="grid grid-cols-2 gap-5 mb-10">
            <div className="bg-indigo-900/30 rounded-3xl p-6 border border-indigo-500/30 shadow-lg group">
              <h4 className="text-[10px] text-indigo-300 uppercase font-black mb-3 tracking-widest">Mental Pattern</h4>
              <p className="text-white text-base font-bold drop-shadow-sm">{data.currentPattern}</p>
            </div>
            <div className="bg-emerald-900/30 rounded-3xl p-6 border border-emerald-500/30 shadow-lg group">
              <h4 className="text-[10px] text-emerald-300 uppercase font-black mb-3 tracking-widest">Impact Layer</h4>
              <p className="text-white text-base font-bold leading-tight drop-shadow-sm">{data.relationshipImpact}</p>
            </div>
          </div>

          {/* Actionable Plan */}
          <div className="relative bg-gradient-to-br from-indigo-600/40 via-purple-600/40 to-fuchsia-600/40 rounded-[2.5rem] p-8 border border-white/20 overflow-hidden shadow-2xl">
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center text-2xl shadow-lg">🌱</div>
                  <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] drop-shadow-md">Growth Plan</h3>
                </div>
                <p className="text-white text-lg italic mb-8 border-l-4 border-white/50 pl-6 font-semibold">
                  "{data.growthPlan}"
                </p>
                
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 flex items-center gap-4 border border-white/20 shadow-xl">
                   <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-2xl">
                      <div className="w-3 h-3 bg-black rounded-full"></div>
                   </div>
                   <div>
                      <h4 className="text-[10px] text-white/70 uppercase font-black mb-1 tracking-widest">Daily Action</h4>
                      <p className="text-white text-base font-black">{data.dailyAction}</p>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>

      <div className="mt-10 flex flex-col gap-4">
        {onChat && !readonly && (
          <Button onClick={onChat} fullWidth className="bg-white text-black py-6 text-base font-black shadow-2xl">
             Deep Chat with Kosha
          </Button>
        )}
        <Button onClick={onReset} variant="secondary" fullWidth className="py-5 font-black border-white/30">
          {readonly ? "Seal Journal" : "Return to Home"}
        </Button>
      </div>
    </div>
  );
};