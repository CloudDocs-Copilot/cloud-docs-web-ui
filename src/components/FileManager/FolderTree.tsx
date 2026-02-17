import React, { useEffect, useState, useCallback } from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import { FolderTreeItem } from './FolderTreeItem';
import { folderService } from '../../services/folder.service';
import useOrganization from '../../hooks/useOrganization';
import type { Folder } from '../../types/folder.types';

interface FolderTreeProps {
  onSelectFolder: (folder: Folder) => void;
  selectedFolderId?: string;
  refreshTrigger?: number; // Prop to force refresh
  onMoveDocument?: (documentId: string, targetFolderId: string) => void;
  onTreeLoaded?: (tree: Folder | null) => void;
}

export const FolderTree: React.FC<FolderTreeProps> = ({ 
  onSelectFolder, 
  selectedFolderId,
  refreshTrigger,
  onMoveDocument,
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
        if (onTreeLoaded) {
          onTreeLoaded(enhancedRoot);
        }
        // If no folder selected, select root by default (only on initial load)
        if (!selectedFolderId) {
          onSelectFolder(enhancedRoot);
        }
      }
    } catch (err) {
      console.error('Failed to load folder tree', err);
      setError('Failed to load folders');
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
      await fetchTree(); // Refresh after move
    } catch (err: any) {
      console.error('Move failed', err);
      alert('Failed to move folder: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!activeOrganization) {
    return <Alert variant="warning">Please select an organization</Alert>;
  }

  if (loading && !tree) {
    return <div className="p-3 text-center"><Spinner animation="border" size="sm" /></div>;
  }

  if (error) {
    return <Alert variant="danger" className="m-2 p-2" style={{fontSize: '0.8rem'}}>{error}</Alert>;
  }

  if (!tree) {
    return <div className="p-3 text-muted">No folders found</div>;
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
        />
      )}
    </div>
  );
};
