import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { CsrfProvider } from '../../context/CsrfProvider';
import { useCsrfToken } from '../../context/CsrfContext';

// Simple mock of fetch
const mockFetch = jest.fn() as jest.Mock<Promise<Response>>;
global.fetch = mockFetch;

const TestComponent = () => {
  const { token, isInitialized, isLoading, error } = useCsrfToken();
  return (
    <div>
      <div data-testid="token">Token: {token || 'null'}</div>
      <div data-testid="init">Init: {isInitialized.toString()}</div>
      <div data-testid="loading">Loading: {isLoading.toString()}</div>
      <div data-testid="error">Error: {error?.message || 'null'}</div>
    </div>
  );
};

describe('CsrfProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReset();
  });

  it('provides csrf context to children', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'test-token' }),
    });

    render(
      <CsrfProvider>
        <TestComponent />
      </CsrfProvider>
    );

    expect(screen.getByTestId('token')).toBeInTheDocument();
  });

  it('calls fetch on mount', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'test-token' }),
    });

    render(
      <CsrfProvider>
        <TestComponent />
      </CsrfProvider>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  it('renders children correctly', () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'test-token' }),
    });

    render(
      <CsrfProvider>
        <div>Child Content</div>
      </CsrfProvider>
    );

    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('uses correct fetch endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'test-token' }),
    });

    render(
      <CsrfProvider>
        <TestComponent />
      </CsrfProvider>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/csrf-token'),
        expect.any(Object)
      );
    });
  });

  it('sets credentials in request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'test-token' }),
    });

    render(
      <CsrfProvider>
        <TestComponent />
      </CsrfProvider>
    );

    await waitFor(() => {
      const callArgs = (mockFetch as jest.Mock).mock.calls[0];
      expect(callArgs[1]).toHaveProperty('credentials', 'include');
    });
  });

  it('sets content-type header', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'test-token' }),
    });

    render(
      <CsrfProvider>
        <TestComponent />
      </CsrfProvider>
    );

    await waitFor(() => {
      const callArgs = (mockFetch as jest.Mock).mock.calls[0];
      expect(callArgs[1].headers).toHaveProperty(
        'Content-Type',
        'application/json'
      );
    });
  });

  it('handles successful token response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'success-token' }),
    });

    render(
      <CsrfProvider>
        <TestComponent />
      </CsrfProvider>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  it('handles csrfToken field in response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ csrfToken: 'csrf-token-value' }),
    });

    render(
      <CsrfProvider>
        <TestComponent />
      </CsrfProvider>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  it('renders without crashing', () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'test-token' }),
    });

    const { container } = render(
      <CsrfProvider>
        <div>Content</div>
      </CsrfProvider>
    );

    expect(container).toBeInTheDocument();
  });

  it('passes through multiple children', () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'test-token' }),
    });

    render(
      <CsrfProvider>
        <div>Child One</div>
        <div>Child Two</div>
      </CsrfProvider>
    );

    expect(screen.getByText('Child One')).toBeInTheDocument();
    expect(screen.getByText('Child Two')).toBeInTheDocument();
  });

  it('wraps children components', () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'test-token' }),
    });

    const { container } = render(
      <CsrfProvider>
        <TestComponent />
      </CsrfProvider>
    );

    expect(container.querySelector('[data-testid="token"]')).toBeInTheDocument();
  });
});
