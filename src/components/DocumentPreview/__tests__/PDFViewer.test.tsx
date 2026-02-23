import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { PDFViewer } from '../PDFViewer';
import { apiClient } from '../../../api/httpClient.config';

// Mock apiClient
jest.mock('../../../api/httpClient.config', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

// Mock react-pdf to avoid heavy native behavior in tests
jest.mock('react-pdf', () => ({
  Document: ({ children, onLoadSuccess, file }: { children: React.ReactNode; onLoadSuccess?: (doc: { numPages: number }) => void; file?: string }) => {
    React.useEffect(() => { 
      if (onLoadSuccess && file) {
        // Simular carga exitosa después de un tick
        setTimeout(() => onLoadSuccess({ numPages: 2 }), 0);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [file]);
    return <div data-testid="pdf-document">{children}</div>;
  },
  Page: () => <div data-testid="pdf-page">PDF Page</div>,
  pdfjs: { GlobalWorkerOptions: { workerSrc: '' }, version: '3.11.174' },
}));

jest.mock('../../../services/preview.service', () => ({ previewService: { formatFileSize: (n: number) => `${n} bytes` } }));

describe('PDFViewer', () => {
  const mockApiGet = apiClient.get as jest.MockedFunction<typeof apiClient.get>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Ensure URL.createObjectURL exists in the test environment
    if (!global.URL.createObjectURL) {
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    }
    if (!global.URL.revokeObjectURL) {
      global.URL.revokeObjectURL = jest.fn();
    }
  });

  it('loads PDF blob and renders page', async () => {
    const blob = new Blob(['%PDF-1.4'], { type: 'application/pdf' });
    mockApiGet.mockResolvedValueOnce({ 
      data: blob, 
      status: 200, 
      statusText: 'OK',
      headers: {},
      config: {} as any
    });

    render(<PDFViewer url="/doc.pdf" filename="f.pdf" fileSize={1024} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('pdf-document')).toBeInTheDocument();
    }, { timeout: 2000 });
    
    await waitFor(() => {
      expect(screen.getByTestId('pdf-page')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('shows error when apiClient request fails', async () => {
    mockApiGet.mockRejectedValueOnce(new Error('Network error'));
    
    render(<PDFViewer url="/missing.pdf" filename="x.pdf" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Error Loading PDF/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('errors for invalid blob type', async () => {
    const blob = new Blob(['hello'], { type: 'text/plain' });
    mockApiGet.mockResolvedValueOnce({ 
      data: blob, 
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any
    });
    
    render(<PDFViewer url="/bad.pdf" filename="bad.pdf" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to load PDF/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('zoom buttons update percentage', async () => {
    const blob = new Blob(['%PDF'], { type: 'application/pdf' });
    mockApiGet.mockResolvedValueOnce({ 
      data: blob, 
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any
    });
    
    const { container } = render(<PDFViewer url="/doc.pdf" filename="f.pdf" fileSize={1024} />);
    
    await waitFor(() => {
      expect(container.textContent).toMatch(/100%/);
    }, { timeout: 2000 });
    
    const zoomInBtn = screen.getByTitle(/Aumentar zoom/i);
    fireEvent.click(zoomInBtn);
    
    await waitFor(() => {
      expect(container.textContent).toMatch(/120%/);
    }, { timeout: 1000 });
    
    const zoomOutBtn = screen.getByTitle(/Reducir zoom/i);
    fireEvent.click(zoomOutBtn);
    
    await waitFor(() => {
      expect(container.textContent).toMatch(/100%/);
    }, { timeout: 1000 });
  });
});
