
import React, { useState, useEffect } from 'react';

export const LoadingScreen: React.FC = () => {
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);

  const phases = [
    "Receiving your signal...",
    "Looking deep into the reflection...",
    "Listening to the silence...",
    "Understanding your heart...",
    "Translating your mood...",
    "Preparing your mirror..."
  ];

  useEffect(() => {
    const phaseInterval = setInterval(() => {
      setPhase((p) => (p + 1) % phases.length);
    }, 3000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 99;
        // Natural slowing progress bar
        const increment = Math.max(0.1, (100 - prev) * 0.05);
        return prev + increment;
      });
    }, 100);

    return () => {
      clearInterval(phaseInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-[#08080a] flex flex-col items-center justify-center overflow-hidden animate-fade-in">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 to-transparent pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] animate-pulse"></div>

      {/* Main Visualizer: Advanced Scanner */}
      <div className="relative w-72 h-72 flex items-center justify-center">
        {/* Outer Rotating Ring */}
        <div className="absolute inset-0 border border-white/5 rounded-full animate-spin-slow"></div>
        <div className="absolute inset-4 border border-indigo-500/10 rounded-full animate-reverse-spin"></div>
        
        {/* Progress Circular Track */}
        <svg className="absolute w-full h-full -rotate-90">
          <circle
            cx="144"
            cy="144"
            r="130"
            fill="none"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="2"
          />
          <circle
            cx="144"
            cy="144"
            r="130"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeDasharray={816}
            strokeDashoffset={816 - (816 * progress) / 100}
            className="transition-all duration-300 ease-out"
            strokeLinecap="round"
          />
        </svg>

        {/* Central Neural Hub */}
        <div className="relative w-24 h-24 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 flex items-center justify-center z-10 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
           <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_20px_white] animate-pulse"></div>
           {/* Scanning Beam */}
           <div className="absolute inset-0 rounded-full border-t-2 border-white/40 animate-spin"></div>
        </div>
      </div>

      {/* Text Content */}
      <div className="mt-20 text-center space-y-10 z-10 w-full max-w-xs px-6">
        <div className="space-y-6">
          <div className="flex flex-col gap-2 items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.8em] text-white/30 ml-[0.8em]">Analyzing Soul</span>
            <span className="text-[12px] font-mono text-white/60">{Math.floor(progress)}%</span>
          </div>

          <div className="relative h-12 flex items-center justify-center">
            {phases.map((text, i) => (
              <h2 
                key={i}
                className={`absolute w-full text-lg sm:text-xl font-serif-display italic text-white transition-all duration-1000 transform ${
                  phase === i ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
                }`}
              >
                "{text}"
              </h2>
            ))}
          </div>
        </div>
        
        <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.4em] opacity-50">Please stay present</p>
      </div>

      <style>{`
        .animate-spin-slow { animation: spin 12s linear infinite; }
        .animate-reverse-spin { animation: reverse-spin 8s linear infinite; }
        @keyframes reverse-spin { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
      `}</style>
    </div>
  );
};
