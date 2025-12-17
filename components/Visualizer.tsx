import React from 'react';

interface VisualizerProps {
  state: 'idle' | 'waiting' | 'analyzing' | 'peaceful';
}

export const Visualizer: React.FC<VisualizerProps> = ({ state }) => {
  
  const getContainerClass = () => {
    switch (state) {
      case 'idle': return 'scale-100 opacity-80';
      case 'waiting': return 'scale-110 opacity-100';
      case 'analyzing': return 'scale-125 opacity-100';
      case 'peaceful': return 'scale-100 opacity-90';
    }
  };

  const getCoreGradient = () => {
    switch (state) {
      case 'idle': return 'from-zinc-400 to-zinc-600 shadow-[0_0_30px_rgba(161,161,170,0.4)]';
      case 'waiting': return 'from-cyan-400 to-blue-600 shadow-[0_0_40px_rgba(6,182,212,0.6)]';
      case 'analyzing': return 'from-fuchsia-500 to-indigo-600 shadow-[0_0_50px_rgba(217,70,239,0.7)]';
      case 'peaceful': return 'from-emerald-400 to-teal-600 shadow-[0_0_40px_rgba(16,185,129,0.6)]';
    }
  };

  return (
    <div className={`relative flex items-center justify-center w-80 h-80 transition-all duration-700 ${getContainerClass()}`}>
      
      {/* Spectrum Halo */}
      <div className={`absolute inset-0 rounded-full blur-[80px] mix-blend-screen animate-[spin_15s_linear_infinite] opacity-60 bg-gradient-to-tr from-fuchsia-600 via-cyan-500 to-amber-400`}></div>

      {/* Layer 2: The Energy Rings (Pulse) */}
      <div className={`absolute w-56 h-56 rounded-full border-2 border-white/20 blur-[1px] animate-[ping_3s_ease-in-out_infinite] opacity-30`}></div>
      <div className={`absolute w-72 h-72 rounded-full border border-white/10 blur-[2px] animate-[ping_5s_ease-in-out_infinite] opacity-20`}></div>

      {/* Layer 3: The Vivid Core */}
      <div className="relative w-40 h-40 flex items-center justify-center">
         <div className={`absolute inset-0 rounded-full blur-3xl transition-all duration-500 bg-gradient-to-br ${getCoreGradient()}`}></div>
         
         <div className={`w-32 h-32 rounded-full bg-gradient-to-br transition-all duration-500 p-[1px] ${getCoreGradient()}`}>
            <div className="w-full h-full rounded-full bg-black/40 backdrop-blur-2xl flex items-center justify-center overflow-hidden relative">
               <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent animate-pulse"></div>
               <div className="w-4 h-4 rounded-full bg-white shadow-[0_0_20px_white] animate-pulse"></div>
            </div>
         </div>
      </div>

      {/* State Text Indicator */}
      {state === 'analyzing' && (
         <div className="absolute inset-0 flex items-center justify-center animate-spin-slow">
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>
         </div>
      )}
    </div>
  );
};