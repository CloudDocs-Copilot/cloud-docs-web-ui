# RFE-UI-004: Sección AI en Dashboard — Estadísticas Reales

## 📋 Resumen

| Campo | Valor |
|-------|-------|
| **Fecha** | Febrero 16, 2026 |
| **Estado** | 📋 Propuesto |
| **Issues relacionadas** | [#46 (US-201)](https://github.com/CloudDocs-Copilot/cloud-docs-web-ui/issues/46), [#52 (US-205)](https://github.com/CloudDocs-Copilot/cloud-docs-web-ui/issues/52) |
| **Épica** | Inteligencia Artificial (Core MVP) |
| **Prioridad** | 🟡 Media (P2 — UX dashboard) |
| **Estimación** | 5h |
| **Repositorio** | `cloud-docs-web-ui` |

---

## 🎯 Objetivo

Reemplazar las estadísticas hardcoded/fake del Dashboard con datos reales de IA:

1. **Distribución por categoría** — donut chart o barra horizontal con conteo por categoría AI
2. **Nube de tags** — tags más frecuentes con tamaño proporcional al conteo
3. **Estado de procesamiento** — cuántos docs procesados / pendientes / fallidos
4. **Actividad reciente de IA** — últimos documentos procesados con su categoría

---

## 📡 Estado Actual

### Dashboard actual (`src/pages/Dashboard.tsx`)

El dashboard actual tiene:
- Conteo de documentos por tipo de archivo
- Lista de documentos recientes
- Stats de almacenamiento

**El sidebar tiene un link "Colecciones Inteligentes" que lleva a un 404.**

Las estadísticas mostradas son basadas en metadata de archivo (mimeType, size), no en análisis de IA.

---

## 🏗️ Diseño Visual

### Layout de la sección AI

```
┌────────────────────────────────────────────────────────────────────────┐
│  Dashboard                                                             │
│                                                                        │
│  ┌── Estadísticas existentes (sin cambios) ──────────────────────┐    │
│  │  📄 12 documentos  │  💾 45.2 MB  │  📁 3 carpetas           │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                        │
│  ┌── NUEVA SECCIÓN: Inteligencia Artificial ─────────────────────┐    │
│  │                                                                │    │
│  │  ┌─ Estado IA ──────────┐  ┌─ Categorías ──────────────────┐ │    │
│  │  │                      │  │                                │ │    │
│  │  │  ✅ 10 procesados    │  │  ████████ Factura        (5)  │ │    │
│  │  │  ⏳  2 pendientes    │  │  ██████   Contrato       (3)  │ │    │
│  │  │  ❌  0 fallidos      │  │  ████     Informe        (2)  │ │    │
│  │  │                      │  │  ██       Otro           (2)  │ │    │
│  │  └──────────────────────┘  └────────────────────────────────┘ │    │
│  │                                                                │    │
│  │  ┌─ Tags Frecuentes ──────────────────────────────────────┐   │    │
│  │  │                                                         │   │    │
│  │  │   finanzas(15)  proveedor(8)  2026(12)  iva(7)         │   │    │
│  │  │   contrato(6)  servicios(5)  alquiler(4)  legal(3)    │   │    │
│  │  │                                                         │   │    │
│  │  └─────────────────────────────────────────────────────────┘   │    │
│  │                                                                │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📝 Componentes

### 1. AIDashboardSection (contenedor)

```typescript
// CREAR src/components/AI/AIDashboardSection.tsx

import React, { useEffect, useState } from 'react';
import { AIStatsCard } from './AIStatsCard';
import { AICategoryChart } from './AICategoryChart';
import { AITagCloud } from './AITagCloud';
import { useAI } from '../../hooks/useAI';
import type { AIStatsResponse } from '../../types/ai.types';
import styles from './AIDashboardSection.module.css';

export const AIDashboardSection: React.FC = () => {
  const { getStats, isLoading, error } = useAI();
  const [stats, setStats] = useState<AIStatsResponse | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const data = await getStats();
      setStats(data);
    };
    fetchStats();
  }, [getStats]);

  // Si no hay nada procesado, no mostrar sección
  const totalDocs = stats
    ? stats.totalProcessed + stats.totalFailed + stats.totalPending
    : 0;

  if (!isLoading && totalDocs === 0) {
    return null; // No mostrar sección AI si no hay documentos procesados
  }

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h5 className={styles.title}>
          <i className="bi bi-stars" /> Inteligencia Artificial
        </h5>
      </div>

      {isLoading && (
        <div className={styles.loading}>
          <div className="spinner-border spinner-border-sm" />
          Cargando estadísticas IA...
        </div>
      )}

      {error && (
        <div className="alert alert-warning" role="alert">
          <i className="bi bi-exclamation-triangle" /> {error}
        </div>
      )}

      {stats && (
        <div className={styles.grid}>
          <AIStatsCard stats={stats} />
          <AICategoryChart categories={stats.categoryCounts} />
          <AITagCloud tags={stats.topTags} />
        </div>
      )}
    </div>
  );
};
```

```css
/* src/components/AI/AIDashboardSection.module.css */

