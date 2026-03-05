/**
 * Interfaz del modelo de Documento para el frontend
 * Basada en el modelo de Mongoose del backend
 */
export type AIProcessingStatus = 'none' | 'pending' | 'processing' | 'completed' | 'failed';

/** Categoría asignada por IA; puede ser libre (string) o un conjunto cerrado en el futuro */
export type AICategory = string;

export interface Document {
  /** ID único del documento */
  id: string;
  /** Nombre del archivo en el sistema de archivos */
  filename?: string;
  /** Nombre original del archivo subido por el usuario */
  originalname?: string;
  /** URL del archivo (opcional, para acceso directo) */
  url?: string;
  /** ID del usuario que subió el archivo */
  uploadedBy: string;
  /** ID de la organización a la que pertenece el documento (puede ser null para documentos personales) */
  organization?: string | null;
  /** ID de la carpeta que contiene el documento */
  folder: string;
  /** Path completo del archivo en el filesystem */
  path: string;
  /** Tamaño del archivo en bytes */
  size: number;
  /** Tipo MIME del archivo (ej: 'application/pdf', 'application/vnd.ms-excel') */
  mimeType: string;
  /** Contenido de texto extraído del documento (para búsqueda) */
  extractedContent?: string | null;
  /** Fecha de subida (deprecated, usar createdAt) */
  uploadedAt?: Date | string;
  /** IDs de usuarios con quienes se comparte el documento */
  sharedWith?: string[];
  /** AI processing metadata */
  aiProcessingStatus?: AIProcessingStatus;
  aiCategory?: AICategory | null;
  aiConfidence?: number | null; // 0..1
  aiTags?: string[];
  aiSummary?: string | null;
  aiKeyPoints?: string[];
  /** Texto completo extraído (puede ser grande; no siempre viene en las respuestas) */
  extractedText?: string | null;
  aiProcessedAt?: Date | string | null;
  aiError?: string | null;

  /** Indica si el documento está marcado como eliminado (soft delete) */
  isDeleted?: boolean;
  deletedAt?: Date | string | null;
  deletionReason?: string | null;
  deletedBy?: string | null;
  scheduledDeletionDate?: Date | string | null;

  /** Fecha de creación */
  createdAt: Date | string;
  /** Fecha de última actualización */
  updatedAt: Date | string;
}

/**
 * DTO para crear un nuevo documento
 * Solo incluye los campos necesarios para la creación
 */
export interface CreateDocumentDto {
  filename?: string;
  originalname?: string;
  url?: string;
  folder: string;
  path: string;
  size: number;
  mimeType: string;
  sharedWith?: string[];
}

/**
 * DTO para actualizar un documento existente
 * Todos los campos son opcionales
 */
export interface UpdateDocumentDto {
  filename?: string;
  originalname?: string;
  url?: string;
  folder?: string;
  sharedWith?: string[];
}

/**
 * Tipo helper para identificar el tipo de archivo por MIME type
 */
export type DocumentFileType = 
  | 'pdf' 
  | 'word' 
  | 'excel' 
  | 'image' 
  | 'text' 
  | 'video' 
  | 'audio' 
  | 'archive' 
  | 'other';

/**
 * Helper para obtener el tipo de archivo desde el MIME type
 */
export const getFileTypeFromMime = (mimeType: string): DocumentFileType => {
  const mime = mimeType.toLowerCase();
  if (mime.includes('pdf')) return 'pdf';
  // Check excel/spreadsheet BEFORE word/document (spreadsheetml contains 'document')
  if (mime.includes('excel') || mime.includes('spreadsheet')) return 'excel';
  if (mime.includes('word') || mime.includes('document')) return 'word';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('text/')) return 'text';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.includes('zip') || mime.includes('rar') || mime.includes('tar')) return 'archive';
  return 'other';
};

/**
 * Helper para formatear el tamaño del archivo
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
};
