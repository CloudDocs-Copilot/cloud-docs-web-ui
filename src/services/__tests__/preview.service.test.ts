import { previewService } from '../preview.service';
import { DocumentPreviewType } from '../../types/preview.types';
import type { PreviewDocument } from '../../types/preview.types';

describe('preview.service', () => {

  describe('getPreviewUrl', () => {
    it('returns correct preview URL for a document', () => {
      const url = previewService.getPreviewUrl({ id: 'doc-123', filename: 'test.pdf', mimeType: 'application/pdf' } as PreviewDocument);
      expect(url).toContain('doc-123');
    });
  });

  describe('getPreviewType', () => {
    it('detects PDF files', () => {
      const type = previewService.getPreviewType({ id: '1', filename: 'document.pdf', mimeType: 'application/pdf' } as PreviewDocument);
      expect(type).toBe(DocumentPreviewType.PDF);
    });

    it('detects image files', () => {
      expect(previewService.getPreviewType({ id: '1', filename: 'photo.jpg', mimeType: 'image/jpeg' } as PreviewDocument)).toBe(DocumentPreviewType.IMAGE);
      expect(previewService.getPreviewType({ id: '1', filename: 'image.png', mimeType: 'image/png' } as PreviewDocument)).toBe(DocumentPreviewType.IMAGE);
    });

    it('detects video files', () => {
      expect(previewService.getPreviewType({ id: '1', filename: 'video.mp4', mimeType: 'video/mp4' } as PreviewDocument)).toBe(DocumentPreviewType.VIDEO);
    });

    it('detects text files', () => {
      expect(previewService.getPreviewType({ id: '1', filename: 'readme.txt', mimeType: 'text/plain' } as PreviewDocument)).toBe(DocumentPreviewType.TEXT);
    });

    it('detects office documents', () => {
      const docType = previewService.getPreviewType({ id: '1', filename: 'document.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' } as PreviewDocument);
      expect(docType).toBe(DocumentPreviewType.OFFICE);
    });

    it('returns UNSUPPORTED for unknown types', () => {
      expect(previewService.getPreviewType({ id: '1', filename: 'archive.zip', mimeType: 'application/zip' } as PreviewDocument)).toBe(DocumentPreviewType.UNSUPPORTED);
    });
  });

  describe('canPreview', () => {
    it('returns true for supported formats', () => {
      expect(previewService.canPreview({ id: '1', filename: 'document.pdf', mimeType: 'application/pdf', size: 1024 } as PreviewDocument)).toBe(true);
      expect(previewService.canPreview({ id: '2', filename: 'image.jpg', mimeType: 'image/jpeg', size: 2048 } as PreviewDocument)).toBe(true);
    });

    it('returns false for unsupported types', () => {
      expect(previewService.canPreview({ id: '3', filename: 'archive.zip', mimeType: 'application/zip', size: 512 } as PreviewDocument)).toBe(false);
    });
  });
});
