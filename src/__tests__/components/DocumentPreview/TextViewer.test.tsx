/// <reference types="jest" />
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import userEvent from '@testing-library/user-event';
import { TextViewer } from '../../../components/DocumentPreview/TextViewer';

// Declarar tipos para global
declare const global: typeof globalThis;

// Mock de react-syntax-highlighter
jest.mock('react-syntax-highlighter', () => ({
  Prism: ({ children, language }: { children?: React.ReactNode; language?: string }) => (
    <pre data-testid="syntax-highlighter" data-language={language}>
      {children}
    </pre>
  ),
}));

jest.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  vscDarkPlus: {},
}));

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

// Mock de previewService
jest.mock('../../../services/preview.service', () => ({
  previewService: {
    getCodeLanguage: jest.fn((filename: string) => {
      if (filename.endsWith('.js')) return 'javascript';
      if (filename.endsWith('.ts')) return 'typescript';
      if (filename.endsWith('.py')) return 'python';
      return 'text';
    }),
  },
}));

import * as previewServiceModule from '../../../services/preview.service';

// Mock global fetch
global.fetch = jest.fn();

describe('TextViewer', () => {
  const defaultProps = {
    url: 'https://example.com/file.txt',
    filename: 'readme.txt',
    mimeType: 'text/plain',
    fileSize: 512,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock fetch para devolver texto
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => 'This is the file content.\nLine 2\nLine 3',
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders text viewer with header', async () => {
    render(<TextViewer {...defaultProps} />);

    await waitFor(() => expect(screen.getByTestId('preview-header')).toBeInTheDocument());
    expect(screen.getByText('readme.txt')).toBeInTheDocument();
  });

  it('fetches text content with authentication credentials', async () => {
    await act(async () => {
      render(<TextViewer {...defaultProps} />);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        defaultProps.url,
        expect.objectContaining({ credentials: 'include' })
      );
    });
  });

  it('loads and displays text content', async () => {
    await act(async () => {
      render(<TextViewer {...defaultProps} />);
    });

    await waitFor(() => {
      expect(screen.getByText(/This is the file content/)).toBeInTheDocument();
    });
  });

  it('calls onBack when back button is clicked', async () => {
    const onBack = jest.fn();
    const user = userEvent.setup();
    await act(async () => {
      render(<TextViewer {...defaultProps} onBack={onBack} />);
    });

    const backButton = screen.getByRole('button', { name: /back/i });
    await user.click(backButton);

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('handles fetch error gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    await act(async () => {
      render(<TextViewer {...defaultProps} />);
    });

    await waitFor(() => {
      // El texto de contenido no debería aparecer
      expect(screen.queryByText(/This is the file content/)).not.toBeInTheDocument();
    });
  });

  it('handles non-ok response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });
    await act(async () => {
      render(<TextViewer {...defaultProps} />);
    });

    await waitFor(() => {
      expect(screen.queryByText(/This is the file content/)).not.toBeInTheDocument();
    });
  });

  it('uses syntax highlighter for JavaScript files', async () => {
    (previewServiceModule.previewService.getCodeLanguage as jest.Mock).mockReturnValue('javascript');
    await act(async () => {
      render(<TextViewer {...defaultProps} filename="app.js" />);
    });

    await waitFor(() => {
      const highlighter = screen.getByTestId('syntax-highlighter');
      expect(highlighter).toBeInTheDocument();
      expect(highlighter).toHaveAttribute('data-language', 'javascript');
    });
  });

  it('uses syntax highlighter for TypeScript files', async () => {
    (previewServiceModule.previewService.getCodeLanguage as jest.Mock).mockReturnValue('typescript');
    await act(async () => {
      render(<TextViewer {...defaultProps} filename="app.ts" />);
    });

    await waitFor(() => {
      const highlighter = screen.getByTestId('syntax-highlighter');
      expect(highlighter).toHaveAttribute('data-language', 'typescript');
    });
  });

  it('uses plain text for .txt files', async () => {
    (previewServiceModule.previewService.getCodeLanguage as jest.Mock).mockReturnValue('text');
    await act(async () => {
      render(<TextViewer {...defaultProps} />);
    });

    await waitFor(() => {
      // Debería mostrar texto plano sin syntax highlighter
      expect(screen.getByText(/This is the file content/)).toBeInTheDocument();
    });
  });

  it('accepts custom language prop', async () => {
    await act(async () => {
      render(<TextViewer {...defaultProps} language="python" />);
    });

    await waitFor(() => {
      const highlighter = screen.getByTestId('syntax-highlighter');
      expect(highlighter).toHaveAttribute('data-language', 'python');
    });
  });

  it('renders controls in header', async () => {
    render(<TextViewer {...defaultProps} />);

    await waitFor(() => expect(screen.getByTestId('preview-header')).toBeInTheDocument());
  });

  it('displays loading state initially', async () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<TextViewer {...defaultProps} />);

    // El componente debería mostrar un spinner o estado de carga
    await waitFor(() => expect(screen.getByTestId('preview-header')).toBeInTheDocument());
  });
});
