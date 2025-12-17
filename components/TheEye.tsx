import React from 'react';

interface TheEyeProps {
  state: 'idle' | 'listening' | 'watching' | 'thinking' | 'angry';
}

export const TheEye: React.FC<TheEyeProps> = ({ state }) => {
  const getColor = () => {
    switch (state) {
      case 'idle': return 'text-zinc-500';
      case 'listening': return 'text-emerald-500';
      case 'watching': return 'text-indigo-500';
      case 'thinking': return 'text-white animate-pulse';
      case 'angry': return 'text-red-600';
      default: return 'text-zinc-500';
    }
  };

  const getSize = () => {
    switch (state) {
      case 'thinking': return 'scale-110';
      case 'angry': return 'scale-90';
      default: return 'scale-100';
    }
  };

  return (
    <div className={`relative flex items-center justify-center transition-all duration-1000 ${getSize()}`}>
      {/* Outer Glow */}
      <div className={`absolute w-48 h-48 rounded-full blur-3xl opacity-20 transition-colors duration-700 ${state === 'angry' ? 'bg-red-900' : 'bg-zinc-700'}`}></div>
      
      {/* The Eye SVG */}
      <svg 
        width="120" 
        height="120" 
        viewBox="0 0 100 100" 
        className={`relative z-10 transition-colors duration-700 ${getColor()}`}
        fill="currentColor"
      >
        <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="1" fill="none" className="opacity-30" />
        <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="0.5" fill="none" className="opacity-50 animate-spin-slow" />
        
        {/* Pupil */}
        <circle cx="50" cy="50" r={state === 'watching' ? 20 : 10} className="transition-all duration-500" />
        
        {/* Dynamic Iris Lines */}
        {state === 'thinking' && (
           <g className="animate-spin" style={{transformOrigin: '50px 50px', animationDuration: '3s'}}>
             <line x1="50" y1="10" x2="50" y2="20" stroke="currentColor" strokeWidth="2" />
             <line x1="50" y1="90" x2="50" y2="80" stroke="currentColor" strokeWidth="2" />
             <line x1="10" y1="50" x2="20" y2="50" stroke="currentColor" strokeWidth="2" />
             <line x1="90" y1="50" x2="80" y2="50" stroke="currentColor" strokeWidth="2" />
           </g>
        )}
      </svg>
    </div>
  );
};
