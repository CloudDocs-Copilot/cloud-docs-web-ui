import { render, screen, fireEvent } from '@testing-library/react';
import DocumentCard from '../DocumentCard';
import type { Document } from '../../types/document.types';
import * as previewServiceModule from '../../services/preview.service';

const moveToTrashMock = jest.fn();

// Mock hook
jest.mock('../../hooks/useDocumentDeletion', () => ({
  useDocumentDeletion: () => ({ moveToTrash: moveToTrashMock, loading: false }),
}));

// Mock preview service (must include getDownloadUrl because DocumentCard uses it)
jest.mock('../../services/preview.service', () => ({
  previewService: {
    canPreview: jest.fn(() => true),
    getDownloadUrl: jest.fn((doc: { id?: string; _id?: string }) => `/download/${doc.id || doc._id || 'unknown'}`),
  },
}));

// Mock preview modal to avoid deep tree
jest.mock('../DocumentPreview', () => ({
  DocumentPreviewModal: ({ show }: { show: boolean }) =>
    show ? <div data-testid="preview-modal">PREVIEW</div> : null,
}));

describe('DocumentCard', () => {
  const baseDoc: Partial<Document> = {
    id: 'd1',
    filename: 'file.pdf',
    originalname: 'original.pdf',
    mimeType: 'application/pdf',
    size: 1024,
    url: '/file.pdf',
    path: '/path',
    uploadedBy: 'user-1',
    organization: 'org-1',
    folder: 'folder_legal',
    uploadedAt: new Date('2026-02-14T00:00:00.000Z').toISOString(),
    sharedWith: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    moveToTrashMock.mockResolvedValue(true);
  });

  it('renders document title and badge', () => {
    render(<DocumentCard document={baseDoc as Document} />);
    expect(screen.getByText(/original\.pdf|file\.pdf/i)).toBeInTheDocument();
    expect(screen.getByText('Legal')).toBeInTheDocument();
  });

  it('renders different folder names correctly', () => {
    const folders = [
      { id: 'folder_proyectos', name: 'Proyectos' },
      { id: 'folder_tecnico', name: 'Técnico' },
      { id: 'folder_marketing', name: 'Marketing' },
      { id: 'folder_unknown', name: 'General' },
    ];

    folders.forEach(({ id, name }) => {
      const doc = { ...baseDoc, folder: id };
      const { unmount } = render(<DocumentCard document={doc as Document} />);
      expect(screen.getByText(name)).toBeInTheDocument();
      unmount();
    });
  });

  it('calls window.open when download clicked', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);

    render(<DocumentCard document={baseDoc as Document} />);
    fireEvent.click(screen.getByTitle('Descargar'));

    // DocumentCard uses previewService.getDownloadUrl(previewDocument)
    expect(previewServiceModule.previewService.getDownloadUrl).toHaveBeenCalled();
    expect(openSpy).toHaveBeenCalledWith('/download/d1', '_blank');

    openSpy.mockRestore();
  });

  it('clicking card opens preview modal when canPreview is true', () => {
    render(<DocumentCard document={baseDoc as Document} />);

    // click title (bubbles to Card onClick)
    fireEvent.click(screen.getByText(/original\.pdf|file\.pdf/i));

    expect(screen.getByTestId('preview-modal')).toBeInTheDocument();
  });

  it('clicking preview option opens preview modal when canPreview is true', () => {
    render(<DocumentCard document={baseDoc as Document} />);

    fireEvent.click(screen.getByTitle('Vista previa'));

    expect(screen.getByTestId('preview-modal')).toBeInTheDocument();
  });

  it('does not open preview modal when canPreview is false', () => {
    (previewServiceModule.previewService.canPreview as jest.Mock).mockReturnValueOnce(false);

    render(<DocumentCard document={baseDoc as Document} />);

    fireEvent.click(screen.getByText(/original\.pdf|file\.pdf/i));

    expect(screen.queryByTestId('preview-modal')).not.toBeInTheDocument();
  });

  it('uses _id if id is missing for download url', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);

    const doc: Partial<Document> = { ...baseDoc, id: undefined, _id: 'mongo-1' };
    render(<DocumentCard document={doc as Document} />);

    fireEvent.click(screen.getByTitle('Descargar'));

    expect(openSpy).toHaveBeenCalledWith('/download/mongo-1', '_blank');

    openSpy.mockRestore();
  });

  it('does not render delete button when canDelete is false', () => {
    render(<DocumentCard document={baseDoc as Document} />);
    expect(screen.queryByTitle('Mover a papelera')).not.toBeInTheDocument();
  });
});
