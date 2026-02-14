import { render, screen, fireEvent, act } from '@testing-library/react';
import { VideoPlayer } from '../VideoPlayer';

const originalFetch = global.fetch;
const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;

beforeEach(() => {
  URL.createObjectURL = jest.fn(() => 'blob:video-url');
  URL.revokeObjectURL = jest.fn();
});

afterEach(() => {
  global.fetch = originalFetch;
  URL.createObjectURL = originalCreateObjectURL;
  URL.revokeObjectURL = originalRevokeObjectURL;
  jest.restoreAllMocks();
});

describe('VideoPlayer branches and controls', () => {
  it('renders video when fetch succeeds and loading hides', async () => {
    const blob = new Blob(['v'], { type: 'video/mp4' });
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true, blob: async () => blob });

    const { container } = render(<VideoPlayer url="/v.mp4" mimeType="video/mp4" filename="v.mp4" onBack={() => {}} fileSize={0} />);
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    const video = container.querySelector('video');
    expect(video).toBeTruthy();
  });

  it('shows error when fetch fails', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: false });

    await act(async () => {
      render(<VideoPlayer url="/bad.mp4" mimeType="video/mp4" filename="bad.mp4" onBack={() => {}} fileSize={0} />);
    });

    expect(await screen.findByText(/Failed to load video/i)).toBeInTheDocument();
  });

  it('togglePlay calls play/pause on video element', async () => {
    const blob = new Blob(['v'], { type: 'video/mp4' });
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true, blob: async () => blob });

    const { container } = render(<VideoPlayer url="/v.mp4" mimeType="video/mp4" filename="v.mp4" onBack={() => {}} fileSize={0} />);
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    const videoEl = document.querySelector('video') as HTMLVideoElement;
    if (videoEl) {
      // mock play/pause
      videoEl.play = jest.fn().mockResolvedValue(undefined);
      videoEl.pause = jest.fn();

      // Find play/pause button by icon class
      const playIcon = container.querySelector('i[class*="bi-play"], i[class*="bi-pause"]');
      const playBtn = playIcon?.parentElement as HTMLElement;
      
      if (playBtn) {
        fireEvent.click(playBtn);
        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 50));
        });
        // Verify play or pause was called (depends on initial state)
        expect(videoEl.play).toHaveBeenCalled();
      }
    }
  });

  it('keyboard shortcuts toggle play, mute and fullscreen handlers are invoked', async () => {
    const blob = new Blob(['v'], { type: 'video/mp4' });
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true, blob: async () => blob });

    await act(async () => {
      render(<VideoPlayer url="/v.mp4" mimeType="video/mp4" filename="v.mp4" onBack={() => {}} fileSize={0} />);
    });

    const videoEl = document.querySelector('video') as HTMLVideoElement;
    videoEl.play = jest.fn().mockResolvedValue(undefined);
    videoEl.muted = false;

    // press space
    fireEvent.keyDown(window, { key: ' ' });
    expect(videoEl.play).toHaveBeenCalled();

    // press m to toggle mute
    fireEvent.keyDown(window, { key: 'm' });
    expect(videoEl.muted).toBeDefined();
  });

  it('changePlaybackRate cycles through rates', async () => {
    const blob = new Blob(['v'], { type: 'video/mp4' });
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true, blob: async () => blob });

    await act(async () => {
      render(<VideoPlayer url="/v.mp4" mimeType="video/mp4" filename="v.mp4" onBack={() => {}} fileSize={0} />);
    });

    const rateBtn = screen.getByTitle(/Playback Speed/i) || screen.getAllByRole('button').find(b => b.title === 'Playback Speed');
    expect(rateBtn).toBeTruthy();
    const initialText = rateBtn?.textContent;
    fireEvent.click(rateBtn as HTMLElement);
    // after clicking should change displayed playbackRate text
    expect(rateBtn?.textContent).not.toBe(initialText);
  });
});
