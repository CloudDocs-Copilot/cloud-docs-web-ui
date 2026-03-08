/**
 * Brand Constants - CloudDocs Copilot
 * 
 * Centraliza los colores, tamaños y configuraciones de marca
 * para mantener consistencia visual en toda la aplicación.
 */

// ==================== PALETA DE COLORES ====================

/**
 * Colores principales del gradiente de marca
 */
export const BRAND_COLORS = {
  // Gradiente principal (3 colores)
  gradient: {
    start: '#6366f1',    // Indigo
    middle: '#8b5cf6',   // Purple
    end: '#d946ef',      // Pink
  },
  
  // Gradiente pestaña (efecto 3D)
  gradientTab: {
    start: '#7c3aed',    // Purple oscuro
    end: '#6366f1',      // Indigo
  },
  
  // Colores sólidos
  primary: '#6366f1',    // Indigo principal
  secondary: '#8b5cf6',  // Purple secundario
  accent: '#d946ef',     // Pink acento
  
  // Colores del ícono
  icon: {
    white: '#ffffff',
    colored: '#6366f1',
  },
} as const;

// ==================== TAMAÑOS DEL LOGO ====================

/**
 * Tamaños predefinidos del logo para diferentes contextos
 */
export const LOGO_SIZES = {
  xs: 24,      // Extra pequeño (íconos inline)
  sm: 32,      // Pequeño (navegación móvil)
  md: 40,      // Mediano (por defecto)
  lg: 48,      // Grande
  xl: 56,      // Extra grande (páginas de autenticación)
  xxl: 72,     // Muy grande (landing page)
} as const;

// ==================== VARIANTES ====================

/**
 * Variantes de color disponibles
 */
export const LOGO_VARIANTS = {
  DEFAULT: 'default',    // Fondo sólido indigo
  WHITE: 'white',        // Fondo blanco (para fondos oscuros)
  GRADIENT: 'gradient',  // Fondo con gradiente (recomendado)
} as const;

// ==================== CONFIGURACIÓN DE ANIMACIÓN ====================

/**
 * Configuración de animaciones
 */
export const ANIMATION_CONFIG = {
  pulse: {
    duration: '2s',
    timing: 'ease-in-out',
    iteration: 'infinite',
  },
  hover: {
    scale: 1.05,
    duration: '0.2s',
  },
} as const;

// ==================== ESPACIADO ====================

/**
 * Espaciado proporcional del ícono dentro del folder
 */
export const LOGO_SPACING = {
  iconTopMargin: '8%',    // Margen superior del ícono
  iconSize: 0.5,          // Tamaño del ícono relativo al contenedor (50%)
} as const;

// ==================== SOMBRAS ====================

/**
 * Configuración de sombras
 */
export const LOGO_SHADOWS = {
  folder: '0 4px 6px -1px rgba(99, 102, 241, 0.2)',
  icon: '0 1px 2px rgba(0, 0, 0, 0.1)',
  innerShadow: {
    color: 'black',
    opacity: 0.05,
  },
} as const;

// ==================== NOMBRE DE MARCA ====================

/**
 * Información de la marca
 */
export const BRAND_INFO = {
  name: 'CloudDocs Copilot',
  tagline: 'Gestión documental inteligente con IA',
  shortName: 'CloudDocs',
  version: '1.0.0',
} as const;
