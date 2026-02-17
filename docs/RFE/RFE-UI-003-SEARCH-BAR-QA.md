# RFE-UI-003: Activación de Barra de Búsqueda + Q&A con IA

## 📋 Resumen

| Campo | Valor |
|-------|-------|
| **Fecha** | Febrero 16, 2026 |
| **Estado** | 📋 Propuesto |
| **Issues relacionadas** | [#51 (US-204)](https://github.com/CloudDocs-Copilot/cloud-docs-web-ui/issues/51) |
| **Épica** | Inteligencia Artificial (Core MVP) |
| **Prioridad** | 🟠 Alta (P1 — funcionalidad core) |
| **Estimación** | 8h |
| **Repositorio** | `cloud-docs-web-ui` |

---

## 🎯 Objetivo

1. **Activar la barra de búsqueda** que actualmente existe en el Header pero está inerte (sin handlers ni estado)
2. **Conectarla al endpoint de búsqueda** del backend (full-text ES + filtros de categoría/tags)
3. **Añadir modo Q&A** que envía la pregunta al RAG del backend y muestra la respuesta del LLM
4. **Panel de resultados** con highlights, filtros por categoría y paginación básica

---

## 📡 Estado Actual

### Barra de búsqueda actual (`src/components/Header.tsx`)

La barra de búsqueda existe visualmente pero:
- **No tiene `onChange` handler** — escribir no hace nada
- **No tiene estado** — ningún `useState` para el search term
- **No conecta con API** — no hay llamada a `/api/search`
- **No hay panel de resultados** — no se renderizan resultados

Esencialmente es HTML decorativo.

---

## 🏗️ Diseño

### Flujo de Interacción

```
Usuario escribe en la barra de búsqueda
    │
    ├── Si empieza con "?" → Modo Q&A
    │       Ej: "?¿Cuánto costó la factura del mes pasado?"
    │       │
    │       └── POST /api/ai/ask { question: "..." }
    │            │
    │            └── Muestra respuesta del LLM + fuentes
    │
    └── Si NO empieza con "?" → Modo búsqueda normal
            Ej: "factura proveedor-x"
            │
            ├── Debounce 300ms
            ├── GET /api/search?q=...&category=...&tags=...
            │
            └── Muestra lista de documentos con highlights
```

### Layout del Panel de Resultados

```
┌────────────────────────────────────────────────────────────────┐
│  🔍 [factura proveedor                           ] [⚡Q&A]    │
│                                                                │
│  ┌─ Filtros ──────────────────────────────────────────────┐   │
│  │  Categoría: [Todas ▼] [Factura] [Contrato] [Informe]  │   │
│  │  Tags: [finanzas ✕] [2026 ✕]                          │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  3 resultados                                                  │
│                                                                │
│  📄 presupuesto-2026.pdf                        92% match     │
│     [🔴 Factura] [finanzas] [iva]                             │
│     "...el total de la **factura** del **proveedor** X..."    │
│                                                                │
│  📄 contrato-proveedor-x.docx                   78% match    │
│     [🟢 Contrato] [proveedor-x] [servicios]                  │
│     "...acuerdo con el **proveedor** para suministro..."      │
│                                                                │
│  📄 informe-gastos-q1.pdf                        65% match    │
│     [🔵 Informe] [finanzas] [2026]                            │
│     "...declaración de gastos incluyendo **factura**s..."     │
└────────────────────────────────────────────────────────────────┘
```

### Layout del Modo Q&A

```
┌────────────────────────────────────────────────────────────────┐
│  ⚡ [?¿Cuánto costó la factura del mes pasado?   ] [🔍 Normal]│
│                                                                │
│  ┌─ Respuesta IA ─────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  🤖 Según tus documentos, la factura del proveedor X   │   │
│  │     del mes pasado tiene un total de 1.500,00€ con     │   │
│  │     IVA incluido (315€ de IVA).                        │   │
│  │                                                         │   │
│  │  📎 Fuentes:                                            │   │
│  │     - presupuesto-2026.pdf (92% relevancia)            │   │
│  │     - detalle-gastos-enero.xlsx (78% relevancia)       │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

---

## 📝 Componentes

### 1. SearchBar (refactorización del input existente)

```typescript
// CREAR src/components/Search/SearchBar.tsx

import React, { useState, useCallback, useRef, useEffect } from 'react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onQAMode: (question: string) => void;
  isLoading: boolean;
  debounceMs?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onQAMode,
  isLoading,
  debounceMs = 300,
}) => {
  const [value, setValue] = useState('');
  const [isQA, setIsQA] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    // Detectar modo Q&A
    const qaMode = newValue.startsWith('?');
    setIsQA(qaMode);

    if (qaMode) {
      // En modo Q&A, no hacer debounce — solo buscar al presionar Enter
      return;
    }

    // Modo búsqueda normal: debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (newValue.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        onSearch(newValue.trim());
      }, debounceMs);
    }
  }, [onSearch, debounceMs]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isQA && value.length > 1) {
      e.preventDefault();
      onQAMode(value.slice(1).trim()); // Quitar el "?" inicial
    } else if (e.key === 'Enter' && !isQA && value.trim().length >= 2) {
      e.preventDefault();
      onSearch(value.trim());
    } else if (e.key === 'Escape') {
      setValue('');
      setIsQA(false);
    }
  }, [isQA, value, onSearch, onQAMode]);

  const toggleMode = useCallback(() => {
    if (isQA) {
      // Switch to search mode
      const searchText = value.startsWith('?') ? value.slice(1) : value;
      setValue(searchText);
      setIsQA(false);
      if (searchText.trim().length >= 2) onSearch(searchText.trim());
    } else {
      // Switch to Q&A mode
      setValue('?' + value);
      setIsQA(true);
    }
  }, [isQA, value, onSearch]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={`${styles.inputWrapper} ${isQA ? styles.qaMode : ''}`}>
        <i className={`bi ${isQA ? 'bi-robot' : 'bi-search'} ${styles.icon}`} />
        <input
          type="text"
          className={styles.input}
          placeholder={isQA 
            ? 'Pregunta a la IA sobre tus documentos...' 
            : 'Buscar documentos...'}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          aria-label={isQA ? 'Pregunta a la IA' : 'Buscar documentos'}
        />
        {isLoading && (
          <div className={`spinner-border spinner-border-sm ${styles.spinner}`} />
        )}
        <button
          className={`btn btn-sm ${styles.modeToggle}`}
          onClick={toggleMode}
          title={isQA ? 'Cambiar a búsqueda normal' : 'Cambiar a modo Q&A'}
        >
          {isQA ? (
            <><i className="bi bi-search" /> Normal</>
          ) : (
            <><i className="bi bi-lightning-charge" /> Q&A</>
          )}
        </button>
      </div>
      {isQA && (
        <div className={styles.qaHint}>
          Presiona Enter para enviar la pregunta a la IA
        </div>
      )}
    </div>
  );
};
```

```css
/* src/components/Search/SearchBar.module.css */

