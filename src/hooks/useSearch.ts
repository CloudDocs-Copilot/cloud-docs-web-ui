import { useState, useCallback } from 'react';
import type { Document } from '../types/document.types';

interface SearchFilters {
  query: string;
  mimeType?: string;
  fromDate?: string;
  toDate?: string;
  organizationId?: string;
}

interface SearchHistoryItem {
  query: string;
  results: number;
  timestamp: Date;
}

interface SearchResult extends Document {
  highlight?: string;
}

interface SearchResponse {
  documents: SearchResult[];
  total: number;
  took?: number;
}

export const useSearch = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [took, setTook] = useState<number | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  const search = useCallback(async (filters: SearchFilters) => {
    if (!filters.query.trim()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      searchParams.append('q', filters.query.trim());
      
      if (filters.mimeType) {
        searchParams.append('mimeType', filters.mimeType);
      }
      if (filters.fromDate) {
        searchParams.append('fromDate', filters.fromDate);
      }
      if (filters.toDate) {
        searchParams.append('toDate', filters.toDate);
      }
      if (filters.organizationId) {
        searchParams.append('organizationId', filters.organizationId);
      }

      const response = await fetch(`http://localhost:4000/api/search?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Para enviar cookies de autenticación
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: SearchResponse = await response.json();
      
      setResults(data.documents || []);
      setTotal(data.total || 0);
      setTook(data.took || null);

      // Agregar al historial
      setSearchHistory(prev => {
        const newItem: SearchHistoryItem = {
          query: filters.query.trim(),
          results: data.total || 0,
          timestamp: new Date(),
        };

        // Evitar duplicados y mantener solo los últimos 10
        const filtered = prev.filter(item => item.query !== newItem.query);
        return [newItem, ...filtered].slice(0, 10);
      });

    } catch (err) {
      console.error('Error en búsqueda:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido en la búsqueda');
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
    setTotal(null);
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
