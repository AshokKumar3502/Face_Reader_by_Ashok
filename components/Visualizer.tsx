
import React from 'react';

interface VisualizerProps {
  state: 'idle' | 'waiting' | 'analyzing' | 'peaceful' | 'breathing';
}

export const Visualizer: React.FC<VisualizerProps> = ({ state }) => {
  
  const getContainerClass = () => {
    switch (state) {
      case 'idle': return 'scale-100 opacity-80';
      case 'waiting': return 'scale-110 opacity-100';
      case 'analyzing': return 'scale-125 opacity-100';
      case 'peaceful': return 'scale-100 opacity-90';
      case 'breathing': return 'scale-150 opacity-100 animate-[breathing_10s_ease-in-out_infinite]';
    }
  };

  const getCoreGradient = () => {
    switch (state) {
      case 'idle': return 'from-zinc-400 to-zinc-600 shadow-[0_0_30px_rgba(161,161,170,0.4)]';
      case 'waiting': return 'from-cyan-400 to-blue-600 shadow-[0_0_40px_rgba(6,182,212,0.6)]';
      case 'analyzing': return 'from-fuchsia-500 to-indigo-600 shadow-[0_0_50px_rgba(217,70,239,0.7)]';
      case 'peaceful': return 'from-emerald-400 to-teal-600 shadow-[0_0_40px_rgba(16,185,129,0.6)]';
      case 'breathing': return 'from-emerald-300 via-white to-teal-400 shadow-[0_0_80px_rgba(255,255,255,0.4)]';
    }
  };

  return (
    <div className={`relative flex items-center justify-center w-64 h-64 sm:w-80 sm:h-80 transition-all duration-700 ${getContainerClass()}`}>
      
      {/* Spectrum Halo */}
      <div className={`absolute inset-0 rounded-full blur-[60px] sm:blur-[80px] mix-blend-screen animate-[spin_15s_linear_infinite] opacity-60 bg-gradient-to-tr from-fuchsia-600 via-cyan-500 to-amber-400`}></div>

      {/* Breathing Ring Layer */}
      {state === 'breathing' && (
        <div className="absolute inset-0 rounded-full border border-white/40 animate-[ping_4s_linear_infinite] opacity-20"></div>
      )}

      {/* Layer 3: The Vivid Core */}
      <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
         <div className={`absolute inset-0 rounded-full blur-3xl transition-all duration-500 bg-gradient-to-br ${getCoreGradient()}`}></div>
         
         <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br transition-all duration-500 p-[1px] ${getCoreGradient()}`}>
            <div className="w-full h-full rounded-full bg-black/40 backdrop-blur-2xl flex items-center justify-center overflow-hidden relative">
               <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent animate-pulse"></div>
               <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white shadow-[0_0_15px_white] animate-pulse"></div>
            </div>
         </div>
      </div>

      <style>{`
        @keyframes breathing {
          0% { transform: scale(1.0); filter: blur(0px); }
          40% { transform: scale(1.4); filter: blur(2px); } /* Inhale (4s) */
          100% { transform: scale(1.0); filter: blur(0px); } /* Exhale (6s) */
        }
      `}</style>
    </div>
  );
};
