import { aiService } from '../../services/ai.service';
import { apiClient } from '../../api';

jest.mock('../../api', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockRagResponse = {
  data: {
    success: true,
    data: {
      answer: 'El importe total es 1.500 €',
      sources: ['doc-1'],
      chunks: [{ documentId: 'doc-1', content: 'fragmento', score: 0.85 }],
    },
  },
};

describe('aiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── askOrganization ──────────────────────────────────────────────────────
  describe('askOrganization', () => {
    it('llama a POST /ai/ask y retorna la respuesta', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(mockRagResponse);

      const result = await aiService.askOrganization({
        question: '¿Cuál es el importe?',
        organizationId: 'org-123',
      });

      expect(apiClient.post).toHaveBeenCalledWith('/ai/ask', {
        question: '¿Cuál es el importe?',
        organizationId: 'org-123',
      });
      expect(result.data.answer).toBe('El importe total es 1.500 €');
    });

    it('propaga errores de red', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue(new Error('Network error'));
      await expect(
        aiService.askOrganization({ question: 'test', organizationId: 'org-1' }),
      ).rejects.toThrow('Network error');
    });
  });

  // ── askDocument ──────────────────────────────────────────────────────────
  describe('askDocument', () => {
    it('llama a POST /ai/documents/:id/ask', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue(mockRagResponse);

      const result = await aiService.askDocument('doc-abc', {
        question: '¿Quién firmó?',
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        '/ai/documents/doc-abc/ask',
        { question: '¿Quién firmó?' },
      );
      expect(result.success).toBe(true);
    });
  });

  // ── extractText ──────────────────────────────────────────────────────────
  describe('extractText', () => {
    it('llama a GET /ai/documents/:id/extract-text', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: {
          success: true,
          data: { text: 'contenido', charCount: 10, wordCount: 2, mimeType: 'application/pdf' },
        },
      });

      const result = await aiService.extractText('doc-1');

      expect(apiClient.get).toHaveBeenCalledWith('/ai/documents/doc-1/extract-text');
      expect(result.data.charCount).toBe(10);
    });
  });

  // ── processDocument ──────────────────────────────────────────────────────
  describe('processDocument', () => {
    it('llama a POST /ai/documents/:id/process con el texto', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({
        data: {
          success: true,
          data: {
            documentId: 'doc-1',
            chunksCreated: 5,
            totalWords: 400,
            processingTime: 1200,
            dimensions: 1536,
          },
        },
      });

      const result = await aiService.processDocument('doc-1', { text: 'texto largo' });

      expect(apiClient.post).toHaveBeenCalledWith(
        '/ai/documents/doc-1/process',
        { text: 'texto largo' },
      );
      expect(result.data.chunksCreated).toBe(5);
    });
  });

  // ── deleteChunks ─────────────────────────────────────────────────────────
  describe('deleteChunks', () => {
    it('llama a DELETE /ai/documents/:id/chunks', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue({
        data: { success: true, data: { deletedCount: 3 } },
      });

      const result = await aiService.deleteChunks('doc-1');

      expect(apiClient.delete).toHaveBeenCalledWith('/ai/documents/doc-1/chunks');
      expect(result.data.deletedCount).toBe(3);
    });
  });

  // ── classifyDocument ──────────────────────────────────────────────────────
  describe('classifyDocument', () => {
    it('llama a POST /ai/documents/:id/classify', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({
        data: {
          success: true,
          data: { category: 'Factura', confidence: 0.93, tags: ['factura', 'pago'] },
        },
      });

      const result = await aiService.classifyDocument('doc-1');

      expect(apiClient.post).toHaveBeenCalledWith('/ai/documents/doc-1/classify');
      expect(result.data.category).toBe('Factura');
      expect(result.data.confidence).toBeGreaterThan(0.9);
    });
  });

  // ── summarizeDocument ─────────────────────────────────────────────────────
  describe('summarizeDocument', () => {
    it('llama a POST /ai/documents/:id/summarize', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({
        data: {
          success: true,
          data: { summary: 'Resumen del documento', keyPoints: ['punto 1', 'punto 2'] },
        },
      });

      const result = await aiService.summarizeDocument('doc-1');

      expect(apiClient.post).toHaveBeenCalledWith('/ai/documents/doc-1/summarize');
      expect(result.data.summary).toBe('Resumen del documento');
      expect(result.data.keyPoints).toHaveLength(2);
    });
  });
});
