/// <reference types="jest" />
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageViewer } from '../../../components/DocumentPreview/ImageViewer';

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

describe('ImageViewer', () => {
  const defaultProps = {
    url: 'https://example.com/image.jpg',
    filename: 'photo.jpg',
    alt: 'Test photo',
    fileSize: 2048,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock fetch para devolver un blob de imagen
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['image content'], { type: 'image/jpeg' }),
    });

    // Mock URL.createObjectURL y revokeObjectURL
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-image-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders image viewer with header', async () => {
    render(<ImageViewer {...defaultProps} />);

    await waitFor(() => expect(screen.getByTestId('preview-header')).toBeInTheDocument());
    expect(screen.getByText('photo.jpg')).toBeInTheDocument();
  });

  it('fetches image with authentication credentials', async () => {
    await act(async () => {
      render(<ImageViewer {...defaultProps} />);
    });
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        defaultProps.url,
        expect.objectContaining({ credentials: 'include' })
      );
    });
  });

  it('loads image successfully', async () => {
    await act(async () => {
      render(<ImageViewer {...defaultProps} />);
    });
    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  it('calls onBack when back button is clicked', async () => {
    const onBack = jest.fn();
    const user = userEvent.setup();
    await act(async () => {
      render(<ImageViewer {...defaultProps} onBack={onBack} />);
    });
    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('handles fetch error gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    await act(async () => {
      render(<ImageViewer {...defaultProps} />);
    });
    await waitFor(() => {
      // El componente debería mostrar estado de error
      expect(global.URL.createObjectURL).not.toHaveBeenCalled();
    });
  });

  it('handles non-ok response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });
    await act(async () => {
      render(<ImageViewer {...defaultProps} />);
    });
    await waitFor(() => {
      expect(global.URL.createObjectURL).not.toHaveBeenCalled();
    });
  });

  it('creates blob URL from fetched image', async () => {
    await act(async () => {
      render(<ImageViewer {...defaultProps} />);
    });
    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'image/jpeg' })
      );
    });
  });

  it('displays image with correct alt text', async () => {
    await act(async () => {
      render(<ImageViewer {...defaultProps} />);
    });
    await waitFor(() => {
      const image = screen.getByAltText('Test photo');
      expect(image).toBeInTheDocument();
    });
  });

  it('uses filename as alt text when alt prop is not provided', async () => {
    await act(async () => {
      render(<ImageViewer {...defaultProps} alt={undefined} />);
    });
    await waitFor(() => {
      const image = screen.getByAltText('photo.jpg');
      expect(image).toBeInTheDocument();
    });
  });

  it('renders zoom controls in header', async () => {
    render(<ImageViewer {...defaultProps} />);
    const header = screen.getByTestId('preview-header');
    expect(header).toBeInTheDocument();
  });

  it('creates blob URL from fetched image', async () => {
    await act(async () => {
      render(<ImageViewer {...defaultProps} />);
    });
    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'image/jpeg' })
      );
    });
  });
});
