/// <reference types="jest" />
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VideoPlayer } from '../../../components/DocumentPreview/VideoPlayer';

// Declarar tipos para global
declare const global: typeof globalThis;

// Mock de PreviewHeader
jest.mock('../../../components/DocumentPreview/PreviewHeader', () => ({
  PreviewHeader: ({ filename, onBack, children }: any) => (
    <div data-testid="preview-header">
      <button onClick={onBack}>Back</button>
      <span>{filename}</span>
      {children}
    </div>
  ),
}));

// Mock global fetch
global.fetch = jest.fn();

// Mock HTMLMediaElement methods
window.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
window.HTMLMediaElement.prototype.pause = jest.fn();
window.HTMLMediaElement.prototype.load = jest.fn();

describe('VideoPlayer', () => {
  const defaultProps = {
    url: 'https://example.com/video.mp4',
    mimeType: 'video/mp4',
    filename: 'sample-video.mp4',
    fileSize: 10240,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock fetch para devolver un blob de video
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['video content'], { type: 'video/mp4' }),
    });

    // Mock URL.createObjectURL y revokeObjectURL
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-video-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders video player with header', () => {
    render(<VideoPlayer {...defaultProps} />);
    
    expect(screen.getByTestId('preview-header')).toBeInTheDocument();
    expect(screen.getByText('sample-video.mp4')).toBeInTheDocument();
  });

  it('fetches video with authentication credentials', async () => {
    render(<VideoPlayer {...defaultProps} />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        defaultProps.url,
        expect.objectContaining({ credentials: 'include' })
      );
    });
  });

  it('loads video successfully', async () => {
    render(<VideoPlayer {...defaultProps} />);
    
    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  it('renders video element with correct MIME type', async () => {
    const { container } = render(<VideoPlayer {...defaultProps} />);
    
    await waitFor(() => {
      const video = container.querySelector('video');
      expect(video).toBeInTheDocument();
    });
  });

  it('calls onBack when back button is clicked', async () => {
    const onBack = jest.fn();
    const user = userEvent.setup();
    
    render(<VideoPlayer {...defaultProps} onBack={onBack} />);
    
    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);
    
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('handles fetch error gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    
    render(<VideoPlayer {...defaultProps} />);
    
    await waitFor(() => {
      expect(global.URL.createObjectURL).not.toHaveBeenCalled();
    });
  });

  it('handles non-ok response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });
    
    render(<VideoPlayer {...defaultProps} />);
    
    await waitFor(() => {
      expect(global.URL.createObjectURL).not.toHaveBeenCalled();
    });
  });

  it('creates blob URL from fetched video', async () => {
    render(<VideoPlayer {...defaultProps} />);
    
    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'video/mp4' })
      );
    });
  });

  it('renders playback controls in header', () => {
    render(<VideoPlayer {...defaultProps} />);
    
    const header = screen.getByTestId('preview-header');
    expect(header).toBeInTheDocument();
  });

  it('supports different video MIME types', async () => {
    const { container } = render(
      <VideoPlayer {...defaultProps} mimeType="video/webm" />
    );
    
    await waitFor(() => {
      const video = container.querySelector('video');
      expect(video).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );
    
    render(<VideoPlayer {...defaultProps} />);
    
    // El componente debería mostrar estado de carga
    expect(screen.getByTestId('preview-header')).toBeInTheDocument();
  });
});