.container {
  position: relative;
  width: 100%;
  max-width: 600px;
}

.inputWrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid var(--bs-border-color, #dee2e6);
  border-radius: 8px;
  background: white;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.inputWrapper:focus-within {
  border-color: var(--bs-primary, #0d6efd);
  box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.15);
}

.qaMode {
  border-color: var(--bs-purple, #6f42c1);
  background: linear-gradient(135deg, #f8f0ff 0%, white 50%);
}

.qaMode:focus-within {
  border-color: var(--bs-purple, #6f42c1);
  box-shadow: 0 0 0 2px rgba(111, 66, 193, 0.15);
}

.icon {
  color: var(--bs-secondary, #6c757d);
  font-size: 0.9rem;
}

.input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.9rem;
}

.spinner {
  width: 14px;
  height: 14px;
  border-width: 2px;
  color: var(--bs-primary, #0d6efd);
}

.modeToggle {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

.qaHint {
  position: absolute;
  top: 100%;
  left: 0;
  font-size: 0.7rem;
  color: var(--bs-purple, #6f42c1);
  margin-top: 2px;
}
```

### 2. SearchResults Panel

```typescript
// CREAR src/components/Search/SearchResults.tsx

import React from 'react';
import { CategoryBadge } from '../AI/CategoryBadge';
import { TagPills } from '../AI/TagPills';
import styles from './SearchResults.module.css';

interface SearchResult {
  id: string;
  score: number;
  document: {
    filename: string;
    originalname: string;
    mimeType: string;
    aiCategory?: string;
    aiTags?: string[];
  };
  highlights?: {
    content?: string[];
    filename?: string[];
  };
}

interface SearchResultsProps {
  results: SearchResult[];
  total: number;
  isLoading: boolean;
  onDocumentClick: (documentId: string) => void;
  onTagClick: (tag: string) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  total,
  isLoading,
  onDocumentClick,
  onTagClick,
}) => {
  if (isLoading) {
    return (
      <div className={styles.panel}>
        <div className={styles.loading}>
          <div className="spinner-border spinner-border-sm" />
          <span>Buscando...</span>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className={styles.panel}>
        <div className={styles.empty}>
          <i className="bi bi-search" />
          <p>No se encontraron documentos</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        {total} resultado{total !== 1 ? 's' : ''}
      </div>
      <div className={styles.list}>
        {results.map((result) => (
          <div
            key={result.id}
            className={styles.resultItem}
            onClick={() => onDocumentClick(result.id)}
            role="button"
            tabIndex={0}
          >
            <div className={styles.resultHeader}>
              <span className={styles.filename}>
                <i className="bi bi-file-earmark" />
                {result.document.originalname || result.document.filename}
              </span>
              <span className={styles.score}>
                {Math.round(result.score * 100)}%
              </span>
            </div>

            {result.document.aiCategory && (
              <CategoryBadge category={result.document.aiCategory} size="sm" />
            )}

            {result.document.aiTags && result.document.aiTags.length > 0 && (
              <TagPills
                tags={result.document.aiTags}
                maxVisible={3}
                onClick={onTagClick}
              />
            )}

            {result.highlights?.content && result.highlights.content.length > 0 && (
              <div
                className={styles.highlight}
                dangerouslySetInnerHTML={{
                  __html: `...${result.highlights.content[0]}...`,
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

```css
/* src/components/Search/SearchResults.module.css */

.panel {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  margin-top: 4px;
  background: white;
  border: 1px solid var(--bs-border-color, #dee2e6);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  max-height: 70vh;
  overflow-y: auto;
}

.header {
  padding: 8px 12px;
  font-size: 0.75rem;
  color: var(--bs-secondary, #6c757d);
  border-bottom: 1px solid var(--bs-border-color-translucent);
}

.list {
  padding: 4px 0;
}

.resultItem {
  padding: 10px 12px;
  cursor: pointer;
  transition: background-color 0.15s;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.resultItem:hover {
  background-color: var(--bs-light, #f8f9fa);
}

.resultHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filename {
  font-weight: 500;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.score {
  font-size: 0.7rem;
  color: var(--bs-success, #198754);
  font-weight: 600;
}

.highlight {
  font-size: 0.75rem;
  color: var(--bs-secondary, #6c757d);
  line-height: 1.4;
}

.highlight em {
  background-color: #fff3cd;
  font-style: normal;
  font-weight: 600;
  padding: 0 2px;
  border-radius: 2px;
}

.loading, .empty {
  padding: 24px;
  text-align: center;
  color: var(--bs-secondary, #6c757d);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.empty i {
  font-size: 2rem;
  opacity: 0.5;
}
```

### 3. QAResponse Panel

```typescript
// CREAR src/components/Search/QAResponse.tsx

import React from 'react';
import type { AIQAResponse } from '../../types/ai.types';
import styles from './QAResponse.module.css';

interface QAResponseProps {
  response: AIQAResponse | null;
  isLoading: boolean;
  onSourceClick: (documentId: string) => void;
}

export const QAResponse: React.FC<QAResponseProps> = ({
  response,
  isLoading,
  onSourceClick,
}) => {
  if (isLoading) {
    return (
      <div className={styles.panel}>
        <div className={styles.loading}>
          <div className="spinner-border spinner-border-sm" />
          <span>Pensando...</span>
        </div>
      </div>
    );
  }

  if (!response) return null;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <i className="bi bi-robot" /> Respuesta IA
      </div>
      <div className={styles.answer}>
        {response.answer}
      </div>
      {response.sources.length > 0 && (
        <div className={styles.sources}>
          <div className={styles.sourcesTitle}>
            <i className="bi bi-paperclip" /> Fuentes:
          </div>
          {response.sources.map((source, i) => (
            <button
              key={i}
              className={styles.sourceItem}
              onClick={() => onSourceClick(source.documentId)}
            >
              <i className="bi bi-file-earmark" />
              {source.filename}
              <span className={styles.sourceScore}>
                {Math.round(source.score * 100)}%
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
```

```css
/* src/components/Search/QAResponse.module.css */

.panel {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  margin-top: 4px;
  background: linear-gradient(135deg, #f8f0ff 0%, white 30%);
  border: 1px solid var(--bs-purple, #6f42c1);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(111, 66, 193, 0.12);
  overflow: hidden;
}

.header {
  padding: 8px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--bs-purple, #6f42c1);
  border-bottom: 1px solid rgba(111, 66, 193, 0.1);
}

.answer {
  padding: 12px;
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--bs-body-color, #212529);
}

.sources {
  padding: 8px 12px 12px;
  border-top: 1px solid rgba(111, 66, 193, 0.1);
}

.sourcesTitle {
  font-size: 0.75rem;
  color: var(--bs-secondary, #6c757d);
  margin-bottom: 6px;
}

.sourceItem {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-right: 8px;
  margin-bottom: 4px;
  padding: 2px 8px;
  border: 1px solid var(--bs-border-color, #dee2e6);
  border-radius: 6px;
  background: white;
  font-size: 0.75rem;
  cursor: pointer;
}

.sourceItem:hover {
  background: var(--bs-light, #f8f9fa);
  border-color: var(--bs-primary, #0d6efd);
}

.sourceScore {
  color: var(--bs-success, #198754);
  font-weight: 600;
  font-size: 0.65rem;
}

.loading {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--bs-purple, #6f42c1);
}
```

### 4. SearchContainer (orquestador)

```typescript
// CREAR src/components/Search/SearchContainer.tsx

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from './SearchBar';
import { SearchResults } from './SearchResults';
import { QAResponse } from './QAResponse';
import { useAI } from '../../hooks/useAI';
import { useHttpRequest } from '../../hooks/useHttpRequest';
import type { AIQAResponse } from '../../types/ai.types';
import styles from './SearchContainer.module.css';

interface SearchResultData {
  results: any[];
  total: number;
}

export const SearchContainer: React.FC = () => {
  const navigate = useNavigate();
  const { askQuestion } = useAI();
  const searchRequest = useHttpRequest<SearchResultData>();
  
  const [mode, setMode] = useState<'search' | 'qa'>('search');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [qaResponse, setQaResponse] = useState<AIQAResponse | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isQALoading, setIsQALoading] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    setMode('search');
    setShowResults(true);
    setQaResponse(null);

    await searchRequest.execute({
      method: 'GET',
      url: `/search?q=${encodeURIComponent(query)}`,
    });

    if (searchRequest.data) {
      setSearchResults(searchRequest.data.results);
    }
  }, [searchRequest]);

  const handleQA = useCallback(async (question: string) => {
    setMode('qa');
    setShowResults(true);
    setSearchResults([]);
    setIsQALoading(true);

    const response = await askQuestion(question);
    setQaResponse(response);
    setIsQALoading(false);
  }, [askQuestion]);

  const handleDocumentClick = useCallback((documentId: string) => {
    setShowResults(false);
    navigate(`/documents/${documentId}`);
  }, [navigate]);

  const handleTagClick = useCallback((tag: string) => {
    handleSearch(tag);
  }, [handleSearch]);

  return (
    <div className={styles.container} onBlur={(e) => {
      // Close results when clicking outside
      if (!e.currentTarget.contains(e.relatedTarget)) {
        setTimeout(() => setShowResults(false), 200);
      }
    }}>
      <SearchBar
        onSearch={handleSearch}
        onQAMode={handleQA}
        isLoading={searchRequest.isLoading || isQALoading}
      />

      {showResults && mode === 'search' && (
        <SearchResults
          results={searchResults}
          total={searchResults.length}
          isLoading={searchRequest.isLoading}
          onDocumentClick={handleDocumentClick}
          onTagClick={handleTagClick}
        />
      )}

      {showResults && mode === 'qa' && (
        <QAResponse
          response={qaResponse}
          isLoading={isQALoading}
          onSourceClick={handleDocumentClick}
        />
      )}
    </div>
  );
};
```

---

## 🔄 Integración en Header

```typescript
// Modificar src/components/Header.tsx

// Reemplazar el input de búsqueda estático por SearchContainer:
import { SearchContainer } from './Search/SearchContainer';

// En el JSX, reemplazar:
// <input type="text" placeholder="Buscar..." />
// Por:
<SearchContainer />
```

---

## 🧪 Testing

```typescript
describe('SearchBar', () => {
  it('debounces search input', async () => {
    jest.useFakeTimers();
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} onQAMode={jest.fn()} isLoading={false} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
    expect(onSearch).not.toHaveBeenCalled();

    jest.advanceTimersByTime(300);
    expect(onSearch).toHaveBeenCalledWith('test');
  });

  it('detects Q&A mode when input starts with ?', () => {
    render(<SearchBar onSearch={jest.fn()} onQAMode={jest.fn()} isLoading={false} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '?what' } });
    expect(screen.getByText(/Enter para enviar/)).toBeInTheDocument();
  });

  it('calls onQAMode on Enter in Q&A mode', () => {
    const onQAMode = jest.fn();
    render(<SearchBar onSearch={jest.fn()} onQAMode={onQAMode} isLoading={false} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '?test question' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(onQAMode).toHaveBeenCalledWith('test question');
  });

  it('clears on Escape', () => {
    render(<SearchBar onSearch={jest.fn()} onQAMode={jest.fn()} isLoading={false} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    
    expect(input.value).toBe('');
  });
});

describe('SearchResults', () => {
  it('renders results with highlights', () => {
    const results = [{
      id: '1',
      score: 0.92,
      document: { filename: 'test.pdf', originalname: 'test.pdf', mimeType: 'application/pdf' },
      highlights: { content: ['this is a <em>test</em> highlight'] },
    }];

    render(
      <SearchResults
        results={results}
        total={1}
        isLoading={false}
        onDocumentClick={jest.fn()}
        onTagClick={jest.fn()}
      />
    );

    expect(screen.getByText('test.pdf')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(
      <SearchResults results={[]} total={0} isLoading={false}
        onDocumentClick={jest.fn()} onTagClick={jest.fn()} />
    );
    expect(screen.getByText('No se encontraron documentos')).toBeInTheDocument();
  });
});

describe('QAResponse', () => {
  it('renders answer and sources', () => {
    const response = {
      answer: 'The invoice total is 1500€.',
      sources: [{ documentId: '1', filename: 'factura.pdf', chunkIndex: 0, score: 0.92 }],
    };

    render(<QAResponse response={response} isLoading={false} onSourceClick={jest.fn()} />);
    expect(screen.getByText(/1500€/)).toBeInTheDocument();
    expect(screen.getByText('factura.pdf')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<QAResponse response={null} isLoading={true} onSourceClick={jest.fn()} />);
    expect(screen.getByText('Pensando...')).toBeInTheDocument();
  });
});
```

---

## ✅ Criterios de Aceptación

| # | Criterio | Estado |
|---|----------|--------|
| 1 | Barra de búsqueda tiene handler funcional con debounce 300ms | ⬜ |
| 2 | Búsqueda query conecta a GET /api/search y muestra resultados | ⬜ |
| 3 | Resultados muestran filename, score, category badge, tags, highlights | ⬜ |
| 4 | Click en resultado navega a vista de documento | ⬜ |
| 5 | Prefijo "?" activa modo Q&A (visual distinto, envía a POST /api/ai/ask) | ⬜ |
| 6 | Respuesta Q&A muestra texto del LLM + fuentes clickeables | ⬜ |
| 7 | Toggle entre modo normal y Q&A funciona | ⬜ |
| 8 | Escape cierra panel de resultados y limpia input | ⬜ |
| 9 | Panel se cierra al hacer click fuera | ⬜ |
| 10 | Loading states visibles en ambos modos | ⬜ |
| 11 | Click en tag filtra búsqueda por ese tag | ⬜ |

---

## 📋 Tareas de Implementación

- [ ] Crear `src/components/Search/SearchBar.tsx` + CSS Module
- [ ] Crear `src/components/Search/SearchResults.tsx` + CSS Module
- [ ] Crear `src/components/Search/QAResponse.tsx` + CSS Module
- [ ] Crear `src/components/Search/SearchContainer.tsx` + CSS Module (orquestador)
- [ ] Modificar `Header.tsx`: reemplazar input estático por `SearchContainer`
- [ ] Tests: SearchBar (debounce, QA mode, Escape, Enter)
- [ ] Tests: SearchResults (render, empty state, highlight)
- [ ] Tests: QAResponse (render, loading, source click)

---

## 📁 Archivos

```
src/components/Search/                  ← CREAR directorio
├── SearchBar.tsx                       ← CREAR
├── SearchBar.module.css                ← CREAR
├── SearchResults.tsx                   ← CREAR
├── SearchResults.module.css            ← CREAR
├── QAResponse.tsx                      ← CREAR
├── QAResponse.module.css               ← CREAR
├── SearchContainer.tsx                 ← CREAR
└── SearchContainer.module.css          ← CREAR

src/components/Header.tsx               ← MODIFICAR: integrar SearchContainer
```

---

## 🔗 RFEs Relacionadas

| RFE | Relación |
|-----|----------|
| RFE-UI-001 | Provee useAI().askQuestion() y tipos AIQAResponse |
| RFE-UI-002 | Reutiliza CategoryBadge y TagPills en resultados de búsqueda |
| RFE-AI-004 | Backend provee búsqueda full-text + filtros en ES |
| RFE-AI-005 | Backend provee RAG seguro (con filtro org) para Q&A |
