import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { PDFViewer } from '../PDFViewer';

// Mock react-pdf to avoid heavy native behavior in tests
jest.mock('react-pdf', () => ({
  Document: ({ children, onLoadSuccess }: { children: React.ReactNode; onLoadSuccess?: (doc: { numPages: number }) => void }) => {
    React.useEffect(() => { 
      if (onLoadSuccess) {
        onLoadSuccess({ numPages: 2 });
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return <div>{children}</div>;
  },
  Page: () => <div data-testid="pdf-page" />,
  pdfjs: { GlobalWorkerOptions: {} },
}));

jest.mock('../../../services/preview.service', () => ({ previewService: { formatFileSize: (n: number) => `${n} bytes` } }));

// Aumentar timeout por si las operaciones de fetch/pdf tardan en CI
jest.setTimeout(30000);

describe('PDFViewer', () => {
  beforeEach(() => jest.resetAllMocks());

  beforeEach(() => {
    // Ensure URL.createObjectURL exists in the test environment
    // and can be spied on / restored
    if (!global.URL.createObjectURL) {
      global.URL.createObjectURL = () => 'blob:mock';
    }
    if (!global.URL.revokeObjectURL) {
      global.URL.revokeObjectURL = () => {};
    }
  });

  it('loads PDF blob and renders page', async () => {
    const blob = new Blob(['%PDF-1.4'], { type: 'application/pdf' });
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200, headers: new Headers(), blob: () => Promise.resolve(blob) } as Response));
    const { container } = render(<PDFViewer url="/doc.pdf" filename="f.pdf" fileSize={1024} />);
    await waitFor(() => expect(container.querySelector('[data-testid="pdf-page"]')).toBeInTheDocument(), { timeout: 5000 });
    (global.fetch as jest.Mock | undefined)?.mockClear();
  });

  it('shows error when response not ok', async () => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: false, status: 404, headers: new Headers(), text: () => Promise.resolve('no') } as Response));
    render(<PDFViewer url="/missing.pdf" filename="x.pdf" />);
    await waitFor(() => expect(screen.getByText(/No se pudo cargar el documento/i)).toBeInTheDocument());
    (global.fetch as jest.Mock | undefined)?.mockClear();
  });

  it('errors for invalid blob type', async () => {
    const blob = new Blob(['hello'], { type: 'text/plain' });
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200, headers: new Headers(), blob: () => Promise.resolve(blob) } as Response));
    render(<PDFViewer url="/bad.pdf" filename="bad.pdf" />);
    await waitFor(() => expect(screen.getByText(/No se pudo cargar el documento/i)).toBeInTheDocument());
    (global.fetch as jest.Mock | undefined)?.mockClear();
  });

  it('zoom buttons update percentage', async () => {
    const blob = new Blob(['%PDF'], { type: 'application/pdf' });
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, status: 200, headers: new Headers(), blob: () => Promise.resolve(blob) } as Response));
    const { container } = render(<PDFViewer url="/doc.pdf" filename="f.pdf" fileSize={1024} />);
    await waitFor(() => expect(container.textContent).toMatch(/100%/), { timeout: 5000 });
    fireEvent.click(screen.getByTitle(/Aumentar zoom/i));
    await waitFor(() => expect(container.textContent).toMatch(/120%/));
    fireEvent.click(screen.getByTitle(/Reducir zoom/i));
    await waitFor(() => expect(container.textContent).toMatch(/100%/));
    (global.fetch as jest.Mock | undefined)?.mockClear();
  });
});
