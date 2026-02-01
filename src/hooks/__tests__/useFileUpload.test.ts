/**
 * Tests para useFileUpload hook
 * @module useFileUpload.test
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useFileUpload } from '../useFileUpload';
import * as documentService from '../../services/document.service';
import { v4 as uuidv4 } from 'uuid';

// Mock del servicio de documentos
jest.mock('../../services/document.service', () => ({
  uploadDocument: jest.fn(),
}));

// Mock de uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'),
}));

describe('useFileUpload Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset uuid mock counter
    let counter = 0;
    (uuidv4 as jest.Mock).mockImplementation(() => `mock-uuid-${++counter}`);
  });

  describe('Estado inicial', () => {
    it('debe inicializar con estado vacío', () => {
      const { result } = renderHook(() => useFileUpload());

      expect(result.current.files).toEqual([]);
      expect(result.current.isUploading).toBe(false);
      expect(result.current.totalProgress).toBe(0);
      expect(result.current.pendingCount).toBe(0);
      expect(result.current.successCount).toBe(0);
      expect(result.current.errorCount).toBe(0);
      expect(result.current.allSuccessful).toBe(false);
      expect(result.current.uploadedDocuments).toEqual([]);
    });
  });

  describe('addFiles', () => {
    it('debe agregar archivos válidos a la cola', () => {
      const { result } = renderHook(() => useFileUpload());

      const validFile = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      });

      act(() => {
        const validation = result.current.addFiles([validFile]);
        expect(validation.valid).toHaveLength(1);
        expect(validation.invalid).toHaveLength(0);
      });

      expect(result.current.files).toHaveLength(1);
      expect(result.current.files[0].file.name).toBe('test.pdf');
      expect(result.current.files[0].status).toBe('pending');
      expect(result.current.pendingCount).toBe(1);
    });

    it('debe rechazar archivos con tipo MIME no permitido', () => {
      const { result } = renderHook(() => useFileUpload());

      const invalidFile = new File(['content'], 'virus.exe', {
        type: 'application/x-msdownload',
      });

      act(() => {
        const validation = result.current.addFiles([invalidFile]);
        expect(validation.invalid).toHaveLength(1);
        expect(validation.invalid[0].error.code).toBe('INVALID_TYPE');
      });

      expect(result.current.files).toHaveLength(0);
    });

    it('debe rechazar archivos que exceden el tamaño máximo', () => {
      const { result } = renderHook(() => useFileUpload());

      // Crear un archivo simulado que excede 50MB
      const largeContent = new Array(51 * 1024 * 1024).fill('a').join('');
      const largeFile = new File([largeContent], 'huge.pdf', {
        type: 'application/pdf',
      });

      act(() => {
        const validation = result.current.addFiles([largeFile]);
        expect(validation.invalid).toHaveLength(1);
        expect(validation.invalid[0].error.code).toBe('FILE_TOO_LARGE');
      });

      expect(result.current.files).toHaveLength(0);
    });

    it('debe limitar la cantidad de archivos simultáneos', () => {
      const { result } = renderHook(() => useFileUpload({ maxFiles: 2 }));

      const files = [
        new File(['1'], 'file1.pdf', { type: 'application/pdf' }),
        new File(['2'], 'file2.pdf', { type: 'application/pdf' }),
        new File(['3'], 'file3.pdf', { type: 'application/pdf' }),
      ];

      act(() => {
        const validation = result.current.addFiles(files);
        expect(validation.valid).toHaveLength(2);
        expect(validation.invalid).toHaveLength(1);
      });

      expect(result.current.files).toHaveLength(2);
    });

    it('debe manejar múltiples tipos de archivos válidos', () => {
      const { result } = renderHook(() => useFileUpload());

      const files = [
        new File(['pdf'], 'doc.pdf', { type: 'application/pdf' }),
        new File(['img'], 'photo.jpg', { type: 'image/jpeg' }),
        new File(['png'], 'graphic.png', { type: 'image/png' }),
      ];

      act(() => {
        const validation = result.current.addFiles(files);
        expect(validation.valid).toHaveLength(3);
      });

      expect(result.current.files).toHaveLength(3);
    });

    it('debe manejar FileList además de array de Files', () => {
      const { result } = renderHook(() => useFileUpload());

      // Simular FileList
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const fileList = {
        0: file,
        length: 1,
        item: (index: number) => (index === 0 ? file : null),
        [Symbol.iterator]: function* () {
          yield file;
        },
      } as unknown as FileList;

      act(() => {
        const validation = result.current.addFiles(fileList);
        expect(validation.valid).toHaveLength(1);
      });

      expect(result.current.files).toHaveLength(1);
    });
  });

  describe('removeFile', () => {
    it('debe remover un archivo de la cola', () => {
      const { result } = renderHook(() => useFileUpload());

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      act(() => {
        result.current.addFiles([file]);
      });

      expect(result.current.files).toHaveLength(1);
      const fileId = result.current.files[0].id;

      act(() => {
        result.current.removeFile(fileId);
      });

      expect(result.current.files).toHaveLength(0);
    });
  });

  describe('uploadAll', () => {
    it('debe subir todos los archivos pendientes', async () => {
      (documentService.uploadDocument as jest.Mock).mockResolvedValue({
        success: true,
        document: { id: 'doc-123', filename: 'test.pdf' },
      });

      const { result } = renderHook(() => useFileUpload());

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      act(() => {
        result.current.addFiles([file]);
      });

      await act(async () => {
        await result.current.uploadAll();
      });

      await waitFor(() => {
        expect(result.current.files[0].status).toBe('success');
      });

      expect(result.current.successCount).toBe(1);
      expect(result.current.uploadedDocuments).toHaveLength(1);
    });

    it('debe marcar archivos como error cuando falla la subida', async () => {
      (documentService.uploadDocument as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useFileUpload());

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      act(() => {
        result.current.addFiles([file]);
      });

      await act(async () => {
        await result.current.uploadAll();
      });

      await waitFor(() => {
        expect(result.current.files[0].status).toBe('error');
      });

      expect(result.current.errorCount).toBe(1);
    });

    it('debe llamar onUploadComplete por cada archivo completado', async () => {
      (documentService.uploadDocument as jest.Mock).mockResolvedValue({
        success: true,
        document: { id: 'doc-123', filename: 'test.pdf' },
      });

      const onUploadComplete = jest.fn();
      const { result } = renderHook(() =>
        useFileUpload({ onUploadComplete })
      );

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      act(() => {
        result.current.addFiles([file]);
      });

      await act(async () => {
        await result.current.uploadAll();
      });

      await waitFor(() => {
        expect(onUploadComplete).toHaveBeenCalled();
      });
    });

    it('debe llamar onAllComplete cuando todos los archivos terminan', async () => {
      (documentService.uploadDocument as jest.Mock).mockResolvedValue({
        success: true,
        document: { id: 'doc-123', filename: 'test.pdf' },
      });

      const onAllComplete = jest.fn();
      const { result } = renderHook(() =>
        useFileUpload({ onAllComplete })
      );

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      act(() => {
        result.current.addFiles([file]);
      });

      await act(async () => {
        await result.current.uploadAll();
      });

      await waitFor(() => {
        expect(onAllComplete).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ status: 'success' }),
          ])
        );
      });
    });
  });

  describe('cancelUpload', () => {
    it('debe cancelar una subida en progreso', async () => {
      // Simular subida lenta que puede ser cancelada
      (documentService.uploadDocument as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 5000))
      );

      const { result } = renderHook(() => useFileUpload());

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      act(() => {
        result.current.addFiles([file]);
      });

      const fileId = result.current.files[0].id;

      // Iniciar subida sin await
      act(() => {
        result.current.uploadAll();
      });

      // Cancelar inmediatamente
      act(() => {
        result.current.cancelUpload(fileId);
      });

      await waitFor(() => {
        expect(result.current.files[0].status).toBe('cancelled');
      });
    });
  });

  describe('cancelAll', () => {
    it('debe cancelar todas las subidas en progreso', async () => {
      (documentService.uploadDocument as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 5000))
      );

      const { result } = renderHook(() => useFileUpload());

      const files = [
        new File(['1'], 'file1.pdf', { type: 'application/pdf' }),
        new File(['2'], 'file2.pdf', { type: 'application/pdf' }),
      ];

      act(() => {
        result.current.addFiles(files);
      });

      act(() => {
        result.current.uploadAll();
      });

      act(() => {
        result.current.cancelAll();
      });

      await waitFor(() => {
        expect(
          result.current.files.every((f) => f.status === 'cancelled' || f.status === 'pending')
        ).toBe(true);
      });
    });
  });

  describe('retryUpload', () => {
    it('debe reintentar un archivo fallido', async () => {
      let callCount = 0;
      (documentService.uploadDocument as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('First attempt failed'));
        }
        return Promise.resolve({
          success: true,
          document: { id: 'doc-123', filename: 'test.pdf' },
        });
      });

      const { result } = renderHook(() => useFileUpload());

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      act(() => {
        result.current.addFiles([file]);
      });

      const fileId = result.current.files[0].id;

      // Primer intento - falla
      await act(async () => {
        await result.current.uploadAll();
      });

      await waitFor(() => {
        expect(result.current.files[0].status).toBe('error');
      });

      // Reintentar
      await act(async () => {
        await result.current.retryUpload(fileId);
      });

      await waitFor(() => {
        expect(result.current.files[0].status).toBe('success');
      });
    });
  });

  describe('clearCompleted', () => {
    it('debe limpiar archivos completados exitosamente', async () => {
      (documentService.uploadDocument as jest.Mock).mockResolvedValue({
        success: true,
        document: { id: 'doc-123', filename: 'test.pdf' },
      });

      const { result } = renderHook(() => useFileUpload());

      const files = [
        new File(['1'], 'file1.pdf', { type: 'application/pdf' }),
        new File(['2'], 'file2.pdf', { type: 'application/pdf' }),
      ];

      act(() => {
        result.current.addFiles(files);
      });

      await act(async () => {
        await result.current.uploadAll();
      });

      await waitFor(() => {
        expect(result.current.successCount).toBe(2);
      });

      act(() => {
        result.current.clearCompleted();
      });

      expect(result.current.files).toHaveLength(0);
    });
  });

  describe('reset', () => {
    it('debe reiniciar todo el estado del hook', async () => {
      (documentService.uploadDocument as jest.Mock).mockResolvedValue({
        success: true,
        document: { id: 'doc-123', filename: 'test.pdf' },
      });

      const { result } = renderHook(() => useFileUpload());

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      act(() => {
        result.current.addFiles([file]);
      });

      await act(async () => {
        await result.current.uploadAll();
      });

      await waitFor(() => {
        expect(result.current.successCount).toBe(1);
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.files).toEqual([]);
      expect(result.current.uploadedDocuments).toEqual([]);
      expect(result.current.successCount).toBe(0);
    });
  });

  describe('Computed properties', () => {
    it('debe calcular totalProgress correctamente', async () => {
      (documentService.uploadDocument as jest.Mock).mockImplementation(
        ({ onProgress }) => {
          // Simular progreso
          onProgress?.({ loaded: 50, total: 100, percentage: 50 });
          return Promise.resolve({
            success: true,
            document: { id: 'doc-123', filename: 'test.pdf' },
          });
        }
      );

      const { result } = renderHook(() => useFileUpload());

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      act(() => {
        result.current.addFiles([file]);
      });

      await act(async () => {
        await result.current.uploadAll();
      });

      // El progreso final debe ser 100% para archivos completados
      await waitFor(() => {
        expect(result.current.files[0].status).toBe('success');
      });
    });

    it('debe calcular allSuccessful correctamente', async () => {
      (documentService.uploadDocument as jest.Mock).mockResolvedValue({
        success: true,
        document: { id: 'doc-123', filename: 'test.pdf' },
      });

      const { result } = renderHook(() => useFileUpload());

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      act(() => {
        result.current.addFiles([file]);
      });

      expect(result.current.allSuccessful).toBe(false);

      await act(async () => {
        await result.current.uploadAll();
      });

      await waitFor(() => {
        expect(result.current.allSuccessful).toBe(true);
      });
    });
  });
});
