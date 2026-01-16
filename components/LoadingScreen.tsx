
import React, { useState, useEffect } from 'react';

export const LoadingScreen: React.FC = () => {
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);

  const phases = [
    "Thinking about your day...",
    "Looking at your smile...",
    "Hearing your voice...",
    "Comparing with last week...",
    "Preparing your mentor report...",
    "Almost ready..."
  ];

  useEffect(() => {
    const phaseInterval = setInterval(() => setPhase((p) => (p + 1) % phases.length), 3000);
    const progressInterval = setInterval(() => {
      setProgress((prev) => prev >= 100 ? 99 : prev + Math.max(0.1, (100 - prev) * 0.05));
    }, 100);
    return () => { clearInterval(phaseInterval); clearInterval(progressInterval); };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-[#020203] flex flex-col items-center justify-center overflow-hidden animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 to-transparent pointer-events-none"></div>
      
      <div className="relative w-64 h-64 flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
        {/* Animated Orbits */}
        <div className="absolute inset-0 border border-white/5 rounded-full animate-[spin_10s_linear_infinite]"></div>
        <div className="absolute inset-8 border border-white/5 rounded-full animate-[spin_6s_linear_infinite_reverse]"></div>
        
        {/* Central Glowing Core */}
        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-3xl border border-white/20 flex items-center justify-center z-10 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
           <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_15px_white] animate-pulse"></div>
        </div>

        {/* Progress HUD */}
        <svg className="absolute w-full h-full -rotate-90">
          <circle cx="128" cy="128" r="110" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <circle cx="128" cy="128" r="110" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray={691} strokeDashoffset={691 - (691 * progress) / 100} className="transition-all duration-300 ease-out" />
        </svg>
      </div>

      <div className="mt-16 text-center space-y-6 z-10 w-full max-w-xs px-6">
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.6em]">{Math.floor(progress)}% Processed</p>
        <div className="h-10 relative flex items-center justify-center">
          {phases.map((text, i) => (
            <h2 key={i} className={`absolute w-full text-base sm:text-lg font-serif-display italic text-white transition-all duration-1000 transform ${phase === i ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              "{text}"
            </h2>
          ))}
        </div>
      </div>
    </div>
  );
};
