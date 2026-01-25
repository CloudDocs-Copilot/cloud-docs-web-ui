# CloudsDocsCopilot - Frontend

Sistema de gestión de documentos inteligente con IA para organización automática, búsqueda avanzada y colaboración en tiempo real.

## 📋 Tabla de Contenidos


## ✨ Características

### Implementadas

### En Desarrollo


## 🛠️ Stack Tecnológico
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
**Hecho con ❤️ usando React + TypeScript + Vite**
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
# CloudsDocsCopilot - Frontend

Sistema de gestión de documentos inteligente con IA para organización automática, búsqueda avanzada y colaboración en tiempo real.

## 📋 Tabla de Contenidos

- Introducción
- Instalación
- Uso básico

## ✨ Características

- Organización automática de documentos con IA
- Búsqueda avanzada y filtrado
- Gestión de usuarios y permisos

## 🛠️ Stack Tecnológico

- React, TypeScript, Vite
- Axios, React Router, React Bootstrap

---

## 🚀 Instalación

```bash
git clone https://github.com/deivis9010/CloudsDocsCopilotFront.git
cd CloudsDocsCopilotFront/CloudsDocsCopilotFront
npm install
cp .env.example .env
npm run dev
```

## ⚙️ Configuración

- Establece `VITE_API_BASE_URL` en `.env` (por ejemplo `http://localhost:3000/api`).

## 🧪 Testing

- `npm run test` para ejecutar tests.

---

## 🤝 Contribuir

- Fork → rama feature → PR

---

**Hecho con ❤️ usando React + TypeScript + Vite**

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
# CloudsDocsCopilot - Frontend

Proyecto frontend para CloudsDocsCopilot — organiza documentos usando IA.

## Contenido

- Instalación
- Configuración
- Testing
- Contribución

## Instalación

```bash
git clone https://github.com/deivis9010/CloudsDocsCopilotFront.git
cd CloudsDocsCopilotFront/CloudsDocsCopilotFront
npm install
cp .env.example .env
npm run dev
```

## Configuración

- Ajusta `VITE_API_BASE_URL` en `.env` (ej. `http://localhost:3000/api`).

## Testing

- Ejecuta `npm run test`.

## Contribuir

- Fork → branch → PR

---

**Hecho con ❤️ usando React + TypeScript + Vite**
- ✅ Seguir las convenciones de naming

