import React, { useState, useEffect } from 'react';
import { Badge } from 'react-bootstrap';
import { 
  Folder as FolderIcon, 
  Folder2Open as FolderOpenIcon, 
  ChevronRight, 
  ChevronDown,
  FileEarmark 
} from 'react-bootstrap-icons';
import type { Folder } from '../../types/folder.types';
import type { Document } from '../../types/document.types';
import styles from './FolderTree.module.css';

interface FolderTreeItemProps {
  folder: Folder;
  selectedFolderId?: string;
  onSelect: (folder: Folder) => void;
  onMoveFolder: (sourceId: string, targetId: string) => void;
  onMoveDocument?: (documentId: string, targetFolderId: string) => void;
  onDocumentClick?: (document: Document) => void;
  onRenameFolder?: (folder: Folder) => void;
  onRenameDocument?: (document: Document) => void;
}

export const FolderTreeItem: React.FC<FolderTreeItemProps> = ({ 
  folder, 
  selectedFolderId, 
  onSelect,
  onMoveFolder,
  onMoveDocument,
  onDocumentClick,
  onRenameFolder,
  onRenameDocument
}) => {
  // Expandir por defecto para mostrar la estructura completa del directorio
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Para manejar el delay entre click simple y doble click en documentos
  const clickTimerRef = React.useRef<number | null>(null);
  const clickPreventRef = React.useRef(false);
  
  const hasChildren = folder.children && folder.children.length > 0;
  const hasDocuments = folder.documents && folder.documents.length > 0;
  const hasContent = hasChildren || hasDocuments;
  const isSelected = selectedFolderId === folder.id;

  // Limpiar timer al desmontar el componente
  useEffect(() => {
    return () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
    };
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(folder);
  };
  
  const handleDocumentSingleClick = (doc: any) => {
    // Esperar 250ms para ver si es un doble click
    clickTimerRef.current = window.setTimeout(() => {
      if (!clickPreventRef.current && onDocumentClick) {
        onDocumentClick(doc);
      }
      clickPreventRef.current = false;
    }, 250);
  };
  
  const handleDocumentDoubleClick = (e: React.MouseEvent, doc: any) => {
    e.stopPropagation();
    // Cancelar el timer del click simple
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }
    clickPreventRef.current = true;
    
    // Ejecutar renombrado
    if (onRenameDocument) {
      onRenameDocument(doc);
    }
    
    // Reset después de un momento
    setTimeout(() => {
      clickPreventRef.current = false;
    }, 300);
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
    // Permitir soltar solo si no se arrastra sobre sí mismo
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
      console.error('Error al soltar', err);
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
        draggable={!folder.isRoot} // La carpeta raíz no se puede mover
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ paddingLeft: `${(folder.level || 0) * 12}px` }}
      >
        <span 
          className={styles.toggleIcon} 
          onClick={handleToggle}
          style={{ visibility: hasContent ? 'visible' : 'hidden' }}
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
        
        <span 
          className={styles.folderName} 
          style={{ fontWeight: folder.isRoot ? 600 : 400 }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            if (!folder.isRoot && onRenameFolder) {
              onRenameFolder(folder);
            }
          }}
        >
          {folder.displayName || folder.name}
        </span>

        {folder.itemCount !== undefined && (
          <Badge bg="secondary" pill className="ms-2" style={{ fontSize: '0.6rem' }}>
            {folder.itemCount}
          </Badge>
        )}
      </div>

      {isExpanded && hasContent && (
        <div className={styles.childrenContainer}>
          {/* Subcarpetas */}
          {folder.children && folder.children.map(child => (
            <FolderTreeItem
              key={child.id}
              folder={child}
              selectedFolderId={selectedFolderId}
              onSelect={onSelect}
              onMoveFolder={onMoveFolder}
              onMoveDocument={onMoveDocument}
              onDocumentClick={onDocumentClick}
              onRenameFolder={onRenameFolder}
              onRenameDocument={onRenameDocument}
            />
          ))}
          
          {/* Documentos */}
          {folder.documents && folder.documents.map(doc => (
            <div 
              key={doc.id}
              className={styles.treeItem}
              style={{ 
                paddingLeft: `${((folder.level || 0) + 1) * 12}px`,
                cursor: onDocumentClick ? 'pointer' : 'default'
              }}
              onClick={() => handleDocumentSingleClick(doc)}
              onDoubleClick={(e) => handleDocumentDoubleClick(e, doc)}
              draggable={true}
              onDragStart={(e) => {
                e.stopPropagation();
                e.dataTransfer.setData('application/json', JSON.stringify({
                  type: 'document',
                  id: doc.id
                }));
                e.dataTransfer.effectAllowed = 'move';
              }}
            >
              <span 
                className={styles.toggleIcon} 
                style={{ visibility: 'hidden' }}
              />
              
              <span className={`${styles.folderIcon} me-2`}>
                <FileEarmark className="text-muted" size={14} />
              </span>
              
              <span className={styles.folderName} style={{ fontSize: '0.85rem' }}>
                {doc.originalname || doc.filename}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
