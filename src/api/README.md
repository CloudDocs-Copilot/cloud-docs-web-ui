# API Client & HTTP Request Hook - Usage Guide

Esta guía explica cómo consumir APIs en el proyecto usando las herramientas disponibles.

## 📋 Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [useHttpRequest Hook](#usehttprequest-hook)
- [apiClient Directo](#apiclient-directo)
- [Cuándo usar cada uno](#cuándo-usar-cada-uno)
- [Ejemplos Completos](#ejemplos-completos)

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────┐
│   httpClient.config.ts          │  ← Configuración base de Axios
│   - Interceptors                │     - Autenticación con cookies
│   - CSRF token management       │     - Manejo global de errores
│   - Error handling              │     - Timeout & retry logic
└────────────┬────────────────────┘
             │
             ├─────────────────────────────────┐
             │                                 │
             ▼                                 ▼
┌─────────────────────────────┐   ┌──────────────────────────┐
│   useHttpRequest Hook       │   │   apiClient (directo)    │
│   (Para componentes React)  │   │   (Para servicios/utils) │
└────────────┬────────────────┘   └────────┬─────────────────┘
             │                              │
             ▼                              ▼
┌─────────────────────────────┐   ┌──────────────────────────┐
│   Dashboard.tsx             │   │   uploadService.ts       │
│   UserProfile.tsx           │   │   exportUtils.ts         │
│   DocumentList.tsx          │   │   migrationScripts.ts    │
└─────────────────────────────┘   └──────────────────────────┘
```

---

## 🎣 useHttpRequest Hook

### **Cuándo usarlo:**
✅ **SIEMPRE en componentes React** (recomendado)
- Obtener datos al cargar un componente
- Enviar formularios
- Actualizaciones en tiempo real
- Operaciones CRUD desde la UI

### **Ventajas:**
- ✅ Manejo automático de estados (loading, error, success)
- ✅ Reintentos automáticos configurables
- ✅ Sanitización de datos
- ✅ Cancelación de peticiones al desmontar
- ✅ Callbacks onSuccess/onError/onSettled
- ✅ Validaciones personalizadas

### **Uso Básico:**

```tsx
import { useHttpRequest } from '../hooks/useHttpRequest';
import type { User } from '../types/user.types';

const MyComponent: React.FC = () => {
  const { execute, data, isLoading, isError, error } = useHttpRequest<User[]>();

  useEffect(() => {
    execute({
      method: 'GET',
      url: '/users'
    });
  }, []);

  if (isLoading) return <Spinner />;
  if (isError) return <Alert>{error?.message}</Alert>;

  return (
    <ul>
      {data?.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
};
```

### **Uso Avanzado con Callbacks:**

```tsx
const { execute, data, isLoading, isError, error } = useHttpRequest<User>({
  onSuccess: (data) => {
    toast.success(`User ${data.name} created successfully!`);
    navigate('/users');
  },
  onError: (error) => {
    toast.error(error.message);
  },
  retry: 3, // Reintentar 3 veces en caso de error 5xx
  retryDelay: 1000, // Esperar 1 segundo entre reintentos
});

const handleSubmit = async (formData: CreateUserDto) => {
  await execute({
    method: 'POST',
    url: '/users',
    data: formData
  });
};
```

### **GET con Parámetros:**

```tsx
const { execute, data } = useHttpRequest<Document[]>();

useEffect(() => {
  const userId = localStorage.getItem('userId');
  
    execute({
      method: 'GET',
      url: '/documents/recent',
      config: {
        params: { userId }
      }
    });
}, []);
```

### **POST/PUT/PATCH con Datos:**

```tsx
const { execute, isLoading } = useHttpRequest<Document>();

const handleUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  await execute({
    method: 'POST',
    url: '/documents/upload',
    data: formData,
    config: {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  });
};
```

### **DELETE:**

```tsx
const { execute, isLoading } = useHttpRequest<void>();

const handleDelete = async (documentId: string) => {
  if (confirm('¿Eliminar documento?')) {
    await execute({
      method: 'DELETE',
      url: `/documents/${documentId}`
    });
  }
};
```

---

## 🔧 apiClient Directo

### **Cuándo usarlo:**
✅ **Solo para casos especiales:**
- Servicios de utilidad fuera de componentes React
- Scripts de migración/importación
- Funciones helpers que no necesitan UI state
- Testing (mocking)

### **Ventajas:**
- ✅ Más ligero (sin overhead de React)
- ✅ Útil para operaciones batch
- ✅ Ideal para scripts/utilidades

### **Desventajas:**
- ❌ No maneja estados de loading/error automáticamente
- ❌ No se integra con React lifecycle
- ❌ Requiere manejo manual de errores

### **Uso Básico:**

```typescript
import { apiClient } from '../api/httpClient.config';
import type { Document } from '../types/document.types';

/**
 * Servicio para exportar documentos (no requiere UI state)
 */
export const exportDocumentsToCSV = async (userId: string): Promise<Blob> => {
  try {
    const response = await apiClient.get<Blob>('/documents/export', {
      params: { userId },
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    console.error('Error exporting documents:', error);
    throw error;
  }
};
```

### **POST con apiClient:**

```typescript
import { apiClient, sanitizeData } from '../api';
import type { CreateDocumentDto, Document } from '../types/document.types';

export const createDocumentInBackground = async (
  data: CreateDocumentDto
): Promise<Document> => {
  try {
    const sanitizedData = sanitizeData(data);
    
    const response = await apiClient.post<Document>(
      '/documents',
      sanitizedData
    );
    
    return response.data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error creating document:', errorMessage);
    throw error;
  }
};
```

### **Operaciones Batch:**

```typescript
/**
 * Importa múltiples documentos (operación batch)
 */
export const importDocumentsBatch = async (
  documents: CreateDocumentDto[]
): Promise<{ success: number; failed: number }> => {
  let success = 0;
  let failed = 0;

  for (const doc of documents) {
    try {
      await apiClient.post('/documents', sanitizeData(doc));
      success++;
    } catch (error) {
      console.error('Failed to import:', doc, error);
      failed++;
    }
  }

  return { success, failed };
};
```

---

## 🤔 Cuándo usar cada uno

### **Usa `useHttpRequest` cuando:**
- ✅ Estás en un componente React
- ✅ Necesitas mostrar estados de loading/error en la UI
- ✅ Quieres callbacks automáticos (onSuccess, onError)
- ✅ Necesitas reintentos automáticos
- ✅ La operación es iniciada por el usuario (clicks, formularios)

**Ejemplo:** Dashboard, Formularios, Listas de datos, Perfiles

### **Usa `apiClient` cuando:**
- ✅ Estás en un servicio/utilidad fuera de React
- ✅ No necesitas UI state (loading, error)
- ✅ Operaciones batch o background
- ✅ Scripts de migración/importación
- ✅ Helpers puros (sin interacción con UI)

**Ejemplo:** Exportadores, Importadores batch, Workers, Scripts

---

## 📚 Ejemplos Completos

### Ejemplo 1: Dashboard Component (useHttpRequest)

```tsx
import React, { useEffect } from 'react';
import { useHttpRequest } from '../hooks/useHttpRequest';
import type { Document } from '../types/document.types';

const Dashboard: React.FC = () => {
  const { execute, data: documents, isLoading, isError, error } = useHttpRequest<Document[]>({
    onSuccess: (data) => {
      console.log('Documents loaded successfully:', data.length);
    },
    onError: (error) => {
      console.error('Error loading documents:', error.message);
    }
  });

  useEffect(() => {
    const userId = localStorage.getItem('userId') || 'default-user';
    
    execute({
      method: 'GET',
      url: '/documents/recent',
      config: {
        params: { userId }
      }
    });
  }, []);

  if (isLoading) return <Spinner />;
  if (isError) return <Alert variant="danger">{error?.message}</Alert>;

  return (
    <div>
      {documents?.map(doc => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  );
};
```

### Ejemplo 2: Servicio de Exportación (apiClient)

```typescript
// services/exportService.ts
import { apiClient } from '../api/httpClient.config';

/**
 * Exporta documentos a PDF (operación en background)
 */
export const exportDocumentsToPDF = async (
  documentIds: string[]
): Promise<Blob> => {
  try {
    const response = await apiClient.post<Blob>(
      '/documents/export/pdf',
      { documentIds },
      { responseType: 'blob' }
    );
    
    // Crear descarga automática
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `documents-${Date.now()}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    return response.data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error exporting to PDF:', errorMessage);
    throw error;
  }
};
```

### Ejemplo 3: Formulario con Validación (useHttpRequest)

```tsx
import React, { useState } from 'react';
import { useHttpRequest } from '../hooks/useHttpRequest';
import type { CreateUserDto, User } from '../types/user.types';

const CreateUserForm: React.FC = () => {
  const [formData, setFormData] = useState<CreateUserDto>({
    name: '',
    email: '',
    role: 'user'
  });

  const { execute, isLoading, isError, error } = useHttpRequest<User>({
    onSuccess: (user) => {
      toast.success(`User ${user.name} created!`);
      setFormData({ name: '', email: '', role: 'user' });
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await execute({
      method: 'POST',
      url: '/users',
      data: formData
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        placeholder="Name"
        required
      />
      <input 
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        placeholder="Email"
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create User'}
      </button>
      {isError && <p className="error">{error?.message}</p>}
    </form>
  );
};
```

---

## 🔐 Seguridad y CSRF

El sistema maneja automáticamente:

- ✅ **Cookies httpOnly**: El token de autenticación se envía automáticamente
- ✅ **Token CSRF**: Se obtiene y envía automáticamente en POST/PUT/PATCH/DELETE
- ✅ **Cookie CSRF**: `__Host-psifi.x-csrf-token` se envía en todas las peticiones
- ✅ **Header CSRF**: `x-csrf-token` se añade automáticamente

**No necesitas preocuparte por:**
- ❌ Gestión manual de tokens
- ❌ Headers de autenticación
- ❌ Almacenamiento de credenciales

---

## 📝 Resumen

| Característica | useHttpRequest | apiClient |
|---|---|---|
| Uso en componentes React | ✅ Recomendado | ❌ No recomendado |
| Estados (loading, error) | ✅ Automático | ❌ Manual |
| Reintentos automáticos | ✅ Sí | ❌ No |
| Callbacks (onSuccess, onError) | ✅ Sí | ❌ No |
| Cancelación automática | ✅ Sí (al desmontar) | ❌ Manual |
| Servicios/Utilities | ❌ Excesivo | ✅ Perfecto |
| Operaciones batch | ❌ No ideal | ✅ Ideal |
| Testing/Mocking | ⚠️ Complejo | ✅ Simple |

---

## 🚀 Mejores Prácticas

1. **Usa `useHttpRequest` por defecto** en componentes React
2. **Usa `apiClient`** solo para servicios especializados
3. **Siempre maneja errores** (visual o console.error)
4. **Sanitiza datos** antes de enviar (automático en useHttpRequest)
5. **Usa TypeScript** para tipar requests y responses
6. **No dupliques lógica** - el hook ya maneja todo lo necesario

---

## 📖 Referencias

- [Axios Documentation](https://axios-http.com/)
- [React Hooks Guide](https://react.dev/reference/react)
- [CSRF Protection](../../../backend/middleware/CSRF-PROTECTION-EXPLANATION.md)
