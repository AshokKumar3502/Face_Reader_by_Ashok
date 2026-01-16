
import React from 'react';

interface VisualizerProps {
  state: 'idle' | 'waiting' | 'analyzing' | 'peaceful' | 'breathing';
}

export const Visualizer: React.FC<VisualizerProps> = ({ state }) => {
  
  const getColorTheme = () => {
    switch (state) {
      case 'idle': return 'from-slate-400 to-zinc-900';
      case 'analyzing': return 'from-indigo-400 to-blue-900';
      case 'peaceful': return 'from-emerald-400 to-teal-900';
      default: return 'from-white/20 to-zinc-800';
    }
  };

  return (
    <div className="relative flex items-center justify-center w-64 h-64 sm:w-80 sm:h-80 transition-all duration-1000 scale-100" style={{ transformStyle: 'preserve-3d' }}>
      
      {/* Dynamic Aura Background */}
      <div className={`absolute inset-0 rounded-full blur-[80px] opacity-30 mix-blend-screen transition-all duration-1000 bg-gradient-to-tr ${getColorTheme()}`}></div>

      {/* Primary 3D Sculpt */}
      <div className="relative w-40 h-40 flex items-center justify-center animate-[float-3d_6s_ease-in-out_infinite]" style={{ transformStyle: 'preserve-3d' }}>
         
         {/* Kinetic Axis Ring */}
         <div className="absolute inset-[-40px] border border-white/5 rounded-full animate-[spin_20s_linear_infinite]" style={{ transform: 'rotateX(70deg)' }}></div>
         <div className="absolute inset-[-60px] border border-white/5 rounded-full animate-[spin_30s_linear_infinite_reverse]" style={{ transform: 'rotateY(60deg)' }}></div>
         
         {/* Central Core */}
         <div className={`w-28 h-28 rounded-full bg-gradient-to-br transition-all duration-1000 p-[1px] relative overflow-hidden ${getColorTheme()}`} style={{ transform: 'translateZ(20px)' }}>
            <div className="w-full h-full rounded-full bg-black/80 backdrop-blur-2xl flex items-center justify-center">
               <div className="relative w-4 h-4 bg-white rounded-full shadow-[0_0_20px_white] animate-pulse"></div>
               <div className="absolute inset-[-20px] border border-white/10 rounded-full animate-ping opacity-20"></div>
            </div>
         </div>

         {/* Floating Elements */}
         <div className="absolute w-2 h-2 bg-indigo-400 rounded-full blur-[1px]" style={{ transform: 'translateZ(50px) translateX(60px)' }}></div>
         <div className="absolute w-1.5 h-1.5 bg-emerald-400 rounded-full blur-[1px]" style={{ transform: 'translateZ(40px) translateY(-60px)' }}></div>
      </div>
    </div>
  );
};
