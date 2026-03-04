import { getFileTypeFromMime, formatFileSize } from '../document.types';

describe('document.types helpers', () => {
  describe('getFileTypeFromMime', () => {
    it('identifies PDF files', () => {
      expect(getFileTypeFromMime('application/pdf')).toBe('pdf');
      expect(getFileTypeFromMime('text/pdf')).toBe('pdf');
    });

    it('identifies Word documents', () => {
      expect(getFileTypeFromMime('application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe('word');
      expect(getFileTypeFromMime('application/msword')).toBe('word');
      expect(getFileTypeFromMime('application/vnd.ms-word.document.macroEnabled.12')).toBe('word');
    });

    it('identifies Excel spreadsheets', () => {
      expect(getFileTypeFromMime('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')).toBe('excel');
      expect(getFileTypeFromMime('application/vnd.ms-excel')).toBe('excel');
      expect(getFileTypeFromMime('application/vnd.ms-excel.sheet.macroEnabled.12')).toBe('excel');
    });

    it('identifies image files', () => {
      expect(getFileTypeFromMime('image/png')).toBe('image');
      expect(getFileTypeFromMime('image/jpeg')).toBe('image');
      expect(getFileTypeFromMime('image/gif')).toBe('image');
      expect(getFileTypeFromMime('image/svg+xml')).toBe('image');
    });

    it('identifies text files', () => {
      expect(getFileTypeFromMime('text/plain')).toBe('text');
      expect(getFileTypeFromMime('text/html')).toBe('text');
      expect(getFileTypeFromMime('text/csv')).toBe('text');
    });

    it('identifies video files', () => {
      expect(getFileTypeFromMime('video/mp4')).toBe('video');
      expect(getFileTypeFromMime('video/mpeg')).toBe('video');
      expect(getFileTypeFromMime('video/quicktime')).toBe('video');
    });

    it('identifies audio files', () => {
      expect(getFileTypeFromMime('audio/mp3')).toBe('audio');
      expect(getFileTypeFromMime('audio/mpeg')).toBe('audio');
      expect(getFileTypeFromMime('audio/wav')).toBe('audio');
    });

    it('identifies archive files', () => {
      expect(getFileTypeFromMime('application/zip')).toBe('archive');
      expect(getFileTypeFromMime('application/x-rar-compressed')).toBe('archive');
      expect(getFileTypeFromMime('application/x-tar')).toBe('archive');
      expect(getFileTypeFromMime('application/gzip')).toBe('archive');
    });

    it('returns other for unrecognized types', () => {
      expect(getFileTypeFromMime('application/octet-stream')).toBe('other');
      expect(getFileTypeFromMime('application/unknown')).toBe('other');
      expect(getFileTypeFromMime('')).toBe('other');
    });

    // Additional branch coverage tests
    it('identifies document files without word keyword', () => {
      expect(getFileTypeFromMime('application/document')).toBe('word');
      expect(getFileTypeFromMime('text/document')).toBe('word');
    });

    it('identifies spreadsheet files without excel keyword', () => {
      expect(getFileTypeFromMime('application/spreadsheet')).toBe('excel');
      expect(getFileTypeFromMime('application/vnd.oasis.opendocument.spreadsheet')).toBe('excel');
    });

    it('identifies rar archives specifically', () => {
      expect(getFileTypeFromMime('application/rar')).toBe('archive');
      expect(getFileTypeFromMime('application/vnd.rar')).toBe('archive');
    });

    it('identifies tar archives specifically', () => {
      expect(getFileTypeFromMime('application/tar')).toBe('archive');
      expect(getFileTypeFromMime('application/x-gtar')).toBe('archive');
    });

    it('identifies mixed case and special mime types', () => {
      expect(getFileTypeFromMime('APPLICATION/PDF')).toBe('pdf');
      expect(getFileTypeFromMime('Image/PNG')).toBe('image');
      expect(getFileTypeFromMime('VIDEO/MPEG')).toBe('video');
    });
  });

  describe('formatFileSize', () => {
    it('formats zero bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });

    it('formats bytes correctly', () => {
      expect(formatFileSize(100)).toBe('100 Bytes');
      expect(formatFileSize(512)).toBe('512 Bytes');
      expect(formatFileSize(1023)).toBe('1023 Bytes');
    });

    it('formats kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(2048)).toBe('2 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(10240)).toBe('10 KB');
    });

    it('formats megabytes correctly', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(2097152)).toBe('2 MB');
      expect(formatFileSize(5242880)).toBe('5 MB');
      expect(formatFileSize(1572864)).toBe('1.5 MB');
    });

    it('formats gigabytes correctly', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
      expect(formatFileSize(2147483648)).toBe('2 GB');
      expect(formatFileSize(5368709120)).toBe('5 GB');
    });

    it('formats terabytes correctly', () => {
      expect(formatFileSize(1099511627776)).toBe('1 TB');
      expect(formatFileSize(2199023255552)).toBe('2 TB');
    });

    it('rounds decimals to 2 places', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1234567)).toBe('1.18 MB');
      expect(formatFileSize(987654321)).toBe('941.9 MB');
    });

    it('handles edge cases', () => {
      expect(formatFileSize(1)).toBe('1 Bytes');
      expect(formatFileSize(1025)).toBe('1 KB');
      expect(formatFileSize(1048577)).toBe('1 MB');
    });
  });
});
