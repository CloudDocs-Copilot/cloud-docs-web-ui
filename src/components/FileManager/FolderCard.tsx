import React, { useState } from 'react';
import { Card, Dropdown } from 'react-bootstrap';
import { Folder as FolderIcon, Folder2Open as FolderOpenIcon, ThreeDotsVertical, PencilSquare } from 'react-bootstrap-icons';
import type { Folder } from '../../types/folder.types';

interface FolderCardProps {
  folder: Folder;
  onSelect: (folder: Folder) => void;
  onMoveDocument?: (documentId: string, targetFolderId: string) => void;
  onMoveFolder?: (sourceFolderId: string, targetFolderId: string) => void;
  onRename?: (folder: Folder) => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({ 
  folder, 
  onSelect, 
  onMoveDocument,
  onMoveFolder,
  onRename
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleClick = () => {
    onSelect(folder);
  };

  /* --- Manejadores de Drag & Drop --- */
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Solo cambiar si realmente salimos del elemento (no sus hijos)
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      
      if (data.type === 'document' && onMoveDocument) {
        // Mover documento a esta carpeta
        onMoveDocument(data.id, folder.id);
      } else if (data.type === 'folder' && onMoveFolder && data.id !== folder.id) {
        // Mover carpeta dentro de esta carpeta
        onMoveFolder(data.id, folder.id);
      }
    } catch (err) {
      console.error('Error al soltar', err);
    }
  };

  return (
    <Card 
      className={`h-100 shadow-sm border-0 text-center p-3 ${isDragOver ? 'border-primary border-3' : 'bg-light'}`}
      style={{
        cursor: 'pointer',
        backgroundColor: isDragOver ? '#e3f2fd' : undefined,
        transition: 'all 0.2s ease',
        position: 'relative'
      }}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Menú de opciones */}
      {onRename && (
        <Dropdown 
          className="position-absolute" 
          style={{ top: '8px', right: '8px', zIndex: 10 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Dropdown.Toggle 
            variant="light" 
            size="sm" 
            className="border-0 p-1"
            style={{ lineHeight: 1 }}
          >
            <ThreeDotsVertical size={16} />
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => onRename(folder)}>
              <PencilSquare className="me-2" size={14} />
              Renombrar
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      )}

      <div 
        className="d-flex justify-content-center align-items-center mb-2"
        onClick={handleClick}
      >
        {isDragOver ? (
          <FolderOpenIcon 
            className="text-primary" 
            size={64}
            style={{ transition: 'all 0.2s ease' }}
          />
        ) : (
          <FolderIcon 
            className="text-warning" 
            size={56}
            style={{ transition: 'all 0.2s ease' }}
          />
        )}
      </div>
      <div 
        className="text-truncate small fw-bold" 
        title={folder.displayName || folder.name}
        onClick={handleClick}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (onRename) {
            onRename(folder);
          }
        }}
        style={{ cursor: onRename ? 'text' : 'pointer' }}
      >
        {folder.displayName || folder.name}
      </div>
      {folder.itemCount !== undefined && (
        <div 
          className="text-muted" 
          style={{ fontSize: '0.75rem' }}
          onClick={handleClick}
        >
          {folder.itemCount} {folder.itemCount === 1 ? 'archivo' : 'archivos'}
        </div>
      )}
    </Card>
  );
};
