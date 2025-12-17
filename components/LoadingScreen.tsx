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

  // Dynamic colors for each phase
  const colors = [
    'rgba(147, 51, 234, 0.6)', // Purple
    'rgba(236, 72, 153, 0.6)', // Pink
    'rgba(59, 130, 246, 0.6)', // Blue
    'rgba(6, 182, 212, 0.6)',  // Cyan
    'rgba(16, 185, 129, 0.6)', // Emerald
    'rgba(245, 158, 11, 0.6)', // Amber
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((p) => (p + 1) % phases.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden">
      
      {/* Vibrant Shifting Background */}
      <div 
        className="absolute inset-0 transition-colors duration-1000 ease-in-out opacity-20"
        style={{ backgroundColor: colors[phase] }}
      ></div>

      {/* Orbiting Elements */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] border-4 border-white/5 rounded-full animate-[spin_60s_linear_infinite]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] border-2 border-white/10 rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] border border-dashed border-white/20 rounded-full animate-[spin_20s_linear_infinite]"></div>
      </div>

      {/* The Central Chromatic Core */}
      <div className="relative w-80 h-80 flex items-center justify-center scale-110">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className="absolute inset-0 border-2 rounded-[30%] animate-pulse"
            style={{
              borderColor: colors[(phase + i) % colors.length],
              transform: `rotate(${i * 30 + phase * 20}deg) scale(${1 + i * 0.1})`,
              boxShadow: `0 0 40px ${colors[(phase + i) % colors.length]}`,
              animationDelay: `${i * 0.15}s`,
              animationDuration: `2.5s`
            }}
          ></div>
        ))}
        
        {/* The White Hot Seed */}
        <div className="relative w-24 h-24 bg-white rounded-full shadow-[0_0_80px_rgba(255,255,255,0.8)] flex items-center justify-center z-10">
          <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-30"></div>
          <div className="w-6 h-6 bg-black rounded-full animate-pulse"></div>
        </div>

        {/* Dynamic Scan Ray */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-gradient-to-b from-transparent via-white to-transparent opacity-80 animate-[bounce_1.5s_infinite] shadow-[0_0_20px_white]"
        ></div>
      </div>

      {/* Full Color Typography */}
      <div className="mt-20 text-center space-y-8 z-10">
        <div className="flex flex-col gap-2">
          <span 
            className="text-xs font-mono uppercase tracking-[0.5em] font-black transition-colors duration-1000"
            style={{ color: colors[phase] }}
          >
            Spectrum Resonation
          </span>
          <div className="h-[2px] w-16 bg-white/20 mx-auto rounded-full overflow-hidden">
            <div className="h-full bg-white animate-[shimmer_2s_infinite] w-1/2"></div>
          </div>
        </div>

        <h2 className="text-3xl font-serif-display text-white italic drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] transition-all duration-500 transform">
          "{phases[phase]}"
        </h2>

        {/* Real-time Telemetry */}
        <div className="flex gap-8 justify-center font-mono text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold">
          <div className="flex flex-col items-start gap-1">
             <span className="text-white/80">FREQ: {(432.08 + phase * 12.5).toFixed(2)}Hz</span>
             <span>STRATUM: 0X{phase.toString(16).toUpperCase()}</span>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <div className="flex flex-col items-start gap-1">
             <span className="text-white/80">KOSHA: {['ANNAMAYA', 'PRANAMAYA', 'MANOMAYA', 'VIJNANAMAYA', 'ANANDAMAYA', 'NIRVANA'][phase]}</span>
             <span>CHROMATICITY: ACTIVE</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 left-0 right-0 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-black">
          Architected by Ashok
        </p>
      </div>
    </div>
  );
};