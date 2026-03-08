import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { FolderBreadcrumbs } from '../FolderBreadcrumbs';
import type { Folder } from '../../../types/folder.types';

describe('FolderBreadcrumbs', () => {
  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockFolder = (id: string, name: string): Folder => ({
    id,
    name,
    displayName: name,
    type: 'folder',
    owner: 'user-1',
    organization: 'org-1',
    path: `/${name.toLowerCase()}`,
    parent: null,
    isRoot: id === 'root',
    level: 1,
    children: [],
    itemCount: 0
  });

  it('no renderiza nada cuando el path está vacío', () => {
    const { container } = render(
      <FolderBreadcrumbs 
        currentFolder={null} 
        path={[]} 
        onNavigate={mockOnNavigate} 
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('renderiza correctamente el path de carpetas', () => {
    const path: Folder[] = [
      createMockFolder('root', 'Mi Unidad'),
      createMockFolder('folder-1', 'Documents'),
      createMockFolder('folder-2', 'Work'),
    ];
    
    render(
      <FolderBreadcrumbs 
        currentFolder={path[2]} 
        path={path} 
        onNavigate={mockOnNavigate} 
      />
    );
    
    expect(screen.getByText('Mi Unidad')).toBeInTheDocument();
    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('renderiza el icono de carpeta para el primer elemento', () => {
    const path: Folder[] = [
      createMockFolder('root', 'Mi Unidad'),
    ];
    
    const { container } = render(
      <FolderBreadcrumbs 
        currentFolder={path[0]} 
        path={path} 
        onNavigate={mockOnNavigate} 
      />
    );
    
    // Check for folder icon (svg)
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('llama a onNavigate cuando se hace clic en un breadcrumb que no es el último', async () => {
    const path: Folder[] = [
      createMockFolder('root', 'Mi Unidad'),
      createMockFolder('folder-1', 'Documents'),
      createMockFolder('folder-2', 'Work'),
    ];
    
    render(
      <FolderBreadcrumbs 
        currentFolder={path[2]} 
        path={path} 
        onNavigate={mockOnNavigate} 
      />
    );
    
    // Click on first breadcrumb (should navigate)
    await userEvent.click(screen.getByText('Mi Unidad'));
    expect(mockOnNavigate).toHaveBeenCalledWith('root');
    
    // Click on second breadcrumb (should navigate)
    await userEvent.click(screen.getByText('Documents'));
    expect(mockOnNavigate).toHaveBeenCalledWith('folder-1');
  });

  it('no llama a onNavigate cuando se hace clic en el último breadcrumb', async () => {
    const path: Folder[] = [
      createMockFolder('root', 'Mi Unidad'),
      createMockFolder('folder-1', 'Work'),
    ];
    
    render(
      <FolderBreadcrumbs 
        currentFolder={path[1]} 
        path={path} 
        onNavigate={mockOnNavigate} 
      />
    );
    
    // Click on last breadcrumb (should not navigate)
    await userEvent.click(screen.getByText('Work'));
    expect(mockOnNavigate).not.toHaveBeenCalled();
  });

  it('renderiza displayName cuando está disponible', () => {
    const path: Folder[] = [
      {
        ...createMockFolder('folder-1', 'Actual Name'),
        displayName: 'Display Name',
      },
    ];
    
    render(
      <FolderBreadcrumbs 
        currentFolder={path[0]} 
        path={path} 
        onNavigate={mockOnNavigate} 
      />
    );
    
    expect(screen.getByText('Display Name')).toBeInTheDocument();
    expect(screen.queryByText('Actual Name')).not.toBeInTheDocument();
  });
});
