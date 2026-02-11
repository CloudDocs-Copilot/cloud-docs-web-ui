/**
 * Hook para búsqueda de documentos
 */

import { useState, useCallback, useEffect } from 'react';
import { searchService } from '../services/search.service';
import type { SearchParams } from '../services/search.service';
import type { Document } from '../types/document.types';

const SEARCH_HISTORY_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 10;

export const useSearch = () => {
  const [results, setResults] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [took, setTook] = useState(0);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  /**
   * Cargar historial de búsquedas desde localStorage
   */
  useEffect(() => {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (history) {
      try {
        setSearchHistory(JSON.parse(history));
      } catch (e) {
        console.error('Error loading search history:', e);
      }
    }
  }, []);

  /**
   * Guardar término en historial
   */
  const saveToHistory = useCallback((query: string) => {
    if (!query || query.trim().length === 0) return;

    setSearchHistory((prev) => {
      // Eliminar duplicados y agregar al inicio
      const filtered = prev.filter((item) => item !== query);
      const newHistory = [query, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      
      // Guardar en localStorage
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
      
      return newHistory;
    });
  }, []);

  /**
   * Limpiar historial
   */
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  }, []);

  /**
   * Ejecutar búsqueda
   */
  const search = useCallback(async (params: SearchParams) => {
    try {
      setLoading(true);
      setError(null);

      const response = await searchService.search(params);

      setResults(response.data);
      setTotal(response.total);
      setTook(response.took);

      // Guardar en historial
      saveToHistory(params.query);

      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al buscar documentos';
      setError(errorMessage);
      setResults([]);
      setTotal(0);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [saveToHistory]);

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Limpiar resultados
   */
  const clearResults = useCallback(() => {
    setResults([]);
    setTotal(0);
    setTook(0);
    setError(null);
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

export default useSearch;
