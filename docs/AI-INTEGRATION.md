# Integración de IA en CloudDocs Web UI

## Estado Actual

La funcionalidad de IA está **completamente implementada en el backend** (API REST bajo `/api/ai`), pero la integración en el frontend está en **fase de diseño** con RFE (Request for Enhancement) detallados.

### Backend: Endpoints Disponibles

Todos los endpoints requieren autenticación (`Authorization: Bearer <token>`) y están bajo `/api/ai`:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/ai/ask` | Preguntar sobre todos los documentos de la organización (RAG) |
| `POST` | `/ai/documents/:id/ask` | Preguntar sobre un documento específico |
| `GET` | `/ai/documents/:id/extract-text` | Extraer texto de un documento |
| `POST` | `/ai/documents/:id/process` | Procesar documento (chunking + embeddings) |
| `DELETE` | `/ai/documents/:id/chunks` | Eliminar chunks procesados |
| `POST` | `/ai/documents/:id/classify` | Clasificar documento (categoría, confianza, tags) |
| `POST` | `/ai/documents/:id/summarize` | Resumir documento (resumen + puntos clave) |

> Ver [documentación completa del módulo de IA del backend](../../cloud-docs-api-service/docs/AI-MODULE.md) para detalles de request/response.

### Frontend: Plan de Implementación

La integración frontend se divide en 4 RFEs secuenciales:

```
RFE-UI-001 (Fundación - tipos, servicio, hooks)
    │
    ├── RFE-UI-002 (DocumentCard con badges IA)
    │
    ├── RFE-UI-003 (Barra búsqueda + modo Q&A)
    │
    └── RFE-UI-004 (Dashboard con estadísticas IA)
```

#### RFE-UI-001: Tipos, Servicio y Hooks (Bloqueante)

Crea la base necesaria para todas las funcionalidades de IA en el frontend:

- **`ai.types.ts`**: Tipos TypeScript para respuestas IA
- **`ai.service.ts`**: Funciones de llamada a la API
- **`useAI` hook**: Estado y acciones para operaciones IA
- **`useAIPolling` hook**: Polling del estado de procesamiento

[Ver detalle completo →](RFE/RFE-UI-001-AI-TYPES-SERVICE.md)

#### RFE-UI-002: DocumentCard con IA

Extiende `DocumentCard` con indicadores visuales de IA:

- Badge de categoría IA
- Tags de clasificación
- Tooltip con resumen
- Spinner de procesamiento
- Indicador de errores

[Ver detalle completo →](RFE/RFE-UI-002-DOCUMENT-CARD-AI.md)

#### RFE-UI-003: Barra de Búsqueda + Q&A

Activa la barra de búsqueda del Header con modo dual:

- Búsqueda normal (ya existente)
- Modo Q&A con prefijo `?` que usa RAG
- Panel de resultados con highlights
- Filtros por categoría y tags IA

[Ver detalle completo →](RFE/RFE-UI-003-SEARCH-BAR-QA.md)

#### RFE-UI-004: Dashboard de IA

Añade sección de estadísticas IA al Dashboard:

- Distribución de categorías (gráfico)
- Nube de tags
- Contadores de estado de procesamiento
- Actividad reciente de IA

[Ver detalle completo →](RFE/RFE-UI-004-AI-DASHBOARD.md)

## Configuración Necesaria

El frontend **no necesita variables de entorno adicionales** para IA. Toda la configuración de IA reside en el backend.

La única variable necesaria es `VITE_API_BASE_URL` apuntando al backend:

```bash
# .env.example (ya configurado)
VITE_API_BASE_URL=http://localhost:4000/api
```

## Dependencias Futuras

Cuando se implementen los RFEs de IA, se anticipan estas dependencias adicionales:

| Paquete | Propósito | RFE |
|---------|-----------|-----|
| `react-markdown` | Renderizar respuestas IA en markdown | RFE-UI-003 |
| `chart.js` / `recharts` | Gráficos de distribución de categorías | RFE-UI-004 |
