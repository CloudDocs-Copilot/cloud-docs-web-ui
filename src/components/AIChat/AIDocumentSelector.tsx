import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { listDocuments, listSharedDocuments } from '../../services/document.service';
import searchService from '../../services/search.service';
import { isAiCompatibleMimeType } from '../../types/ai.types';
import styles from './AIDocumentSelector.module.css';

// ---- Types ----

interface DocumentOption {
  id: string;
  name: string;
  mimeType: string;
  aiProcessingStatus: 'completed' | 'processing' | 'failed' | 'none' | null | undefined;
  source: 'own' | 'shared';
}

type ViewMode = 'initial' | 'suggestions' | 'results';
type DocStatus = DocumentOption['aiProcessingStatus'];

interface RawDoc {
  id?: string;
  _id?: string;
  filename?: string;
  originalname?: string;
  mimeType?: string;
  aiProcessingStatus?: string;
}

interface AIDocumentSelectorProps {
  value: string | null;
  onChange: (id: string, name: string) => void;
}

const STATUS_LABELS: Record<string, { label: string; cssClass: string }> = {
  completed: { label: 'Procesado', cssClass: styles.aiCompleted },
  processing: { label: 'Procesando', cssClass: styles.aiProcessing },
  failed: { label: 'Error', cssClass: styles.aiFailed },
  none: { label: 'Sin procesar', cssClass: styles.aiNone },
};

function toDocOption(d: RawDoc, source: 'own' | 'shared'): DocumentOption {
  return {
    id: d.id ?? d._id ?? '',
    name: d.originalname ?? d.filename ?? 'Documento sin nombre',
    mimeType: d.mimeType ?? '',
    aiProcessingStatus: (d.aiProcessingStatus as DocStatus) ?? 'none',
    source,
  };
}

// ---- Component ----

