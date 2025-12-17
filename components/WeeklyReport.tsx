import React from 'react';
import { WeeklyInsight } from '../types';
import { Button } from './Button';

interface WeeklyReportProps {
  data: WeeklyInsight;
  onClose: () => void;
}

export const WeeklyReport: React.FC<WeeklyReportProps> = ({ data, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-lg relative animate-slide-up">
        
        {/* Background Glows */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-amber-500/20 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px] animate-pulse-slow animation-delay-200"></div>

        <div className="relative bg-zinc-900/80 border border-amber-500/30 rounded-[2rem] overflow-hidden shadow-2xl">
          
          {/* Header */}
          <div className="p-8 text-center border-b border-white/5 bg-gradient-to-b from-amber-500/10 to-transparent">
             <div className="inline-block px-3 py-1 mb-4 rounded-full border border-amber-500/50 text-amber-300 text-[10px] font-bold uppercase tracking-widest bg-amber-900/20">
                Weekly Meta-Analysis
             </div>
             <h2 className="text-3xl font-serif-display text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-amber-200 drop-shadow-md">
                {data.weekTitle}
             </h2>
          </div>

          <div className="p-8 space-y-8">
             
             {/* The Soul Report */}
             <div className="text-center">
                <p className="text-zinc-200 text-sm leading-relaxed font-serif-display italic">
                   "{data.soulReport}"
                </p>
             </div>

             {/* Grid Stats */}
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                   <h4 className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Trend</h4>
                   <p className="text-amber-200 font-bold text-sm">{data.emotionalTrend}</p>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center">
                   <h4 className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Realization</h4>
                   <p className="text-purple-200 font-bold text-sm leading-tight">{data.keyRealization}</p>
                </div>
             </div>

             {/* Mantra */}
             <div className="relative p-6 rounded-2xl bg-gradient-to-r from-zinc-800 to-zinc-900 border border-white/10 text-center overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>
                <h3 className="text-[10px] text-zinc-400 uppercase tracking-widest mb-3">Mantra For Next Week</h3>
                <p className="text-xl text-white font-serif-display tracking-wide drop-shadow-lg">
                   "{data.nextWeekMantra}"
                </p>
             </div>

             <Button onClick={onClose} fullWidth className="bg-white/10 hover:bg-white/20 border-white/20 text-white">
                Close Report
             </Button>
          </div>

        </div>
      </div>
    </div>
  );
};