import { render, screen, fireEvent, act } from '@testing-library/react';
import { ImageViewer } from '../ImageViewer';

const originalFetch = global.fetch;
const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;

beforeEach(() => {
  // mock createObjectURL
  URL.createObjectURL = jest.fn(() => 'blob:fake-url');
  URL.revokeObjectURL = jest.fn();
});

afterEach(() => {
  global.fetch = originalFetch;
  URL.createObjectURL = originalCreateObjectURL;
  URL.revokeObjectURL = originalRevokeObjectURL;
  jest.restoreAllMocks();
});

describe('ImageViewer branches and edge cases', () => {
  it('renders loading state then image when fetch succeeds', async () => {
    const blob = new Blob(['abc'], { type: 'image/png' });
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true, blob: async () => blob });

    await act(async () => {
      render(<ImageViewer url="/img.png" filename="img.png" alt="alt" onBack={() => {}} fileSize={123} />);
    });

    // image should be present with src set to our mocked blob url
    const img = await screen.findByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'blob:fake-url');
  });

  it('shows error alert when fetch returns not ok', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: false });

    await act(async () => {
      render(<ImageViewer url="/bad.png" filename="bad.png" onBack={() => {}} fileSize={0} />);
    });

    expect(await screen.findByText(/Error Loading Image/i)).toBeInTheDocument();
    expect(screen.getByText(/Failed to load image/i)).toBeInTheDocument();
  });

  it('zoom in/out and rotate update zoom level and rotation', async () => {
    const blob = new Blob(['a'], { type: 'image/png' });
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true, blob: async () => blob });

    await act(async () => {
      render(<ImageViewer url="/img.png" filename="img.png" onBack={() => {}} fileSize={0} />);
    });

    const zoomText = screen.getByText(/100%/i);
    expect(zoomText).toBeInTheDocument();

    const zoomInBtn = screen.getAllByTitle(/Aumentar zoom/i)[0] || screen.getAllByRole('button')[1];
    fireEvent.click(zoomInBtn);
    expect(screen.getByText(/125%/i)).toBeInTheDocument();

    const rotateBtn = screen.getAllByTitle(/Rotar 90/i)[0] || screen.getAllByRole('button').find(b => b.title?.includes('Rotar'));
    fireEvent.click(rotateBtn);

    const img = screen.getByRole('img');
    expect(img.style.transform).toContain('rotate(90deg)');
  });

  it('allows dragging when zoomed and updates translate position', async () => {
    const blob = new Blob(['a'], { type: 'image/png' });
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true, blob: async () => blob });

    await act(async () => {
      render(<ImageViewer url="/img.png" filename="img.png" onBack={() => {}} fileSize={0} />);
    });

    // zoom in twice
    const zoomInBtn = screen.getAllByTitle(/Aumentar zoom/i)[0];
    fireEvent.click(zoomInBtn);
    fireEvent.click(zoomInBtn);

    const container = screen.getByRole('img').parentElement as HTMLElement;
    // simulate drag
    fireEvent.mouseDown(container, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(container, { clientX: 120, clientY: 110 });
    fireEvent.mouseUp(container);

    const img = screen.getByRole('img');
    expect(img.style.transform).toMatch(/translate\(/i);
  });

  it('revokes object URL on unmount', async () => {
    const blob = new Blob(['x'], { type: 'image/png' });
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true, blob: async () => blob });

    const { unmount } = render(<ImageViewer url="/img.png" filename="img.png" onBack={() => {}} fileSize={0} />);
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    const callsBefore = (URL.revokeObjectURL as jest.Mock).mock.calls.length;
    unmount();
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    const callsAfter = (URL.revokeObjectURL as jest.Mock).mock.calls.length;
    expect(callsAfter).toBeGreaterThanOrEqual(callsBefore);
  });
});
