import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-make-primary text-[10px] md:text-xs font-bold mb-1 uppercase tracking-widest">{label}</label>}
      <input
        className={`
          w-full bg-white border-2 border-transparent rounded-xl 
          text-make-textDark text-sm md:text-base p-3 placeholder-gray-400
          focus:outline-none focus:border-make-primary focus:ring-4 focus:ring-make-primary/20
          transition-all duration-300 select-text font-medium shadow-sm
          ${className}
        `}
        {...props}
      />
    </div>
  );
};