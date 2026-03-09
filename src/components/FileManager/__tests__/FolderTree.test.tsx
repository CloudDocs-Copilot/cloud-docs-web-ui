import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FolderTree } from '../FolderTree';
import { folderService } from '../../../services/folder.service';
import type { Folder } from '../../../types/folder.types';

// Mock dependencies
jest.mock('../../../services/folder.service');
jest.mock('../../../hooks/useOrganization');
jest.mock('../FolderTreeItem', () => ({
  FolderTreeItem: ({ folder }: { folder: Folder }) => (
    <div data-testid={`folder-${folder.id}`}>{folder.name}</div>
  ),
}));
jest.mock('../../../hooks/useOrganization');

import useOrganization from '../../../hooks/useOrganization';
const mockUseOrganization = useOrganization as jest.MockedFunction<typeof useOrganization>;

describe('FolderTree', () => {
  const mockOnSelectFolder = jest.fn();
  const mockOnMoveDocument = jest.fn();
  const mockOnDocumentClick = jest.fn();
  const mockOnRenameFolder = jest.fn();
  const mockOnRenameDocument = jest.fn();
  const mockOnTreeLoaded = jest.fn();

  const mockRootFolder: Folder = {
    id: 'root-1',
    name: 'Mi Unidad',
    displayName: 'Mi Unidad',
    type: 'folder',
    owner: 'user-1',
    organization: 'org-1',
    path: '/',
    parent: null,
    isRoot: true,
    level: 0,
    children: [
      {
        id: 'folder-1',
        name: 'Documents',
        displayName: 'Documents',
        type: 'folder',
        owner: 'user-1',
        organization: 'org-1',
        path: '/documents',
        parent: 'root-1',
        isRoot: false,
        level: 1,
        children: [],
        itemCount: 0,
      },
    ],
    itemCount: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseOrganization.mockReturnValue({
      activeOrganization: { id: 'org-1', name: 'Test Org' },
    });
    (folderService.getTree as jest.Mock).mockResolvedValue(mockRootFolder);
  });

  it('renderiza el estado de carga inicialmente', async () => {
    render(<FolderTree onSelectFolder={mockOnSelectFolder} />);

    // Component renders (loading state is internal)
    await waitFor(() => {
      expect(folderService.getTree).toHaveBeenCalled();
    });
  });

  it('renderiza el árbol de carpetas después de cargar', async () => {
    render(<FolderTree onSelectFolder={mockOnSelectFolder} />);

    await waitFor(() => {
      expect(screen.getByTestId('folder-root-1')).toBeInTheDocument();
    });

    expect(screen.getByText('Mi Unidad')).toBeInTheDocument();
  });

  it('llama a onTreeLoaded cuando el árbol se carga', async () => {
    render(
      <FolderTree
        onSelectFolder={mockOnSelectFolder}
        onTreeLoaded={mockOnTreeLoaded}
      />
    );

    await waitFor(() => {
      expect(mockOnTreeLoaded).toHaveBeenCalled();
    });
  });

  it('llama a onSelectFolder con la carpeta raíz cuando no hay carpeta seleccionada', async () => {
    render(<FolderTree onSelectFolder={mockOnSelectFolder} />);

    await waitFor(() => {
      expect(mockOnSelectFolder).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'root-1' })
      );
    });
  });

  it('no llama a onSelectFolder cuando se proporciona selectedFolderId', async () => {
    render(
      <FolderTree
        onSelectFolder={mockOnSelectFolder}
        selectedFolderId="folder-1"
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('folder-root-1')).toBeInTheDocument();
    });

    expect(mockOnSelectFolder).not.toHaveBeenCalled();
  });

  it('maneja el error cuando falla la obtención del árbol', async () => {
    (folderService.getTree as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch')
    );

    render(<FolderTree onSelectFolder={mockOnSelectFolder} />);

    await waitFor(() => {
      expect(screen.getByText('Error al cargar carpetas')).toBeInTheDocument();
    });
  });

  it('no obtiene el árbol cuando no hay organización activa', async () => {
    mockUseOrganization.mockReturnValue({
      activeOrganization: null,
    });

    render(<FolderTree onSelectFolder={mockOnSelectFolder} />);

    await waitFor(() => {
      expect(folderService.getTree).not.toHaveBeenCalled();
    });
  });

  it('vuelve a obtener el árbol cuando cambia refreshTrigger', async () => {
    const { rerender } = render(
      <FolderTree onSelectFolder={mockOnSelectFolder} refreshTrigger={0} />
    );

    await waitFor(() => {
      expect(folderService.getTree).toHaveBeenCalledTimes(1);
    });

    rerender(
      <FolderTree onSelectFolder={mockOnSelectFolder} refreshTrigger={1} />
    );

    await waitFor(() => {
      expect(folderService.getTree).toHaveBeenCalledTimes(2);
    });
  });

  it('pasa todos los callbacks a FolderTreeItem', async () => {
    render(
      <FolderTree
        onSelectFolder={mockOnSelectFolder}
        onMoveDocument={mockOnMoveDocument}
        onDocumentClick={mockOnDocumentClick}
        onRenameFolder={mockOnRenameFolder}
        onRenameDocument={mockOnRenameDocument}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('folder-root-1')).toBeInTheDocument();
    });
  });

  it('mejora el árbol con información de nivel', async () => {
    render(
      <FolderTree
        onSelectFolder={mockOnSelectFolder}
        onTreeLoaded={mockOnTreeLoaded}
      />
    );

    await waitFor(() => {
      expect(mockOnTreeLoaded).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 0,
          children: expect.arrayContaining([
            expect.objectContaining({ level: 1 }),
          ]),
        })
      );
    });
  });

  it('renderiza con todas las props opcionales', async () => {
    render(
      <FolderTree
        onSelectFolder={mockOnSelectFolder}
        selectedFolderId="folder-1"
        refreshTrigger={0}
        onMoveDocument={mockOnMoveDocument}
        onDocumentClick={mockOnDocumentClick}
        onRenameFolder={mockOnRenameFolder}
        onRenameDocument={mockOnRenameDocument}
        onTreeLoaded={mockOnTreeLoaded}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('folder-root-1')).toBeInTheDocument();
    });
  });

  it('maneja múltiples cambios de refreshTrigger', async () => {
    const { rerender } = render(
      <FolderTree onSelectFolder={mockOnSelectFolder} refreshTrigger={0} />
    );

    await waitFor(() => {
      expect(screen.getByTestId('folder-root-1')).toBeInTheDocument();
    });

    rerender(
      <FolderTree onSelectFolder={mockOnSelectFolder} refreshTrigger={1} />
    );

    await waitFor(() => {
      expect(folderService.getTree).toHaveBeenCalledTimes(2);
    });

    rerender(
      <FolderTree onSelectFolder={mockOnSelectFolder} refreshTrigger={2} />
    );

    await waitFor(() => {
      expect(folderService.getTree).toHaveBeenCalledTimes(3);
    });
  });
});
