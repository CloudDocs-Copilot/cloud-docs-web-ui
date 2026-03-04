/**
 * Servicio para operaciones con carpetas
 */
import { apiClient } from '../api';
import type { 
  Folder, 
  FolderTreeResponse, 
  FolderContentsResponse,
  CreateFolderDto, 
  MoveFolderDto, 
  RenameFolderDto 
} from '../types/folder.types';

export const folderService = {
  /**
   * Obtiene el árbol completo de carpetas del usuario
   */
  getTree: async (organizationId: string): Promise<Folder> => {
    const response = await apiClient.get<FolderTreeResponse>(`/folders/tree`, {
      params: { organizationId }
    });
    return response.data.tree;
  },

  /**
   * Obtiene el contenido de una carpeta específica
   */
  getContents: async (folderId: string): Promise<FolderContentsResponse['contents']> => {
    const response = await apiClient.get<FolderContentsResponse>(`/folders/${folderId}/contents`);
    return response.data.contents;
  },

  /**
   * Crea una nueva carpeta
   */
  create: async (data: CreateFolderDto): Promise<Folder> => {
    const response = await apiClient.post<{ success: boolean; folder: Folder }>('/folders', data);
    return response.data.folder;
  },

  /**
   * Mueve una carpeta a otra ubicación
   */
  move: async (folderId: string, data: MoveFolderDto): Promise<Folder> => {
    const response = await apiClient.patch<{ success: boolean; folder: Folder }>(
      `/folders/${folderId}/move`, 
      data
    );
    return response.data.folder;
  },

  /**
   * Renombra una carpeta
   */
  rename: async (folderId: string, data: RenameFolderDto): Promise<Folder> => {
    const response = await apiClient.patch<{ success: boolean; folder: Folder }>(
      `/folders/${folderId}`,
      data
    );
    return response.data.folder;
  },

  /**
   * Elimina una carpeta
   */
  delete: async (folderId: string, force: boolean = false): Promise<void> => {
    await apiClient.delete(`/folders/${folderId}`, {
      params: { force }
    });
  }
};
