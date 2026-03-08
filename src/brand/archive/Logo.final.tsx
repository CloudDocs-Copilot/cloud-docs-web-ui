import React, { useId } from 'react';
import { Sparkles } from 'lucide-react';
import styles from './Logo.module.final.css?inline';

interface LogoProps {
  size?: number;
  variant?: 'default' | 'white' | 'gradient';
  className?: string;
  onClick?: () => void;
  animated?: boolean;
}

/**
 * Logo Component - CloudDocs Copilot (Final Design)
 * 
 * Logo corporativo que combina un ícono Sparkles de lucide-react 
 * sobre un folder de documento con gradiente, representando la 
 * gestión documental inteligente con IA.
 */
export const Logo: React.FC<LogoProps> = ({
  size = 40,
  variant = 'gradient',
  className = '',
  onClick,
  animated = false,
}) => {
  // Calculate proportional sizes
  const containerSize = size;
  const iconSize = size * 0.5; // Icon size relative to container
  const uniqueId = useId();
  const gradientId = `folder-gradient-${uniqueId}`;

  const getContainerClasses = () => {
    const classes = [styles.logoContainer];
    if (animated) classes.push(styles.logoAnimated);
    if (onClick) classes.push(styles.logoClickable);
    if (className) classes.push(className);
    return classes.join(' ');
  };

  const getGradientColors = () => {
    if (variant === 'white') {
      return { start: '#ffffff', end: '#f8f9fa' };
    }
    if (variant === 'gradient') {
      return { start: '#6366f1', end: '#d946ef' }; // 3-color gradient with purple in middle
    }
    // default
    return { start: '#6366f1', end: '#6366f1' };
  };

  const getIconColor = () => {
    if (variant === 'white') return '#6366f1';
    return '#ffffff';
  };

  const colors = getGradientColors();

  return (
    <div
      className={getContainerClasses()}
      style={{ width: containerSize, height: containerSize }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <svg
        width={containerSize}
        height={containerSize}
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.folderSvg}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
          <filter id="folder-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.2"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id={`${gradientId}-tab`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        
        {/* Folder shape */}
        <path
          d="M8 14C8 11.7909 9.79086 10 12 10H22L26 14H44C46.2091 14 48 15.7909 48 18V42C48 44.2091 46.2091 46 44 46H12C9.79086 46 8 44.2091 8 42V14Z"
          fill={`url(#${gradientId})`}
          filter="url(#folder-shadow)"
        />
        
        {/* Folder tab accent - improved 3D */}
        <path
          d="M22 10H12C9.79086 10 8 11.7909 8 14V18H26L22 10Z"
          fill={`url(#${gradientId}-tab)`}
        />
        
        {/* Inner shadow for depth */}
        <path
          d="M8 18V42C8 44.2091 9.79086 46 12 46H44C46.2091 46 48 44.2091 48 42V18H8Z"
          fill="black"
          opacity="0.05"
        />
      </svg>
      
      <div className={styles.iconWrapper}>
        <Sparkles
          size={iconSize}
          color={getIconColor()}
          strokeWidth={1.5}
          className={styles.logoIcon}
        />
      </div>
    </div>
  );
};

export default Logo;
