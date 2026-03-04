import React, { useState, useCallback, type FormEvent } from 'react';
import { Container, Row, Col, Form, Button, Badge, Alert, Card } from 'react-bootstrap';
import { Search, X, FileEarmark } from 'react-bootstrap-icons';
import MainLayout from '../components/MainLayout';
import { formatDate, formatFileSize } from '../utils/formatters';
import useOrganization from '../hooks/useOrganization';
import { apiClient } from '../api/httpClient.config';
import styles from './SearchPage.module.css';
import type { Document } from '../types/document.types';

/**
 * Colores por tipo de archivo
 */
const FILE_TYPE_COLORS: Record<string, string> = {
  'pdf': '#dc3545',
  'doc': '#0d6efd', 
  'docx': '#0d6efd',
  'txt': '#6c757d',
  'jpg': '#198754',
  'jpeg': '#198754',
  'png': '#198754',
  'gif': '#198754',
  'xlsx': '#198754',
  'xls': '#198754'
};

const SearchPage: React.FC = () => {
  // Contexto de organización
  const { activeOrganization } = useOrganization();

  // Estados del formulario
  const [query, setQuery] = useState('');
  const [mimeType, setMimeType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [results, setResults] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [searchTime, setSearchTime] = useState<number | null>(null);

  /**
   * Obtiene el color del tipo de archivo
   */
  const getFileTypeColor = (mimeType: string): string => {
    const extension = mimeType.split('/')[1] || mimeType;
    return FILE_TYPE_COLORS[extension.toLowerCase()] || '#6c757d';
  };

  /**
   * Obtiene la etiqueta elegante del tipo de archivo
   */
  const getFileTypeLabel = (mimeType: string): string => {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'Word';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'Excel';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'PowerPoint';
    if (mimeType.includes('text/plain')) return 'Texto';
    if (mimeType.includes('image/jpeg')) return 'JPEG';
    if (mimeType.includes('image/png')) return 'PNG';
    if (mimeType.includes('image/gif')) return 'GIF';
    
    // Fallback: usar la extensión del mimeType
    const extension = mimeType.split('/')[1];
    return extension ? extension.toUpperCase() : 'Archivo';
  };

  /**
   * Obtiene el ícono del tipo de archivo
   */
  const getFileIcon = (mimeType: string): string => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📈';
    return '📋';
  };

  /**
   * Maneja la búsqueda
   */
  const handleSearch = useCallback(async (e?: FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!query.trim()) {
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const searchParams = new URLSearchParams();
      searchParams.append('q', query.trim());
      
      // Agregar organización si existe
      if (activeOrganization?.id) {
        searchParams.append('organizationId', activeOrganization.id);
      }
      
      // Usar los nombres correctos de parámetros
      if (mimeType) {
        searchParams.append('mimeType', mimeType);
        console.log('🗂️ Filtro de tipo aplicado:', mimeType);
      }
      if (fromDate) {
        searchParams.append('fromDate', fromDate);
        console.log('📅 Filtro fecha desde:', fromDate);
      }
      if (toDate) {
        searchParams.append('toDate', toDate);
        console.log('📅 Filtro fecha hasta:', toDate);
      }

      console.log('🔍 Iniciando búsqueda con parámetros:', {
        query: query.trim(),
        mimeType: mimeType || 'todos',
        organizationId: activeOrganization?.id || 'ninguna',
        fromDate,
        toDate
      });

      const response = await apiClient.get(`/search?${searchParams.toString()}`);
      
      const { data: documents = [], total = 0, took = 0 } = response.data;
      
      console.log(`✅ Respuesta de búsqueda:`, {
        total,
        took,
        documents: documents.map((d: Document) => ({
          id: d.id,
          filename: d.filename || d.originalname,
          mimeType: d.mimeType
        }))
      });
      
      setResults(documents);
      setTotalResults(total);
      setSearchTime(took);

    } catch (err: unknown) {
      console.error('Error en búsqueda:', err);
      const errorMessage = err instanceof Error && 'response' in err ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || err.message : 'Error desconocido en la búsqueda';
      setError(errorMessage);
      setResults([]);
      setTotalResults(0);
      setSearchTime(null);
    } finally {
      setLoading(false);
    }
  }, [query, mimeType, fromDate, toDate, activeOrganization?.id]);

  /**
   * Maneja la vista previa del documento
   */
  const handlePreview = useCallback(async (docId: string) => {
    try {
      // Hacer petición autenticada para obtener la URL de preview
      const response = await apiClient.get(`/documents/preview/${docId}`, {
        responseType: 'blob',
        headers: {
          'Accept': '*/*'
        }
      });
      
      // Obtener el Content-Type de la respuesta
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      console.log('📋 Content-Type recibido:', contentType);
      
      // Crear URL temporal para el blob con el content-type correcto
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      
      // Abrir en nueva ventana con configuración para mostrar correctamente
      const previewWindow = window.open(url, '_blank', 'width=1000,height=800,scrollbars=yes,resizable=yes');
      
      if (!previewWindow) {
        setError('No se pudo abrir la ventana de previsualización. Verifica que no estén bloqueadas las ventanas emergentes.');
        return;
      }
      
      // Limpiar URL después de un tiempo
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 30000); // 30 segundos para dar tiempo a que cargue
      
    } catch (error: unknown) {
      console.error('Error al previsualizar documento:', error);
      const errorMsg = error instanceof Error && 'response' in error ? (error as { response?: { data?: { message?: string } }; message: string }).response?.data?.message || error.message : 'Error desconocido';
      setError(`Error al previsualizar el documento: ${errorMsg}`);
    }
  }, []);

  /**
   * Limpia todos los filtros y resultados
   */
  const handleClear = useCallback(() => {
    setQuery('');
    setMimeType('');
    setFromDate('');
    setToDate('');
    setResults([]);
    setError(null);
    setHasSearched(false);
    setTotalResults(0);
    setSearchTime(null);
  }, []);

  return (
    <MainLayout>
      <Container className={styles.searchContainer}>
        {/* Cabecera */}
        <div className={styles.searchHeader}>
          <h2>
            <Search className={styles.titleIcon} />
            Buscar Documentos
          </h2>
          <Form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchInputWrapper}>
              <Form.Control
                type="text"
                placeholder="Pregunta a tus documentos..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={styles.searchInput}
              />
              <Button 
                type="submit" 
                variant="primary"
                disabled={loading || !query.trim()}
                className={styles.searchButton}
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>

            {/* Filtros avanzados */}
            <Row className="mt-3">
              <Col md={4}>
                <Form.Select
                  value={mimeType}
                  onChange={(e) => {
                    setMimeType(e.target.value);
                    // Si hay una búsqueda activa, reejecutar automáticamente
                    if (query.trim() && hasSearched) {
                      setTimeout(() => handleSearch(), 100);
                    }
                  }}
                  className={styles.filterSelect}
                >
                  <option value="">Todos los tipos</option>
                  <option value="application/pdf">📄 PDF</option>
                  <option value="application/msword">📝 Word (.doc)</option>
                  <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">📝 Word (.docx)</option>
                  <option value="application/vnd.ms-excel">📊 Excel (.xls)</option>
                  <option value="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet">📊 Excel (.xlsx)</option>
                  <option value="application/vnd.ms-powerpoint">📈 PowerPoint (.ppt)</option>
                  <option value="application/vnd.openxmlformats-officedocument.presentationml.presentation">📈 PowerPoint (.pptx)</option>
                  <option value="text/plain">📋 Texto (.txt)</option>
                  <option value="image/jpeg">🖼️ JPEG</option>
                  <option value="image/png">🖼️ PNG</option>
                  <option value="image/gif">🖼️ GIF</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Control
                  type="date"
                  placeholder="Desde"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    // Si hay una búsqueda activa, reejecutar automáticamente
                    if (query.trim() && hasSearched) {
                      setTimeout(() => handleSearch(), 100);
                    }
                  }}
                  className={styles.dateInput}
                />
              </Col>
              <Col md={3}>
                <Form.Control
                  type="date"
                  placeholder="Hasta"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    // Si hay una búsqueda activa, reejecutar automáticamente
                    if (query.trim() && hasSearched) {
                      setTimeout(() => handleSearch(), 100);
                    }
                  }}
                  className={styles.dateInput}
                />
              </Col>
              <Col md={2}>
                <Button
                  variant="outline-secondary"
                  onClick={handleClear}
                  className={styles.clearButton}
                >
                  <X /> Limpiar
                </Button>
              </Col>
            </Row>
          </Form>
        </div>

        {/* Error */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Estadísticas de búsqueda */}
        {hasSearched && (
          <div className={styles.searchStats}>
            <small className="text-muted">
              {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
            </small>
          </div>
        )}

        {/* Resultados */}
        <Row>
          <Col lg={9}>
            {/* Lista de resultados */}
            {loading && (
              <div className={styles.loadingState}>
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Buscando...</span>
                  </div>
                  <p className="mt-2">Buscando documentos...</p>
                </div>
              </div>
            )}

            {error && (
              <Alert variant="danger" className="mb-3">
                <strong>Error:</strong> {error}
              </Alert>
            )}

            {hasSearched && !loading && !error && (
              <div className="mb-3">
                <small className="text-muted">
                  {totalResults > 0 ? (
                    <>
                      {totalResults} resultado{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
                      {searchTime && ` en ${searchTime}ms`}
                      {mimeType && <span className="ms-2 badge bg-info">Tipo: {mimeType.split('/')[1]?.toUpperCase()}</span>}
                      {fromDate && <span className="ms-2 badge bg-secondary">Desde: {fromDate}</span>}
                      {toDate && <span className="ms-2 badge bg-secondary">Hasta: {toDate}</span>}
                    </>
                  ) : (
                    <>
                      No se encontraron resultados
                      {mimeType && <span className="ms-2 badge bg-warning">Filtro tipo: {mimeType.split('/')[1]?.toUpperCase()}</span>}
                    </>
                  )}
                </small>
              </div>
            )}

            {hasSearched && !loading && results.length === 0 && !error && (
              <div className={styles.emptyState}>
                <FileEarmark className={styles.emptyIcon} />
                <h4>No se encontraron documentos</h4>
                <p>Prueba con otros términos de búsqueda o ajusta los filtros</p>
              </div>
            )}

            {results.length > 0 && (
              <div className={styles.resultsContainer}>
                {results.map((doc) => (
                  <Card key={doc.id} className={styles.resultCard}>
                    <Card.Body>
                      <div className={styles.resultHeader}>
                        <div className={styles.fileInfo}>
                          <span className={styles.fileIcon}>
                            {getFileIcon(doc.mimeType)}
                          </span>
                          <div>
                            <h6 className={styles.fileName}>
                              {doc.originalname || doc.filename}
                            </h6>
                            <div className={styles.fileMeta}>
                              <Badge 
                                style={{ backgroundColor: getFileTypeColor(doc.mimeType) }}
                                className="me-2"
                              >
                                {getFileTypeLabel(doc.mimeType)}
                              </Badge>
                              <span className="text-muted me-2">
                                {doc.size ? formatFileSize(doc.size) : 'Tamaño desconocido'}
                              </span>
                              <span className="text-muted">
                                {doc.uploadedAt ? formatDate(doc.uploadedAt) : 'Fecha desconocida'}
                              </span>
                            </div>
                            
                            {/* Mostrar snippet del contenido si existe */}
                            {doc.extractedContent && (
                              <div className={styles.contentSnippet}>
                                <small className="text-muted">
                                  Contenido: {doc.extractedContent.substring(0, 150)}...
                                </small>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className={styles.resultActions}>
                          <Button
                            variant="primary"
                            size="sm"
                            className={styles.actionButton}
                            onClick={() => handlePreview(doc.id)}
                            title="Ver documento"
                          >
                            Ver
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            )}
          </Col>

          {/* Sidebar con tips */}
          <Col lg={3}>
            <Card className={styles.tipsCard}>
              <Card.Header>
                <h6 className="mb-0">💡 Tips de búsqueda</h6>
              </Card.Header>
              <Card.Body>
                <ul className={styles.tipsList}>
                  <li>Usa comillas para frases exactas: <code>"contrato de arrendamiento"</code></li>
                  <li>Busca por tipo de archivo usando los filtros de arriba</li>
                  <li>Combina términos: <code>contrato arrendamiento</code> encontrará ambos</li>
                  <li>Usa palabras clave del contenido del documento</li>
                  <li>Puedes buscar por nombre de archivo o por contenido</li>
                  <li>Los filtros de fecha te ayudan a encontrar documentos recientes</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </MainLayout>
  );
};

export default SearchPage;
