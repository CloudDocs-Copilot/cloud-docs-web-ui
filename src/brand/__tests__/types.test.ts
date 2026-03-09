import type {
  LogoProps,
  LogoVariant,
  LogoSize,
  LogoContext,
  GradientColors,
  IconColors,
} from '../types';

describe('Tipos de Marca', () => {
  describe('LogoProps', () => {
    it('acepta todas las props válidas', () => {
      const props: LogoProps = {
        size: 40,
        variant: 'gradient',
        className: 'test-class',
        onClick: () => {},
        animated: true,
      };
      
      expect(props.size).toBe(40);
      expect(props.variant).toBe('gradient');
      expect(props.className).toBe('test-class');
      expect(props.animated).toBe(true);
      expect(typeof props.onClick).toBe('function');
    });

    it('todas las props son opcionales', () => {
      const props: LogoProps = {};
      
      expect(props).toBeDefined();
    });
  });

  describe('LogoVariant', () => {
    it('acepta variantes válidas', () => {
      const variant1: LogoVariant = 'default';
      const variant2: LogoVariant = 'white';
      const variant3: LogoVariant = 'gradient';
      
      expect(variant1).toBe('default');
      expect(variant2).toBe('white');
      expect(variant3).toBe('gradient');
    });
  });

  describe('LogoSize', () => {
    it('acepta todas las variantes de tamaño', () => {
      const sizes: LogoSize[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
      
      expect(sizes).toHaveLength(6);
      expect(sizes).toContain('xs');
      expect(sizes).toContain('xxl');
    });
  });

  describe('LogoContext', () => {
    it('acepta todos los tipos de contexto', () => {
      const contexts: LogoContext[] = [
        'navigation',
        'authentication',
        'landing',
        'inline',
        'footer',
      ];
      
      expect(contexts).toHaveLength(5);
      expect(contexts).toContain('navigation');
      expect(contexts).toContain('authentication');
    });
  });

  describe('GradientColors', () => {
    it('tiene propiedades de color requeridas', () => {
      const gradient: GradientColors = {
        start: '#6366f1',
        middle: '#8b5cf6',
        end: '#d946ef',
      };
      
      expect(gradient.start).toBe('#6366f1');
      expect(gradient.middle).toBe('#8b5cf6');
      expect(gradient.end).toBe('#d946ef');
    });
  });

  describe('IconColors', () => {
    it('tiene colores de icono requeridos', () => {
      const iconColors: IconColors = {
        white: '#ffffff',
        colored: '#6366f1',
      };
      
      expect(iconColors.white).toBe('#ffffff');
      expect(iconColors.colored).toBe('#6366f1');
    });
  });
});
