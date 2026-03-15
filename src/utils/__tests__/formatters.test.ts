import { formatFileSize, formatDate } from '../formatters';

describe('formatters', () => {
  describe('formatFileSize', () => {
    it('formats 0 bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });

    it('formats bytes', () => {
      expect(formatFileSize(512)).toBe('512 Bytes');
    });

    it('formats kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
    });

    it('formats megabytes', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
    });

    it('formats gigabytes', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });

    it('formats terabytes', () => {
      expect(formatFileSize(1024 * 1024 * 1024 * 1024)).toBe('1 TB');
    });
  });

  describe('formatDate', () => {
    it('handles invalid date', () => {
      expect(formatDate('invalid-date')).toBe('Fecha inválida');
    });

    it('formats today as time', () => {
      const now = new Date();
      const result = formatDate(now);
      // Should contain hours and minutes
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('formats yesterday', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(formatDate(yesterday)).toBe('Ayer');
    });

    it('formats days this week', () => {
      const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      const result = formatDate(fiveDaysAgo);
      expect(result).toContain('Hace');
      expect(result).toContain('días');
    });

    it('formats string date', () => {
      const dateStr = new Date().toISOString();
      const result = formatDate(dateStr);
      expect(result).not.toBe('Fecha inválida');
    });

    it('formats date from this year', () => {
      const dateThisYear = new Date('2025-01-15');
      const now = new Date();
      if (now.getFullYear() === 2025) {
        const result = formatDate(dateThisYear);
        expect(result).toMatch(/\d{1,2}\s/);
      }
    });

    it('formats date from previous year', () => {
      const datePreviousYear = new Date('2024-12-25');
      const result = formatDate(datePreviousYear);
      expect(result).not.toBe('Fecha inválida');
      // Should include year since it's different
      if (new Date().getFullYear() > 2024) {
        expect(result).toContain('2024');
      }
    });

    it('formats date object directly', () => {
      const specificDate = new Date(2024, 0, 1);
      const result = formatDate(specificDate);
      expect(result).not.toBe('Fecha inválida');
    });
  });
});
