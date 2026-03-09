import {
  BRAND_COLORS,
  LOGO_SIZES,
  LOGO_VARIANTS,
  ANIMATION_CONFIG,
  LOGO_SPACING,
  LOGO_SHADOWS,
  BRAND_INFO,
} from '../constants';

describe('Constantes de Marca', () => {
  describe('BRAND_COLORS', () => {
    it('tiene colores de gradiente definidos', () => {
      expect(BRAND_COLORS.gradient).toBeDefined();
      expect(BRAND_COLORS.gradient.start).toBe('#6366f1');
      expect(BRAND_COLORS.gradient.middle).toBe('#8b5cf6');
      expect(BRAND_COLORS.gradient.end).toBe('#d946ef');
    });

    it('tiene colores de pestaña gradiente definidos', () => {
      expect(BRAND_COLORS.gradientTab).toBeDefined();
      expect(BRAND_COLORS.gradientTab.start).toBe('#7c3aed');
      expect(BRAND_COLORS.gradientTab.end).toBe('#6366f1');
    });

    it('tiene colores sólidos definidos', () => {
      expect(BRAND_COLORS.primary).toBe('#6366f1');
      expect(BRAND_COLORS.secondary).toBe('#8b5cf6');
      expect(BRAND_COLORS.accent).toBe('#d946ef');
    });

    it('tiene colores de icono definidos', () => {
      expect(BRAND_COLORS.icon.white).toBe('#ffffff');
      expect(BRAND_COLORS.icon.colored).toBe('#6366f1');
    });
  });

  describe('LOGO_SIZES', () => {
    it('tiene todas las variantes de tamaño', () => {
      expect(LOGO_SIZES.xs).toBe(24);
      expect(LOGO_SIZES.sm).toBe(32);
      expect(LOGO_SIZES.md).toBe(40);
      expect(LOGO_SIZES.lg).toBe(48);
      expect(LOGO_SIZES.xl).toBe(56);
      expect(LOGO_SIZES.xxl).toBe(72);
    });

    it('los tamaños están en orden ascendente', () => {
      const sizes = Object.values(LOGO_SIZES);
      for (let i = 1; i < sizes.length; i++) {
        expect(sizes[i]).toBeGreaterThan(sizes[i - 1]);
      }
    });
  });

  describe('LOGO_VARIANTS', () => {
    it('tiene todos los tipos de variantes', () => {
      expect(LOGO_VARIANTS.DEFAULT).toBe('default');
      expect(LOGO_VARIANTS.WHITE).toBe('white');
      expect(LOGO_VARIANTS.GRADIENT).toBe('gradient');
    });
  });

  describe('ANIMATION_CONFIG', () => {
    it('tiene configuración de pulso', () => {
      expect(ANIMATION_CONFIG.pulse).toBeDefined();
      expect(ANIMATION_CONFIG.pulse.duration).toBe('2s');
      expect(ANIMATION_CONFIG.pulse.timing).toBe('ease-in-out');
      expect(ANIMATION_CONFIG.pulse.iteration).toBe('infinite');
    });

    it('tiene configuración de hover', () => {
      expect(ANIMATION_CONFIG.hover).toBeDefined();
      expect(ANIMATION_CONFIG.hover.scale).toBe(1.05);
      expect(ANIMATION_CONFIG.hover.duration).toBe('0.2s');
    });
  });

  describe('LOGO_SPACING', () => {
    it('tiene valores de espaciado', () => {
      expect(LOGO_SPACING.iconTopMargin).toBe('8%');
      expect(LOGO_SPACING.iconSize).toBe(0.5);
    });

    it('iconSize es una proporción', () => {
      expect(LOGO_SPACING.iconSize).toBeGreaterThan(0);
      expect(LOGO_SPACING.iconSize).toBeLessThan(1);
    });
  });

  describe('LOGO_SHADOWS', () => {
    it('tiene sombra de carpeta', () => {
      expect(LOGO_SHADOWS.folder).toBeDefined();
      expect(typeof LOGO_SHADOWS.folder).toBe('string');
    });

    it('tiene sombra de icono', () => {
      expect(LOGO_SHADOWS.icon).toBeDefined();
      expect(typeof LOGO_SHADOWS.icon).toBe('string');
    });

    it('tiene sombra interna', () => {
      expect(LOGO_SHADOWS.innerShadow).toBeDefined();
      expect(LOGO_SHADOWS.innerShadow.color).toBe('black');
      expect(LOGO_SHADOWS.innerShadow.opacity).toBe(0.05);
    });
  });

  describe('BRAND_INFO', () => {
    it('tiene nombre de marca', () => {
      expect(BRAND_INFO.name).toBe('CloudDocs Copilot');
    });

    it('tiene eslogan', () => {
      expect(BRAND_INFO.tagline).toBe('Gestión documental inteligente con IA');
    });

    it('tiene nombre corto', () => {
      expect(BRAND_INFO.shortName).toBe('CloudDocs');
    });

    it('tiene versión', () => {
      expect(BRAND_INFO.version).toBe('1.0.0');
    });
  });
});
