import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '',
  ...props 
}) => {
  const baseStyle = "relative overflow-hidden py-4 px-8 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 transform active:scale-[0.98] focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed group flex items-center justify-center gap-3";
  
  const variants = {
    primary: "bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_35px_rgba(79,70,229,0.5)] hover:bg-indigo-500 border border-indigo-400/30",
    secondary: "bg-white/5 backdrop-blur-2xl border border-white/10 text-white hover:bg-white/10 hover:border-white/20 shadow-2xl",
    ghost: "text-zinc-400 hover:text-white bg-transparent hover:bg-white/5 border border-transparent hover:border-white/5",
    danger: "bg-rose-950/30 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {/* Refined Gloss Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Subtle Bottom Light Reflection */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

      <span className="relative z-10 drop-shadow-sm flex items-center justify-center gap-2">
        {children}
      </span>

      {/* Hover Pulse Effect for Primary */}
      {variant === 'primary' && (
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1)_0%,_transparent_70%)]"></div>
      )}
    </button>
  );
};