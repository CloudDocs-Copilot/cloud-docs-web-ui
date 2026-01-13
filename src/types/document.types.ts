/**
 * Interfaz del modelo de Documento para el frontend
 * Basada en el modelo de Mongoose del backend
 */
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
  /** ID de la organización a la que pertenece el documento */
  organization: string;
  /** ID de la carpeta que contiene el documento */
  folder: string;
  /** Path completo del archivo en el filesystem */
  path: string;
  /** Tamaño del archivo en bytes */
  size: number;
  /** Tipo MIME del archivo (ej: 'application/pdf', 'application/vnd.ms-excel') */
  mimeType: string;
  /** Fecha de subida */
  uploadedAt: Date | string;
  /** IDs de usuarios con quienes se comparte el documento */
  sharedWith: string[];
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
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'word';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'excel';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('text/')) return 'text';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return 'archive';
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
