import { sanitizeData } from '../sanitizer';

describe('API Utils - sanitizeData', () => {
  describe('Sanitización de strings', () => {
    it('debe remover caracteres peligrosos < y >', () => {
      const input = '<script>alert("XSS")</script>';
      const result = sanitizeData(input);
      expect(result).toBe('scriptalert("XSS")/script');
    });

    it('debe mantener strings seguros sin cambios', () => {
      const input = 'Este es un texto seguro';
      const result = sanitizeData(input);
      expect(result).toBe(input);
    });

    it('debe manejar strings vacíos', () => {
      const input = '';
      const result = sanitizeData(input);
      expect(result).toBe('');
    });
  });

  describe('Sanitización de arrays', () => {
    it('debe sanitizar todos los elementos del array', () => {
      const input = ['<div>test</div>', 'safe text', '<p>otro</p>'];
      const result = sanitizeData(input);
      expect(result).toEqual(['divtest/div', 'safe text', 'potro/p']);
    });

    it('debe mantener arrays vacíos', () => {
      const input: string[] = [];
      const result = sanitizeData(input);
      expect(result).toEqual([]);
    });

    it('debe sanitizar arrays anidados', () => {
      const input = [['<div>test</div>'], ['safe']];
      const result = sanitizeData(input);
      expect(result).toEqual([['divtest/div'], ['safe']]);
    });
  });

  describe('Sanitización de objetos', () => {
    it('debe sanitizar todos los valores del objeto', () => {
      const input = {
        name: '<script>alert(1)</script>',
        email: 'user@test.com',
        description: '<div>Content</div>',
      };
      const result = sanitizeData(input);
      expect(result).toEqual({
        name: 'scriptalert(1)/script',
        email: 'user@test.com',
        description: 'divContent/div',
      });
    });

    it('debe manejar objetos anidados', () => {
      const input = {
        user: {
          name: '<b>John</b>',
          profile: {
            bio: '<p>Developer</p>',
          },
        },
      };
      const result = sanitizeData(input);
      expect(result).toEqual({
        user: {
          name: 'bJohn/b',
          profile: {
            bio: 'pDeveloper/p',
          },
        },
      });
    });

    it('debe mantener valores no-string sin cambios', () => {
      const input = {
        id: 123,
        active: true,
        score: 4.5,
        tags: null,
      };
      const result = sanitizeData(input);
      expect(result).toEqual(input);
    });
  });

  describe('Sanitización de tipos primitivos', () => {
    it('debe mantener números sin cambios', () => {
      expect(sanitizeData(123)).toBe(123);
      expect(sanitizeData(0)).toBe(0);
      expect(sanitizeData(-45.67)).toBe(-45.67);
    });

    it('debe mantener booleanos sin cambios', () => {
      expect(sanitizeData(true)).toBe(true);
      expect(sanitizeData(false)).toBe(false);
    });

    it('debe mantener null sin cambios', () => {
      expect(sanitizeData(null)).toBe(null);
    });

    it('debe mantener undefined sin cambios', () => {
      expect(sanitizeData(undefined)).toBe(undefined);
    });
  });

  describe('Casos complejos', () => {
    it('debe sanitizar objetos con arrays de objetos', () => {
      const input = {
        users: [
          { name: '<script>XSS</script>', role: 'admin' },
          { name: 'John Doe', role: '<b>user</b>' },
        ],
      };
      const result = sanitizeData(input);
      expect(result).toEqual({
        users: [
          { name: 'scriptXSS/script', role: 'admin' },
          { name: 'John Doe', role: 'buser/b' },
        ],
      });
    });

    it('debe manejar datos mezclados correctamente', () => {
      const input = {
        text: '<div>Test</div>',
        numbers: [1, 2, 3],
        nested: {
          flag: true,
          items: ['<p>item1</p>', 'item2'],
        },
      };
      const result = sanitizeData(input);
      expect(result).toEqual({
        text: 'divTest/div',
        numbers: [1, 2, 3],
        nested: {
          flag: true,
          items: ['pitem1/p', 'item2'],
        },
      });
    });
  });
});
