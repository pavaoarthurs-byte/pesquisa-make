import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-make-primary text-xs md:text-sm font-bold mb-1 md:mb-2 uppercase tracking-widest">{label}</label>}
      <input
        className={`
          w-full bg-white border-2 border-transparent rounded-xl 
          text-make-textDark text-base md:text-xl p-3 md:p-5 placeholder-gray-400
          focus:outline-none focus:border-make-primary focus:ring-4 focus:ring-make-primary/20
          transition-all duration-300 select-text font-medium shadow-sm
          ${className}
        `}
        {...props}
      />
    </div>
  );
};