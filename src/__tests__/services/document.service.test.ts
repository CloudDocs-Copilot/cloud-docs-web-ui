// document.service.test.ts
/**
 * Tests para document.service
 * @module document.service.test
 */

import {
  uploadDocument,
  listDocuments,
  getRecentDocuments,
  getDocument,
  downloadDocument,
  deleteDocument,
  moveDocument,
  copyDocument,
  shareDocument,
  getActiveOrganizationId,
  getOrganizationMembers,
} from '../../services/document.service';
import { apiClient } from '../../api';

// Mock del cliente API
jest.mock('../../api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  },
}));

describe('Document Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadDocument', () => {
    const mockFile = new File(['test content'], 'test.pdf', {
      type: 'application/pdf',
    });

    const mockResponse = {
      data: {
        success: true,
        message: 'Documento subido exitosamente',
        document: {
          id: '123',
          filename: 'test.pdf',
          originalName: 'test.pdf',
          mimeType: 'application/pdf',
          size: 12,
        },
      },
    };

    it('debe subir un archivo correctamente', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await uploadDocument({ file: mockFile });

      expect(apiClient.post).toHaveBeenCalledWith(
        '/documents/upload',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      );
      expect(result.success).toBe(true);
      expect(result.document).toBeDefined();
      expect(result.document.filename).toBe('test.pdf');
    });

    it('debe incluir folderId si se proporciona', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      await uploadDocument({ file: mockFile, folderId: 'folder-123' });

      const formDataArg = (apiClient.post as jest.Mock).mock.calls[0][1] as FormData;
      expect(formDataArg.get('folderId')).toBe('folder-123');
    });

    it('debe llamar al callback de progreso durante la subida', async () => {
      (apiClient.post as jest.Mock).mockImplementation((_url: string, _data: FormData, config?: unknown) => {
        const cfg = config as { onUploadProgress?: (evt: { loaded: number; total?: number }) => void } | undefined;

        if (cfg?.onUploadProgress) {
          cfg.onUploadProgress({ loaded: 50, total: 100 });
          cfg.onUploadProgress({ loaded: 100, total: 100 });
        }
        return Promise.resolve(mockResponse);
      });

      const onProgress = jest.fn();
      await uploadDocument({ file: mockFile, onProgress });

      expect(onProgress).toHaveBeenCalledTimes(2);
      expect(onProgress).toHaveBeenNthCalledWith(1, {
        loaded: 50,
        total: 100,
        percentage: 50,
      });
      expect(onProgress).toHaveBeenNthCalledWith(2, {
        loaded: 100,
        total: 100,
        percentage: 100,
      });
    });

    it('NO debe llamar al callback de progreso si total no viene definido', async () => {
      (apiClient.post as jest.Mock).mockImplementation((_url: string, _data: FormData, config?: unknown) => {
        const cfg = config as { onUploadProgress?: (evt: { loaded: number; total?: number }) => void } | undefined;

        if (cfg?.onUploadProgress) {
          cfg.onUploadProgress({ loaded: 10 }); // total undefined
        }
        return Promise.resolve(mockResponse);
      });

      const onProgress = jest.fn();
      await uploadDocument({ file: mockFile, onProgress });

      expect(onProgress).not.toHaveBeenCalled();
    });

    it('debe pasar el signal de abort al cliente', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const abortController = new AbortController();
      await uploadDocument({ file: mockFile, signal: abortController.signal });

      expect(apiClient.post).toHaveBeenCalledWith(
        '/documents/upload',
        expect.any(FormData),
        expect.objectContaining({
          signal: abortController.signal,
        })
      );
    });

    it('debe lanzar error cuando la subida falla', async () => {
      const error = new Error('Network error');
      (apiClient.post as jest.Mock).mockRejectedValueOnce(error);

      await expect(uploadDocument({ file: mockFile })).rejects.toThrow('Network error');
    });
  });

  describe('listDocuments', () => {
    it('debe obtener la lista de documentos', async () => {
      const mockResponse = {
        data: {
          success: true,
          count: 2,
          documents: [
            { id: '1', filename: 'doc1.pdf' },
            { id: '2', filename: 'doc2.pdf' },
          ],
        },
      };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await listDocuments();

      expect(apiClient.get).toHaveBeenCalledWith('/documents');
      expect(result.success).toBe(true);
      expect(result.count).toBe(2);
      expect(result.documents).toHaveLength(2);
    });
  });

  describe('getRecentDocuments', () => {
    it('debe obtener documentos recientes de una organización', async () => {
      const mockResponse = {
        data: {
          success: true,
          count: 3,
          documents: [
            { id: '1', filename: 'recent1.pdf' },
            { id: '2', filename: 'recent2.pdf' },
            { id: '3', filename: 'recent3.pdf' },
          ],
        },
      };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await getRecentDocuments('org-123');

      expect(apiClient.get).toHaveBeenCalledWith('/documents/recent/org-123', {
        params: { limit: 10 },
      });
      expect(result.documents).toHaveLength(3);
    });

    it('debe permitir especificar un límite personalizado', async () => {
      const mockResponse = {
        data: {
          success: true,
          count: 5,
          documents: [],
        },
      };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      await getRecentDocuments('org-123', 5);

      expect(apiClient.get).toHaveBeenCalledWith('/documents/recent/org-123', {
        params: { limit: 5 },
      });
    });
  });

  describe('getDocument', () => {
    it('debe obtener un documento por ID', async () => {
      const mockResponse = {
        data: {
          success: true,
          document: { id: '123', filename: 'test.pdf' },
        },
      };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await getDocument('123');

      expect(apiClient.get).toHaveBeenCalledWith('/documents/123');
      expect(result.document.id).toBe('123');
    });
  });

  describe('downloadDocument', () => {
    it('debe descargar un documento', async () => {
      const mockBlob = new Blob(['test content'], { type: 'application/pdf' });
      const mockResponse = { data: mockBlob };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await downloadDocument('123');

      expect(apiClient.get).toHaveBeenCalledWith('/documents/download/123', {
        responseType: 'blob',
      });
      expect(result).toEqual(mockBlob);
    });
  });

  describe('deleteDocument', () => {
    it('debe eliminar un documento', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Documento eliminado',
        },
      };
      (apiClient.delete as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await deleteDocument('123');

      expect(apiClient.delete).toHaveBeenCalledWith('/documents/123');
      expect(result.success).toBe(true);
    });
  });

  describe('moveDocument', () => {
    it('debe mover un documento a otra carpeta', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Documento movido',
          document: { id: '123', folderId: 'folder-456' },
        },
      };
      (apiClient.patch as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await moveDocument('123', 'folder-456');

      expect(apiClient.patch).toHaveBeenCalledWith('/documents/123/move', {
        targetFolderId: 'folder-456',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('copyDocument', () => {
    it('debe copiar un documento a otra carpeta', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Documento copiado',
          document: { id: '123', folderId: 'folder-456' },
        },
      };
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await copyDocument('123', 'folder-456');

      expect(apiClient.post).toHaveBeenCalledWith('/documents/123/copy', {
        targetFolderId: 'folder-456',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('shareDocument', () => {
    it('debe compartir un documento con userIds', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Documento compartido',
          document: { id: '123' },
        },
      };
      (apiClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await shareDocument('123', ['u1', 'u2']);

      expect(apiClient.post).toHaveBeenCalledWith('/documents/123/share', {
        userIds: ['u1', 'u2'],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('getActiveOrganizationId', () => {
    it('debe retornar el organizationId desde /memberships/active-organization', async () => {
      const mockResponse = {
        data: {
          success: true,
          organizationId: 'org-123',
        },
      };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await getActiveOrganizationId();

      expect(apiClient.get).toHaveBeenCalledWith('/memberships/active-organization');
      expect(result).toBe('org-123');
    });
  });

  describe('getOrganizationMembers', () => {
    it('debe retornar data cuando viene en la respuesta', async () => {
      const mockResponse = {
        data: {
          success: true,
          count: 2,
          data: [
            { _id: 'm1', user: { _id: 'u1', email: 'a@a.com' } },
            { _id: 'm2', user: { _id: 'u2', email: 'b@b.com' } },
          ],
        },
      };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await getOrganizationMembers('org-123');

      expect(apiClient.get).toHaveBeenCalledWith('/memberships/organization/org-123/members');
      expect(result).toHaveLength(2);
      expect(result[0]._id).toBe('m1');
    });

    it('debe retornar [] cuando data viene undefined', async () => {
      const mockResponse = {
        data: {
          success: true,
          count: 0,
          data: undefined,
        },
      };
      (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await getOrganizationMembers('org-123');

      expect(apiClient.get).toHaveBeenCalledWith('/memberships/organization/org-123/members');
      expect(result).toEqual([]);
    });
  });
});