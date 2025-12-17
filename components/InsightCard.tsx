import React from 'react';
import { InsightData } from '../types';
import { Button } from './Button';

interface InsightCardProps {
  data: InsightData;
  onReset: () => void;
  onChat?: () => void; // New prop
  readonly?: boolean;
}

export const InsightCard: React.FC<InsightCardProps> = ({ data, onReset, onChat, readonly = false }) => {
  return (
    <div className="w-full max-w-lg animate-slide-up pb-12">
      
      {/* Status Bar */}
      {!readonly && (
         <div className="flex justify-center mb-6">
           <div className="px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.3)]">
             Analysis Complete
           </div>
         </div>
      )}

      {/* Main Card */}
      <div className="relative overflow-hidden bg-zinc-900/60 backdrop-blur-2xl border border-white/5 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        
        {/* Decorative Top Gradient */}
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-teal-500/10 to-transparent pointer-events-none"></div>

        <div className="p-8 relative z-10">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-6">
            <div>
              <h2 className="text-xs font-bold text-zinc-300 uppercase tracking-widest mb-1">Psych Profile</h2>
              <div className="text-[10px] text-zinc-500 font-mono font-bold">{new Date().toLocaleDateString()}</div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-serif-display text-white drop-shadow-md">{data.emotionalScore}</div>
              <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wide">Balance Score</div>
            </div>
          </div>

          {/* Core Insight - Editorial Style */}
          <div className="mb-10 text-center">
            <h1 className="text-2xl md:text-3xl font-serif-display text-white leading-tight drop-shadow-lg bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
              "{data.psychProfile}"
            </h1>
          </div>

          {/* The "Why" - Dark Glass Box */}
          {data.simpleExplanation && (
            <div className="bg-black/30 rounded-xl p-6 border border-white/5 mb-8 shadow-inner">
              <h4 className="flex items-center gap-2 text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-3">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_10px_rgba(129,140,248,0.8)]"></span>
                Visual Evidence
              </h4>
              <p className="text-zinc-200 text-sm leading-relaxed font-normal">
                {data.simpleExplanation}
              </p>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-colors shadow-lg group">
              <h4 className="text-[10px] text-zinc-400 uppercase font-bold mb-2 tracking-wide group-hover:text-teal-300 transition-colors">Pattern</h4>
              <p className="text-zinc-100 text-sm font-bold">{data.currentPattern}</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-colors shadow-lg group">
              <h4 className="text-[10px] text-zinc-400 uppercase font-bold mb-2 tracking-wide group-hover:text-indigo-300 transition-colors">Impact</h4>
              <p className="text-zinc-100 text-sm font-bold leading-tight">{data.relationshipImpact}</p>
            </div>
          </div>

          {/* Action Plan */}
          <div className="relative bg-gradient-to-br from-teal-900/30 to-emerald-900/30 rounded-2xl p-6 border border-white/10 overflow-hidden shadow-xl">
             {/* Subtle noise for texture */}
             <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
             
             <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg filter drop-shadow-md">🌱</span>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider drop-shadow-md">Growth Plan</h3>
                </div>
                <p className="text-zinc-200 text-sm italic mb-6 border-l-2 border-teal-400/50 pl-4 font-medium">
                  "{data.growthPlan}"
                </p>
                
                <div className="bg-black/30 rounded-xl p-4 flex items-start gap-3 border border-white/5">
                   <div className="mt-1 w-4 h-4 rounded-full border border-teal-400 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(45,212,191,0.4)]">
                      <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                   </div>
                   <div>
                      <h4 className="text-[10px] text-teal-300 uppercase font-bold mb-1">Today's Mission</h4>
                      <p className="text-white text-sm font-bold">{data.dailyAction}</p>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {onChat && !readonly && (
          <Button onClick={onChat} fullWidth className="bg-indigo-500/20 hover:bg-indigo-500/30 border-indigo-500/30 text-indigo-100 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
             Chat with Kosha about this
          </Button>
        )}
        <Button onClick={onReset} variant="secondary" fullWidth className="border-white/20 bg-white/5 hover:bg-white/10 text-white">
          {readonly ? "Close Journal" : "Complete Check-in"}
        </Button>
      </div>
    </div>
  );
};