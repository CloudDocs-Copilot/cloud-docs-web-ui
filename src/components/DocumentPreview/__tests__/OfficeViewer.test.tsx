import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('../../../services/preview.service', () => ({
  previewService: { formatFileSize: (n:number) => `${n} bytes` },
}));

import { OfficeViewer } from '../OfficeViewer';

describe('OfficeViewer', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('loads html and allows zoom in/out', async () => {
    const html = '<p>hello</p>';
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, text: () => Promise.resolve(html) } as any));
    render(<OfficeViewer url="/doc" filename="file.docx" />);

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    // zoom controls are rendered as children; find percent text after zooming
    const plus = screen.getByTitle('Aumentar zoom');
    const minus = screen.getByTitle('Reducir zoom');

    fireEvent.click(plus);
    fireEvent.click(plus);
    fireEvent.click(minus);

    // zoom percent should be displayed
    expect(screen.getByText(/%/)).toBeInTheDocument();
  });

  it('shows loading and then content when fetch succeeds', async () => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, text: () => Promise.resolve('<div id="doc">hello</div>') } as any));
    const { container } = render(<OfficeViewer url="/doc.html" filename="file.docx" fileSize={1024} />);

    // Initially shows loading spinner
    await waitFor(() => expect(container.querySelector('svg') || container.querySelector('div')).toBeTruthy());
    // Then content appears
    await waitFor(() => expect(screen.getByText('hello')).toBeInTheDocument());
    global.fetch && (global.fetch as jest.Mock).mockClear();
  });

  it('shows error when fetch fails', async () => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: false, statusText: 'Not found' } as any));
    render(<OfficeViewer url="/missing.html" filename="x" />);

    await waitFor(() => expect(screen.getByText(/Error Loading Document/i)).toBeInTheDocument());
    global.fetch && (global.fetch as jest.Mock).mockClear();
  });

  it('zoom in and out updates zoom level text', async () => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, text: () => Promise.resolve('<p>ok</p>') } as any));
    const { container } = render(<OfficeViewer url="/doc.html" filename="file.docx" fileSize={1024} />);

    await waitFor(() => expect(container.textContent).toMatch(/100%/));
    const plus = screen.getByTitle(/Aumentar zoom/i);
    fireEvent.click(plus);
    await waitFor(() => expect(container.textContent).toMatch(/120%/));
    const minus = screen.getByTitle(/Reducir zoom/i);
    fireEvent.click(minus);
    await waitFor(() => expect(container.textContent).toMatch(/100%/));
    global.fetch && (global.fetch as jest.Mock).mockClear();
  });

  it('renders formatted file size from previewService', async () => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: true, text: () => Promise.resolve('<p>ok</p>') } as any));
    render(<OfficeViewer url="/doc.html" filename="file.docx" fileSize={2048} />);
    await waitFor(() => expect(screen.getByText(/2048 bytes/)).toBeInTheDocument());
  });
});
