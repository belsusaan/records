import React from 'react';
import { motion } from 'framer-motion';

/**
 * CircularText component inspired by ReactBits
 * (https://reactbits.dev/text-animations/circular-text)
 * Renders rotating circular text around the center vinyl sticker.
 */
export default function CircularText({
  text = '• SIDE A • CANCIONES ESPECIALES •',
  spinDuration = 24,
  className = '',
  radius = 68,
  fontSize = 11,
  letterSpacing = '3px',
  color = '#e2c299',
  reverse = false,
  pathId = 'circularTextPath',
}) {
  const displayText = text.toUpperCase();
  const uniqueId = React.useId().replace(/:/g, '') || pathId;

  return (
    <div className={`relative flex items-center justify-center pointer-events-none ${className}`}>
      <motion.div
        animate={{ rotate: reverse ? -360 : 360 }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration: spinDuration,
        }}
        className="w-full h-full flex items-center justify-center origin-center"
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <path
              id={uniqueId}
              d={`M 100, 100 m -${radius}, 0 a ${radius},${radius} 0 1,1 ${radius * 2},0 a ${radius},${radius} 0 1,1 -${radius * 2},0`}
            />
          </defs>
          <text
            fill={color}
            fontSize={fontSize}
            fontWeight="600"
            letterSpacing={letterSpacing}
            className="font-serif-vintage uppercase select-none transition-colors duration-500"
            style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.8))' }}
          >
            <textPath
              href={`#${uniqueId}`}
              startOffset="50%"
              textAnchor="middle"
            >
              {displayText}
            </textPath>
          </text>
        </svg>
      </motion.div>
    </div>
  );
}
