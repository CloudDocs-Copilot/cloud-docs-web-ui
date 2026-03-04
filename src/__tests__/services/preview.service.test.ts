import { previewService, DEFAULT_PREVIEW_CONFIG } from '../../services/preview.service';
import { DocumentPreviewType } from '../../types/preview.types';

describe('previewService', () => {
  test('getPreviewType detects PDF', () => {
    const type = previewService.getPreviewType({ id: '1', url: '', mimeType: 'application/pdf', filename: 'doc.pdf', size: 100 });
    expect(type).toBe(DocumentPreviewType.PDF);
  });

  test('getPreviewType detects image', () => {
    const type = previewService.getPreviewType({ id: '2', url: '', mimeType: 'image/png', filename: 'img.png', size: 100 });
    expect(type).toBe(DocumentPreviewType.IMAGE);
  });

  test('getPreviewType detects video', () => {
    const type = previewService.getPreviewType({ id: '3', url: '', mimeType: 'video/mp4', filename: 'video.mp4', size: 100 });
    expect(type).toBe(DocumentPreviewType.VIDEO);
  });

  test('getCodeLanguage and labels', () => {
    expect(previewService.getCodeLanguage('file.js')).toBe('javascript');
    expect(previewService.getCodeLanguage('file.unknown')).toBe('text');
    expect(previewService.getPreviewTypeLabel(DocumentPreviewType.TEXT)).toBe('Text Document');
  });

  test('formatFileSize formats correctly', () => {
    expect(previewService.formatFileSize(0)).toBe('0 Bytes');
    expect(previewService.formatFileSize(1024)).toContain('KB');
  });

  test('canPreview respects max file size', () => {
    const big = { id: 'big', url: '', mimeType: 'text/plain', filename: 'a.txt', size: DEFAULT_PREVIEW_CONFIG.maxFileSize + 1 };
    expect(previewService.canPreview(big)).toBe(false);
  });
});
