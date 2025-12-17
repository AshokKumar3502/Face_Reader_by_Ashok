import React from 'react';

interface VisualizerProps {
  state: 'idle' | 'waiting' | 'analyzing' | 'peaceful';
}

export const Visualizer: React.FC<VisualizerProps> = ({ state }) => {
  
  // Dynamic class generation for complex states
  const getContainerClass = () => {
    switch (state) {
      case 'idle': return 'scale-100 opacity-60';
      case 'waiting': return 'scale-110 opacity-90';
      case 'analyzing': return 'scale-125 opacity-100';
      case 'peaceful': return 'scale-100 opacity-80';
    }
  };

  const getCoreColor = () => {
    switch (state) {
      case 'idle': return 'bg-zinc-500';
      case 'waiting': return 'bg-teal-400';
      case 'analyzing': return 'bg-indigo-400';
      case 'peaceful': return 'bg-emerald-300';
    }
  };

  return (
    <div className={`relative flex items-center justify-center w-80 h-80 transition-all duration-300 ${getContainerClass()}`}>
      
      {/* Layer 1: The Ambient Nebula (Slow Spin) */}
      <div className={`absolute inset-0 rounded-full blur-[80px] mix-blend-screen animate-[spin_10s_linear_infinite] opacity-40 ${
        state === 'analyzing' ? 'bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900' : 
        state === 'peaceful' ? 'bg-gradient-to-r from-teal-900 via-emerald-900 to-cyan-900' :
        'bg-gradient-to-r from-zinc-800 to-zinc-900'
      }`}></div>

      {/* Layer 2: The Energy Rings (Pulse) */}
      <div className={`absolute w-48 h-48 rounded-full border border-white/10 blur-[1px] animate-[ping_3s_ease-in-out_infinite] opacity-20`}></div>
      <div className={`absolute w-64 h-64 rounded-full border border-white/5 blur-[2px] animate-[ping_4s_ease-in-out_infinite] opacity-10 animation-delay-1000`}></div>

      {/* Layer 3: The Liquid Core (Morphing) */}
      <div className="relative w-32 h-32 flex items-center justify-center">
         {/* Inner Glow */}
         <div className={`absolute inset-0 rounded-full blur-2xl transition-colors duration-300 opacity-50 ${getCoreColor()}`}></div>
         
         {/* The Solid Sphere */}
         <div className="w-24 h-24 rounded-full bg-gradient-to-br from-white/20 to-transparent backdrop-blur-md border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center justify-center overflow-hidden">
            {/* Internal movement */}
            <div className={`absolute w-full h-full bg-gradient-to-t from-white/10 to-transparent animate-pulse-slow`}></div>
         </div>
      </div>

      {/* State Text Indicator */}
      {state === 'analyzing' && (
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none">
            <div className="w-1 h-1 bg-white rounded-full mx-auto shadow-[0_0_10px_white] animate-bounce"></div>
         </div>
      )}
    </div>
  );
};