import React, { useState, useEffect } from 'react';

export const LoadingScreen: React.FC = () => {
  const [phase, setPhase] = useState(0);
  const phases = [
    "Aligning with your frequency...",
    "Peeling back the outer sheath...",
    "Listening to the silence...",
    "Decoding the emotional resonance...",
    "Mirroring the soul...",
    "Finalizing the reflection..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((p) => (p + 1) % phases.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-[#050507] flex flex-col items-center justify-center overflow-hidden">
      {/* Background Occult/Tech Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] border border-white/5 rounded-full animate-[spin_60s_linear_infinite]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] border border-white/10 rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] border border-dashed border-white/5 rounded-full animate-[spin_20s_linear_infinite]"></div>
      </div>

      {/* The Central Resonance Core */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Layered Mandalas */}
        {[...Array(5)].map((_, i) => (
          <div 
            key={i}
            className="absolute inset-0 border border-amber-500/20 rounded-xl animate-pulse"
            style={{
              transform: `rotate(${i * 15}deg) scale(${1 + i * 0.1})`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${3 + i}s`
            }}
          ></div>
        ))}
        
        {/* The Pulsing Eye/Seed */}
        <div className="relative w-16 h-16 bg-white rounded-full shadow-[0_0_50px_rgba(255,255,255,0.4)] flex items-center justify-center">
          <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20"></div>
          <div className="w-4 h-4 bg-black rounded-full animate-pulse"></div>
        </div>

        {/* Scanning Beam */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-amber-400 to-transparent opacity-50 animate-[bounce_2s_infinite]"></div>
      </div>

      {/* Scientific/Mystical Metadata */}
      <div className="mt-16 text-center space-y-6 z-10">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-amber-500/60 font-bold">
            Quantum Resonance Scan
          </span>
          <div className="h-px w-12 bg-amber-500/30 mx-auto"></div>
        </div>

        <h2 className="text-2xl font-serif-display text-white italic animate-fade-in key={phase}">
          "{phases[phase]}"
        </h2>

        {/* Pseudo-Data Stream */}
        <div className="flex gap-4 justify-center font-mono text-[8px] text-zinc-600 uppercase tracking-widest">
          <div className="flex flex-col items-start">
             <span>RES: 432.08Hz</span>
             <span>STRATUM: LEVEL_{phase + 1}</span>
          </div>
          <div className="w-px h-6 bg-white/10"></div>
          <div className="flex flex-col items-start">
             <span>KOSHA: {['ANNA', 'PRANA', 'MANO', 'VIJNANA', 'ANANDA'][Math.min(phase, 4)]}</span>
             <span>ENTROPY: 0.002%</span>
          </div>
        </div>
      </div>

      {/* Developer Credit Footer */}
      <div className="absolute bottom-12 left-0 right-0 text-center opacity-40">
        <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 font-bold">
          System Initialized by Ashok
        </p>
      </div>
    </div>
  );
};
