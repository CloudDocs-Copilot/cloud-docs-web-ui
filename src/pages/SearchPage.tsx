import React, { useState, useCallback, useRef, useEffect, useContext } from 'react';
import type { FormEvent } from 'react';
import { Container, Row, Col, Form, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { Search, X, Clock, FileEarmark } from 'react-bootstrap-icons';
import MainLayout from '../components/MainLayout';
import DocumentCard from '../components/DocumentCard';
import { usePageTitle } from '../hooks/usePageInfoTitle';
import { useSearch } from '../hooks/useSearch';
import { useAutocomplete } from '../hooks/useAutocomplete';
import { OrganizationContext } from '../context/OrganizationContext';
import type { Document } from '../types/document.types';
import styles from './SearchPage.module.css';

// Tipos MIME comunes
const FILE_TYPES = [
  { value: '', label: 'Todos los tipos' },
  { value: 'application/pdf', label: 'PDF' },
  { value: 'image/jpeg', label: 'Imágenes (JPG)' },
  { value: 'image/png', label: 'Imágenes (PNG)' },
  { value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', label: 'Word' },
  { value: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', label: 'Excel' },
  { value: 'video/mp4', label: 'Video (MP4)' },
  { value: 'text/plain', label: 'Texto plano' },
];

const SearchPage: React.FC = () => {
  usePageTitle({
    title: 'Buscar documentos',
    subtitle: 'Encuentra tus archivos rápidamente',
    documentTitle: 'Búsqueda',
    metaDescription: 'Busca documentos por nombre, tipo y fecha'
  });

  const orgContext = useContext(OrganizationContext);
  const { results, loading, error, total, took, searchHistory, search, clearError, clearResults, clearHistory } = useSearch();
  
  const [query, setQuery] = useState('');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [mimeType, setMimeType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  
  const { suggestions, loading: autocompleteLoading } = useAutocomplete(
    query, 
    orgContext?.activeOrganization?.id, 
    showAutocomplete
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  /**
   * Cerrar autocomplete al hacer clic fuera
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowAutocomplete(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Ejecutar búsqueda
   */
  const handleSearch = useCallback(async (e?: FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!query.trim()) {
      return;
    }

    setShowAutocomplete(false);
    setHasSearched(true);

    await search({
      query: query.trim(),
      organizationId: orgContext?.activeOrganization?.id,
      mimeType: mimeType || undefined,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
      limit: 50,
    });
  }, [query, mimeType, fromDate, toDate, orgContext?.activeOrganization, search]);

  /**
   * Seleccionar sugerencia de autocompletado
   */
  const handleSelectSuggestion = useCallback((suggestion: string) => {
    setQuery(suggestion);
    setShowAutocomplete(false);
    inputRef.current?.focus();
  }, []);

  /**
   * Seleccionar del historial
   */
  const handleSelectHistory = useCallback((historyQuery: string) => {
    setQuery(historyQuery);
    setShowAutocomplete(false);
  }, []);

  /**
   * Limpiar búsqueda
   */
  const handleClear = useCallback(() => {
    setQuery('');
    setMimeType('');
    setFromDate('');
    setToDate('');
    setHasSearched(false);
    clearResults();
    clearError();
    inputRef.current?.focus();
  }, [clearResults, clearError]);

  /**
   * Formatear tiempo de búsqueda
   */
  const formatTook = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <MainLayout>
      <Container className={styles.searchContainer}>
        {/* Header con barra de búsqueda */}
        <div className={styles.searchHeader}>
          <h2 className={styles.pageTitle}>
            <Search className={styles.titleIcon} />
            Buscar documentos
          </h2>

          <Form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchInputWrapper}>
              <Search className={styles.searchIcon} />
              <Form.Control
                ref={inputRef}
                type="text"
                placeholder="Buscar por nombre de archivo..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowAutocomplete(true)}
                className={styles.searchInput}
                autoComplete="off"
              />
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className={styles.clearButton}
                  aria-label="Limpiar búsqueda"
                >
                  <X />
                </button>
              )}

              {/* Autocomplete dropdown */}
              {showAutocomplete && (query.length >= 2 || searchHistory.length > 0) && (
                <div ref={autocompleteRef} className={styles.autocompleteDropdown}>
                  {/* Sugerencias */}
                  {suggestions.length > 0 && (
                    <div className={styles.autocompleteSection}>
                      <div className={styles.autocompleteSectionTitle}>
                        <FileEarmark size={14} />
                        Sugerencias
                      </div>
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className={styles.autocompleteItem}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Historial */}
                  {searchHistory.length > 0 && query.length < 2 && (
                    <div className={styles.autocompleteSection}>
                      <div className={styles.autocompleteSectionTitle}>
                        <Clock size={14} />
                        Búsquedas recientes
                        {searchHistory.length > 0 && (
                          <button
                            type="button"
                            onClick={clearHistory}
                            className={styles.clearHistoryBtn}
                          >
                            Limpiar
                          </button>
                        )}
                      </div>
                      {searchHistory.map((item, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSelectHistory(item)}
                          className={styles.autocompleteItem}
                        >
                          <Clock size={14} className={styles.historyIcon} />
                          {item}
                        </button>
                      ))}
                    </div>
                  )}

                  {autocompleteLoading && (
                    <div className={styles.autocompleteLoading}>
                      <Spinner animation="border" size="sm" />
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button type="submit" disabled={!query.trim() || loading} className={styles.searchButton}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Buscar'}
            </Button>
          </Form>

          {/* Filtros */}
          <div className={styles.filters}>
            <Form.Group className={styles.filterGroup}>
              <Form.Label className={styles.filterLabel}>Tipo de archivo</Form.Label>
              <Form.Select
                value={mimeType}
                onChange={(e) => setMimeType(e.target.value)}
                className={styles.filterSelect}
              >
                {FILE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className={styles.filterGroup}>
              <Form.Label className={styles.filterLabel}>Desde</Form.Label>
              <Form.Control
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className={styles.filterInput}
              />
            </Form.Group>

            <Form.Group className={styles.filterGroup}>
              <Form.Label className={styles.filterLabel}>Hasta</Form.Label>
              <Form.Control
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className={styles.filterInput}
              />
            </Form.Group>

            {(mimeType || fromDate || toDate) && (
              <Button
                variant="link"
                onClick={handleClear}
                className={styles.clearFiltersBtn}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="danger" dismissible onClose={clearError} className={styles.errorAlert}>
            {error}
          </Alert>
        )}

        {/* Resultados */}
        {hasSearched && (
          <div className={styles.resultsSection}>
            {/* Stats */}
            {!loading && results.length > 0 && (
              <div className={styles.resultsStats}>
                <span className={styles.resultsCount}>
                  {total} resultado{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
                </span>
                <Badge bg="secondary" className={styles.timeBadge}>
                  {formatTook(took)}
                </Badge>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className={styles.loadingContainer}>
                <Spinner animation="border" />
                <p className={styles.loadingText}>Buscando documentos...</p>
              </div>
            )}

            {/* No results */}
            {!loading && results.length === 0 && (
              <div className={styles.emptyState}>
                <Search size={64} className={styles.emptyIcon} />
                <h4 className={styles.emptyTitle}>No se encontraron resultados</h4>
                <p className={styles.emptyMessage}>
                  Intenta con otros términos de búsqueda o ajusta los filtros
                </p>
              </div>
            )}

            {/* Results grid */}
            {!loading && results.length > 0 && (
              <Row>
                {results.map((doc: Document) => (
                  <Col key={doc.id} xs={12} sm={6} md={4} lg={3} className="mb-3">
                    <DocumentCard document={doc} />
                  </Col>
                ))}
              </Row>
            )}
          </div>
        )}

        {/* Empty state inicial */}
        {!hasSearched && searchHistory.length === 0 && (
          <div className={styles.initialState}>
            <Search size={80} className={styles.initialIcon} />
            <h3 className={styles.initialTitle}>Busca tus documentos</h3>
            <p className={styles.initialMessage}>
              Introduce un nombre de archivo, tipo o fecha para encontrar tus documentos
            </p>
          </div>
        )}

        {/* Historial inicial */}
        {!hasSearched && searchHistory.length > 0 && (
          <div className={styles.historySection}>
            <div className={styles.historySectionHeader}>
              <h4 className={styles.historySectionTitle}>
                <Clock />
                Búsquedas recientes
              </h4>
              <Button variant="link" onClick={clearHistory} className={styles.clearHistoryLink}>
                Limpiar historial
              </Button>
            </div>
            <div className={styles.historyList}>
              {searchHistory.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(item);
                    handleSearch();
                  }}
                  className={styles.historyItem}
                >
                  <Clock size={16} />
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </Container>
    </MainLayout>
  );
};

export default SearchPage;
