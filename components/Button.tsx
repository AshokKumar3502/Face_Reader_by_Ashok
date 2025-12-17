import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '',
  ...props 
}) => {
  const baseStyle = "relative overflow-hidden py-4 px-8 rounded-2xl text-sm font-medium transition-all duration-200 transform active:scale-[0.98] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed group";
  
  const variants = {
    primary: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]",
    secondary: "bg-zinc-900/40 backdrop-blur-md border border-zinc-700/50 text-zinc-300 hover:text-white hover:bg-zinc-800/60 hover:border-zinc-600",
    ghost: "text-zinc-500 hover:text-white bg-transparent hover:bg-white/5"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {/* Shimmer Effect */}
      {variant === 'primary' && (
        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0 pointer-events-none"></div>
      )}
      
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
};