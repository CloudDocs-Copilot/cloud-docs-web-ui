import { render, screen, fireEvent, act } from '@testing-library/react';
import DocumentCard from '../DocumentCard';
import type { Document } from '../../types/document.types';
import * as previewServiceModule from '../../services/preview.service';

jest.mock('../../hooks/useDocumentDeletion', () => ({
  useDocumentDeletion: () => ({ moveToTrash: jest.fn().mockResolvedValue(true), loading: false })
}));

jest.mock('../../services/preview.service', () => ({
  previewService: {
    canPreview: jest.fn(() => true),
    getPreviewUrl: jest.fn((doc: Document) => '/preview/' + doc.id)
  }
}));

jest.mock('../DocumentPreview', () => ({
  DocumentPreviewModal: ({ show }: { show: boolean }) => show ? <div data-testid="preview-modal">PREVIEW</div> : null
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
    uploadedAt: new Date().toISOString(),
    sharedWith: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('renders document title and badge', () => {
    render(<DocumentCard document={baseDoc as Document} />);
    expect(screen.getByText(/original.pdf|file.pdf/i)).toBeInTheDocument();
    expect(screen.getByText(/Legal/i)).toBeInTheDocument();
  });

  it('renders filename, category badge and formatted size/date', () => {
    const doc = { ...baseDoc, folder: 'folder_finanzas' };
    render(<DocumentCard document={doc as Document} />);
    expect(screen.getByText(/original.pdf|file.pdf/i)).toBeInTheDocument();
    expect(screen.getByText(/Finanzas/i)).toBeInTheDocument();
    expect(screen.getByText(/KB|Bytes|MB|GB/)).toBeTruthy();
  });

  it('calls window.open when download clicked', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    render(<DocumentCard document={baseDoc as Document} />);

    const downloadBtn = screen.getByTitle('Descargar');
    fireEvent.click(downloadBtn);

    expect(openSpy).toHaveBeenCalledWith('/preview/d1', '_blank');
    openSpy.mockRestore();
  });

  it('clicking preview opens modal when canPreview is true', () => {
    render(<DocumentCard document={baseDoc as Document} />);
    const card = screen.getByText(/original.pdf|file.pdf/i).closest('div') as HTMLElement;
    fireEvent.click(card);
    expect(screen.getByTestId('preview-modal')).toBeInTheDocument();
  });

  it('move to trash calls moveToTrash and triggers onDeleted', async () => {
    const onDeleted = jest.fn();
    render(<DocumentCard document={baseDoc as Document} onDeleted={onDeleted} />);

    const deleteBtn = screen.getByTitle('Mover a papelera');
    fireEvent.click(deleteBtn);

    const confirmButtons = screen.getAllByRole('button', { name: /Mover a papelera/i });
    const confirmBtn = confirmButtons.find(btn => btn.className.includes('btn-danger')) || confirmButtons[confirmButtons.length - 1];
    
    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    expect(onDeleted).toHaveBeenCalled();
  });

  it('uses _id if id missing for preview id', () => {
    const doc: Partial<Document> = { ...baseDoc, id: undefined, _id: 'mongo-1' };
    render(<DocumentCard document={doc as Document} />);
    const card = screen.getByText(/original.pdf|file.pdf/i).closest('div') as HTMLElement;
    fireEvent.click(card);
    expect(screen.getByTestId('preview-modal')).toBeInTheDocument();
  });

  it('does not open preview modal when canPreview is false', () => {
    jest.spyOn(previewServiceModule.previewService, 'canPreview').mockReturnValueOnce(false);

    render(<DocumentCard document={baseDoc as Document} />);
    const card = screen.getByText(/original.pdf|file.pdf/i).closest('div') as HTMLElement;
    fireEvent.click(card);
    
    expect(screen.queryByTestId('preview-modal')).not.toBeInTheDocument();
  });

  it('displays different folder names correctly', () => {
    const folders = [
      { id: 'folder_proyectos', name: 'Proyectos' },
      { id: 'folder_tecnico', name: 'Técnico' },
      { id: 'folder_marketing', name: 'Marketing' },
      { id: 'folder_unknown', name: 'General' }
    ];

    folders.forEach(({ id, name }) => {
      const doc = { ...baseDoc, folder: id };
      const { unmount } = render(<DocumentCard document={doc as Document} />);
      expect(screen.getByText(name)).toBeInTheDocument();
      unmount();
    });
  });

  it('handles delete without onDeleted callback', async () => {
    render(<DocumentCard document={baseDoc as Document} />);

    const deleteBtn = screen.getByTitle('Mover a papelera');
    fireEvent.click(deleteBtn);

    const confirmButtons = screen.getAllByRole('button', { name: /Mover a papelera/i });
    const confirmBtn = confirmButtons.find(btn => btn.className.includes('btn-danger')) || confirmButtons[confirmButtons.length - 1];
    
    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    // Should not throw error even without onDeleted callback
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  describe('Drag and Drop', () => {
    it('is draggable', () => {
      const { container } = render(<DocumentCard document={baseDoc as Document} />);
      const card = container.querySelector('.card');
      expect(card).toHaveAttribute('draggable', 'true');
    });

    it('has grab cursor by default', () => {
      const { container } = render(<DocumentCard document={baseDoc as Document} />);
      const card = container.querySelector('.card') as HTMLElement;
      expect(card.style.cursor).toBe('grab');
    });

    it('handles drag start event', () => {
      const { container } = render(<DocumentCard document={baseDoc as Document} />);
      const card = container.querySelector('.card')!;
      
      const dataTransfer = {
        setData: jest.fn(),
        effectAllowed: ''
      };

      fireEvent.dragStart(card, { dataTransfer });

      expect(dataTransfer.setData).toHaveBeenCalledWith(
        'application/json',
        JSON.stringify({ type: 'document', id: 'd1' })
      );
      expect(dataTransfer.effectAllowed).toBe('move');
    });

    it('applies dragging class when being dragged', () => {
      const { container } = render(<DocumentCard document={baseDoc as Document} />);
      const card = container.querySelector('.card')!;
      
      const dataTransfer = {
        setData: jest.fn(),
        effectAllowed: ''
      };

      fireEvent.dragStart(card, { dataTransfer });

      // La clase dragging debería aplicarse
      expect(card.className).toContain('dragging');
    });

    it('removes dragging class when drag ends', () => {
      const { container } = render(<DocumentCard document={baseDoc as Document} />);
      const card = container.querySelector('.card')!;
      
      const dataTransfer = {
        setData: jest.fn(),
        effectAllowed: ''
      };

      // Iniciar drag
      fireEvent.dragStart(card, { dataTransfer });
      expect(card.className).toContain('dragging');

      // Terminar drag
      fireEvent.dragEnd(card, { preventDefault: jest.fn() });

      // La clase dragging debería removerse
      expect(card.className).not.toContain('dragging');
    });

    it('renders grip handle icon', () => {
      const { container } = render(<DocumentCard document={baseDoc as Document} />);
      const dragHandle = container.querySelector('.dragHandle');
      expect(dragHandle).toBeInTheDocument();
    });
  });
});
