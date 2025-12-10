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
  // UNIFORM TYPOGRAPHY & BASE STYLE
  // Changed to text-sm md:text-base for consistency across all buttons
  // Added min-h to ensure touch targets remain accessible despite smaller visual size
  // Added whitespace-normal, break-words, text-center, and leading-tight to handle long text gracefully
  const baseStyle = "relative z-10 transition-all duration-200 ease-out rounded-xl font-semibold tracking-wide flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-make-primary/50 text-sm md:text-base whitespace-normal break-words text-center leading-tight";
  
  let variantStyle = "";
  
  // Merge custom dynamic color into styles if provided
  const combinedStyle = dynamicColor ? { ...style, '--dynamic-color': dynamicColor } as React.CSSProperties : style;

  switch (variant) {
    case 'primary':
      // COMPACT PRIMARY BUTTON
      variantStyle = `
        bg-gradient-to-b from-make-primary to-[#b8e030] text-make-textDark 
        shadow-[0_2px_8px_rgba(0,0,0,0.5),0_0_8px_rgba(203,245,66,0.1)] 
        hover:shadow-[0_4px_12px_rgba(0,0,0,0.4),0_0_15px_rgba(203,245,66,0.3)] 
        hover:scale-[1.03] hover:-translate-y-0.5 hover:brightness-105
        active:scale-[0.98] active:translate-y-0 active:duration-75 active:shadow-[0_1px_4px_rgba(0,0,0,0.5)]
        py-2.5 px-6 md:py-3 md:px-8 w-full border border-white/20
      `;
      break;
    
    case 'option':
      // COMPACT OPTION BUTTONS
      if (dynamicColor) {
        // Rating Scale 1-10 & Colored Options (like Pior Coisa)
        const baseState = "bg-white/5 border-white/10 text-gray-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] drop-shadow-sm";
        
        // Refined interaction: Glowy OUTLINE on hover, NOT fill.
        // Fill only happens when Active.
        const interactionState = `
          hover:border-[var(--dynamic-color)] 
          hover:shadow-[0_0_10px_var(--dynamic-color),inset_0_0_5px_rgba(255,255,255,0.1)] 
          hover:scale-[1.05] hover:-translate-y-0.5 hover:text-white
          active:scale-[0.95] active:duration-75
        `;

        const activeState = isActive 
          ? "bg-[var(--dynamic-color)] border-[var(--dynamic-color)] text-make-dark shadow-[0_0_20px_var(--dynamic-color),inset_0_1px_5px_rgba(255,255,255,0.4)] scale-[1.05] -translate-y-0.5 z-20 font-bold hover:bg-[var(--dynamic-color)] hover:text-make-dark"
          : baseState;

        // Removed generic py/px here as RatingGrid controls height/padding via className, 
        // but set backdrop-blur and border
        variantStyle = `border backdrop-blur-sm ${activeState} ${interactionState}`;
      } 
      else {
        // Text Choices (Melhor/Pior/Etc) without dynamic color
        // Reduced padding significantly (px-2 md:px-4) to prevent overflow on mobile with long text
        const activeClasses = isActive 
          ? "bg-gradient-to-br from-make-primary to-make-auxiliary border-make-primary text-make-dark shadow-[0_0_15px_rgba(203,245,66,0.3),inset_0_1px_5px_rgba(255,255,255,0.3)] scale-[1.02] -translate-y-0.5"
          : "bg-white/5 text-gray-100 border-white/10 shadow-[0_2px_4px_rgba(0,0,0,0.2)] drop-shadow-sm hover:border-make-primary/50 hover:text-white hover:bg-white/10 hover:shadow-[0_0_10px_rgba(203,245,66,0.15)] hover:scale-[1.01]";
        
        const clickFeedback = "active:scale-[0.98] active:duration-75 active:brightness-110 active:translate-y-0";

        variantStyle = `border py-2.5 px-2 md:py-3 md:px-4 backdrop-blur-md ${activeClasses} ${clickFeedback}`;
      }
      break;

    case 'secondary':
      // COMPACT SECONDARY
      variantStyle = "bg-transparent border border-make-auxiliary/50 text-make-primary shadow-[0_0_5px_rgba(0,0,0,0.2)] hover:bg-make-auxiliary/20 hover:text-white hover:border-make-auxiliary hover:shadow-[0_0_10px_rgba(50,103,58,0.4)] hover:scale-[1.03] active:scale-[0.98] active:duration-75 py-2.5 px-4 md:py-3 md:px-6 backdrop-blur-sm";
      break;
      
    case 'ghost':
      variantStyle = "bg-transparent text-gray-400 hover:text-white hover:bg-white/5 active:bg-white/10 active:scale-95 py-2 px-3 !rounded-lg text-xs md:text-sm transition-colors duration-150";
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