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
  minLabel = "Muito Insatisfeito", // Default value
  maxLabel = "Muito Satisfeito"   // Default value
}) => {
  
  // Interpolates between Red (Hue 0) and Brand Green (Hue ~74)
  // Saturation 90%, Lightness 60% (matches closely with #CBF542 which is ~74, 90, 61)
  const getGradientColor = (num: number) => {
    // 1 -> 0 deg (Red)
    // 10 -> 74 deg (Brand Green)
    // Formula: (num - 1) * (74 / 9)
    const minHue = 0;
    const maxHue = 74;
    const hue = minHue + ((num - 1) * (maxHue - minHue) / 9);
    
    return `hsl(${hue}, 90%, 60%)`;
  };

  return (
    <div className="w-full">
      {/* Grid with dynamic tight spacing for mobile */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2 md:gap-3 w-full">
        {RATING_SCALE.map((num) => (
          <Button
            key={num}
            variant="option"
            isActive={value === num}
            onClick={() => onChange(num)}
            dynamicColor={getGradientColor(num)}
            // Reduced heights and font sizes. Added 'p-0' to prevent padding overflow.
            className={`
              text-sm sm:text-base md:text-xl font-bold 
              h-9 sm:h-11 md:h-14 
              w-full p-0 flex items-center justify-center
              transition-transform 
              ${value === num ? 'scale-105 z-10' : ''}
            `}
          >
            {num}
          </Button>
        ))}
      </div>
      <div className="flex justify-between items-center text-[10px] md:text-sm font-medium text-gray-400 mt-3 md:mt-4 px-1 uppercase tracking-wide">
        <span className="flex items-center gap-1 md:gap-2">
          <span className="block w-1.5 h-1.5 md:w-2 md:h-2 rounded-full shadow-[0_0_8px_red]" style={{ backgroundColor: 'hsl(0, 90%, 60%)' }}></span>
          {minLabel}
        </span>
        <span className="flex items-center gap-1 md:gap-2 text-right">
          {maxLabel}
          <span className="block w-1.5 h-1.5 md:w-2 md:h-2 rounded-full shadow-[0_0_8px_#CBF542]" style={{ backgroundColor: '#CBF542' }}></span>
        </span>
      </div>
    </div>
  );
};