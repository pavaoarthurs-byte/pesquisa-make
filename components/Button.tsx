import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'option' | 'ghost';
  isActive?: boolean;
  dynamicColor?: string; // Hex or HSL color string for dynamic gradients
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isActive = false, 
  dynamicColor,
  className = '', 
  style = {},
  ...props 
}) => {
  // Base transition for all buttons
  const baseStyle = "relative z-10 transition-all duration-300 ease-out rounded-xl md:rounded-2xl font-semibold flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-make-primary/50";
  
  let variantStyle = "";
  
  // Merge custom dynamic color into styles if provided
  const combinedStyle = dynamicColor ? { ...style, '--dynamic-color': dynamicColor } as React.CSSProperties : style;

  switch (variant) {
    case 'primary':
      // Subtle gradient + Deep Drop Shadow for depth
      // Hover: Brightness up + Stronger Glow
      variantStyle = `
        bg-gradient-to-b from-make-primary to-[#b8e030] text-make-textDark 
        shadow-[0_4px_10px_rgba(0,0,0,0.5),0_0_10px_rgba(203,245,66,0.1)] 
        hover:shadow-[0_10px_25px_rgba(0,0,0,0.4),0_0_30px_rgba(203,245,66,0.5)] 
        hover:scale-[1.02] hover:-translate-y-0.5 hover:brightness-110
        active:scale-[0.98] active:translate-y-0 active:duration-100 active:shadow-[0_2px_5px_rgba(0,0,0,0.5)]
        py-3 md:py-4 px-6 md:px-8 w-full text-base md:text-lg tracking-wide border border-white/20
      `;
      break;
    
    case 'option':
      // Dynamic Color Logic (For Rating Scale 1-10)
      if (dynamicColor) {
        // Default: Very subtle, glass-like
        // UPDATED: Text is now much whiter (gray-100) and has a drop-shadow for clarity
        const baseState = "bg-white/5 border-white/10 text-gray-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] drop-shadow-md";
        
        // Interaction: Lights up intensely
        // UPDATED: Reduced scale from 105/110 to 102/105 to prevent edge clipping
        const interactionState = `
          hover:bg-[var(--dynamic-color)] hover:border-[var(--dynamic-color)] hover:text-make-dark 
          hover:shadow-[0_0_25px_var(--dynamic-color),inset_0_2px_10px_rgba(255,255,255,0.4)] 
          hover:scale-[1.02] md:hover:scale-105 hover:-translate-y-0.5 md:hover:-translate-y-1
          hover:drop-shadow-none
          active:scale-[0.98] active:duration-100
        `;

        // Active: "LED On" look - Strong glow + Inner light
        // UPDATED: Reduced scale
        const activeState = isActive 
          ? "bg-[var(--dynamic-color)] border-[var(--dynamic-color)] text-make-dark shadow-[0_0_35px_var(--dynamic-color),inset_0_2px_10px_rgba(255,255,255,0.4)] scale-[1.02] md:scale-105 -translate-y-0.5 md:-translate-y-1 z-20 font-bold"
          : baseState;

        variantStyle = `border py-2 px-3 md:py-3 md:px-4 text-sm md:text-xl backdrop-blur-sm ${activeState} ${interactionState}`;
      } 
      // Standard Option Logic (For Text Choices)
      else {
        // UPDATED: Active scale reduced to 1.01/1.02
        const activeClasses = isActive 
          ? "bg-gradient-to-br from-make-primary to-make-auxiliary border-make-primary text-make-dark shadow-[0_0_20px_rgba(203,245,66,0.4),inset_0_2px_10px_rgba(255,255,255,0.3)] scale-[1.02] font-bold"
          : "bg-white/5 text-gray-100 border-white/10 shadow-[0_4px_6px_rgba(0,0,0,0.2)] drop-shadow-md hover:border-make-primary/50 hover:text-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(203,245,66,0.15)]";
        
        const clickFeedback = "active:scale-[0.98] active:duration-75 active:brightness-110";

        variantStyle = `border py-3 px-4 md:py-4 md:px-6 text-sm md:text-base backdrop-blur-md ${activeClasses} ${clickFeedback}`;
      }
      break;

    case 'secondary':
      variantStyle = "bg-transparent border border-make-auxiliary/50 text-make-primary shadow-[0_0_10px_rgba(0,0,0,0.2)] hover:bg-make-auxiliary/20 hover:text-white hover:border-make-auxiliary hover:shadow-[0_0_15px_rgba(50,103,58,0.4)] active:scale-95 py-3 px-6 text-sm md:text-base backdrop-blur-sm";
      break;
      
    case 'ghost':
      variantStyle = "bg-transparent text-gray-400 hover:text-white hover:bg-white/5 active:bg-white/10 active:scale-95 py-2 px-2 md:px-4 !rounded-xl text-xs md:text-sm font-medium transition-colors";
      break;
  }

  return (
    <button 
      className={`${baseStyle} ${variantStyle} ${className}`} 
      style={combinedStyle}
      {...props}
    >
      {children}
    </button>
  );
};