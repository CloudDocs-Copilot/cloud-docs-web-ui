/**
 * Tests para tipos y helpers de upload
 * @module upload.types.test
 */

import {
  UPLOAD_CONSTRAINTS,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  isAllowedMimeType,
  isAllowedExtension,
  isFileSizeValid,
  formatFileSize,
  getFileTypeName,
  getAllowedTypesDisplay,
} from '../../types/upload.types';

describe('Upload Types - Constantes', () => {
  describe('UPLOAD_CONSTRAINTS', () => {
    it('debe tener MAX_FILE_SIZE de 50MB', () => {
      expect(UPLOAD_CONSTRAINTS.MAX_FILE_SIZE).toBe(50 * 1024 * 1024);
    });

    it('debe tener MAX_SIMULTANEOUS_UPLOADS de 10', () => {
      expect(UPLOAD_CONSTRAINTS.MAX_SIMULTANEOUS_UPLOADS).toBe(10);
    });

    it('debe tener MAX_CONCURRENT_REQUESTS de 3', () => {
      expect(UPLOAD_CONSTRAINTS.MAX_CONCURRENT_REQUESTS).toBe(3);
    });

    it('debe tener MAX_RETRY_ATTEMPTS de 3', () => {
      expect(UPLOAD_CONSTRAINTS.MAX_RETRY_ATTEMPTS).toBe(3);
    });

    it('debe tener RETRY_DELAY_MS de 2000', () => {
      expect(UPLOAD_CONSTRAINTS.RETRY_DELAY_MS).toBe(2000);
    });
  });

  describe('ALLOWED_MIME_TYPES', () => {
    it('debe incluir application/pdf', () => {
      expect(ALLOWED_MIME_TYPES).toContain('application/pdf');
    });

    it('debe incluir tipos de documentos Office', () => {
      expect(ALLOWED_MIME_TYPES).toContain(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
      expect(ALLOWED_MIME_TYPES).toContain(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      expect(ALLOWED_MIME_TYPES).toContain(
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      );
    });

    it('debe incluir tipos de imagen', () => {
      expect(ALLOWED_MIME_TYPES).toContain('image/jpeg');
      expect(ALLOWED_MIME_TYPES).toContain('image/png');
    });

    it('debe tener exactamente 6 tipos permitidos', () => {
      expect(ALLOWED_MIME_TYPES).toHaveLength(6);
    });
  });

  describe('ALLOWED_EXTENSIONS', () => {
    it('debe incluir extensiones comunes de documentos', () => {
      expect(ALLOWED_EXTENSIONS).toContain('.pdf');
      expect(ALLOWED_EXTENSIONS).toContain('.docx');
      expect(ALLOWED_EXTENSIONS).toContain('.xlsx');
      expect(ALLOWED_EXTENSIONS).toContain('.pptx');
    });

    it('debe incluir extensiones de imagen', () => {
      expect(ALLOWED_EXTENSIONS).toContain('.jpg');
      expect(ALLOWED_EXTENSIONS).toContain('.jpeg');
      expect(ALLOWED_EXTENSIONS).toContain('.png');
    });
  });
});

describe('Upload Types - Helper Functions', () => {
  describe('isAllowedMimeType', () => {
    it('debe retornar true para tipos MIME permitidos', () => {
      expect(isAllowedMimeType('application/pdf')).toBe(true);
      expect(isAllowedMimeType('image/jpeg')).toBe(true);
      expect(isAllowedMimeType('image/png')).toBe(true);
    });

    it('debe retornar false para tipos MIME no permitidos', () => {
      expect(isAllowedMimeType('application/exe')).toBe(false);
      expect(isAllowedMimeType('text/plain')).toBe(false);
      expect(isAllowedMimeType('application/javascript')).toBe(false);
      expect(isAllowedMimeType('')).toBe(false);
    });

    it('debe retornar false para tipos MIME de video', () => {
      expect(isAllowedMimeType('video/mp4')).toBe(false);
      expect(isAllowedMimeType('video/webm')).toBe(false);
    });
  });

  describe('isAllowedExtension', () => {
    it('debe retornar true para extensiones permitidas', () => {
      expect(isAllowedExtension('documento.pdf')).toBe(true);
      expect(isAllowedExtension('archivo.docx')).toBe(true);
      expect(isAllowedExtension('hoja.xlsx')).toBe(true);
      expect(isAllowedExtension('presentacion.pptx')).toBe(true);
      expect(isAllowedExtension('imagen.jpg')).toBe(true);
      expect(isAllowedExtension('foto.jpeg')).toBe(true);
      expect(isAllowedExtension('grafico.png')).toBe(true);
    });

    it('debe retornar false para extensiones no permitidas', () => {
      expect(isAllowedExtension('virus.exe')).toBe(false);
      expect(isAllowedExtension('script.js')).toBe(false);
      expect(isAllowedExtension('archivo.txt')).toBe(false);
      expect(isAllowedExtension('video.mp4')).toBe(false);
    });

    it('debe manejar mayúsculas y minúsculas', () => {
      expect(isAllowedExtension('documento.PDF')).toBe(true);
      expect(isAllowedExtension('imagen.JPG')).toBe(true);
      expect(isAllowedExtension('FOTO.PNG')).toBe(true);
    });

    it('debe retornar false para archivos sin extensión', () => {
      expect(isAllowedExtension('archivo')).toBe(false);
    });
  });

  describe('isFileSizeValid', () => {
    it('debe retornar true para archivos dentro del límite', () => {
      expect(isFileSizeValid(0)).toBe(true);
      expect(isFileSizeValid(1024)).toBe(true); // 1KB
      expect(isFileSizeValid(1024 * 1024)).toBe(true); // 1MB
      expect(isFileSizeValid(50 * 1024 * 1024)).toBe(true); // 50MB exacto
    });

    it('debe retornar false para archivos que exceden el límite', () => {
      expect(isFileSizeValid(50 * 1024 * 1024 + 1)).toBe(false); // 50MB + 1 byte
      expect(isFileSizeValid(100 * 1024 * 1024)).toBe(false); // 100MB
      expect(isFileSizeValid(1024 * 1024 * 1024)).toBe(false); // 1GB
    });
  });

  describe('formatFileSize', () => {
    it('debe formatear bytes correctamente', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(512)).toBe('512 B');
      expect(formatFileSize(1023)).toBe('1023 B');
    });

    it('debe formatear kilobytes correctamente', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1024 * 500)).toBe('500.0 KB');
    });

    it('debe formatear megabytes correctamente', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
      expect(formatFileSize(1024 * 1024 * 5)).toBe('5.0 MB');
      expect(formatFileSize(1024 * 1024 * 50)).toBe('50.0 MB');
    });
  });

  describe('getFileTypeName', () => {
    it('debe retornar nombres amigables para tipos conocidos', () => {
      expect(getFileTypeName('application/pdf')).toBe('PDF');
      expect(getFileTypeName('image/jpeg')).toBe('Imagen JPEG');
      expect(getFileTypeName('image/png')).toBe('Imagen PNG');
    });

    it('debe retornar nombres para tipos de documentos Office', () => {
      expect(
        getFileTypeName(
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
      ).toBe('Word');
      expect(
        getFileTypeName(
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
      ).toBe('Excel');
      expect(
        getFileTypeName(
          'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        )
      ).toBe('PowerPoint');
    });

    it('debe retornar "Archivo" para tipos desconocidos', () => {
      expect(getFileTypeName('application/unknown')).toBe('Archivo');
      expect(getFileTypeName('')).toBe('Archivo');
      expect(getFileTypeName('text/plain')).toBe('Archivo');
    });
  });

  describe('getAllowedTypesDisplay', () => {
    it('debe retornar string con tipos permitidos', () => {
      const display = getAllowedTypesDisplay();
      expect(display).toBe('PDF, DOCX, XLSX, PPTX, JPG, PNG');
    });
  });
});
