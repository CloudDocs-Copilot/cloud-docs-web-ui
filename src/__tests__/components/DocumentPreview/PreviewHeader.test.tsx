/// <reference types="jest" />
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PreviewHeader } from '../../../components/DocumentPreview/PreviewHeader';

// Mock del previewService
jest.mock('../../../services/preview.service', () => ({
  previewService: {
    formatFileSize: jest.fn((size: number) => {
      if (size < 1024) return `${size} B`;
      if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }),
  },
}));

describe('PreviewHeader', () => {
  it('renders filename correctly', () => {
    render(<PreviewHeader filename="test-document.pdf" />);
    
    expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
  });

  it('displays formatted file size when provided', () => {
    render(<PreviewHeader filename="document.pdf" fileSize={2048} />);
    
    expect(screen.getByText('document.pdf')).toBeInTheDocument();
    expect(screen.getByText('2.00 KB')).toBeInTheDocument();
  });

  it('displays custom file info over file size', () => {
    render(<PreviewHeader filename="document.pdf" fileSize={2048} fileInfo="Page 1 of 5" />);
    
    expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
    expect(screen.queryByText('2.00 KB')).not.toBeInTheDocument();
  });

  it('renders back button when onBack is provided', () => {
    const onBack = jest.fn();
    const { container } = render(<PreviewHeader filename="document.pdf" onBack={onBack} />);
    
    const backButton = container.querySelector('.backButton');
    expect(backButton).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', async () => {
    const onBack = jest.fn();
    const user = userEvent.setup();
    const { container } = render(<PreviewHeader filename="document.pdf" onBack={onBack} />);
    
    const backButton = container.querySelector('.backButton');
    await user.click(backButton!);
    
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('does not render back button when onBack is not provided', () => {
    render(<PreviewHeader filename="document.pdf" />);
    
    expect(screen.queryByRole('button', { name: /arrow-left/i })).not.toBeInTheDocument();
  });

  it('renders download button when onDownload is provided', () => {
    const onDownload = jest.fn();
    render(<PreviewHeader filename="document.pdf" onDownload={onDownload} />);
    
    const downloadButton = screen.getByRole('button', { name: /descargar/i });
    expect(downloadButton).toBeInTheDocument();
  });

  it('calls onDownload when download button is clicked', async () => {
    const onDownload = jest.fn();
    const user = userEvent.setup();
    render(<PreviewHeader filename="document.pdf" onDownload={onDownload} />);
    
    const downloadButton = screen.getByRole('button', { name: /descargar/i });
    await user.click(downloadButton);
    
    expect(onDownload).toHaveBeenCalledTimes(1);
  });

  it('renders share button when onShare is provided', () => {
    const onShare = jest.fn();
    render(<PreviewHeader filename="document.pdf" onShare={onShare} />);
    
    const shareButton = screen.getByRole('button', { name: /compartir/i });
    expect(shareButton).toBeInTheDocument();
  });

  it('calls onShare when share button is clicked', async () => {
    const onShare = jest.fn();
    const user = userEvent.setup();
    render(<PreviewHeader filename="document.pdf" onShare={onShare} />);
    
    const shareButton = screen.getByRole('button', { name: /compartir/i });
    await user.click(shareButton);
    
    expect(onShare).toHaveBeenCalledTimes(1);
  });

  it('renders children content', () => {
    render(
      <PreviewHeader filename="document.pdf">
        <button>Custom Action</button>
      </PreviewHeader>
    );
    
    expect(screen.getByRole('button', { name: /custom action/i })).toBeInTheDocument();
  });

  it('renders all optional elements together', () => {
    const handlers = {
      onBack: jest.fn(),
      onDownload: jest.fn(),
      onShare: jest.fn(),
    };
    
    const { container } = render(
      <PreviewHeader 
        filename="document.pdf" 
        fileSize={1024000}
        {...handlers}
      >
        <button>Zoom</button>
      </PreviewHeader>
    );
    
    expect(screen.getByText('document.pdf')).toBeInTheDocument();
    expect(screen.getByText('1000.00 KB')).toBeInTheDocument();
    expect(container.querySelector('.backButton')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /descargar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /compartir/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /zoom/i })).toBeInTheDocument();
  });

  it('does not display separator when no file info or size', () => {
    render(<PreviewHeader filename="document.pdf" />);
    
    expect(screen.queryByText('•')).not.toBeInTheDocument();
  });

  it('displays separator when file info is present', () => {
    render(<PreviewHeader filename="document.pdf" fileSize={1024} />);
    
    expect(screen.getByText('•')).toBeInTheDocument();
  });
});
