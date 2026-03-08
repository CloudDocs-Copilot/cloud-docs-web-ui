import React from 'react';
import { Breadcrumb } from 'react-bootstrap';
import { Folder } from 'react-bootstrap-icons';
import type { Folder as IFolder } from '../../types/folder.types';

interface FolderBreadcrumbsProps {
  currentFolder: IFolder | null;
  path: IFolder[]; // Ancestors path including current
  onNavigate: (folderId: string) => void;
}

export const FolderBreadcrumbs: React.FC<FolderBreadcrumbsProps> = ({ 
  path, 
  onNavigate 
}) => {
  if (!path || path.length === 0) return null;

  return (
    <Breadcrumb className="mb-0 p-1" style={{ backgroundColor: 'transparent' }}>
      {path.map((folder, index) => {
        const isLast = index === path.length - 1;
        return (
          <Breadcrumb.Item 
            key={folder.id} 
            active={isLast}
            onClick={() => !isLast && onNavigate(folder.id)}
            style={{ 
              cursor: isLast ? 'default' : 'pointer',
              color: isLast ? '#111827' : '#6b7280',
              fontWeight: isLast ? 500 : 400
            }}
          >
            {index === 0 && <Folder className="me-1 mb-1" size={14} />}
            {folder.displayName || folder.name}
          </Breadcrumb.Item>
        );
      })}
    </Breadcrumb>
  );
};
