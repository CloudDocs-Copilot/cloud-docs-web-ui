/**
 * Servicio para búsqueda de documentos
 * @module search.service
 */

import { apiClient } from '../api';
import type { Document } from '../types/document.types';

// ============================================================================
// Tipos
// ============================================================================

/**
 * Parámetros de búsqueda
 */
export interface SearchParams {
  query: string;
  organizationId?: string;
  mimeType?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Respuesta de búsqueda
 */
export interface SearchResponse {
  success: boolean;
  data: Document[];
  total: number;
  took: number;
  limit: number;
  offset: number;
}

/**
 * Respuesta de autocompletado
 */
export interface AutocompleteResponse {
  success: boolean;
  suggestions: string[];
}

// ============================================================================
// Servicio
// ============================================================================

export const searchService = {
  /**
   * Buscar documentos
   * @param params Parámetros de búsqueda
   * @returns Resultados de búsqueda
   */
  search: async (params: SearchParams): Promise<SearchResponse> => {
    const queryParams = new URLSearchParams();
    
    queryParams.append('q', params.query);
    
    if (params.organizationId) {
      queryParams.append('organizationId', params.organizationId);
    }
    
    if (params.mimeType) {
      queryParams.append('mimeType', params.mimeType);
    }
    
    if (params.fromDate) {
      queryParams.append('fromDate', params.fromDate.toISOString());
    }
    
    if (params.toDate) {
      queryParams.append('toDate', params.toDate.toISOString());
    }
    
    if (params.limit !== undefined) {
      queryParams.append('limit', params.limit.toString());
    }
    
    if (params.offset !== undefined) {
      queryParams.append('offset', params.offset.toString());
    }

    const response = await apiClient.get<SearchResponse>(`/documents/search?${queryParams.toString()}`);
    return response.data;
  },

  /**
   * Obtener sugerencias de autocompletado
   * @param query Término de búsqueda
   * @param organizationId ID de la organización (opcional)
   * @param limit Número de sugerencias
   * @returns Lista de sugerencias
   */
  autocomplete: async (query: string, organizationId?: string, limit: number = 5): Promise<string[]> => {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    queryParams.append('limit', limit.toString());
    
    if (organizationId) {
      queryParams.append('organizationId', organizationId);
    }

    const response = await apiClient.get<AutocompleteResponse>(
      `/search/autocomplete?${queryParams.toString()}`
    );
    
    return response.data.suggestions;
  },
};

export default searchService;
