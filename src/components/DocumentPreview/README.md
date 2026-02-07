# Document Preview System

Sistema completo de visualización de documentos para CloudDocs Web UI.

## 📋 Descripción

Sistema de preview de documentos que permite visualizar diferentes tipos de archivos sin necesidad de descargarlos. Incluye viewers especializados para PDFs, imágenes, videos, archivos de texto y código.

## ✨ Características

### Tipos de Archivos Soportados

1. **PDFs** (`application/pdf`)
   - Navegación por páginas (anterior/siguiente)
   - Control de zoom (50% - 300%)
   - Contador de páginas
   - Powered by `react-pdf` y PDF.js

2. **Imágenes** (`image/*`)
   - Zoom (25% - 500%)
   - Rotación (90°)
   - Pan/arrastre cuando hay zoom
   - Ajuste a ventana
   - Soporta: JPEG, PNG, GIF, WebP, SVG, BMP

3. **Videos** (`video/*`)
   - Player HTML5 nativo
   - Controles de reproducción (play/pause)
   - Barra de progreso
   - Control de volumen
   - Velocidad de reproducción (0.5x - 2x)
   - Pantalla completa
   - Soporta: MP4, WebM, OGG, QuickTime

4. **Audio** (`audio/*`)
   - Player HTML5 básico
   - Soporta: MP3, WAV, OGG, WebM

5. **Texto y Código** (`text/*`, código fuente)
   - Syntax highlighting con `react-syntax-highlighter`
   - Números de línea
   - Ajuste de líneas
   - Copiar al portapapeles
   - Soporta 25+ lenguajes (JS, TS, Python, Java, etc.)

6. **Office** (información, requiere descarga)
   - Word (.doc, .docx)
   - Excel (.xls, .xlsx)
   - PowerPoint (.ppt, .pptx)
   - OpenDocument (.odt, .ods, .odp)

## 🏗️ Arquitectura

```
src/
├── components/
│   └── DocumentPreview/
│       ├── DocumentPreviewModal.tsx    # Modal principal (orquestador)
│       ├── PDFViewer.tsx               # Visor de PDFs
│       ├── ImageViewer.tsx             # Visor de imágenes
│       ├── VideoPlayer.tsx             # Player de video
│       ├── TextViewer.tsx              # Visor de texto/código
│       ├── *.module.css                # Estilos por componente
│       └── index.ts                    # Barrel export
├── services/
│   └── preview.service.ts              # Lógica de detección de tipos
└── types/
    └── preview.types.ts                # Tipos TypeScript
```

## 🔧 Uso

### Desde DocumentCard (ya integrado)

El preview se activa automáticamente al hacer clic en un DocumentCard:

```tsx
// src/components/DocumentCard.tsx
<DocumentCard document={document} />
```

### Uso Manual

```tsx
import { DocumentPreviewModal } from './components/DocumentPreview';
import type { PreviewDocument } from './types/preview.types';

const MyComponent = () => {
  const [showPreview, setShowPreview] = useState(false);
  
  const document: PreviewDocument = {
    id: '123',
    filename: 'report.pdf',
    originalname: 'Annual Report 2025.pdf',
    mimeType: 'application/pdf',
    size: 1024000,
    url: 'https://api.example.com/files/123'
  };

  return (
    <>
      <button onClick={() => setShowPreview(true)}>
        Preview Document
      </button>
      
      <DocumentPreviewModal
        show={showPreview}
        onHide={() => setShowPreview(false)}
        document={document}
      />
    </>
  );
};
```

### Usar el Servicio de Preview

```tsx
import { previewService } from './services/preview.service';

// Detectar tipo de preview
const previewType = previewService.getPreviewType(document);

// Verificar si se puede previsualizar
const canPreview = previewService.canPreview(document);

// Obtener URL de preview
const url = previewService.getPreviewUrl(document);

// Obtener lenguaje de código
const language = previewService.getCodeLanguage('app.tsx'); // 'typescript'

// Formatear tamaño de archivo
const size = previewService.formatFileSize(1024000); // '1000 KB'
```

## ⚙️ Configuración

El sistema usa configuración por defecto que puede ser personalizada:

```typescript
import { PreviewService } from './services/preview.service';

const customConfig = {
  maxFileSize: 50 * 1024 * 1024, // 50 MB
  supportedImageFormats: ['image/jpeg', 'image/png'],
  // ... más opciones
};

const customPreviewService = new PreviewService(customConfig);
```

## 📦 Dependencias

- `react-pdf` - Renderizado de PDFs con PDF.js
- `react-syntax-highlighter` - Syntax highlighting para código
- `@types/react-syntax-highlighter` - Tipos TypeScript

## 🎨 Estilos

Cada viewer tiene su propio módulo CSS:

- `PDFViewer.module.css` - Fondo claro, barra de herramientas blanca
- `ImageViewer.module.css` - Fondo oscuro (#2d2d2d)
- `VideoPlayer.module.css` - Fondo negro, controles estilo media player
- `TextViewer.module.css` - Fondo oscuro, estilo editor de código
- `DocumentPreviewModal.module.css` - Modal responsive

## 📱 Responsive Design

- Modal fullscreen en dispositivos móviles (<992px)
- Toolbars adaptables con wrapping
- Controles táctiles optimizados
- Altura mínima de 500px en desktop

## 🚀 Performance

### Optimizaciones Implementadas

1. **Lazy Loading**: PDF.js carga páginas bajo demanda
2. **Memoization**: `useMemo` para cálculos costosos
3. **CDN**: PDF.js worker desde CDN de Cloudflare
4. **Event Debouncing**: Para zoom y pan en ImageViewer
5. **Code Splitting**: Componentes pueden separarse por ruta

### Tiempos de Carga Objetivo

- PDFs pequeños (<5MB): < 2 segundos
- Imágenes: < 1 segundo
- Videos: streaming progresivo
- Texto/código: < 1 segundo

## 🔒 Seguridad

- URLs de preview usan la misma autenticación que el API
- No se almacenan archivos en localStorage
- CORS configurado en el servidor
- Sanitización de nombres de archivo

## 🧪 Testing

Los componentes de preview pueden probarse con Jest:

```tsx
import { render } from '@testing-library/react';
import { DocumentPreviewModal } from './DocumentPreviewModal';

test('renders PDF viewer for PDF documents', () => {
  const document = {
    id: '1',
    filename: 'test.pdf',
    mimeType: 'application/pdf',
    size: 1024,
  };

  render(
    <DocumentPreviewModal
      show={true}
      onHide={() => {}}
      document={document}
    />
  );
  
  // Assertions...
});
```

## 📝 Notas

- **Office Documents**: Requieren conversión server-side o descarga
- **Large Files**: Archivos >100MB no tienen preview por defecto
- **Browser Support**: Requiere navegadores modernos con soporte para:
  - ES6+
  - HTML5 Video/Audio
  - FileReader API
  - Fullscreen API

## 🔮 Mejoras Futuras

- [ ] Preview de archivos Office con LibreOffice Online
- [ ] Anotaciones en PDFs
- [ ] Compartir con timestamp para videos
- [ ] OCR para imágenes escaneadas
- [ ] Preview de archivos comprimidos (ZIP)
- [ ] Caché de previews en IndexedDB
- [ ] Miniaturas generadas server-side

## 📄 Licencia

Parte del proyecto CloudDocs - MIT License