export const AIDocumentSelector: React.FC<AIDocumentSelectorProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const [myDocs, setMyDocs] = useState<DocumentOption[]>([]);
  const [sharedDocs, setSharedDocs] = useState<DocumentOption[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<DocumentOption[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('initial');
  const [searching, setSearching] = useState(false);

  const [incompatible, setIncompatible] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ---- Initial load: own docs + shared docs in parallel ----
  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([listDocuments(), listSharedDocuments()]).then(([myRes, sharedRes]) => {
      if (cancelled) return;
      if (myRes.status === 'fulfilled') {
        setMyDocs((myRes.value.documents ?? []).map((d) => toDocOption(d as RawDoc, 'own')));
      }
      if (sharedRes.status === 'fulfilled') {
        setSharedDocs((sharedRes.value.documents ?? []).map((d) => toDocOption(d as RawDoc, 'shared')));
      }
      setInitialLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  const allDocs = [...myDocs, ...sharedDocs];
  const selectedDoc =
    (viewMode === 'results' ? searchResults : allDocs).find((d) => d.id === value) ??
    allDocs.find((d) => d.id === value);

  // ---- Handlers ----

  const handleClear = useCallback(() => {
    setInputValue('');
    setSuggestions([]);
    setSearchResults([]);
    setViewMode('initial');
    inputRef.current?.focus();
  }, []);

  const runSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    try {
      setSearching(true);
      setViewMode('results');
      const res = await searchService.search({ query: query.trim() });
      // The backend may return results under 'data', 'results', 'documents', or 'hits'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = res as any;
      const docs: RawDoc[] = raw.data ?? raw.results ?? raw.documents ?? raw.hits ?? [];
      console.debug('[AIDocumentSelector] search response:', res, '→ docs:', docs);
      setSearchResults(docs.map((d) => toDocOption(d, 'own')));
    } catch (err) {
      console.error('[AIDocumentSelector] search error:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setInputValue(q);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (q.trim().length < 2) {
      setSuggestions([]);
      setViewMode('initial');
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setSearching(true);
        const results = await searchService.autocomplete(q.trim());
        setSuggestions(results ?? []);
        setViewMode('suggestions');
      } catch {
        setSuggestions([]);
        setViewMode('suggestions');
      } finally {
        setSearching(false);
      }
    }, 400);
  }, []);

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      setInputValue(suggestion);
      setSuggestions([]);
      runSearch(suggestion);
    },
    [runSearch],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        runSearch(inputValue);
      }
      if (e.key === 'Escape') setOpen(false);
    },
    [inputValue, runSearch],
  );

  const handleSelect = useCallback(
    (doc: DocumentOption) => {
      if (!isAiCompatibleMimeType(doc.mimeType)) {
        setIncompatible(true);
        setTimeout(() => setIncompatible(false), 600);
        return;
      }
      onChange(doc.id, doc.name);
      setOpen(false);
      setInputValue('');
      setViewMode('initial');
    },
    [onChange],
  );

  // ---- Item renderer ----

  const renderDocItem = (doc: DocumentOption) => {
    const compatible = isAiCompatibleMimeType(doc.mimeType);
    const statusInfo = STATUS_LABELS[doc.aiProcessingStatus ?? 'none'] ?? STATUS_LABELS['none'];
    return (
      <li key={doc.id} role="option" aria-selected={doc.id === value}>
        <button
          type="button"
          className={`${styles.option} ${doc.id === value ? styles.optionSelected : ''} ${
            !compatible ? styles.optionIncompatible : ''
          }`}
          onClick={() => handleSelect(doc)}
          title={!compatible ? 'Formato no compatible con IA' : undefined}
        >
          <span className={styles.optionIcon} aria-hidden="true">
            {doc.mimeType.includes('pdf') ? '📄' : doc.mimeType.includes('word') ? '📝' : '🗒️'}
          </span>
          <span className={styles.optionContent}>
            <span className={styles.optionName}>{doc.name}</span>
            <span className={styles.optionMeta}>
              <span className={`${styles.aiBadge} ${statusInfo.cssClass}`}>{statusInfo.label}</span>
              {doc.source === 'shared' && (
                <span className={styles.sharedBadge}>Compartido</span>
              )}
              {!compatible && (
                <span className={styles.unsupportedBadge}>⚠ No compatible</span>
              )}
            </span>
          </span>
        </button>
      </li>
    );
  };

  // ---- Body ----

  const renderBody = () => {
    if (initialLoading) {
      return (
        <div className={styles.emptyOption}>
          <Spinner animation="border" size="sm" /> Cargando…
        </div>
      );
    }

    if (viewMode === 'suggestions') {
      if (searching) {
        return (
          <div className={styles.emptyOption}>
            <Spinner animation="border" size="sm" />
          </div>
        );
      }
      if (suggestions.length === 0) {
        return <div className={styles.emptyOption}>Sin sugerencias</div>;
      }
      return (
        <ul className={styles.optionList} role="listbox" aria-label="Sugerencias">
          {suggestions.map((s) => (
            <li key={s} role="option" aria-selected={false}>
              <button
                type="button"
                className={styles.suggestionItem}
                onClick={() => handleSuggestionClick(s)}
              >
                <span className={styles.suggestionIcon} aria-hidden="true">🔍</span>
                <span className={styles.suggestionText}>{s}</span>
              </button>
            </li>
          ))}
        </ul>
      );
    }

    if (viewMode === 'results') {
      return (
        <>
          <div className={styles.resultsHeader}>
            <span className={styles.resultsLabel}>
              Resultados para <strong>&ldquo;{inputValue}&rdquo;</strong>
            </span>
            <button
              type="button"
              className={styles.clearBtn}
              onClick={handleClear}
              aria-label="Limpiar búsqueda"
            >
              ✕ Limpiar
            </button>
          </div>
          {searching ? (
            <div className={styles.emptyOption}>
              <Spinner animation="border" size="sm" />
            </div>
          ) : searchResults.length === 0 ? (
            <div className={styles.emptyOption}>Sin resultados</div>
          ) : (
            <ul className={styles.optionList} role="listbox" aria-label="Resultados de búsqueda">
              {searchResults.map(renderDocItem)}
            </ul>
          )}
        </>
      );
    }

    // ---- initial view ----
    const hasAny = myDocs.length > 0 || sharedDocs.length > 0;
    if (!hasAny) {
      return <div className={styles.emptyOption}>Sin documentos disponibles</div>;
    }
    return (
      <>
        {myDocs.length > 0 && (
          <section>
            <div className={styles.sectionLabel}>Mis documentos</div>
            <ul className={styles.optionList} role="listbox" aria-label="Mis documentos">
              {myDocs.map(renderDocItem)}
            </ul>
          </section>
        )}
        {sharedDocs.length > 0 && (
          <section>
            <div className={styles.sectionLabel}>Compartidos conmigo</div>
            <ul className={styles.optionList} role="listbox" aria-label="Compartidos conmigo">
              {sharedDocs.map(renderDocItem)}
            </ul>
          </section>
        )}
      </>
    );
  };

  // ---- Root ----

  return (
    <div
      className={`${styles.wrapper} ${incompatible ? styles.shake : ''}`}
      aria-label="Selector de documentos"
    >
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Selector de documentos"
      >
        <span aria-hidden="true">📄</span>
        <span className={`${styles.triggerLabel} ${!selectedDoc ? styles.triggerPlaceholder : ''}`}>
          {selectedDoc ? selectedDoc.name : 'Seleccionar documento…'}
        </span>
        <span className={`${styles.chevron} ${open ? styles.chevronUp : ''}`} aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <div
          className={`${styles.dropdown} ${styles.dropdownOpen}`}
          role="listbox"
          aria-label="Lista de documentos"
        >
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon} aria-hidden="true">🔍</span>
            <input
              ref={inputRef}
              className={styles.searchInput}
              type="text"
              placeholder="Buscar… (Enter para buscar)"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              aria-label="Filtrar documentos"
              autoFocus
            />
            {inputValue && (
              <button
                type="button"
                className={styles.clearIconBtn}
                onClick={handleClear}
                aria-label="Limpiar"
              >
                ✕
              </button>
            )}
          </div>

          <div className={styles.bodyScroll}>{renderBody()}</div>
        </div>
      )}
    </div>
  );
};
