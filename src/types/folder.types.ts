/**
 * Interfaz de Carpeta para el Frontend
 */
export interface Folder {
  /** ID único de la carpeta */
  id: string;
  /** Nombre técnico (para sistema de archivos) */
  name: string;
  /** Nombre visual (display name) */
  displayName?: string;
  /** Tipo de carpeta */
  type: 'root' | 'folder' | 'shared';
  /** ID del propietario */
  owner: string;
  /** ID de la organización */
  organization: string;
  /** ID de la carpeta padre (null para root) */
  parent: string | null;
  /** Si es carpeta raíz */
  isRoot: boolean;
  /** Path virtual/físico */
  path: string;
  
  // Virtuals o populados en frontend
  /** Hijos (subcarpetas) para estructura de árbol */
  children?: Folder[];
  /** Nivel de profundidad para indentación visual */
  level?: number;
  /** Cantidad de items dentro (opcional) */
  itemCount?: number;
  
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Respuesta para el árbol de carpetas
 */
export interface FolderTreeResponse {
  success: boolean;
  tree: Folder; // Retorna la carpeta raíz con children populados
}

/**
 * Respuesta para el contenido de una carpeta
 */
export interface FolderContentsResponse {
  success: boolean;
  contents: {
    folder: Folder;
    subfolders: Folder[];
    documents: any[]; // Usar Document type cuando importemos
  };
}

/**
 * DTO para crear carpeta
 */
export interface CreateFolderDto {
  name: string;
  organizationId: string;
  parentId: string;
}

/**
 * DTO para mover carpeta
 */
export interface MoveFolderDto {
  targetFolderId: string;
}

/**
 * DTO para renombrar carpeta
 */
export interface RenameFolderDto {
  name: string;
  displayName?: string;
}
