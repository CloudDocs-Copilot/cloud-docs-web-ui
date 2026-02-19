import { renderHook, waitFor, act } from '@testing-library/react';
import { useSearch } from '../../hooks/useSearch';
import searchService from '../../services/search.service';

jest.mock('../../services/search.service');

describe('useSearch hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe inicializar con valores por defecto', () => {
    const { result } = renderHook(() => useSearch());

    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.total).toBe(0);
    expect(result.current.searchHistory).toEqual([]);
  });

  it('debe realizar búsqueda correctamente', async () => {
    const mockResults = {
      success: true,
      data: [
        { id: '1', filename: 'test.pdf', originalname: 'Test.pdf' }
      ],
      total: 1,
      took: 10,
      limit: 20,
      offset: 0
    };

    (searchService.search as jest.Mock).mockResolvedValue(mockResults);

    const { result } = renderHook(() => useSearch());

    await act(async () => {
      await result.current.search({ query: 'test' });
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.results).toEqual(mockResults.data);
      expect(result.current.total).toBe(1);
      expect(result.current.took).toBe(10);
    });
  });

  it('debe manejar errores de búsqueda', async () => {
    (searchService.search as jest.Mock).mockRejectedValue(new Error('Search failed'));

    const { result } = renderHook(() => useSearch());

    await act(async () => {
      try {
        await result.current.search({ query: 'test' });
      } catch {
        // El error es manejado por el hook, no debe propagarse
      }
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Error al buscar documentos');
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.results).toEqual([]);
  });

  it('debe guardar historial de búsquedas', async () => {
    const mockResults = {
      success: true,
      data: [],
      total: 0,
      took: 5,
      limit: 20,
      offset: 0
    };

    (searchService.search as jest.Mock).mockResolvedValue(mockResults);

    const { result } = renderHook(() => useSearch());

    // Limpiar historial antes de empezar
    await act(async () => {
      result.current.clearHistory();
    });
    await waitFor(() => {
      expect(result.current.searchHistory).toEqual([]);
    });

    await act(async () => {
      await result.current.search({ query: 'test1' });
      await result.current.search({ query: 'test2' });
    });

    await waitFor(() => {
      expect(result.current.searchHistory.length).toBe(2);
      expect(result.current.searchHistory).toContain('test1');
      expect(result.current.searchHistory).toContain('test2');
    });
  });

  it('debe limpiar resultados', async () => {
    const mockResults = {
      success: true,
      data: [{ id: '1', filename: 'test.pdf' }],
      total: 1,
      took: 5,
      limit: 20,
      offset: 0
    };

    (searchService.search as jest.Mock).mockResolvedValue(mockResults);

    const { result } = renderHook(() => useSearch());

    await act(async () => {
      await result.current.search({ query: 'test' });
    });

    await waitFor(() => {
      expect(result.current.results.length).toBeGreaterThan(0);
    });

    result.current.clearResults();

    await waitFor(() => {
      expect(result.current.results).toEqual([]);
      expect(result.current.total).toBe(0);
    });
  });

  it('debe limpiar errores', async () => {
    (searchService.search as jest.Mock).mockRejectedValue(new Error('Search failed'));

    const { result } = renderHook(() => useSearch());

    // Limpiar error antes de empezar
    await act(async () => {
      result.current.clearError();
    });
    await waitFor(() => {
      expect(result.current.error).toBeNull();
    });

    await act(async () => {
      try {
        await result.current.search({ query: 'test' });
      } catch {
        // El error es manejado por el hook, no debe propagarse
      }
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    await act(async () => {
      result.current.clearError();
    });

    await waitFor(() => {
      expect(result.current.error).toBeNull();
    });
    expect(result.current.results).toEqual([]);
  });

  it('debe limpiar historial', async () => {
    const mockResults = {
      success: true,
      data: [],
      total: 0,
      took: 5,
      limit: 20,
      offset: 0
    };

    (searchService.search as jest.Mock).mockResolvedValue(mockResults);

    const { result } = renderHook(() => useSearch());

    // Limpiar historial antes de empezar
    await act(async () => {
      result.current.clearHistory();
    });
    await waitFor(() => {
      expect(result.current.searchHistory).toEqual([]);
    });

    await act(async () => {
      await result.current.search({ query: 'test1' });
      await result.current.search({ query: 'test2' });
    });

    await waitFor(() => {
      expect(result.current.searchHistory.length).toBe(2);
    });

    await act(async () => {
      result.current.clearHistory();
    });
    await waitFor(() => {
      expect(result.current.searchHistory).toEqual([]);
    });
  });
});
