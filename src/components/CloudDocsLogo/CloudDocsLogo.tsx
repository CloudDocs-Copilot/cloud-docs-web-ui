import React from 'react';

interface CloudDocsLogoProps {
  size?: number;
  className?: string;
}

/**
 * CloudDocsLogo - Logo personalizado con gradiente de marca
 * Combina un documento con un elemento de IA (sparkle) para representar
 * la propuesta de valor: gestión documental inteligente con IA
 */
export const CloudDocsLogo: React.FC<CloudDocsLogoProps> = ({ 
  size = 28,
  className 
}) => {
  // ID único para el gradiente SVG
  const gradientId = 'cloudDocsGradient';
  const sparkleGradientId = 'sparkleGradient';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="CloudDocs Copilot Logo"
    >
      <defs>
        {/* Gradiente principal de marca */}
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        {/* Gradiente para el sparkle */}
        <linearGradient id={sparkleGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a5b4fc" />
          <stop offset="100%" stopColor="#c4b5fd" />
        </linearGradient>
      </defs>

      {/* Documento base con esquina doblada */}
      <path
        d="M6 4C6 2.89543 6.89543 2 8 2H18L26 10V28C26 29.1046 25.1046 30 24 30H8C6.89543 30 6 29.1046 6 28V4Z"
        fill={`url(#${gradientId})`}
      />
      
      {/* Esquina doblada del documento */}
      <path
        d="M18 2V8C18 9.10457 18.8954 10 20 10H26L18 2Z"
        fill="rgba(255, 255, 255, 0.3)"
      />

      {/* Líneas del documento */}
      <rect x="10" y="14" width="12" height="2" rx="1" fill="rgba(255, 255, 255, 0.6)" />
      <rect x="10" y="19" width="8" height="2" rx="1" fill="rgba(255, 255, 255, 0.4)" />
      <rect x="10" y="24" width="10" height="2" rx="1" fill="rgba(255, 255, 255, 0.4)" />

      {/* Sparkle de IA - representa la inteligencia artificial */}
      <g transform="translate(20, 2)">
        {/* Estrella/chispa principal */}
        <path
          d="M6 0L7.2 4.8L12 6L7.2 7.2L6 12L4.8 7.2L0 6L4.8 4.8L6 0Z"
          fill={`url(#${sparkleGradientId})`}
        />
        {/* Brillo pequeño */}
        <circle cx="10" cy="2" r="1" fill="#c4b5fd" opacity="0.8" />
        <circle cx="2" cy="10" r="0.8" fill="#a5b4fc" opacity="0.6" />
      </g>
    </svg>
  );
};

export default CloudDocsLogo;
