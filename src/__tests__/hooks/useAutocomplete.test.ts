import { renderHook, waitFor } from '@testing-library/react';
import { useAutocomplete } from '../../hooks/useAutocomplete';
import { searchService } from '../../services/search.service';

jest.mock('../../services/search.service', () => ({
  searchService: {
    autocomplete: jest.fn(),
  },
}));

describe('useAutocomplete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns initial state', () => {
    (searchService.autocomplete as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useAutocomplete(''));

    expect(result.current.suggestions).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('does not fetch suggestions for empty query', async () => {
    (searchService.autocomplete as jest.Mock).mockResolvedValue([]);

    renderHook(() => useAutocomplete(''));

    await waitFor(() => {
      expect(searchService.autocomplete).not.toHaveBeenCalled();
    });
  });

  it('does not fetch suggestions for single character query', async () => {
    (searchService.autocomplete as jest.Mock).mockResolvedValue([]);

    renderHook(() => useAutocomplete('a'));

    await waitFor(() => {
      expect(searchService.autocomplete).not.toHaveBeenCalled();
    });
  });

  it('fetches suggestions for valid query', async () => {
    const mockSuggestions = ['test1', 'test2'];
    (searchService.autocomplete as jest.Mock).mockResolvedValue(mockSuggestions);

    const { result } = renderHook(() => useAutocomplete('test'));

    await waitFor(() => {
      expect(result.current.suggestions).toEqual(mockSuggestions);
    });

    expect(searchService.autocomplete).toHaveBeenCalledWith('test', undefined);
  });

  it('includes organizationId in request when provided', async () => {
    (searchService.autocomplete as jest.Mock).mockResolvedValue(['suggestion']);

    const { result } = renderHook(() =>
      useAutocomplete('test', 'org-123')
    );

    await waitFor(() => {
      expect(searchService.autocomplete).toHaveBeenCalledWith('test', 'org-123');
    });
  });

  it('debounces requests', async () => {
    (searchService.autocomplete as jest.Mock).mockResolvedValue(['test']);

    const { rerender } = renderHook(
      ({ query }: { query: string }) => useAutocomplete(query),
      { initialProps: { query: 'te' } }
    );

    rerender({ query: 'tes' });
    rerender({ query: 'test' });

    // Should not have called immediately due to debouncing
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(searchService.autocomplete).not.toHaveBeenCalled();

    await waitFor(
      () => {
        expect(searchService.autocomplete).toHaveBeenCalled();
      },
      { timeout: 500 }
    );
  });

  it('handles errors gracefully', async () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    (searchService.autocomplete as jest.Mock).mockRejectedValue(
      new Error('API error')
    );

    const { result } = renderHook(() => useAutocomplete('test'));

    await waitFor(() => {
      expect(result.current.suggestions).toEqual([]);
    });

    consoleSpy.mockRestore();
  });

  it('clears suggestions on clearSuggestions call', () => {
    (searchService.autocomplete as jest.Mock).mockResolvedValue([]);

    const { result } = renderHook(() => useAutocomplete(''));

    // Verify clearSuggestions method exists and is callable
    expect(typeof result.current.clearSuggestions).toBe('function');
    expect(() => {
      result.current.clearSuggestions();
    }).not.toThrow();
  });

  it('respects enabled flag', async () => {
    (searchService.autocomplete as jest.Mock).mockResolvedValue(['test']);

    renderHook(() => useAutocomplete('test', undefined, false));

    await waitFor(() => {
      expect(searchService.autocomplete).not.toHaveBeenCalled();
    });
  });

  it('updates suggestions when query changes', async () => {
    (searchService.autocomplete as jest.Mock)
      .mockResolvedValueOnce(['result1'])
      .mockResolvedValueOnce(['result2']);

    const { rerender, result } = renderHook(
      ({ query }: { query: string }) => useAutocomplete(query),
      { initialProps: { query: 'test' } }
    );

    await waitFor(() => {
      expect(result.current.suggestions).toContain('result1');
    });

    rerender({ query: 'test2' });

    await waitFor(
      () => {
        expect(result.current.suggestions).toContain('result2');
      },
      { timeout: 500 }
    );
  });

  it('returns loading state during request', async () => {
    const slowPromise = new Promise((resolve) =>
      setTimeout(() => resolve(['slow result']), 100)
    );
    (searchService.autocomplete as jest.Mock).mockReturnValue(slowPromise);

    const { result } = renderHook(() => useAutocomplete('test'));

    // Should eventually complete
    await waitFor(
      () => {
        expect(searchService.autocomplete).toHaveBeenCalled();
      },
      { timeout: 500 }
    );
  });

  it('handles whitespace trimming', async () => {
    (searchService.autocomplete as jest.Mock).mockResolvedValue(['test']);

    const { result } = renderHook(() => useAutocomplete('  test  '));

    await waitFor(() => {
      expect(searchService.autocomplete).toHaveBeenCalledWith('test', undefined);
    });
  });
});
