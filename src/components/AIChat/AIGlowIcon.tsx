import React from 'react';
import { Sparkles } from 'lucide-react';
import styles from './AIGlowIcon.module.css';

interface AIGlowIconProps {
  size?: number;
}

/**
 * AIGlowIcon - Ícono animado con efecto de resplandor para el asistente de IA
 * Usa el ícono de estrella (Sparkles) del logo de CloudDocs Copilot
 * con colores del proyecto y animación de pulso
 */
export const AIGlowIcon: React.FC<AIGlowIconProps> = ({ size = 120 }) => {
  // El círculo es 60% del contenedor (40% disponible para anillos),
  // el ícono es 55% del círculo
  const circleSize = size * 0.6;
  const iconSize = circleSize * 0.55;

  return (
    <div 
      className={styles.glowContainer}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <div className={styles.glowCircle}>
        <Sparkles
          size={iconSize}
          color="#ffffff"
          strokeWidth={2}
          className={styles.sparkleIcon}
        />
      </div>
    </div>
  );
};
