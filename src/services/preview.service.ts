import { API_BASE_URL } from '../config/env';
import { DocumentPreviewType } from '../types/preview.types';
import type { PreviewConfig, PreviewDocument } from '../types/preview.types';


/**
 * Configuración por defecto del sistema de preview
 */
export const DEFAULT_PREVIEW_CONFIG: PreviewConfig = {
  maxFileSize: 100 * 1024 * 1024, // 100 MB
  supportedImageFormats: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp'
  ],
  supportedVideoFormats: [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime'
  ],
  supportedAudioFormats: [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/webm'
  ],
  supportedTextFormats: [
    'text/plain',
    'text/csv',
    'text/html',
    'text/xml',
    'application/json',
    'application/xml'
  ],
  codeLanguages: {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'swift': 'swift',
    'kt': 'kotlin',
    'sql': 'sql',
    'sh': 'bash',
    'yaml': 'yaml',
    'yml': 'yaml',
    'json': 'json',
    'xml': 'xml',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'md': 'markdown'
  }
};

/**
 * Servicio para manejo de previews de documentos
 */
export class PreviewService {
  private config: PreviewConfig;

  constructor(config: PreviewConfig = DEFAULT_PREVIEW_CONFIG) {
    this.config = config;
  }

  /**
   * Determina el tipo de preview basado en el MIME type del documento
   */
  getPreviewType(document: PreviewDocument): DocumentPreviewType {
    const { mimeType, filename } = document;

    // PDF
    if (mimeType === 'application/pdf') {
      return DocumentPreviewType.PDF;
    }

    // Imágenes
    if (this.config.supportedImageFormats.includes(mimeType)) {
      return DocumentPreviewType.IMAGE;
    }

    // Videos
    if (this.config.supportedVideoFormats.includes(mimeType)) {
      return DocumentPreviewType.VIDEO;
    }

    // Audio
    if (this.config.supportedAudioFormats.includes(mimeType)) {
      return DocumentPreviewType.AUDIO;
    }

    // Código (basado en extensión)
    if (filename) {
      const extension = this.getFileExtension(filename);
      if (extension && this.config.codeLanguages[extension]) {
        return DocumentPreviewType.CODE;
      }
    }

    // Texto plano
    if (this.config.supportedTextFormats.includes(mimeType)) {
      return DocumentPreviewType.TEXT;
    }

    // Office (Microsoft Office, OpenOffice, etc.)
    if (this.isOfficeDocument(mimeType)) {
      return DocumentPreviewType.OFFICE;
    }

    return DocumentPreviewType.UNSUPPORTED;
  }

  /**
   * Verifica si un documento es de tipo Office
   */
  private isOfficeDocument(mimeType: string): boolean {
    const officeFormats = [
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-powerpoint', // .ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'application/vnd.oasis.opendocument.text', // .odt
      'application/vnd.oasis.opendocument.spreadsheet', // .ods
      'application/vnd.oasis.opendocument.presentation' // .odp
    ];

    return officeFormats.includes(mimeType);
  }

  /**
   * Obtiene la extensión de un archivo
   */
  private getFileExtension(filename: string): string | null {
    const parts = filename.split('.');
    if (parts.length < 2) return null;
    return parts[parts.length - 1].toLowerCase();
  }

  /**
   * Obtiene el lenguaje de código basado en la extensión del archivo
   */
  getCodeLanguage(filename?: string): string {
    if (!filename) return 'text';
    const extension = this.getFileExtension(filename);
    if (!extension) return 'text';
    return this.config.codeLanguages[extension] || 'text';
  }

  /**
   * Verifica si un documento puede tener preview
   */
  canPreview(document: PreviewDocument): boolean {
    const previewType = this.getPreviewType(document);
    
    // No se puede previsualizar archivos no soportados
    if (previewType === DocumentPreviewType.UNSUPPORTED) {
      return false;
    }

    // Verificar tamaño máximo
    if (document.size > this.config.maxFileSize) {
      return false;
    }

    return true;
  }

  /**
   * Genera la URL de preview para un documento
   */
  public getPreviewUrl(document: PreviewDocument): string {
    // Siempre usar el endpoint de preview del API para asegurar autenticación correcta
    const baseUrl = API_BASE_URL || 'http://localhost:4000/api';
    const url = `${baseUrl}/documents/preview/${document.id}`;
    
    return url;
  }

  /**
   * Genera la URL de descarga para un documento
   */
  getDownloadUrl(document: PreviewDocument): string {
    const baseUrl = API_BASE_URL || 'http://localhost:4000/api';
    const url = `${baseUrl}/documents/download/${document.id}`;

    return url;
  }

  /**
   * Formatea el tamaño de archivo para mostrar
   */
  public formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Obtiene un mensaje descriptivo del tipo de preview
   */
  getPreviewTypeLabel(type: DocumentPreviewType): string {
    const labels: Record<DocumentPreviewType, string> = {
      [DocumentPreviewType.PDF]: 'PDF Document',
      [DocumentPreviewType.IMAGE]: 'Image',
      [DocumentPreviewType.VIDEO]: 'Video',
      [DocumentPreviewType.AUDIO]: 'Audio',
      [DocumentPreviewType.TEXT]: 'Text Document',
      [DocumentPreviewType.CODE]: 'Code File',
      [DocumentPreviewType.OFFICE]: 'Office Document',
      [DocumentPreviewType.UNSUPPORTED]: 'Unsupported Format'
    };

    return labels[type];
  }
}

// Instancia singleton del servicio
export const previewService = new PreviewService();
