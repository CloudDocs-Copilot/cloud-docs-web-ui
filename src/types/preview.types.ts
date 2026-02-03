/**
 * Tipos de documentos soportados para preview
 */
export const DocumentPreviewType = {
  PDF: 'pdf',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  TEXT: 'text',
  CODE: 'code',
  OFFICE: 'office',
  UNSUPPORTED: 'unsupported'
} as const;

export type DocumentPreviewType = typeof DocumentPreviewType[keyof typeof DocumentPreviewType];

/**
 * Información del documento para preview
 */
export interface PreviewDocument {
  id: string;
  filename?: string;
  originalname?: string;
  mimeType: string;
  size: number;
  url?: string;
  path?: string;
}

/**
 * Props para el modal de preview
 */
export interface DocumentPreviewModalProps {
  show: boolean;
  onHide: () => void;
  document: PreviewDocument;
}

/**
 * Props para viewers específicos
 */
export interface PDFViewerProps {
  url: string;
  filename: string;
}

export interface ImageViewerProps {
  url: string;
  filename: string;
  alt?: string;
}

export interface VideoPlayerProps {
  url: string;
  mimeType: string;
  filename: string;
}

export interface TextViewerProps {
  url: string;
  filename: string;
  mimeType: string;
  language?: string;
}

export interface AudioPlayerProps {
  url: string;
  mimeType: string;
  filename: string;
}

/**
 * Configuración de preview
 */
export interface PreviewConfig {
  maxFileSize: number; // Tamaño máximo en bytes para preview
  supportedImageFormats: string[];
  supportedVideoFormats: string[];
  supportedAudioFormats: string[];
  supportedTextFormats: string[];
  codeLanguages: Record<string, string>; // extension -> language
}

/**
 * Estado de carga del preview
 */
export interface PreviewLoadState {
  isLoading: boolean;
  error: string | null;
  progress?: number;
}
