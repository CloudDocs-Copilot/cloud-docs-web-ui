import React, { useState } from 'react';
import { Badge } from 'react-bootstrap';
import { 
  Folder as FolderIcon, 
  Folder2Open as FolderOpenIcon, 
  ChevronRight, 
  ChevronDown 
} from 'react-bootstrap-icons';
import type { Folder } from '../../types/folder.types';
import styles from './FolderTree.module.css';

interface FolderTreeItemProps {
  folder: Folder;
  selectedFolderId?: string;
  onSelect: (folder: Folder) => void;
  onMoveFolder: (sourceId: string, targetId: string) => void;
  onMoveDocument?: (documentId: string, targetFolderId: string) => void;
}

export const FolderTreeItem: React.FC<FolderTreeItemProps> = ({ 
  folder, 
  selectedFolderId, 
  onSelect,
  onMoveFolder,
  onMoveDocument
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const hasChildren = folder.children && folder.children.length > 0;
  const isSelected = selectedFolderId === folder.id;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(folder);
  };

  /* --- Manejadores de Drag & Drop --- */
  
  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'folder',
      id: folder.id
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Allow drop only if not dragging over itself (handled by drop logic mostly)
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.type === 'folder' && data.id !== folder.id) {
        onMoveFolder(data.id, folder.id);
      } else if (data.type === 'document' && onMoveDocument) {
        onMoveDocument(data.id, folder.id);
      }
    } catch (err) {
      console.error('Drop error', err);
    }
  };

  return (
    <div className={styles.treeItemContainer}>
      <div 
        className={`
          ${styles.treeItem} 
          ${isSelected ? styles.selected : ''} 
          ${isDragOver ? styles.dragOver : ''}
        `}
        onClick={handleClick}
        draggable={!folder.isRoot} // Root cannot be moved
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ paddingLeft: `${(folder.level || 0) * 12}px` }}
      >
        <span 
          className={styles.toggleIcon} 
          onClick={handleToggle}
          style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
        >
          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </span>
        
        <span className={`${styles.folderIcon} me-2`}>
          {folder.isRoot ? (
            <FolderIcon className="text-primary" size={18} />
          ) : isExpanded ? (
            <FolderOpenIcon className="text-warning" />
          ) : (
            <FolderIcon className="text-warning" />
          )}
        </span>
        
        <span className={styles.folderName} style={{ fontWeight: folder.isRoot ? 600 : 400 }}>
          {folder.displayName || folder.name}
        </span>

        {folder.itemCount !== undefined && (
          <Badge bg="secondary" pill className="ms-2" style={{ fontSize: '0.6rem' }}>
            {folder.itemCount}
          </Badge>
        )}
      </div>

      {isExpanded && hasChildren && (
        <div className={styles.childrenContainer}>
          {folder.children!.map(child => (
            <FolderTreeItem
              key={child.id}
              folder={child}
              selectedFolderId={selectedFolderId}
              onSelect={onSelect}
              onMoveFolder={onMoveFolder}
              onMoveDocument={onMoveDocument}
            />
          ))}
        </div>
      )}
    </div>
  );
};
