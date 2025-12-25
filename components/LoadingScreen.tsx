
import React, { useState, useEffect } from 'react';

export const LoadingScreen: React.FC = () => {
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);

  const phases = [
    "Getting ready...",
    "Looking at your face...",
    "Understanding your mood...",
    "Feeling your heartbeat...",
    "Thinking about you...",
    "Almost done..."
  ];

  useEffect(() => {
    const phaseInterval = setInterval(() => {
      setPhase((p) => (p + 1) % phases.length);
    }, 2500);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 98;
        return prev + (100 - prev) * 0.1;
      });
    }, 400);

    return () => {
      clearInterval(phaseInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-[#08080a] flex flex-col items-center justify-center overflow-hidden animate-fade-in">
      <div className="absolute inset-0 bg-white/5 opacity-40"></div>

      <div className="relative w-64 h-64 flex items-center justify-center">
        <div className="absolute inset-0 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="relative w-20 h-20 rounded-full bg-white/5 backdrop-blur-3xl border border-white/20 flex items-center justify-center z-10 overflow-hidden">
           <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_15px_white] animate-pulse"></div>
        </div>
      </div>

      <div className="mt-16 text-center space-y-10 z-10 w-full max-w-xs px-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/40">Searching...</span>
            <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="relative h-8 flex items-center justify-center">
            {phases.map((text, i) => (
              <h2 
                key={i}
                className={`absolute text-base sm:text-lg font-serif-display italic text-white/90 transition-all duration-1000 transform ${
                  phase === i ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
                }`}
              >
                "{text}"
              </h2>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
