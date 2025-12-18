import React, { useState, useEffect } from 'react';

export const LoadingScreen: React.FC = () => {
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);

  const phases = [
    "Initializing neural bridge...",
    "Scanning facial architecture...",
    "Mapping emotional layers...",
    "Decoding micro-expressions...",
    "Synthesizing inner state...",
    "Finalizing self-understanding..."
  ];

  const colors = [
    'rgba(99, 102, 241, 0.2)',  // Indigo
    'rgba(168, 85, 247, 0.2)',  // Purple
    'rgba(236, 72, 153, 0.2)',  // Pink
    'rgba(20, 184, 166, 0.2)',  // Teal
    'rgba(59, 130, 246, 0.2)',  // Blue
    'rgba(255, 255, 255, 0.1)', // Neutral
  ];

  useEffect(() => {
    const phaseInterval = setInterval(() => {
      setPhase((p) => (p + 1) % phases.length);
    }, 3000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 98; // Hold at 98% until model returns
        return prev + (100 - prev) * 0.1; // Smoothly approach 100%
      });
    }, 400);

    return () => {
      clearInterval(phaseInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-[#08080a] flex flex-col items-center justify-center overflow-hidden animate-fade-in">
      
      {/* Liquid Ambient Background */}
      <div 
        className="absolute inset-0 transition-colors duration-[2000ms] ease-in-out opacity-40"
        style={{ backgroundColor: colors[phase] }}
      ></div>

      {/* High-Performance Orbital Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] border-[1px] border-white/5 rounded-full animate-[spin_40s_linear_infinite] will-change-transform"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] border-[0.5px] border-white/10 rounded-full animate-[spin_25s_linear_infinite_reverse] will-change-transform"></div>
        
        {/* Scanning Sweep */}
        <div className="absolute top-0 left-0 w-full h-[30vh] bg-gradient-to-b from-white/[0.03] to-transparent animate-[scan_4s_ease-in-out_infinite] pointer-events-none"></div>
      </div>

      {/* The Neural Core */}
      <div className="relative w-64 h-64 flex items-center justify-center scale-90 sm:scale-100">
        {/* Pulsing Aura */}
        <div className="absolute inset-0 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        
        {/* Floating Geometry */}
        {[...Array(3)].map((_, i) => (
          <div 
            key={i}
            className="absolute inset-0 border-[0.5px] border-white/20 rounded-[40%] transition-transform duration-[3000ms] ease-in-out"
            style={{
              transform: `rotate(${i * 60 + phase * 45}deg) scale(${1 + i * 0.05})`,
              boxShadow: `0 0 20px ${colors[phase]}`,
            }}
          ></div>
        ))}
        
        {/* The Steady Seed */}
        <div className="relative w-20 h-20 rounded-full bg-white/5 backdrop-blur-3xl border border-white/20 flex items-center justify-center z-10 overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent"></div>
           <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_15px_white] animate-pulse"></div>
        </div>
      </div>

      {/* Typography & Progress */}
      <div className="mt-16 text-center space-y-10 z-10 w-full max-w-xs px-6">
        
        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/40">
              Neural Synthesis
            </span>
            
            {/* Smooth Progress Bar */}
            <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-700 ease-out shadow-[0_0_10px_white]"
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

        {/* Technical Data Stream */}
        <div className="flex flex-col items-center gap-1 opacity-30">
          <div className="flex gap-4 font-mono text-[8px] uppercase tracking-widest font-black text-white">
            <span>Scan Depth: 0.{(4500 + progress * 54).toFixed(0)}m</span>
            <span className="w-px h-3 bg-white/20"></span>
            <span>Signal: {progress > 90 ? 'Stable' : 'Acquiring'}</span>
          </div>
        </div>
      </div>

      {/* Footer Branded Subtitle */}
      <div className="absolute bottom-12 left-0 right-0 text-center px-4">
        <p className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-black">
          Self Understanding Assistant • Architected by Ashok
        </p>
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(300%); opacity: 0; }
        }
      `}</style>
    </div>
  );
};