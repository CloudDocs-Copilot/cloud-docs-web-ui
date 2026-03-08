/**
 * Brand Module - CloudDocs Copilot
 * 
 * Punto único de importación para todos los elementos de marca.
 * Uso: import { Logo, BRAND_COLORS, LogoProps } from '@/brand';
 */

// ==================== COMPONENTES ====================
export { Logo } from './Logo';

// ==================== CONSTANTES ====================
export {
  BRAND_COLORS,
  LOGO_SIZES,
  LOGO_VARIANTS,
  ANIMATION_CONFIG,
  LOGO_SPACING,
  LOGO_SHADOWS,
  BRAND_INFO,
} from './constants';

// ==================== TYPES ====================
export type {
  LogoProps,
  LogoVariant,
  LogoSize,
  LogoContext,
  GradientColors,
  IconColors,
} from './types';
