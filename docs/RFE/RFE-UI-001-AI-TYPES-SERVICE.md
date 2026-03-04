# RFE-UI-001: Tipos de Documento AI + Servicio API de IA

## 📋 Resumen

| Campo | Valor |
|-------|-------|
| **Fecha** | Febrero 16, 2026 |
| **Estado** | 📋 Propuesto |
| **Issues relacionadas** | [#46 (US-201)](https://github.com/CloudDocs-Copilot/cloud-docs-web-ui/issues/46), [#47 (US-202)](https://github.com/CloudDocs-Copilot/cloud-docs-web-ui/issues/47), [#48 (US-203)](https://github.com/CloudDocs-Copilot/cloud-docs-web-ui/issues/48), [#51 (US-204)](https://github.com/CloudDocs-Copilot/cloud-docs-web-ui/issues/51), [#52 (US-205)](https://github.com/CloudDocs-Copilot/cloud-docs-web-ui/issues/52) |
| **Épica** | Inteligencia Artificial (Core MVP) |
| **Prioridad** | 🔴 Crítica (bloquea todas las UI de IA) |
| **Estimación** | 6h |
| **Repositorio** | `cloud-docs-web-ui` |

---

## 🎯 Objetivo

1. Extender la interfaz `Document` con los campos AI que el backend ahora devuelve (RFE-AI-002)
2. Crear tipos para las respuestas AI (clasificación, resumen, Q&A, stats)
3. Crear hook `useAI()` que encapsula las llamadas a los endpoints AI del backend
4. Estos son los **cimientos** para todas las demás RFEs de frontend

---

## 📡 Estado Actual

### Interfaz Document actual (`src/types/document.types.ts`)

```typescript
export interface Document {
  id?: string;
  _id?: string;
  filename?: string;
  originalname?: string;
  url?: string;
  uploadedBy: string;
  organization: string;
  folder: string;
  path: string;
  size: number;
  mimeType: string;
  uploadedAt: Date | string;
  sharedWith: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
  // ❌ Sin campos AI
}
```

### API Layer actual

- Usa `apiClient` (Axios) con cookie auth + CSRF
- Hooks usan `useHttpRequest<TResponse>` con `execute({ method, url, data })`
- **No existe ningún servicio ni hook de IA**

### Hooks existentes

Pattern establecido: hooks domain-specific que wrappean `useHttpRequest`. Ejemplo: `useDocumentDeletion`, `useFileUpload`, `useInvitations`.

---

## 🏗️ Tipos AI Nuevos

### Extender Document Interface

```typescript
// Modificar src/types/document.types.ts

export type AIProcessingStatus = 'none' | 'pending' | 'processing' | 'completed' | 'failed';

export type AICategory =
  | 'Factura'
  | 'Contrato'
  | 'Informe'
  | 'Presentación'
  | 'Correspondencia'
  | 'Manual técnico'
  | 'Imagen/Fotografía'
  | 'Hoja de cálculo'
  | 'Documento personal'
  | 'Otro';

export interface Document {
  // --- Campos existentes (sin cambios) ---
  id?: string;
  _id?: string;
  filename?: string;
  originalname?: string;
  url?: string;
  uploadedBy: string;
  organization: string;
  folder: string;
  path: string;
  size: number;
  mimeType: string;
  uploadedAt: Date | string;
  sharedWith: string[];
  createdAt: Date | string;
  updatedAt: Date | string;

  // --- NUEVOS: Campos AI ---
  aiProcessingStatus?: AIProcessingStatus;
  aiCategory?: AICategory | null;
  aiConfidence?: number | null;
  aiTags?: string[];
  aiSummary?: string | null;
  aiKeyPoints?: string[];
  aiProcessedAt?: Date | string | null;
  aiError?: string | null;
}
```

### Nuevos tipos AI

```typescript
// CREAR src/types/ai.types.ts

// ---- Responses del backend ----

export interface AISummaryResponse {
  status: 'not_processed' | 'processing' | 'completed' | 'failed';
  summary: string | null;
  keyPoints: string[];
  category?: string;
  confidence?: number;
  tags?: string[];
  message?: string;
}

export interface AIQAResponse {
  answer: string;
  sources: AISource[];
}

export interface AISource {
  documentId: string;
  filename: string;
  chunkIndex: number;
  score: number;
}

export interface AICategoryAggregation {
  category: string;
  count: number;
}

export interface AITagAggregation {
  tag: string;
  count: number;
}

export interface AICategoriesResponse {
  categories: AICategoryAggregation[];
  total: number;
}

export interface AITagsResponse {
  tags: AITagAggregation[];
  total: number;
}

export interface AIStatsResponse {
  totalProcessed: number;
  totalFailed: number;
  totalPending: number;
  categoryCounts: AICategoryAggregation[];
  topTags: AITagAggregation[];
}

export interface AIProcessResponse {
  status: string;
  message: string;
}

// ---- Colores de categoría (para UI) ----

export const CATEGORY_COLORS: Record<string, string> = {
  'Factura': '#FF6B6B',
  'Contrato': '#4ECDC4',
  'Informe': '#45B7D1',
  'Presentación': '#96CEB4',
  'Correspondencia': '#FFEAA7',
  'Manual técnico': '#DDA0DD',
  'Imagen/Fotografía': '#FFB347',
  'Hoja de cálculo': '#87CEEB',
  'Documento personal': '#98D8C8',
  'Otro': '#BDC3C7',
};

export const CATEGORY_ICONS: Record<string, string> = {
  'Factura': 'bi-receipt',
  'Contrato': 'bi-file-earmark-text',
  'Informe': 'bi-graph-up',
  'Presentación': 'bi-easel',
  'Correspondencia': 'bi-envelope',
  'Manual técnico': 'bi-book',
  'Imagen/Fotografía': 'bi-image',
  'Hoja de cálculo': 'bi-table',
  'Documento personal': 'bi-person-badge',
  'Otro': 'bi-file-earmark',
};
```

---

## 🪝 Hook useAI

### Implementación

```typescript
// CREAR src/hooks/useAI.ts

import { useCallback, useState } from 'react';
import { useHttpRequest } from './useHttpRequest';
import type {
  AISummaryResponse,
  AIQAResponse,
  AICategoriesResponse,
  AITagsResponse,
  AIStatsResponse,
  AIProcessResponse,
} from '../types/ai.types';

interface UseAIReturn {
  // --- Q&A ---
  askQuestion: (question: string) => Promise<AIQAResponse | null>;
  askQuestionInDocument: (documentId: string, question: string) => Promise<AIQAResponse | null>;

  // --- Resumen ---
  getDocumentSummary: (documentId: string) => Promise<AISummaryResponse | null>;
  regenerateSummary: (documentId: string) => Promise<AISummaryResponse | null>;

  // --- Clasificación ---
  getCategories: () => Promise<AICategoriesResponse | null>;
  getTags: (limit?: number) => Promise<AITagsResponse | null>;
  getStats: () => Promise<AIStatsResponse | null>;

  // --- Procesamiento ---
  processDocument: (documentId: string) => Promise<AIProcessResponse | null>;

  // --- Estado ---
  isLoading: boolean;
  error: string | null;
}

export function useAI(): UseAIReturn {
  const [error, setError] = useState<string | null>(null);

  const qaRequest = useHttpRequest<AIQAResponse>();
  const summaryRequest = useHttpRequest<AISummaryResponse>();
  const categoriesRequest = useHttpRequest<AICategoriesResponse>();
  const tagsRequest = useHttpRequest<AITagsResponse>();
  const statsRequest = useHttpRequest<AIStatsResponse>();
  const processRequest = useHttpRequest<AIProcessResponse>();

  // --- Q&A ---

  const askQuestion = useCallback(async (question: string): Promise<AIQAResponse | null> => {
    try {
      setError(null);
      await qaRequest.execute({
        method: 'POST',
        url: '/ai/ask',
        data: { question },
      });
      return qaRequest.data;
    } catch (err) {
      setError('Error al procesar la pregunta');
      return null;
    }
  }, [qaRequest]);

  const askQuestionInDocument = useCallback(async (
    documentId: string, question: string
  ): Promise<AIQAResponse | null> => {
    try {
      setError(null);
      await qaRequest.execute({
        method: 'POST',
        url: `/ai/ask/${documentId}`,
        data: { question },
      });
      return qaRequest.data;
    } catch (err) {
      setError('Error al procesar la pregunta');
      return null;
    }
  }, [qaRequest]);

  // --- Resumen ---

  const getDocumentSummary = useCallback(async (
    documentId: string
  ): Promise<AISummaryResponse | null> => {
    try {
      setError(null);
      await summaryRequest.execute({
        method: 'GET',
        url: `/ai/documents/${documentId}/summary`,
      });
      return summaryRequest.data;
    } catch (err) {
      setError('Error al obtener resumen');
      return null;
    }
  }, [summaryRequest]);

  const regenerateSummary = useCallback(async (
    documentId: string
  ): Promise<AISummaryResponse | null> => {
    try {
      setError(null);
      await summaryRequest.execute({
        method: 'POST',
        url: `/ai/documents/${documentId}/summarize`,
      });
      return summaryRequest.data;
    } catch (err) {
      setError('Error al regenerar resumen');
      return null;
    }
  }, [summaryRequest]);

  // --- Clasificación ---

  const getCategories = useCallback(async (): Promise<AICategoriesResponse | null> => {
    try {
      setError(null);
      await categoriesRequest.execute({
        method: 'GET',
        url: '/ai/categories',
      });
      return categoriesRequest.data;
    } catch (err) {
      setError('Error al obtener categorías');
      return null;
    }
  }, [categoriesRequest]);

  const getTags = useCallback(async (limit = 50): Promise<AITagsResponse | null> => {
    try {
      setError(null);
      await tagsRequest.execute({
        method: 'GET',
        url: `/ai/tags?limit=${limit}`,
      });
      return tagsRequest.data;
    } catch (err) {
      setError('Error al obtener tags');
      return null;
    }
  }, [tagsRequest]);

  const getStats = useCallback(async (): Promise<AIStatsResponse | null> => {
    try {
      setError(null);
      await statsRequest.execute({
        method: 'GET',
        url: '/ai/stats',
      });
      return statsRequest.data;
    } catch (err) {
      setError('Error al obtener estadísticas');
      return null;
    }
  }, [statsRequest]);

  // --- Procesamiento ---

  const processDocument = useCallback(async (
    documentId: string
  ): Promise<AIProcessResponse | null> => {
    try {
      setError(null);
      await processRequest.execute({
        method: 'POST',
        url: `/ai/process/${documentId}`,
      });
      return processRequest.data;
    } catch (err) {
      setError('Error al procesar documento');
      return null;
    }
  }, [processRequest]);

  // --- Computed ---

  const isLoading = qaRequest.isLoading || summaryRequest.isLoading ||
    categoriesRequest.isLoading || tagsRequest.isLoading ||
    statsRequest.isLoading || processRequest.isLoading;

  return {
    askQuestion,
    askQuestionInDocument,
    getDocumentSummary,
    regenerateSummary,
    getCategories,
    getTags,
    getStats,
    processDocument,
    isLoading,
    error,
  };
}
```

---

## 🔄 Helper: Polling de Estado AI

Útil para `DocumentCard` y `DocumentPreview` que necesitan saber cuándo el procesamiento termina.

```typescript
// CREAR src/hooks/useAIPolling.ts

import { useCallback, useEffect, useRef, useState } from 'react';
import { useHttpRequest } from './useHttpRequest';
import type { AIProcessingStatus } from '../types/document.types';

interface UseAIPollingOptions {
  documentId: string;
  initialStatus?: AIProcessingStatus;
  pollIntervalMs?: number;
  enabled?: boolean;
}

interface UseAIPollingReturn {
  status: AIProcessingStatus;
  isProcessing: boolean;
  isCompleted: boolean;
  isFailed: boolean;
}

export function useAIPolling({
  documentId,
  initialStatus = 'none',
  pollIntervalMs = 3000,
  enabled = true,
}: UseAIPollingOptions): UseAIPollingReturn {
  const [status, setStatus] = useState<AIProcessingStatus>(initialStatus);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statusRequest = useHttpRequest<{ status: AIProcessingStatus }>();

  const checkStatus = useCallback(async () => {
    try {
      await statusRequest.execute({
        method: 'GET',
        url: `/ai/status/${documentId}`,
      });
      if (statusRequest.data) {
        setStatus(statusRequest.data.status);
      }
    } catch {
      // Silenciar errores de polling
    }
  }, [documentId, statusRequest]);

  useEffect(() => {
    // Solo hacer polling si está procesando
    const shouldPoll = enabled && (status === 'pending' || status === 'processing');

    if (shouldPoll) {
      intervalRef.current = setInterval(checkStatus, pollIntervalMs);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status, enabled, pollIntervalMs, checkStatus]);

  // Sync con prop externa
  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  return {
    status,
    isProcessing: status === 'pending' || status === 'processing',
    isCompleted: status === 'completed',
    isFailed: status === 'failed',
  };
}
```

---

## 🧪 Testing

### Tests de tipos (compile-time)

Los tipos son verificados en compile-time por TypeScript. No necesitan tests de runtime, pero:

```typescript
// src/__tests__/types/ai.types.test.ts

import type { Document, AIProcessingStatus, AICategory } from '../../types/document.types';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../../types/ai.types';

describe('AI Types', () => {
  describe('Document AI fields', () => {
    it('should accept valid AI processing status', () => {
      const doc: Partial<Document> = {
        aiProcessingStatus: 'completed',
        aiCategory: 'Factura',
        aiConfidence: 0.92,
        aiTags: ['finanzas', 'iva'],
        aiSummary: 'Test summary',
        aiKeyPoints: ['Point 1'],
      };
      expect(doc.aiProcessingStatus).toBe('completed');
    });

    it('should accept null AI fields (unprocessed document)', () => {
      const doc: Partial<Document> = {
        aiProcessingStatus: 'none',
        aiCategory: null,
        aiConfidence: null,
        aiTags: [],
        aiSummary: null,
      };
      expect(doc.aiCategory).toBeNull();
    });
  });

  describe('CATEGORY_COLORS', () => {
    it('should have a color for every category', () => {
      const categories: AICategory[] = [
        'Factura', 'Contrato', 'Informe', 'Presentación',
        'Correspondencia', 'Manual técnico', 'Imagen/Fotografía',
        'Hoja de cálculo', 'Documento personal', 'Otro',
      ];
      categories.forEach(cat => {
        expect(CATEGORY_COLORS[cat]).toBeDefined();
        expect(CATEGORY_COLORS[cat]).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });

  describe('CATEGORY_ICONS', () => {
    it('should have an icon for every category', () => {
      Object.values(CATEGORY_ICONS).forEach(icon => {
        expect(icon).toMatch(/^bi-/); // Bootstrap icon
      });
    });
  });
});
```

### Tests del Hook useAI

```typescript
// src/__tests__/hooks/useAI.test.ts

import { renderHook, act } from '@testing-library/react';
import { useAI } from '../../hooks/useAI';

// Mock useHttpRequest
jest.mock('../../hooks/useHttpRequest');

describe('useAI', () => {
  it('should expose all AI methods', () => {
    const { result } = renderHook(() => useAI());

    expect(result.current.askQuestion).toBeInstanceOf(Function);
    expect(result.current.askQuestionInDocument).toBeInstanceOf(Function);
    expect(result.current.getDocumentSummary).toBeInstanceOf(Function);
    expect(result.current.regenerateSummary).toBeInstanceOf(Function);
    expect(result.current.getCategories).toBeInstanceOf(Function);
    expect(result.current.getTags).toBeInstanceOf(Function);
    expect(result.current.getStats).toBeInstanceOf(Function);
    expect(result.current.processDocument).toBeInstanceOf(Function);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should call correct endpoint for askQuestion', async () => {
    const { result } = renderHook(() => useAI());
    await act(async () => {
      await result.current.askQuestion('What is this document about?');
    });
    // Verify execute was called with POST /ai/ask
  });

  it('should set error state on failure', async () => {
    // Mock execute to throw
    const { result } = renderHook(() => useAI());
    await act(async () => {
      await result.current.askQuestion('fail');
    });
    expect(result.current.error).toBeDefined();
  });
});
```

### Tests de useAIPolling

```typescript
// src/__tests__/hooks/useAIPolling.test.ts

import { renderHook, act } from '@testing-library/react';
import { useAIPolling } from '../../hooks/useAIPolling';

jest.useFakeTimers();

describe('useAIPolling', () => {
  it('should not poll when status is none', () => {
    const { result } = renderHook(() => useAIPolling({
      documentId: 'doc1',
      initialStatus: 'none',
    }));

    expect(result.current.isProcessing).toBe(false);
  });

  it('should poll when status is pending', () => {
    renderHook(() => useAIPolling({
      documentId: 'doc1',
      initialStatus: 'pending',
    }));

    // Advance timer and verify status check was called
    act(() => jest.advanceTimersByTime(3000));
    // Verify fetch was called
  });

  it('should stop polling when status becomes completed', () => {
    const { result, rerender } = renderHook(
      (props) => useAIPolling(props),
      { initialProps: { documentId: 'doc1', initialStatus: 'pending' as const } }
    );

    expect(result.current.isProcessing).toBe(true);

    rerender({ documentId: 'doc1', initialStatus: 'completed' as const });
    expect(result.current.isCompleted).toBe(true);
    expect(result.current.isProcessing).toBe(false);
  });
});
```

---

## ✅ Criterios de Aceptación

| # | Criterio | Estado |
|---|----------|--------|
| 1 | `Document` interface incluye los 8 campos AI opcionales | ⬜ |
| 2 | Tipos `AIProcessingStatus` y `AICategory` exportados | ⬜ |
| 3 | `ai.types.ts` define todas las interfaces de respuesta (summary, Q&A, stats) | ⬜ |
| 4 | `CATEGORY_COLORS` y `CATEGORY_ICONS` cubren las 10 categorías | ⬜ |
| 5 | Hook `useAI()` expone 8 métodos y estado isLoading/error | ⬜ |
| 6 | Hook `useAIPolling()` hace polling cada 3s durante processing | ⬜ |
| 7 | Polling se detiene automáticamente cuando status = completed/failed | ⬜ |
| 8 | Todos los métodos usan `useHttpRequest` (patrón existente) | ⬜ |
| 9 | No se rompe nada existente (campos AI son opcionales) | ⬜ |

---

## 📋 Tareas de Implementación

- [ ] Modificar `src/types/document.types.ts`: añadir campos AI opcionales + tipos `AIProcessingStatus`, `AICategory`
- [ ] Crear `src/types/ai.types.ts`: interfaces de respuesta, `CATEGORY_COLORS`, `CATEGORY_ICONS`
- [ ] Crear `src/hooks/useAI.ts`: hook con 8 métodos para endpoints AI
- [ ] Crear `src/hooks/useAIPolling.ts`: hook de polling de estado
- [ ] Tests de tipos
- [ ] Tests de useAI (mock useHttpRequest)
- [ ] Tests de useAIPolling (fake timers)
- [ ] Exportar nuevos tipos desde `src/types/index.ts` si existe barrel

---

## 📁 Archivos

```
src/types/document.types.ts    ← MODIFICAR: añadir campos AI
src/types/ai.types.ts          ← CREAR: tipos de respuestas AI + colores + iconos
src/hooks/useAI.ts             ← CREAR: hook principal de IA
src/hooks/useAIPolling.ts      ← CREAR: hook de polling de estado
```

---

## 🔗 RFEs Relacionadas

| RFE | Relación |
|-----|----------|
| RFE-AI-002 | Backend define los campos AI en Document model que aquí reflejamos |
| RFE-AI-003 | Backend provee endpoints /ai/categories, /ai/tags que aquí consumimos |
| RFE-AI-007 | Backend provee endpoint /ai/documents/:id/summary que aquí consumimos |
| RFE-UI-002 | Usa `Document.aiCategory`, `Document.aiTags`, `useAIPolling` |
| RFE-UI-003 | Usa `useAI().askQuestion()` |
| RFE-UI-004 | Usa `useAI().getStats()`, `getCategories()`, `getTags()` |
