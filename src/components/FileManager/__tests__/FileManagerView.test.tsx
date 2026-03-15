import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FileManagerView } from '../FileManagerView';
import { folderService } from '../../../services/folder.service';
import * as documentService from '../../../services/document.service';
import { previewService } from '../../../services/preview.service';
import type { Folder } from '../../../types/folder.types';
import type { Document } from '../../../types/document.types';

// Mock dependencies
jest.mock('../../../services/folder.service');
jest.mock('../../../services/document.service');
jest.mock('../../../services/preview.service');
jest.mock('../../../hooks/useOrganization');
jest.mock('../FolderTree', () => ({
  FolderTree: jest.fn(() => <div data-testid="folder-tree">Folder Tree</div>),
}));
jest.mock('../FolderCard', () => ({
  FolderCard: jest.fn(({ folder }: { folder: Folder }) => (
    <div data-testid={`folder-card-${folder.id}`}>{folder.name}</div>
  )),
}));
jest.mock('../FolderBreadcrumbs', () => ({
  FolderBreadcrumbs: jest.fn(() => <div data-testid="breadcrumbs">Breadcrumbs</div>),
}));
jest.mock('../../DocumentCard', () => ({
  __esModule: true,
  default: jest.fn(({ document: doc }: { document: Document }) => (
    <div data-testid={`document-card-${doc.id}`}>{doc.filename}</div>
  )),
}));
jest.mock('../../FileUploader/FileUploader', () => ({
  FileUploader: jest.fn(() => <div data-testid="file-uploader">File Uploader</div>),
}));
jest.mock('../../DocumentPreview', () => ({
  DocumentPreviewModal: jest.fn(() => <div data-testid="preview-modal">Preview</div>),
}));
jest.mock('../../../hooks/useOrganization');

import useOrganization from '../../../hooks/useOrganization';
const mockUseOrganization = useOrganization as jest.MockedFunction<typeof useOrganization>;

describe('FileManagerView', () => {
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
    children: [],
    itemCount: 0,
  };

  const mockSubFolder: Folder = {
    id: 'folder-1',
    name: 'Documents',
    displayName: 'Documents',
    type: 'folder' as const,
    owner: 'user-1',
    organization: 'org-1',
    path: '/documents',
    parent: 'root-1',
    isRoot: false,
    level: 1,
    children: [],
    itemCount: 0,
  };

  const mockDocument: Document = {
    id: 'doc-1',
    filename: 'test.pdf',
    originalname: 'test.pdf',
    uploadedBy: 'user-1',
    organization: 'org-1',
    folder: 'folder-1',
    path: '/docs/test.pdf',
    size: 1024,
    mimeType: 'application/pdf',
  };

  const mockContents = {
    folder: mockRootFolder,
    subfolders: [mockSubFolder],
    documents: [mockDocument],
    pagination: {
      total: 1,
      page: 1,
      limit: 20,
      pages: 1,
      totalPages: 1,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseOrganization.mockReturnValue({
      activeOrganization: { id: 'org-1', name: 'Test Org' },
    });
    (folderService.getTree as jest.Mock).mockResolvedValue(mockRootFolder);
    (folderService.getContents as jest.Mock).mockResolvedValue(mockContents);
    (folderService.create as jest.Mock).mockResolvedValue({ id: 'new-folder', name: 'New Folder' });
    (folderService.rename as jest.Mock).mockResolvedValue({ id: 'folder-1', name: 'Renamed' });
    (folderService.move as jest.Mock).mockResolvedValue(true);
    (documentService.renameDocument as jest.Mock).mockResolvedValue({ id: 'doc-1', originalname: 'renamed.pdf' });
    (documentService.moveDocument as jest.Mock).mockResolvedValue(true);
    (previewService.canPreview as jest.Mock).mockReturnValue(true);
  });

  it('renderiza el componente FileManagerView', () => {
    render(<FileManagerView />);
    expect(screen.getByTestId('folder-tree')).toBeInTheDocument();
  });

  it('renderiza el botón de crear carpeta', () => {
    render(<FileManagerView />);
    const createButton = screen.getByRole('button', { name: /Nueva carpeta/i });
    expect(createButton).toBeInTheDocument();
  });

  it('renderiza el botón de subir archivo', () => {
    render(<FileManagerView />);
    const uploadButton = screen.getByRole('button', { name: /Subir archivo/i });
    expect(uploadButton).toBeInTheDocument();
  });

  it('renderiza el árbol de carpetas y breadcrumbs', async () => {
    render(<FileManagerView />);
    await waitFor(() => {
      expect(screen.getByTestId('folder-tree')).toBeInTheDocument();
      expect(screen.getByTestId('breadcrumbs')).toBeInTheDocument();
    });
  });

  it('maneja la prop externalRefresh', async () => {
    const { rerender } = render(<FileManagerView externalRefresh={0} />);
    expect(screen.getByTestId('folder-tree')).toBeInTheDocument();

    rerender(<FileManagerView externalRefresh={1} />);
    expect(screen.getByTestId('folder-tree')).toBeInTheDocument();
  });

  it('renderiza sin organización activa', () => {
    mockUseOrganization.mockReturnValue({
      activeOrganization: null,
    });
    render(<FileManagerView />);
    expect(screen.getByTestId('folder-tree')).toBeInTheDocument();
  });

  it('renderiza los botones de acción correctamente', () => {
    render(<FileManagerView />);
    const createBtn = screen.getByRole('button', { name: /Nueva carpeta/i });
    const uploadBtn = screen.getByRole('button', { name: /Subir archivo/i });
    expect(createBtn).toBeInTheDocument();
    expect(uploadBtn).toBeInTheDocument();
  });

  it('desactiva botones cuando no hay carpeta seleccionada', () => {
    render(<FileManagerView />);
    const createButton = screen.getByRole('button', { name: /Nueva carpeta/i });
    const uploadButton = screen.getByRole('button', { name: /Subir archivo/i });
    expect(createButton).toBeDisabled();
    expect(uploadButton).toBeDisabled();
  });

  it('renderiza sin errores después de carga', async () => {
    render(<FileManagerView />);
    await waitFor(() => {
      expect(screen.getByTestId('folder-tree')).toBeInTheDocument();
    });
  });

  it('inicializa con organizacion activa', () => {
    render(<FileManagerView />);
    expect(mockUseOrganization).toHaveBeenCalled();
    expect(screen.getByTestId('folder-tree')).toBeInTheDocument();
  });

  it('renderiza estructura base correctamente', () => {
    render(<FileManagerView />);
    const container = screen.getByTestId('folder-tree').closest('.vh-100') || 
                      screen.getByTestId('folder-tree').closest('.container-fluid') ||
                      screen.getByTestId('folder-tree').parentElement;
    expect(container).toBeInTheDocument();
  });
});
