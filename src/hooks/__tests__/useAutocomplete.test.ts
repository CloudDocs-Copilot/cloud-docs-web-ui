import { renderHook, waitFor, act } from '@testing-library/react';
import useAutocomplete from '../useAutocomplete';

// Mock the search service
jest.mock('../../services/search.service', () => ({
  searchService: {
    autocomplete: jest.fn()
  }
}));

import { searchService } from '../../services/search.service';

describe('useAutocomplete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with empty suggestions and no loading', () => {
    const { result: initResult } = renderHook(() => useAutocomplete('test'));
    expect(initResult.current.suggestions).toEqual([]);
    expect(initResult.current.loading).toBe(false);
  });

  it('returns clearSuggestions function', () => {
    const { result: funcResult } = renderHook(() => useAutocomplete('test'));
    expect(typeof funcResult.current.clearSuggestions).toBe('function');
  });

  it('does not fetch suggestions for queries shorter than 2 characters', async () => {
    renderHook(() => useAutocomplete('a'));
    
    await waitFor(() => {
      expect(searchService.autocomplete).not.toHaveBeenCalled();
    });
  });

  it('clears suggestions when query is empty', async () => {
    const { result: emptyResult } = renderHook(
      ({ query }) => useAutocomplete(query),
      { initialProps: { query: '' } }
    );

    expect(emptyResult.current.suggestions).toEqual([]);
  });

  it('disables fetching when enabled is false', async () => {
    const { result: disabledResult } = renderHook(() => useAutocomplete('test', undefined, false));
    
    await waitFor(() => {
      expect(searchService.autocomplete).not.toHaveBeenCalled();
    });
    
    expect(disabledResult.current.suggestions).toEqual([]);
  });

  it('clears suggestions on clearSuggestions call', () => {
    const { result } = renderHook(() => useAutocomplete('test'));
    
    act(() => {
      result.current.clearSuggestions();
    });

    expect(result.current.suggestions).toEqual([]);
  });
});

