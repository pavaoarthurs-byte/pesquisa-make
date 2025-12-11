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
      {/* 
        Layout alterado para Flex com justify-between para garantir linha única.
        gap-1 no mobile para caber 10 itens, aumentando em telas maiores.
      */}
      <div className="flex w-full justify-between items-center gap-1 md:gap-2">
        {RATING_SCALE.map((num) => (
          <Button
            key={num}
            variant="option"
            isActive={value === num}
            onClick={() => onChange(num)}
            dynamicColor={getGradientColor(num)}
            // !rounded-full força o círculo sobrescrevendo o rounded-xl padrão do Button
            // Tamanhos responsivos: w-7 (28px) mobile -> w-12 (48px) desktop
            className={`
              !rounded-full aspect-square
              w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12
              p-0 flex items-center justify-center
              text-xs sm:text-sm md:text-base
              ${value === num ? 'scale-110 z-10 font-bold' : ''}
            `}
          >
            {num}
          </Button>
        ))}
      </div>
      
      <div className="flex justify-between items-center text-[10px] md:text-xs font-medium text-gray-400 mt-3 px-1 uppercase tracking-wide">
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