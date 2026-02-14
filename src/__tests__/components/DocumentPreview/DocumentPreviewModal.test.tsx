/// <reference types="jest" />
import { render, screen } from '@testing-library/react';
import { DocumentPreviewModal } from '../../../components/DocumentPreview/DocumentPreviewModal';
import { DocumentPreviewType } from '../../../types/preview.types';
import type { PreviewDocument } from '../../../types/preview.types';
import * as previewServiceModule from '../../../services/preview.service';

// Mock de los viewers
jest.mock('../../../components/DocumentPreview/PDFViewer', () => ({
  PDFViewer: ({ filename }: { filename: string }) => <div>PDFViewer: {filename}</div>,
}));

jest.mock('../../../components/DocumentPreview/ImageViewer', () => ({
  ImageViewer: ({ filename }: { filename: string }) => <div>ImageViewer: {filename}</div>,
}));

jest.mock('../../../components/DocumentPreview/VideoPlayer', () => ({
  VideoPlayer: ({ filename }: { filename: string }) => <div>VideoPlayer: {filename}</div>,
}));

jest.mock('../../../components/DocumentPreview/TextViewer', () => ({
  TextViewer: ({ filename }: { filename: string }) => <div>TextViewer: {filename}</div>,
}));

jest.mock('../../../components/DocumentPreview/OfficeViewer', () => ({
  OfficeViewer: ({ filename }: { filename: string }) => <div>OfficeViewer: {filename}</div>,
}));

jest.mock('../../../components/Sidebar', () => ({
  __esModule: true,
  default: () => <div>Sidebar</div>,
}));

// Mock del previewService
jest.mock('../../../services/preview.service', () => ({
  previewService: {
    getPreviewType: jest.fn(),
    getPreviewUrl: jest.fn(),
    canPreview: jest.fn(),
    formatFileSize: jest.fn((size: number) => `${size} bytes`),
  },
}));

