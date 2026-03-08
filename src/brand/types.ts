/**
 * Brand Types - CloudDocs Copilot
 * 
 * TypeScript type definitions para componentes de marca
 */

// ==================== LOGO PROPS ====================

/**
 * Props para el componente Logo
 */
export interface LogoProps {
  /** Tamaño del logo en píxeles (default: 40) */
  size?: number;
  
  /** Variante de color del logo (default: 'gradient') */
  variant?: LogoVariant;
  
  /** Clases CSS adicionales */
  className?: string;
  
  /** Handler para eventos de click */
  onClick?: () => void;
  
  /** Mostrar animación pulse (default: false) */
  animated?: boolean;
}

/**
 * Variantes de color disponibles para el logo
 */
export type LogoVariant = 'default' | 'white' | 'gradient';

// ==================== BRAND COLORS ====================

/**
 * Estructura de colores del gradiente
 */
export interface GradientColors {
  start: string;
  middle?: string;
  end: string;
}

/**
 * Colores del ícono según contexto
 */
export interface IconColors {
  white: string;
  colored: string;
}

// ==================== SIZE TYPES ====================

/**
 * Nombres de tamaños predefinidos
 */
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

// ==================== CONTEXT TYPES ====================

/**
 * Contextos de uso del logo
 */
export type LogoContext = 
  | 'navigation'      // Header, menús
  | 'authentication'  // Login, Register
  | 'landing'         // Landing page
  | 'inline'          // Dentro de texto
  | 'footer';         // Pie de página
