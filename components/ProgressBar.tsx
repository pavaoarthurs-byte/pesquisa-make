import React, { useEffect, useState } from 'react';

export const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => {
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Monitorar redimensionamento da tela para ajustar o caminho SVG
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { width, height } = dimensions;
  
  // Espessura da linha e inset para não cortar o brilho nas bordas
  const strokeWidth = 5;
  const pad = strokeWidth / 2; // Inset de metade da borda

  // Define os pontos do caminho (box percorrendo as bordas)
  // M (Move to): Meio do Topo
  // L (Line to): Canto Superior Direito -> Canto Inferior Direito -> Canto Inferior Esquerdo -> Canto Superior Esquerdo -> Meio do Topo
  const pathData = `
    M ${width / 2} ${pad}
    L ${width - pad} ${pad}
    L ${width - pad} ${height - pad}
    L ${pad} ${height - pad}
    L ${pad} ${pad}
    L ${width / 2} ${pad}
  `;

  // Cálculo do perímetro total para a animação do dasharray
  // Largura total (menos padding) * 2 + Altura total (menos padding) * 2
  const perimeter = (2 * (width - 2 * pad)) + (2 * (height - 2 * pad));

  // Garante o início mínimo de 0.25% conforme solicitado
  const safeProgress = Math.max(0.25, progress);
  
  // O offset define quanto da linha está "escondido". 
  // Se progress for 100%, offset é 0 (tudo visível).
  // Se progress for 0%, offset é igual ao perímetro (tudo escondido).
  const strokeDashoffset = perimeter - (safeProgress / 100) * perimeter;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <svg width={width} height={height} className="w-full h-full">
        <defs>
          <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Trilha de Fundo (opcional, para mostrar o caminho apagado) */}
        <path
          d={pathData}
          fill="none"
          stroke="#32673A" 
          strokeWidth={strokeWidth}
          opacity="0.2"
          strokeLinejoin="round"
        />

        {/* Linha de Progresso Neon */}
        <path
          d={pathData}
          fill="none"
          stroke="#CBF542" // Cor Neon da MAKE
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={perimeter}
          strokeDashoffset={strokeDashoffset}
          filter="url(#neon-glow)"
          // Increased duration to 2.5s and used cubic-bezier for a smoother, less robotic movement
          style={{ transition: 'stroke-dashoffset 2.5s cubic-bezier(0.4, 0, 0.2, 1)' }} 
        />
      </svg>
    </div>
  );
};