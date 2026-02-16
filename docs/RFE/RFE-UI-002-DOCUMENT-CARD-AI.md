# RFE-UI-002: DocumentCard AI Badges + Indicador de Procesamiento

## 📋 Resumen

| Campo | Valor |
|-------|-------|
| **Fecha** | Febrero 16, 2026 |
| **Estado** | 📋 Propuesto |
| **Issues relacionadas** | [#46 (US-201)](https://github.com/CloudDocs-Copilot/cloud-docs-web-ui/issues/46), [#52 (US-205)](https://github.com/CloudDocs-Copilot/cloud-docs-web-ui/issues/52) |
| **Épica** | Inteligencia Artificial (Core MVP) |
| **Prioridad** | 🟠 Alta (P1 — visibilidad de la IA al usuario) |
| **Estimación** | 5h |
| **Repositorio** | `cloud-docs-web-ui` |

---

## 🎯 Objetivo

Enriquecer el componente `DocumentCard` existente para mostrar la metadata de IA:
1. **Badge de categoría** con color e icono (ej: 🔴 Factura)
2. **Pills de tags** (ej: finanzas, iva, 2026)
3. **Indicador de procesamiento** (spinner mientras la IA procesa)
4. **Tooltip de resumen** al hacer hover sobre la card
5. **Indicador de error** cuando el procesamiento falla

---

## 📡 Estado Actual

### DocumentCard actual (`src/components/DocumentCard.tsx`)

El componente actual muestra:
- Nombre del archivo
- Icono según tipo MIME
- Tamaño del archivo
- Fecha de subida
- Acciones (descargar, compartir, eliminar)

**No hay:** Ningún indicador de IA, categoría, tags, resumen ni estado de procesamiento.

---

## 🏗️ Diseño Visual

### Estados de la DocumentCard con IA

```
┌─────────────────────────────────────────────────┐
│ Estado: AI completado                            │
│                                                  │
│  📄 presupuesto-2026.pdf          12.5 KB       │
│                                                  │
│  [🔴 Factura]  confianza: 92%                   │
│                                                  │
│  [finanzas] [iva] [2026] [proveedor-x]          │
│                                                  │
│  💡 "Factura de servicios del proveedor X por    │
│      un total de 1.500€ con IVA incluido..."     │
│                                                  │
│  📅 Subido hace 2h    ⬇️ 🔗 🗑️                 │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Estado: AI procesando                            │
│                                                  │
│  📄 contrato-alquiler.docx        45.2 KB       │
│                                                  │
│  [⏳ Procesando IA...]                           │
│  ─────────── ▓▓▓▓░░░░░ ──────────              │
│                                                  │
│  📅 Subido hace 30s    ⬇️ 🔗 🗑️                │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Estado: AI error                                 │
│                                                  │
│  📄 scan-corrupto.pdf              0 KB         │
│                                                  │
│  [⚠️ Error IA] [🔄 Reintentar]                  │
│                                                  │
│  📅 Subido hace 1h    ⬇️ 🔗 🗑️                 │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Estado: Sin procesamiento IA                     │
│                                                  │
│  📄 notas.txt                      1.2 KB       │
│                                                  │
│  (sin cambios respecto al estado actual)        │
│                                                  │
│  📅 Subido hace 3d    ⬇️ 🔗 🗑️                 │
└─────────────────────────────────────────────────┘
```

---

## 📝 Componentes

### 1. CategoryBadge

```typescript
// CREAR src/components/AI/CategoryBadge.tsx

import React from 'react';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../../types/ai.types';
import type { AICategory } from '../../types/document.types';
import styles from './CategoryBadge.module.css';

interface CategoryBadgeProps {
  category: AICategory | string;
  confidence?: number;
  size?: 'sm' | 'md';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  confidence,
  size = 'sm',
}) => {
  const color = CATEGORY_COLORS[category] || CATEGORY_COLORS['Otro'];
  const icon = CATEGORY_ICONS[category] || CATEGORY_ICONS['Otro'];
  
  return (
    <span
      className={`${styles.badge} ${styles[size]}`}
      style={{ backgroundColor: `${color}22`, color, borderColor: `${color}55` }}
      title={confidence ? `Confianza: ${Math.round(confidence * 100)}%` : undefined}
    >
      <i className={`bi ${icon} ${styles.icon}`} />
      {category}
      {confidence !== undefined && confidence < 0.7 && (
        <span className={styles.lowConfidence}>?</span>
      )}
    </span>
  );
};
```

```css
/* src/components/AI/CategoryBadge.module.css */

.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid;
  font-weight: 500;
  white-space: nowrap;
}

.sm {
  font-size: 0.75rem;
}

.md {
  font-size: 0.85rem;
  padding: 3px 10px;
}

.icon {
  font-size: 0.8em;
}

.lowConfidence {
  font-size: 0.7em;
  opacity: 0.6;
  margin-left: 2px;
}
```

### 2. TagPills

```typescript
// CREAR src/components/AI/TagPills.tsx

import React from 'react';
import styles from './TagPills.module.css';

interface TagPillsProps {
  tags: string[];
  maxVisible?: number;
  onClick?: (tag: string) => void;
}

export const TagPills: React.FC<TagPillsProps> = ({
  tags,
  maxVisible = 4,
  onClick,
}) => {
  const visibleTags = tags.slice(0, maxVisible);
  const remaining = tags.length - maxVisible;

  return (
    <div className={styles.container}>
      {visibleTags.map((tag) => (
        <span
          key={tag}
          className={`${styles.pill} ${onClick ? styles.clickable : ''}`}
          onClick={() => onClick?.(tag)}
          role={onClick ? 'button' : undefined}
          tabIndex={onClick ? 0 : undefined}
        >
          {tag}
        </span>
      ))}
      {remaining > 0 && (
        <span className={styles.more} title={tags.slice(maxVisible).join(', ')}>
          +{remaining}
        </span>
      )}
    </div>
  );
};
```

```css
/* src/components/AI/TagPills.module.css */

.container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.pill {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 10px;
  background-color: var(--bs-light, #f8f9fa);
  color: var(--bs-secondary, #6c757d);
  font-size: 0.7rem;
  border: 1px solid var(--bs-border-color, #dee2e6);
}

.clickable {
  cursor: pointer;
}

.clickable:hover {
  background-color: var(--bs-primary, #0d6efd);
  color: white;
  border-color: var(--bs-primary, #0d6efd);
}

.more {
  display: inline-block;
  padding: 1px 6px;
  font-size: 0.7rem;
  color: var(--bs-secondary, #6c757d);
  cursor: help;
}
```

### 3. AIProcessingIndicator

```typescript
// CREAR src/components/AI/AIProcessingIndicator.tsx

import React from 'react';
import type { AIProcessingStatus } from '../../types/document.types';
import styles from './AIProcessingIndicator.module.css';

interface AIProcessingIndicatorProps {
  status: AIProcessingStatus;
  error?: string | null;
  onRetry?: () => void;
}

export const AIProcessingIndicator: React.FC<AIProcessingIndicatorProps> = ({
  status,
  error,
  onRetry,
}) => {
  switch (status) {
    case 'pending':
    case 'processing':
      return (
        <div className={styles.processing}>
          <div className={`spinner-border spinner-border-sm ${styles.spinner}`} role="status">
            <span className="visually-hidden">Procesando...</span>
          </div>
          <span className={styles.text}>
            {status === 'pending' ? 'En cola IA...' : 'Procesando IA...'}
          </span>
        </div>
      );

    case 'failed':
      return (
        <div className={styles.failed}>
          <i className="bi bi-exclamation-triangle-fill" />
          <span className={styles.text} title={error || 'Error de procesamiento'}>
            Error IA
          </span>
          {onRetry && (
            <button
              className={`btn btn-sm btn-outline-warning ${styles.retryBtn}`}
              onClick={(e) => { e.stopPropagation(); onRetry(); }}
              title="Reintentar procesamiento"
            >
              <i className="bi bi-arrow-clockwise" />
            </button>
          )}
        </div>
      );

    case 'none':
    case 'completed':
    default:
      return null;
  }
};
```

```css
/* src/components/AI/AIProcessingIndicator.module.css */

.processing {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--bs-info, #0dcaf0);
  font-size: 0.75rem;
}

.spinner {
  width: 12px;
  height: 12px;
  border-width: 2px;
}

.failed {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--bs-warning, #ffc107);
  font-size: 0.75rem;
}

.text {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.retryBtn {
  padding: 0 4px;
  font-size: 0.65rem;
  line-height: 1;
}
```

### 4. SummaryTooltip

```typescript
// CREAR src/components/AI/SummaryTooltip.tsx

import React, { useState } from 'react';
import styles from './SummaryTooltip.module.css';

interface SummaryTooltipProps {
  summary: string | null;
  keyPoints?: string[];
  children: React.ReactNode;
}

export const SummaryTooltip: React.FC<SummaryTooltipProps> = ({
  summary,
  keyPoints = [],
  children,
}) => {
  const [visible, setVisible] = useState(false);

  if (!summary) return <>{children}</>;

  return (
    <div
      className={styles.wrapper}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className={styles.tooltip}>
          <div className={styles.header}>
            <i className="bi bi-magic" /> Resumen IA
          </div>
          <p className={styles.summary}>{summary}</p>
          {keyPoints.length > 0 && (
            <ul className={styles.keyPoints}>
              {keyPoints.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
```

```css
/* src/components/AI/SummaryTooltip.module.css */

.wrapper {
  position: relative;
}

.tooltip {
  position: absolute;
  bottom: 100%;
  left: 0;
  z-index: 1000;
  width: 320px;
  max-width: 90vw;
  padding: 12px;
  background: white;
  border: 1px solid var(--bs-border-color, #dee2e6);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  margin-bottom: 8px;
}

.header {
  font-weight: 600;
  font-size: 0.8rem;
  color: var(--bs-primary, #0d6efd);
  margin-bottom: 6px;
}

.summary {
  font-size: 0.8rem;
  color: var(--bs-body-color, #212529);
  margin: 0 0 6px 0;
  line-height: 1.4;
}

.keyPoints {
  margin: 0;
  padding-left: 16px;
  font-size: 0.75rem;
  color: var(--bs-secondary, #6c757d);
}

.keyPoints li {
  margin-bottom: 2px;
}
```

---

## 🔄 Integración en DocumentCard Existente

### Modificar DocumentCard.tsx

```typescript
// Modificar src/components/DocumentCard.tsx

import { CategoryBadge } from './AI/CategoryBadge';
import { TagPills } from './AI/TagPills';
import { AIProcessingIndicator } from './AI/AIProcessingIndicator';
import { SummaryTooltip } from './AI/SummaryTooltip';
import { useAIPolling } from '../hooks/useAIPolling';
import { useAI } from '../hooks/useAI';
import type { Document } from '../types/document.types';

interface DocumentCardProps {
  document: Document;
  onTagClick?: (tag: string) => void;
  // ... props existentes
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onTagClick,
  ...existingProps
}) => {
  const { processDocument } = useAI();
  
  // Polling de estado si está procesando
  const { status } = useAIPolling({
    documentId: document._id || document.id || '',
    initialStatus: document.aiProcessingStatus,
    enabled: document.aiProcessingStatus === 'pending' || 
             document.aiProcessingStatus === 'processing',
  });

  const handleRetry = async () => {
    const docId = document._id || document.id;
    if (docId) {
      await processDocument(docId);
    }
  };

  return (
    <SummaryTooltip
      summary={document.aiSummary || null}
      keyPoints={document.aiKeyPoints}
    >
      <div className={styles.card}>
        {/* ... contenido existente de la card ... */}
        
        {/* NUEVO: Sección AI (solo si el documento tiene info AI) */}
        {status !== 'none' && (
          <div className={styles.aiSection}>
            {/* Indicador de procesamiento (si está procesando o falló) */}
            <AIProcessingIndicator
              status={status}
              error={document.aiError}
              onRetry={handleRetry}
            />

            {/* Badge de categoría (si ya se procesó) */}
            {status === 'completed' && document.aiCategory && (
              <CategoryBadge
                category={document.aiCategory}
                confidence={document.aiConfidence ?? undefined}
              />
            )}

            {/* Tag pills (si ya se procesó) */}
            {status === 'completed' && document.aiTags && document.aiTags.length > 0 && (
              <TagPills
                tags={document.aiTags}
                maxVisible={4}
                onClick={onTagClick}
              />
            )}
          </div>
        )}
      </div>
    </SummaryTooltip>
  );
};
```

### CSS para la sección AI

```css
/* Añadir a DocumentCard.module.css */

.aiSection {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--bs-border-color-translucent, rgba(0,0,0,0.08));
}
```

---

## 🧪 Testing

```typescript
describe('CategoryBadge', () => {
  it('renders category name and icon', () => {
    render(<CategoryBadge category="Factura" />);
    expect(screen.getByText('Factura')).toBeInTheDocument();
  });

  it('shows confidence tooltip', () => {
    render(<CategoryBadge category="Factura" confidence={0.92} />);
    expect(screen.getByTitle('Confianza: 92%')).toBeInTheDocument();
  });

  it('shows question mark for low confidence', () => {
    render(<CategoryBadge category="Otro" confidence={0.45} />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('uses correct color for category', () => {
    const { container } = render(<CategoryBadge category="Factura" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.style.color).toBe('#FF6B6B');
  });
});

describe('TagPills', () => {
  it('renders visible tags', () => {
    render(<TagPills tags={['finanzas', 'iva', '2026']} />);
    expect(screen.getByText('finanzas')).toBeInTheDocument();
    expect(screen.getByText('iva')).toBeInTheDocument();
    expect(screen.getByText('2026')).toBeInTheDocument();
  });

  it('truncates with +N when exceeding maxVisible', () => {
    render(<TagPills tags={['a', 'b', 'c', 'd', 'e', 'f']} maxVisible={3} />);
    expect(screen.getByText('+3')).toBeInTheDocument();
  });

  it('calls onClick when tag is clicked', () => {
    const onClick = jest.fn();
    render(<TagPills tags={['finanzas']} onClick={onClick} />);
    fireEvent.click(screen.getByText('finanzas'));
    expect(onClick).toHaveBeenCalledWith('finanzas');
  });
});

describe('AIProcessingIndicator', () => {
  it('shows spinner during processing', () => {
    render(<AIProcessingIndicator status="processing" />);
    expect(screen.getByText('Procesando IA...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument(); // spinner
  });

  it('shows error with retry button', () => {
    const onRetry = jest.fn();
    render(<AIProcessingIndicator status="failed" error="API error" onRetry={onRetry} />);
    expect(screen.getByText('Error IA')).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Reintentar procesamiento'));
    expect(onRetry).toHaveBeenCalled();
  });

  it('renders nothing for completed status', () => {
    const { container } = render(<AIProcessingIndicator status="completed" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing for none status', () => {
    const { container } = render(<AIProcessingIndicator status="none" />);
    expect(container.firstChild).toBeNull();
  });
});

describe('SummaryTooltip', () => {
  it('shows tooltip on hover', () => {
    render(
      <SummaryTooltip summary="Test summary" keyPoints={['Point 1']}>
        <div>Hover me</div>
      </SummaryTooltip>
    );
    
    fireEvent.mouseEnter(screen.getByText('Hover me'));
    expect(screen.getByText('Test summary')).toBeInTheDocument();
    expect(screen.getByText('Point 1')).toBeInTheDocument();
  });

  it('does not show tooltip when summary is null', () => {
    render(
      <SummaryTooltip summary={null}>
        <div>No tooltip</div>
      </SummaryTooltip>
    );
    
    fireEvent.mouseEnter(screen.getByText('No tooltip'));
    expect(screen.queryByText('Resumen IA')).not.toBeInTheDocument();
  });
});
```

---

## ✅ Criterios de Aceptación

| # | Criterio | Estado |
|---|----------|--------|
| 1 | DocumentCard muestra `CategoryBadge` para documentos procesados | ⬜ |
| 2 | `CategoryBadge` usa color e icono correcto por categoría | ⬜ |
| 3 | DocumentCard muestra `TagPills` con máximo 4 visibles + "+N" | ⬜ |
| 4 | Click en tag dispara evento (para búsqueda filtrada) | ⬜ |
| 5 | Spinner animado durante estado pending/processing | ⬜ |
| 6 | Botón "Reintentar" cuando estado = failed | ⬜ |
| 7 | Tooltip con resumen + keyPoints al hacer hover | ⬜ |
| 8 | Sin cambios visuales para documentos sin IA (status = none) | ⬜ |
| 9 | Polling actualiza indicador sin recargar página | ⬜ |

---

## 📋 Tareas de Implementación

- [ ] Crear `src/components/AI/CategoryBadge.tsx` + CSS Module
- [ ] Crear `src/components/AI/TagPills.tsx` + CSS Module
- [ ] Crear `src/components/AI/AIProcessingIndicator.tsx` + CSS Module
- [ ] Crear `src/components/AI/SummaryTooltip.tsx` + CSS Module
- [ ] Modificar `DocumentCard.tsx`: integrar componentes AI + useAIPolling
- [ ] Añadir `.aiSection` a `DocumentCard.module.css`
- [ ] Tests: CategoryBadge | TagPills | AIProcessingIndicator | SummaryTooltip

---

## 📁 Archivos

```
src/components/AI/                         ← CREAR directorio
├── CategoryBadge.tsx                      ← CREAR
├── CategoryBadge.module.css               ← CREAR
├── TagPills.tsx                            ← CREAR
├── TagPills.module.css                    ← CREAR
├── AIProcessingIndicator.tsx              ← CREAR
├── AIProcessingIndicator.module.css       ← CREAR
├── SummaryTooltip.tsx                     ← CREAR
└── SummaryTooltip.module.css              ← CREAR

src/components/DocumentCard.tsx            ← MODIFICAR: integrar AI components
src/components/DocumentCard.module.css     ← MODIFICAR: añadir .aiSection
```

---

## 🔗 RFEs Relacionadas

| RFE | Relación |
|-----|----------|
| RFE-UI-001 | Provee tipos Document + AI y hooks useAI/useAIPolling |
| RFE-AI-002 | Backend genera los campos AI que estos componentes muestran |
| RFE-UI-003 | TagPills onClick conecta con búsqueda filtrada |
