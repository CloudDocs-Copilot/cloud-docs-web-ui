import { useState, useCallback } from 'react';
import searchService from '../services/search.service';
import type { Document } from '../types/document.types';

interface SearchFilters {
  query: string;
  mimeType?: string;
  fromDate?: string;
  toDate?: string;
  organizationId?: string;
}

interface SearchResult extends Document {
  highlight?: string;
}

export const useSearch = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [took, setTook] = useState<number | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const search = useCallback(async (filters: SearchFilters) => {
    if (!filters.query.trim()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await searchService.search({
        query: filters.query.trim(),
        mimeType: filters.mimeType,
        organizationId: filters.organizationId,
      });

      setResults((data.data as SearchResult[]) || []);
      setTotal(data.total || 0);
      setTook(data.took || null);

      // Agregar al historial (strings únicos, máximo 10)
      setSearchHistory(prev => {
        const query = filters.query.trim();
        const filtered = prev.filter(q => q !== query);
        return [query, ...filtered].slice(0, 10);
      });

    } catch (err) {
      console.error('Error en búsqueda:', err);
      setError('Error al buscar documentos');
      setResults([]);
      setTotal(0);
      setTook(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setTotal(0);
    setTook(null);
    setError(null);
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  return {
    results,
    loading,
    error,
    total,
    took,
    searchHistory,
    search,
    clearError,
    clearResults,
    clearHistory,
  };
};
