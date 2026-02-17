import React, { useEffect, useState, useCallback } from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import { FolderTreeItem } from './FolderTreeItem';
import { folderService } from '../../services/folder.service';
import useOrganization from '../../hooks/useOrganization';
import type { Folder } from '../../types/folder.types';
import type { Document } from '../../types/document.types';

interface FolderTreeProps {
  onSelectFolder: (folder: Folder) => void;
  selectedFolderId?: string;
  refreshTrigger?: number; // Prop para forzar recarga
  onMoveDocument?: (documentId: string, targetFolderId: string) => void;
  onDocumentClick?: (document: Document) => void;
  onRenameFolder?: (folder: Folder) => void;
  onRenameDocument?: (document: Document) => void;
  onTreeLoaded?: (tree: Folder | null) => void;
}

export const FolderTree: React.FC<FolderTreeProps> = ({ 
  onSelectFolder, 
  selectedFolderId,
  refreshTrigger,
  onMoveDocument,
  onDocumentClick,
  onRenameFolder,
  onRenameDocument,
  onTreeLoaded
}) => {
  const { activeOrganization } = useOrganization();
  const [tree, setTree] = useState<Folder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Función recursiva para agregar niveles de profundidad al árbol para la indentación
   */
  const enhanceTreeWithLevels = (node: Folder, level: number = 0): Folder => {
    return {
      ...node,
      level,
      children: node.children 
        ? node.children.map(child => enhanceTreeWithLevels(child, level + 1)) 
        : []
    };
  };

  const fetchTree = useCallback(async () => {
    if (!activeOrganization?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      const rootFolder = await folderService.getTree(activeOrganization.id);
      if (rootFolder) {
        const enhancedRoot = enhanceTreeWithLevels(rootFolder);
        setTree(enhancedRoot);
        // Notificar al componente padre que el árbol ha cargado
        if (onTreeLoaded) {
          onTreeLoaded(enhancedRoot);
        }
        // Si no hay carpeta seleccionada, seleccionar raíz por defecto (solo en carga inicial)
        if (!selectedFolderId) {
          onSelectFolder(enhancedRoot);
        }
      }
    } catch (err) {
      console.error('Error al cargar árbol de carpetas', err);
      setError('Error al cargar carpetas');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOrganization?.id]);

  useEffect(() => {
    fetchTree();
  }, [activeOrganization?.id, refreshTrigger]);

  const handleMoveFolder = async (sourceId: string, targetId: string) => {
    try {
      setLoading(true);
      await folderService.move(sourceId, { targetFolderId: targetId });
      await fetchTree(); // Refrescar después de mover
    } catch (err: any) {
      console.error('Error al mover carpeta', err);
      alert('Error al mover carpeta: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!activeOrganization) {
    return <Alert variant="warning">Por favor selecciona una organización</Alert>;
  }

  if (loading && !tree) {
    return <div className="p-3 text-center"><Spinner animation="border" size="sm" /></div>;
  }

  if (error) {
    return <Alert variant="danger" className="m-2 p-2" style={{fontSize: '0.8rem'}}>{error}</Alert>;
  }

  if (!tree) {
    return <div className="p-3 text-muted">No se encontraron carpetas</div>;
  }

  return (
    <div className="folder-tree-container py-2">
      {tree && (
        <FolderTreeItem
          folder={tree}
          selectedFolderId={selectedFolderId}
          onSelect={onSelectFolder}
          onMoveFolder={handleMoveFolder}
          onMoveDocument={onMoveDocument}
          onDocumentClick={onDocumentClick}
          onRenameFolder={onRenameFolder}
          onRenameDocument={onRenameDocument}
        />
      )}
    </div>
  );
};
