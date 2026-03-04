/**
 * Hook para autocompletado de búsqueda
 */

import { useState, useEffect, useCallback } from 'react';
import { searchService } from '../services/search.service';

const DEBOUNCE_DELAY = 300;

export const useAutocomplete = (query: string, organizationId?: string, enabled: boolean = true) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      const results = await searchService.autocomplete(searchQuery.trim(), organizationId);
      setSuggestions(results);
    } catch (err) {
      console.error('Error fetching autocomplete suggestions:', err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    if (!enabled || !query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    // Debounce
    const timeoutId = setTimeout(() => {
      fetchSuggestions(query);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [query, enabled, fetchSuggestions]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return {
    suggestions,
    loading,
    clearSuggestions,
  };
};

export default useAutocomplete;
