import React from 'react';
import Svg, { Circle, Path, Polygon, G } from 'react-native-svg';

/**
 * Icona della bandiera della Tunisia a forma di cerchio
 * @param {number} size - Dimensione dell'icona (default: 24)
 * @param {string} color - Colore del bordo (opzionale)
 * @param {boolean} isHome - Se true, l'icona è più grande (per il tasto Home)
 */
const TunisiaFlagIcon = ({ size = 24, color, isHome = false }) => {
  // Per il tasto Home, ingrandiamo del 30%
  const scaleFactor = isHome ? 1.4 : 1.0;
  const finalSize = size * scaleFactor;
  
  // Scala l'icona per riempire meglio lo spazio
  const scale = 1.2;
  const viewSize = finalSize * scale;
  const center = viewSize / 2;
  const radius = (finalSize / 2) - 1;
  
  // Colori bandiera Tunisia
  const redColor = '#E70013';    // Rosso tunisino
  const whiteColor = '#FFFFFF';  // Bianco

  // Dimensioni più grandi per i simboli
  const whiteCircleRadius = radius * 0.50;
  const symbolSize = radius * 0.40; // Simboli più grandi
  const spacing = radius * 0.08;    // Spazio tra mezzaluna e stella

  return (
    <Svg 
      width={finalSize} 
      height={finalSize} 
      viewBox={`0 0 ${viewSize} ${viewSize}`}
      style={{ 
        marginTop: isHome ? -4 : 0,
        marginBottom: isHome ? -4 : 0 
      }}
    >
      <G transform={`translate(${(viewSize - finalSize) / 2}, ${(viewSize - finalSize) / 2})`}>
        {/* Cerchio rosso esterno (sfondo) */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill={redColor}
          stroke={color || redColor}
          strokeWidth={isHome ? 1.5 : 1}
        />
        
        {/* Cerchio bianco interno */}
        <Circle
          cx={center}
          cy={center}
          r={whiteCircleRadius}
          fill={whiteColor}
        />
        
        {/* Gruppo mezzaluna + stella */}
        <G>
          {/* Mezzaluna rossa - a sinistra (sistemata per essere più visibile) */}
          <Path
            d={`
              M ${center - spacing} ${center - symbolSize}
              A ${symbolSize} ${symbolSize} 0 1 1 ${center - spacing} ${center + symbolSize}
              A ${symbolSize * 0.70} ${symbolSize * 0.70} 0 1 0 ${center - spacing} ${center - symbolSize}
              Z
            `}
            fill={redColor}
          />
          
          {/* Stella a 5 punte rossa - a destra */}
          <Polygon
            points={`
              ${center + spacing + symbolSize * 0.6},${center - symbolSize * 0.95}
              ${center + spacing + symbolSize * 0.9},${center - symbolSize * 0.3}
              ${center + spacing + symbolSize * 1.4},${center - symbolSize * 0.3}
              ${center + spacing + symbolSize * 1.0},${center + symbolSize * 0.1}
              ${center + spacing + symbolSize * 1.15},${center + symbolSize * 0.65}
              ${center + spacing + symbolSize * 0.6},${center + symbolSize * 0.4}
              ${center + spacing + symbolSize * 0.05},${center + symbolSize * 0.65}
              ${center + spacing + symbolSize * 0.2},${center + symbolSize * 0.1}
              ${center + spacing - symbolSize * 0.3},${center - symbolSize * 0.3}
              ${center + spacing + symbolSize * 0.2},${center - symbolSize * 0.3}
            `}
            fill={redColor}
          />
        </G>
      </G>
    </Svg>
  );
};

export default TunisiaFlagIcon;
