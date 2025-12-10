import React from 'react';
import { Button } from './Button';
import { RATING_SCALE } from '../constants';

interface RatingGridProps {
  value: number | null;
  onChange: (val: number) => void;
  minLabel?: string;
  maxLabel?: string;
}

export const RatingGrid: React.FC<RatingGridProps> = ({ 
  value, 
  onChange,
  minLabel = "Muito Insatisfeito",
  maxLabel = "Muito Satisfeito"
}) => {
  
  const getGradientColor = (num: number) => {
    const minHue = 0;
    const maxHue = 74;
    const hue = minHue + ((num - 1) * (maxHue - minHue) / 9);
    return `hsl(${hue}, 90%, 60%)`;
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-5 gap-1.5 w-full">
        {RATING_SCALE.map((num) => (
          <Button
            key={num}
            variant="option"
            isActive={value === num}
            onClick={() => onChange(num)}
            dynamicColor={getGradientColor(num)}
            // Altura reduzida (h-9) para caber melhor em telas curtas
            className={`
              h-9 sm:h-10 md:h-12 
              w-full p-0 flex items-center justify-center
              ${value === num ? 'scale-[1.02] z-10' : ''}
            `}
          >
            {num}
          </Button>
        ))}
      </div>
      <div className="flex justify-between items-center text-[10px] md:text-xs font-medium text-gray-400 mt-2 px-1 uppercase tracking-wide">
        <span className="flex items-center gap-1.5">
          <span className="block w-1.5 h-1.5 rounded-full shadow-[0_0_5px_red]" style={{ backgroundColor: 'hsl(0, 90%, 60%)' }}></span>
          {minLabel}
        </span>
        <span className="flex items-center gap-1.5 text-right">
          {maxLabel}
          <span className="block w-1.5 h-1.5 rounded-full shadow-[0_0_5px_#CBF542]" style={{ backgroundColor: '#CBF542' }}></span>
        </span>
      </div>
    </div>
  );
};