.section {
  margin-top: 24px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  border: 1px solid var(--bs-border-color, #dee2e6);
}

.header {
  margin-bottom: 16px;
}

.title {
  font-size: 1.1rem;
  color: var(--bs-body-color, #212529);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title i {
  color: var(--bs-purple, #6f42c1);
}

.loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  color: var(--bs-secondary, #6c757d);
  font-size: 0.85rem;
}

.grid {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-rows: auto auto;
  gap: 16px;
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

### 2. AIStatsCard

```typescript
// CREAR src/components/AI/AIStatsCard.tsx

import React from 'react';
import type { AIStatsResponse } from '../../types/ai.types';
import styles from './AIStatsCard.module.css';

interface AIStatsCardProps {
  stats: AIStatsResponse;
}

export const AIStatsCard: React.FC<AIStatsCardProps> = ({ stats }) => {
  const total = stats.totalProcessed + stats.totalFailed + stats.totalPending;

  return (
    <div className={styles.card}>
      <div className={styles.title}>Estado IA</div>
      
      <div className={styles.stat}>
        <span className={`${styles.dot} ${styles.completed}`} />
        <span className={styles.label}>Procesados</span>
        <span className={styles.value}>{stats.totalProcessed}</span>
      </div>

      <div className={styles.stat}>
        <span className={`${styles.dot} ${styles.pending}`} />
        <span className={styles.label}>Pendientes</span>
        <span className={styles.value}>{stats.totalPending}</span>
      </div>

      <div className={styles.stat}>
        <span className={`${styles.dot} ${styles.failed}`} />
        <span className={styles.label}>Fallidos</span>
        <span className={styles.value}>{stats.totalFailed}</span>
      </div>

      {total > 0 && (
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${(stats.totalProcessed / total) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
};
```

```css
/* src/components/AI/AIStatsCard.module.css */

.card {
  padding: 12px;
  background: var(--bs-light, #f8f9fa);
  border-radius: 8px;
  grid-row: 1 / 3;
}

.title {
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 12px;
  color: var(--bs-body-color, #212529);
}

.stat {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 0.8rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.completed { background-color: var(--bs-success, #198754); }
.pending { background-color: var(--bs-info, #0dcaf0); }
.failed { background-color: var(--bs-warning, #ffc107); }

.label {
  flex: 1;
  color: var(--bs-secondary, #6c757d);
}

.value {
  font-weight: 600;
  color: var(--bs-body-color, #212529);
}

.progressBar {
  margin-top: 12px;
  height: 4px;
  background: var(--bs-border-color, #dee2e6);
  border-radius: 2px;
  overflow: hidden;
}

.progressFill {
  height: 100%;
  background: var(--bs-success, #198754);
  border-radius: 2px;
  transition: width 0.3s ease;
}
```

### 3. AICategoryChart

```typescript
// CREAR src/components/AI/AICategoryChart.tsx

import React from 'react';
import { CATEGORY_COLORS } from '../../types/ai.types';
import type { AICategoryAggregation } from '../../types/ai.types';
import styles from './AICategoryChart.module.css';

interface AICategoryChartProps {
  categories: AICategoryAggregation[];
}

export const AICategoryChart: React.FC<AICategoryChartProps> = ({ categories }) => {
  if (categories.length === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.title}>Categorías</div>
        <div className={styles.empty}>Sin documentos clasificados</div>
      </div>
    );
  }

  const maxCount = Math.max(...categories.map(c => c.count));

  return (
    <div className={styles.card}>
      <div className={styles.title}>Documentos por Categoría</div>
      <div className={styles.chart}>
        {categories.map(({ category, count }) => {
          const color = CATEGORY_COLORS[category] || CATEGORY_COLORS['Otro'];
          const width = (count / maxCount) * 100;

          return (
            <div key={category} className={styles.row}>
              <span className={styles.label}>{category}</span>
              <div className={styles.barContainer}>
                <div
                  className={styles.bar}
                  style={{ width: `${width}%`, backgroundColor: color }}
                />
              </div>
              <span className={styles.count}>({count})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

```css
/* src/components/AI/AICategoryChart.module.css */

.card {
  padding: 12px;
  background: var(--bs-light, #f8f9fa);
  border-radius: 8px;
}

.title {
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 12px;
  color: var(--bs-body-color, #212529);
}

.chart {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  width: 120px;
  font-size: 0.75rem;
  color: var(--bs-secondary, #6c757d);
  text-align: right;
  flex-shrink: 0;
}

.barContainer {
  flex: 1;
  height: 16px;
  background: var(--bs-border-color-translucent, rgba(0,0,0,0.05));
  border-radius: 4px;
  overflow: hidden;
}

.bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
  min-width: 4px;
}

.count {
  width: 35px;
  font-size: 0.7rem;
  color: var(--bs-secondary, #6c757d);
  flex-shrink: 0;
}

.empty {
  padding: 16px;
  text-align: center;
  color: var(--bs-secondary, #6c757d);
  font-size: 0.8rem;
}
```

### 4. AITagCloud

```typescript
// CREAR src/components/AI/AITagCloud.tsx

import React from 'react';
import type { AITagAggregation } from '../../types/ai.types';
import styles from './AITagCloud.module.css';

interface AITagCloudProps {
  tags: AITagAggregation[];
  onTagClick?: (tag: string) => void;
}

export const AITagCloud: React.FC<AITagCloudProps> = ({ tags, onTagClick }) => {
  if (tags.length === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.title}>Tags Frecuentes</div>
        <div className={styles.empty}>Sin tags disponibles</div>
      </div>
    );
  }

  const maxCount = Math.max(...tags.map(t => t.count));
  const minCount = Math.min(...tags.map(t => t.count));

  const getSize = (count: number): string => {
    if (maxCount === minCount) return '0.85rem';
    const normalized = (count - minCount) / (maxCount - minCount);
    const minSize = 0.7;
    const maxSize = 1.4;
    return `${minSize + normalized * (maxSize - minSize)}rem`;
  };

  const getOpacity = (count: number): number => {
    if (maxCount === minCount) return 1;
    const normalized = (count - minCount) / (maxCount - minCount);
    return 0.5 + normalized * 0.5;
  };

  return (
    <div className={styles.card}>
      <div className={styles.title}>Tags Frecuentes</div>
      <div className={styles.cloud}>
        {tags.map(({ tag, count }) => (
          <span
            key={tag}
            className={`${styles.tag} ${onTagClick ? styles.clickable : ''}`}
            style={{
              fontSize: getSize(count),
              opacity: getOpacity(count),
            }}
            onClick={() => onTagClick?.(tag)}
            title={`${tag}: ${count} documento${count !== 1 ? 's' : ''}`}
            role={onTagClick ? 'button' : undefined}
            tabIndex={onTagClick ? 0 : undefined}
          >
            {tag}
            <sup className={styles.count}>{count}</sup>
          </span>
        ))}
      </div>
    </div>
  );
};
```

```css
/* src/components/AI/AITagCloud.module.css */

.card {
  padding: 12px;
  background: var(--bs-light, #f8f9fa);
  border-radius: 8px;
}

.title {
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 12px;
  color: var(--bs-body-color, #212529);
}

.cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: baseline;
}

.tag {
  color: var(--bs-primary, #0d6efd);
  font-weight: 500;
  transition: color 0.15s;
  white-space: nowrap;
}

.clickable {
  cursor: pointer;
}

.clickable:hover {
  color: var(--bs-purple, #6f42c1);
  text-decoration: underline;
}

.count {
  font-size: 0.6em;
  color: var(--bs-secondary, #6c757d);
  font-weight: 400;
  margin-left: 1px;
}

.empty {
  padding: 16px;
  text-align: center;
  color: var(--bs-secondary, #6c757d);
  font-size: 0.8rem;
}
```

---

## 🔄 Integración en Dashboard

```typescript
// Modificar src/pages/Dashboard.tsx

import { AIDashboardSection } from '../components/AI/AIDashboardSection';

// En el JSX, después de las estadísticas existentes:
return (
  <div>
    {/* ... estadísticas existentes ... */}
    
    {/* NUEVA SECCIÓN: Dashboard IA */}
    <AIDashboardSection />
    
    {/* ... documentos recientes existentes ... */}
  </div>
);
```

### Fix del link "Colecciones Inteligentes"

El sidebar tiene un link muerto a "Colecciones Inteligentes". Para el MVP, redirigir al Dashboard (donde ahora sí hay stats de IA):

```typescript
// Modificar src/components/Sidebar.tsx
// Cambiar el link de Colecciones Inteligentes para que apunte a /dashboard
// O eliminarlo si no se va a implementar una página dedicada en el MVP
```

---

## 🧪 Testing

```typescript
describe('AIDashboardSection', () => {
  it('renders stats when data is available', async () => {
    // Mock useAI to return stats
    render(<AIDashboardSection />);
    
    await waitFor(() => {
      expect(screen.getByText('Inteligencia Artificial')).toBeInTheDocument();
      expect(screen.getByText('Procesados')).toBeInTheDocument();
    });
  });

  it('does not render when no documents are processed', async () => {
    // Mock useAI to return empty stats
    const { container } = render(<AIDashboardSection />);
    
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('shows error alert when API fails', async () => {
    // Mock useAI to return error
    render(<AIDashboardSection />);
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});

describe('AIStatsCard', () => {
  it('renders processing counts', () => {
    const stats = {
      totalProcessed: 10,
      totalFailed: 1,
      totalPending: 2,
      categoryCounts: [],
      topTags: [],
    };

    render(<AIStatsCard stats={stats} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('shows progress bar proportional to processed', () => {
    const stats = {
      totalProcessed: 8,
      totalFailed: 1,
      totalPending: 1,
      categoryCounts: [],
      topTags: [],
    };

    const { container } = render(<AIStatsCard stats={stats} />);
    const fill = container.querySelector('[class*="progressFill"]') as HTMLElement;
    expect(fill.style.width).toBe('80%');
  });
});

describe('AICategoryChart', () => {
  it('renders category bars', () => {
    const categories = [
      { category: 'Factura', count: 5 },
      { category: 'Contrato', count: 3 },
    ];

    render(<AICategoryChart categories={categories} />);
    expect(screen.getByText('Factura')).toBeInTheDocument();
    expect(screen.getByText('(5)')).toBeInTheDocument();
    expect(screen.getByText('Contrato')).toBeInTheDocument();
  });

  it('shows empty state when no categories', () => {
    render(<AICategoryChart categories={[]} />);
    expect(screen.getByText('Sin documentos clasificados')).toBeInTheDocument();
  });
});

describe('AITagCloud', () => {
  it('renders tags with proportional sizes', () => {
    const tags = [
      { tag: 'finanzas', count: 15 },
      { tag: 'iva', count: 7 },
      { tag: 'legal', count: 3 },
    ];

    render(<AITagCloud tags={tags} />);
    expect(screen.getByText('finanzas')).toBeInTheDocument();
    
    // finanzas should be the largest
    const finanzasEl = screen.getByText('finanzas');
    const legalEl = screen.getByText('legal');
    const finanzasSize = parseFloat(finanzasEl.style.fontSize);
    const legalSize = parseFloat(legalEl.style.fontSize);
    expect(finanzasSize).toBeGreaterThan(legalSize);
  });

  it('calls onTagClick when tag is clicked', () => {
    const onClick = jest.fn();
    render(<AITagCloud tags={[{ tag: 'test', count: 1 }]} onTagClick={onClick} />);
    fireEvent.click(screen.getByText('test'));
    expect(onClick).toHaveBeenCalledWith('test');
  });

  it('shows tooltip with count', () => {
    render(<AITagCloud tags={[{ tag: 'test', count: 5 }]} />);
    expect(screen.getByTitle('test: 5 documentos')).toBeInTheDocument();
  });
});
```

---

## ✅ Criterios de Aceptación

| # | Criterio | Estado |
|---|----------|--------|
| 1 | Sección AI aparece en Dashboard cuando hay documentos procesados | ⬜ |
| 2 | No aparece si no hay ningún documento procesado por IA | ⬜ |
| 3 | AIStatsCard muestra contadores reales (procesados/pendientes/fallidos) | ⬜ |
| 4 | AICategoryChart muestra barras horizontales con colores por categoría | ⬜ |
| 5 | AITagCloud muestra tags con tamaño proporcional a frecuencia | ⬜ |
| 6 | Click en tag en el cloud busca documentos con ese tag | ⬜ |
| 7 | Progress bar muestra proporción de documentos procesados | ⬜ |
| 8 | Datos vienen del endpoint GET /api/ai/stats (no fake/hardcoded) | ⬜ |
| 9 | Loading y error states funcionan correctamente | ⬜ |

---

## 📋 Tareas de Implementación

- [ ] Crear `src/components/AI/AIDashboardSection.tsx` + CSS Module
- [ ] Crear `src/components/AI/AIStatsCard.tsx` + CSS Module
- [ ] Crear `src/components/AI/AICategoryChart.tsx` + CSS Module
- [ ] Crear `src/components/AI/AITagCloud.tsx` + CSS Module
- [ ] Modificar `Dashboard.tsx`: añadir `<AIDashboardSection />`
- [ ] Fix link "Colecciones Inteligentes" en Sidebar (redirigir o eliminar)
- [ ] Tests: AIDashboardSection | AIStatsCard | AICategoryChart | AITagCloud

---

## 📁 Archivos

```
src/components/AI/                      ← AMPLIAR directorio (ya creado en RFE-UI-002)
├── AIDashboardSection.tsx              ← CREAR
├── AIDashboardSection.module.css       ← CREAR
├── AIStatsCard.tsx                     ← CREAR
├── AIStatsCard.module.css              ← CREAR
├── AICategoryChart.tsx                 ← CREAR
├── AICategoryChart.module.css          ← CREAR
├── AITagCloud.tsx                      ← CREAR
└── AITagCloud.module.css               ← CREAR

src/pages/Dashboard.tsx                 ← MODIFICAR: añadir AIDashboardSection
src/components/Sidebar.tsx              ← MODIFICAR: fix link Colecciones Inteligentes
```

---

## 🔗 RFEs Relacionadas

| RFE | Relación |
|-----|----------|
| RFE-UI-001 | Provee useAI().getStats(), tipos AIStatsResponse |
| RFE-AI-003 | Backend provee endpoints /ai/categories, /ai/tags, /ai/stats |
| RFE-UI-002 | Comparte directorio components/AI/ |
| RFE-UI-003 | Click en tag conecta con SearchContainer |