describe('DocumentPreviewModal', () => {
  const mockOnHide = jest.fn();
  
  // Access the mocked service  
  const previewService = previewServiceModule.previewService as jest.Mocked<typeof previewServiceModule.previewService>;
  
  const createMockDocument = (overrides?: Partial<PreviewDocument>): PreviewDocument => ({
    id: '1',
    filename: 'test.pdf',
    originalname: 'test.pdf',
    mimeType: 'application/pdf',
    size: 1024,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    previewService.getPreviewUrl.mockReturnValue('https://example.com/document.pdf');
    previewService.formatFileSize.mockReturnValue('1 KB');
  });

  it('renders modal when show is true', () => {
    const document = createMockDocument();
    previewService.getPreviewType.mockReturnValue(DocumentPreviewType.PDF);
    previewService.canPreview.mockReturnValue(true);

    render(<DocumentPreviewModal show={true} onHide={mockOnHide} document={document} />);
    
    expect(screen.getByText('Sidebar')).toBeInTheDocument();
  });

  it('renders PDFViewer for PDF documents', () => {
    const document = createMockDocument({ mimeType: 'application/pdf' });
    previewService.getPreviewType.mockReturnValue(DocumentPreviewType.PDF);
    previewService.canPreview.mockReturnValue(true);

    render(<DocumentPreviewModal show={true} onHide={mockOnHide} document={document} />);
    
    expect(screen.getByText('PDFViewer: test.pdf')).toBeInTheDocument();
  });

  it('renders ImageViewer for image documents', () => {
    const document = createMockDocument({ 
      filename: 'photo.jpg',
      originalname: 'photo.jpg',
      mimeType: 'image/jpeg' 
    });
    previewService.getPreviewType.mockReturnValue(DocumentPreviewType.IMAGE);
    previewService.canPreview.mockReturnValue(true);

    render(<DocumentPreviewModal show={true} onHide={mockOnHide} document={document} />);
    
    expect(screen.getByText('ImageViewer: photo.jpg')).toBeInTheDocument();
  });

  it('renders VideoPlayer for video documents', () => {
    const document = createMockDocument({ 
      filename: 'video.mp4',
      originalname: 'video.mp4',
      mimeType: 'video/mp4' 
    });
    previewService.getPreviewType.mockReturnValue(DocumentPreviewType.VIDEO);
    previewService.canPreview.mockReturnValue(true);

    render(<DocumentPreviewModal show={true} onHide={mockOnHide} document={document} />);
    
    expect(screen.getByText('VideoPlayer: video.mp4')).toBeInTheDocument();
  });

  it('renders TextViewer for text documents', () => {
    const document = createMockDocument({ 
      filename: 'readme.txt',
      originalname: 'readme.txt',
      mimeType: 'text/plain' 
    });
    previewService.getPreviewType.mockReturnValue(DocumentPreviewType.TEXT);
    previewService.canPreview.mockReturnValue(true);

    render(<DocumentPreviewModal show={true} onHide={mockOnHide} document={document} />);
    
    expect(screen.getByText('TextViewer: readme.txt')).toBeInTheDocument();
  });

  it('renders TextViewer for code documents', () => {
    const document = createMockDocument({ 
      filename: 'app.js',
      originalname: 'app.js',
      mimeType: 'application/javascript' 
    });
    previewService.getPreviewType.mockReturnValue(DocumentPreviewType.CODE);
    previewService.canPreview.mockReturnValue(true);

    render(<DocumentPreviewModal show={true} onHide={mockOnHide} document={document} />);
    
    expect(screen.getByText('TextViewer: app.js')).toBeInTheDocument();
  });

  it('renders OfficeViewer for Office documents', () => {
    const document = createMockDocument({ 
      filename: 'document.docx',
      originalname: 'document.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    previewService.getPreviewType.mockReturnValue(DocumentPreviewType.OFFICE);
    previewService.canPreview.mockReturnValue(true);

    render(<DocumentPreviewModal show={true} onHide={mockOnHide} document={document} />);
    
    expect(screen.getByText('OfficeViewer: document.docx')).toBeInTheDocument();
  });

  it('renders audio player for audio documents', () => {
    const document = createMockDocument({ 
      filename: 'song.mp3',
      originalname: 'song.mp3',
      mimeType: 'audio/mpeg' 
    });
    previewService.getPreviewType.mockReturnValue(DocumentPreviewType.AUDIO);
    previewService.canPreview.mockReturnValue(true);
    previewService.getPreviewUrl.mockReturnValue('https://example.com/song.mp3');

    render(<DocumentPreviewModal show={true} onHide={mockOnHide} document={document} />);
    
    // Verificar que el texto del archivo aparece (puede aparecer en el modal header)
    expect(screen.getAllByText(/song\.mp3/i).length).toBeGreaterThan(0);
  });

  it('shows warning when preview is not available', () => {
    const document = createMockDocument({ 
      filename: 'archive.zip',
      mimeType: 'application/zip' 
    });
    previewService.getPreviewType.mockReturnValue(DocumentPreviewType.UNSUPPORTED);
    previewService.canPreview.mockReturnValue(false);

    render(<DocumentPreviewModal show={true} onHide={mockOnHide} document={document} />);
    
    expect(screen.getByText('Preview Not Available')).toBeInTheDocument();
    expect(screen.getByText(/This file type is not supported for preview/)).toBeInTheDocument();
  });

  it('shows unsupported message for unsupported preview type', () => {
    const document = createMockDocument();
    previewService.getPreviewType.mockReturnValue(DocumentPreviewType.UNSUPPORTED);
    previewService.canPreview.mockReturnValue(true);

    render(<DocumentPreviewModal show={true} onHide={mockOnHide} document={document} />);
    
    expect(screen.getByText('Unsupported File Type')).toBeInTheDocument();
    expect(screen.getByText(/Preview is not available for this file type/)).toBeInTheDocument();
  });

  it('uses originalname over filename when both are present', () => {
    const document = createMockDocument({ 
      filename: 'file123.pdf',
      originalname: 'my-document.pdf'
    });
    previewService.getPreviewType.mockReturnValue(DocumentPreviewType.PDF);
    previewService.canPreview.mockReturnValue(true);

    render(<DocumentPreviewModal show={true} onHide={mockOnHide} document={document} />);
    
    expect(screen.getByText('PDFViewer: my-document.pdf')).toBeInTheDocument();
  });

  it('shows modal header for audio documents', () => {
    const document = createMockDocument({ 
      filename: 'audio.mp3',
      originalname: 'audio.mp3',
      mimeType: 'audio/mpeg' 
    });
    previewService.getPreviewType.mockReturnValue(DocumentPreviewType.AUDIO);
    previewService.canPreview.mockReturnValue(true);

    render(<DocumentPreviewModal show={true} onHide={mockOnHide} document={document} />);
    
    // Audio no tiene su propio header, así que el modal header debe estar visible
    expect(screen.getAllByText(/audio.mp3/).length).toBeGreaterThan(0);
  });

  it('does not show modal header for PDF documents', () => {
    const document = createMockDocument();
    previewService.getPreviewType.mockReturnValue(DocumentPreviewType.PDF);
    previewService.canPreview.mockReturnValue(true);

    const { container } = render(<DocumentPreviewModal show={true} onHide={mockOnHide} document={document} />);
    
    // PDF tiene su propio header, el modal header no debe estar
    const modalHeader = container.querySelector('.modal-header');
    expect(modalHeader).not.toBeInTheDocument();
  });

  it('provides download link when preview is not available', () => {
    const document = createMockDocument({ mimeType: 'application/zip' });
    previewService.getPreviewType.mockReturnValue(DocumentPreviewType.UNSUPPORTED);
    previewService.canPreview.mockReturnValue(false);
    previewService.getPreviewUrl.mockReturnValue('https://example.com/file.zip');

    render(<DocumentPreviewModal show={true} onHide={mockOnHide} document={document} />);
    
    const downloadLink = screen.getByRole('link', { name: /download file/i });
    expect(downloadLink).toHaveAttribute('href', 'https://example.com/file.zip');
    expect(downloadLink).toHaveAttribute('download');
  });

  it('displays file metadata when preview is not available', () => {
    const document = createMockDocument({ 
      filename: 'file.bin',
      mimeType: 'application/octet-stream',
      size: 2048
    });
    previewService.getPreviewType.mockReturnValue(DocumentPreviewType.UNSUPPORTED);
    previewService.canPreview.mockReturnValue(false);
    previewService.formatFileSize.mockReturnValue('2 KB');

    render(<DocumentPreviewModal show={true} onHide={mockOnHide} document={document} />);
    
    expect(screen.getByText(/file.bin/)).toBeInTheDocument();
    expect(screen.getByText(/application\/octet-stream/)).toBeInTheDocument();
    expect(screen.getByText(/2 KB/)).toBeInTheDocument();
  });
});
