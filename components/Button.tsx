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
  const baseStyle = "relative overflow-hidden py-4 px-8 rounded-2xl text-sm font-bold tracking-wide transition-all duration-300 transform active:scale-[0.96] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed group";
  
  const variants = {
    primary: "rainbow-gradient text-white shadow-[0_10px_30px_rgba(255,0,102,0.3)] hover:shadow-[0_15px_40px_rgba(0,204,255,0.4)] hover:-translate-y-0.5",
    secondary: "bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 shadow-xl",
    ghost: "text-zinc-300 hover:text-white bg-transparent hover:bg-white/5"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {/* Gloss Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
      
      <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-md">
        {children}
      </span>
    </button>
  );
};