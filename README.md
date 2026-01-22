# CloudsDocsCopilot - Frontend

Sistema de gestión de documentos inteligente con IA para organización automática, búsqueda avanzada y colaboración en tiempo real.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Desarrollo](#desarrollo)
- [Testing](#testing)
- [Arquitectura](#arquitectura)
- [Documentación Adicional](#documentación-adicional)

---

## ✨ Características

### Implementadas
- ✅ Sistema de autenticación con cookies HTTP-only
- ✅ Protección CSRF automática (Double Submit Cookie Pattern)
- ✅ Dashboard de documentos con visualización en tiempo real
- ✅ HTTP Client configurado con Axios
- ✅ Hook personalizado `useHttpRequest` para consumo de APIs
- ✅ Sistema de tipos TypeScript completo
- ✅ Sanitización automática de datos
- ✅ Manejo centralizado de errores
- ✅ Layout responsive con Bootstrap 5
- ✅ React Router para navegación
- ✅ Testing con Jest y React Testing Library

### En Desarrollo
- 🚧 Sistema de carga de documentos
- 🚧 Búsqueda y filtrado avanzado
- 🚧 Compartición de documentos
- 🚧 Integración con IA para categorización automática

---

## 🛠️ Stack Tecnológico

### Core
- **React 19** - Librería UI con React Compiler
- **TypeScript 5.9** - Tipado estático
- **Vite 7** - Build tool y dev server

### UI/Styling
- **Bootstrap 5.3** - Framework CSS
- **React Bootstrap 2.10** - Componentes React de Bootstrap
- **CSS Modules** - Estilos modulares

### Estado y Datos
- **Axios 1.13** - Cliente HTTP
- **React Router DOM 6.30** - Enrutamiento
- **Custom Hooks** - Gestión de estado local

### Testing
- **Jest 30** - Test runner
- **React Testing Library 16** - Testing de componentes
- **@testing-library/user-event** - Simulación de interacciones

### Code Quality
- **ESLint 9** - Linting
- **TypeScript ESLint** - Reglas específicas de TS
- **React Compiler** - Optimización automática

---

## 📁 Estructura del Proyecto

```
CloudsDocsCopilotFront/
├── src/
│   ├── api/                      # Configuración de HTTP client
│   │   ├── httpClient.config.ts  # Axios instance + interceptors + CSRF
│   │   ├── dataSanitizer.ts      # Sanitización de datos
│   │   ├── index.ts              # Exports públicos
│   │   └── README.md             # 📖 Guía de uso de APIs
│   │
│   ├── components/               # Componentes reutilizables
│   │   ├── ContactForm.tsx       # Formulario de contacto
│   │   ├── DocumentCard.tsx      # Tarjeta de documento
│   │   ├── Header.tsx            # Header de navegación
│   │   ├── MainLayout.tsx        # Layout principal
│   │   └── Sidebar.tsx           # Barra lateral
│   │
│   ├── constants/                # Constantes y configuración
│   │   ├── homeFeatures.ts       # Features del home
│   │   ├── homeStats.ts          # Estadísticas
│   │   └── menuItems.ts          # Items de navegación
│   │
│   ├── context/                  # Context API
│   │   ├── PageContext.ts        # Contexto de página
│   │   └── PageProvider.tsx      # Provider de página
│   │
│   ├── hooks/                    # Custom hooks
│   │   ├── useHttpRequest.ts     # 🎯 Hook principal para APIs
│   │   ├── useFormValidation.ts  # Validación de formularios
│   │   ├── usePageContext.ts     # Acceso al contexto
│   │   ├── usePageInfoTitle.ts   # Gestión de títulos
│   │   └── __tests__/            # Tests de hooks
│   │
│   ├── pages/                    # Páginas/Vistas
│   │   ├── Dashboard.tsx         # Dashboard de documentos
│   │   └── Home.tsx              # Página de inicio
│   │
│   ├── services/                 # Servicios de negocio
│   │   ├── GetDocumentListByUser.ts  # Servicio de documentos
│   │   └── mockDocumentList.ts   # Datos mock
│   │
│   ├── types/                    # Definiciones de tipos
│   │   ├── api.types.ts          # Tipos de API
│   │   ├── category.types.ts     # Tipos de categorías
│   │   ├── document.types.ts     # Tipos de documentos
│   │   ├── page.types.ts         # Tipos de páginas
│   │   └── user.types.ts         # Tipos de usuarios
│   │
│   ├── utils/                    # Utilidades
│   ├── App.tsx                   # Componente raíz
│   └── main.tsx                  # Entry point
│
├── public/                       # Archivos estáticos
├── coverage/                     # Reportes de cobertura
├── .env.example                  # Variables de entorno de ejemplo
├── vite.config.ts               # Configuración de Vite
├── tsconfig.json                # Configuración de TypeScript
├── jest.config.ts               # Configuración de Jest
└── package.json                 # Dependencias y scripts
```

---

## 🚀 Instalación

### Prerrequisitos
- Node.js >= 18.x
- npm >= 9.x o yarn >= 1.22

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/deivis9010/CloudsDocsCopilotFront.git
cd CloudsDocsCopilotFront/CloudsDocsCopilotFront

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 4. Iniciar servidor de desarrollo
npm run dev
```

---

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# URL base de la API backend
VITE_API_BASE_URL=http://localhost:3000/api

# Otras configuraciones
VITE_APP_ENV=development
```

### Backend Required

Este frontend requiere el backend CloudsDocsCopilot configurado con:
- ✅ Autenticación basada en cookies
- ✅ Protección CSRF con `csrf-csrf`
- ✅ Cookie: `__Host-psifi.x-csrf-token`
- ✅ Header: `x-csrf-token`
- ✅ Endpoint: `/api/csrf-token`

---

## 💻 Desarrollo

### Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor dev en http://localhost:5173

# Build
npm run build            # Compila TypeScript y genera build de producción

# Preview
npm run preview          # Preview del build de producción

# Testing
npm run test             # Ejecuta tests una vez
npm run test:watch       # Ejecuta tests en modo watch
npm run test:coverage    # Genera reporte de cobertura

# Linting
npm run lint             # Ejecuta ESLint
```

### Desarrollo Local

```bash
# Terminal 1: Iniciar backend (puerto 3000)
cd ../backend
npm run dev

# Terminal 2: Iniciar frontend (puerto 5173)
npm run dev
```

El frontend estará disponible en: `http://localhost:5173`

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
npm run test

# Con watch mode
npm run test:watch

# Con cobertura
npm run test:coverage
```

### Cobertura

Los reportes de cobertura se generan en `coverage/`:
- `coverage/lcov-report/index.html` - Reporte visual HTML
- `coverage/lcov.info` - Para integraciones CI/CD

### Tests Implementados

- ✅ `useHttpRequest` - Hook de peticiones HTTP
- ✅ Data sanitization - Sanitización de datos

---

## 🏗️ Arquitectura

### Flujo de Datos

```
┌─────────────┐
│   User UI   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│   Components    │  ← useHttpRequest hook
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  HTTP Client    │  ← Axios + Interceptors + CSRF
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   Backend API   │  ← Express + MongoDB
└─────────────────┘
```

### Seguridad

#### Autenticación
- **Cookies HTTP-only**: El token de sesión se almacena en cookies seguras
- **Configuración**: `withCredentials: true` en todas las peticiones
- **Renovación automática**: El backend maneja la renovación de sesión

#### CSRF Protection
- **Patrón**: Double Submit Cookie
- **Cookie**: `__Host-psifi.x-csrf-token` (HTTP-only, Secure, SameSite=Strict)
- **Header**: `x-csrf-token` (enviado automáticamente por el interceptor)
- **Obtención**: GET `/api/csrf-token` antes de la primera petición mutante

#### Sanitización de Datos
- **Entrada**: Todos los datos se sanitizan antes de enviar al servidor
- **Salida**: Los datos recibidos también se sanitizan
- **XSS Prevention**: Eliminación de scripts y código malicioso

### Consumo de APIs

El proyecto tiene 2 formas de consumir APIs:

#### 1. `useHttpRequest` Hook (Recomendado para componentes)

```tsx
import { useHttpRequest } from '../hooks/useHttpRequest';

const { execute, data, isLoading, isError, error } = useHttpRequest<Document[]>();

useEffect(() => {
  execute({
    method: 'GET',
    url: '/api/documents/recent',
    config: { params: { userId } }
  });
}, []);
```

**Ventajas:**
- ✅ Estados automáticos (loading, error, success)
- ✅ Reintentos automáticos
- ✅ Callbacks (onSuccess, onError)
- ✅ Cancelación automática

#### 2. `apiClient` Directo (Solo para servicios/utils)

```typescript
import { apiClient } from '../api/httpClient.config';

const response = await apiClient.get('/api/documents');
```

**Usa cuando:**
- No estés en un componente React
- Operaciones batch
- Scripts de utilidad

📖 **Más detalles**: Ver [src/api/README.md](src/api/README.md)

---

## 📚 Documentación Adicional

### Guías Específicas

- **[API Usage Guide](src/api/README.md)** - Guía completa de consumo de APIs
  - Cuándo usar `useHttpRequest` vs `apiClient`
  - Ejemplos de GET, POST, PUT, DELETE
  - Manejo de errores y validaciones
  - Seguridad y CSRF

### Convenciones de Código

#### Naming
- **Components**: PascalCase - `DocumentCard.tsx`
- **Hooks**: camelCase con prefijo `use` - `useHttpRequest.ts`
- **Types**: PascalCase con sufijo - `Document`, `ApiErrorResponse`
- **Constants**: SCREAMING_SNAKE_CASE - `API_BASE_URL`

#### Imports
```typescript
// 1. React y librerías externas
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 2. Componentes internos
import { DocumentCard } from '../components/DocumentCard';

// 3. Hooks y utilidades
import { useHttpRequest } from '../hooks/useHttpRequest';

// 4. Tipos
import type { Document } from '../types/document.types';

// 5. Estilos
import styles from './Dashboard.module.css';
```

#### TypeScript
- ✅ Siempre tipar props de componentes
- ✅ Usar `type` para tipos simples, `interface` para objetos complejos
- ✅ Evitar `any`, usar `unknown` cuando sea necesario
- ✅ Usar tipos genéricos en hooks

---

## 🔧 Troubleshooting

### Error: "No se puede conectar al servidor"
**Solución**: Verifica que el backend esté corriendo en el puerto correcto (3000 por defecto)

### Error: "Invalid CSRF token"
**Solución**: El token CSRF se obtiene automáticamente. Si persiste:
1. Limpia las cookies del navegador
2. Reinicia el backend
3. Recarga la aplicación

### Error en tests: "Cannot find module"
**Solución**: 
```bash
npm install
npm run test
```

### Build falla con errores de TypeScript
**Solución**:
```bash
# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares

- ✅ Todo el código debe pasar ESLint
- ✅ Mantener cobertura de tests > 80%
- ✅ Documentar funciones complejas con JSDoc
- ✅ Usar TypeScript estricto
- ✅ Seguir las convenciones de naming

---

## 📄 Licencia

Este proyecto es privado y confidencial.

---

## 👥 Equipo

- **Owner**: [@deivis9010](https://github.com/deivis9010)

---

## 🔗 Enlaces Relacionados

- [Backend Repository](https://github.com/deivis9010/CloudsDocsCopilotBack)
- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)

---

## 📝 Changelog

### v0.0.0 (Actual)
- ✅ Setup inicial del proyecto
- ✅ Configuración de Axios con CSRF
- ✅ Hook useHttpRequest
- ✅ Dashboard básico
- ✅ Sistema de autenticación
- ✅ Testing setup

---

**Hecho con ❤️ usando React + TypeScript + Vite**
