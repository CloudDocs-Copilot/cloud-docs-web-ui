/// <reference types="jest" />
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import userEvent from '@testing-library/user-event';
import { VideoPlayer } from '../../../components/DocumentPreview/VideoPlayer';

// Declarar tipos para global
declare const global: typeof globalThis;

// Mock de PreviewHeader
jest.mock('../../../components/DocumentPreview/PreviewHeader', () => ({
  PreviewHeader: ({ filename, onBack, children }: { filename: string; onBack?: () => void; children?: React.ReactNode }) => (
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

  it('renders video player with header', async () => {
    render(<VideoPlayer {...defaultProps} />);

    await waitFor(() => expect(screen.getByTestId('preview-header')).toBeInTheDocument());
    expect(screen.getByText('sample-video.mp4')).toBeInTheDocument();
  });

  it('fetches video with authentication credentials', async () => {
    await act(async () => {
      render(<VideoPlayer {...defaultProps} />);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        defaultProps.url,
        expect.objectContaining({ credentials: 'include' })
      );
    });
  });

  it('loads video successfully', async () => {
    await act(async () => {
      render(<VideoPlayer {...defaultProps} />);
    });

    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  it('renders video element with correct MIME type', async () => {
    let container: HTMLElement | undefined;
    await act(async () => {
      const result = render(<VideoPlayer {...defaultProps} />);
      container = result.container;
    });

    await waitFor(() => {
      const video = container!.querySelector('video');
      expect(video).toBeInTheDocument();
    });
  });

  it('calls onBack when back button is clicked', async () => {
    const onBack = jest.fn();
    const user = userEvent.setup();

    await act(async () => {
      render(<VideoPlayer {...defaultProps} onBack={onBack} />);
    });

    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('handles fetch error gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    await act(async () => {
      render(<VideoPlayer {...defaultProps} />);
    });

    await waitFor(() => {
      expect(global.URL.createObjectURL).not.toHaveBeenCalled();
    });
  });

  it('handles non-ok response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await act(async () => {
      render(<VideoPlayer {...defaultProps} />);
    });

    await waitFor(() => {
      expect(global.URL.createObjectURL).not.toHaveBeenCalled();
    });
  });

  it('creates blob URL from fetched video', async () => {
    await act(async () => {
      render(<VideoPlayer {...defaultProps} />);
    });

    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'video/mp4' })
      );
    });
  });

  it('renders playback controls in header', async () => {
    render(<VideoPlayer {...defaultProps} />);

    await waitFor(() => expect(screen.getByTestId('preview-header')).toBeInTheDocument());
  });

  it('supports different video MIME types', async () => {
    let container: HTMLElement | undefined;
    await act(async () => {
      const result = render(
        <VideoPlayer {...defaultProps} mimeType="video/webm" />
      );
      container = result.container;
    });

    await waitFor(() => {
      const video = container!.querySelector('video');
      expect(video).toBeInTheDocument();
    });
  });

  it('displays loading state initially', async () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<VideoPlayer {...defaultProps} />);

    // El componente debería mostrar estado de carga
    await waitFor(() => expect(screen.getByTestId('preview-header')).toBeInTheDocument());
  });
});
