# Hook useApi - Consumo Genérico de APIs

Este documento explica cómo usar el hook `useApi` para consumir APIs de manera genérica con validaciones y seguridad integradas.

## 📋 Características

- ✅ Consumo genérico de APIs REST
- ✅ Tipado completo con TypeScript
- ✅ Validación de datos antes de enviar peticiones
- ✅ Sanitización automática de datos para prevenir XSS
- ✅ Reintentos automáticos en caso de errores 5xx
- ✅ Manejo centralizado de errores
- ✅ Interceptors de autenticación automáticos
- ✅ Cancelación de peticiones
- ✅ Callbacks para éxito, error y finalización
- ✅ Soporte para AbortController

## 🚀 Instalación

Las dependencias ya están instaladas. Solo necesitas configurar las variables de entorno:

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar la URL base de tu API
VITE_API_BASE_URL=http://localhost:3000/api
```

## 📖 Uso Básico

### 1. Import del hook

```typescript
import { useApi } from '@/hooks/useApi';
import type { User } from '@/types/user.types';
```

### 2. Uso en un componente

```typescript
const UserComponent = () => {
  const { execute, data, isLoading, error, isSuccess } = useApi<User>();

  const fetchUser = async (userId: number) => {
    await execute({
      method: 'GET',
      url: `/users/${userId}`,
    });
  };

  useEffect(() => {
    fetchUser(1);
  }, []);

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  return <div>{data.name}</div>;
};
```

## 🔧 Métodos HTTP Soportados

### GET - Obtener datos

```typescript
const { execute, data } = useApi<User[]>();

await execute({
  method: 'GET',
  url: '/users',
});
```

### POST - Crear recurso

```typescript
const { execute, data } = useApi<User, CreateUserRequest>();

await execute({
  method: 'POST',
  url: '/users',
  data: {
    name: 'John Doe',
    email: 'john@example.com',
  },
});
```

### PUT - Actualizar recurso completo

```typescript
await execute({
  method: 'PUT',
  url: `/users/${userId}`,
  data: updatedUser,
});
```

### PATCH - Actualizar parcialmente

```typescript
await execute({
  method: 'PATCH',
  url: `/users/${userId}`,
  data: { name: 'New Name' },
});
```

### DELETE - Eliminar recurso

```typescript
await execute({
  method: 'DELETE',
  url: `/users/${userId}`,
});
```

## 🛡️ Validación de Datos

### Validación básica

```typescript
await execute(
  {
    method: 'POST',
    url: '/users',
    data: formData,
  },
  {
    validate: (data) => {
      if (!data.email.includes('@')) {
        return 'Email inválido';
      }
      return true;
    },
  }
);
```

### Validación con múltiples condiciones

```typescript
const validation = {
  validate: (data: CreateUserRequest) => {
    if (!data.name || data.name.length < 3) {
      return 'El nombre debe tener al menos 3 caracteres';
    }
    if (!data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return 'Email inválido';
    }
    if (data.password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    return true;
  },
};

await execute({ method: 'POST', url: '/users', data }, validation);
```

## 🔄 Reintentos Automáticos

```typescript
const { execute } = useApi({
  retry: 3, // Número de reintentos
  retryDelay: 1000, // Delay entre reintentos (ms)
  onSuccess: (data) => console.log('Éxito:', data),
  onError: (error) => console.error('Error:', error),
});
```

## 📞 Callbacks

```typescript
const { execute } = useApi<User>({
  onSuccess: (data) => {
    console.log('Usuario cargado:', data);
    toast.success('Usuario cargado correctamente');
  },
  onError: (error) => {
    console.error('Error:', error);
    toast.error(error.message);
  },
  onSettled: () => {
    console.log('Petición finalizada');
  },
});
```

## 🎯 Estado del Hook

El hook retorna un objeto con las siguientes propiedades:

```typescript
{
  data: T | null;           // Datos de la respuesta
  error: ApiErrorResponse | null;  // Error si lo hay
  status: ApiStatus;        // Estado actual: 'idle' | 'loading' | 'success' | 'error'
  isLoading: boolean;       // true si está cargando
  isError: boolean;         // true si hay error
  isSuccess: boolean;       // true si fue exitoso
  isIdle: boolean;          // true si no se ha ejecutado
  execute: Function;        // Función para ejecutar petición
  reset: Function;          // Resetear el estado
  cancel: Function;         // Cancelar petición en curso
  retryCount: number;       // Número de reintentos realizados
}
```

## 🔒 Seguridad

### Autenticación automática

El hook añade automáticamente el token de autenticación desde localStorage:

```typescript
// El token se añade automáticamente en los headers
localStorage.setItem('authToken', 'your-jwt-token');
```

### Sanitización de datos

Los datos se sanitizan automáticamente para prevenir XSS:

```typescript
// Entrada
const data = { name: '<script>alert("XSS")</script>' };

// Salida sanitizada
const sanitized = { name: 'scriptalert("XSS")/script' };
```

### Manejo de errores de autenticación

```typescript
// Error 401 - Limpia el localStorage y redirige a login automáticamente
// Error 403 - Acceso prohibido
// Error 404 - Recurso no encontrado
// Error 5xx - Error del servidor
```

## 🧪 Testing

### Ejecutar todos los tests

```bash
npm test
```

### Tests con cobertura

```bash
npm run test:coverage
```

### Tests en modo watch

```bash
npm run test:watch
```

## 📁 Estructura de Archivos

```
src/
├── api/
│   ├── __tests__/
│   │   └── sanitizeData.test.ts
│   ├── examples/
│   │   └── useApiExamples.ts
│   ├── apiTypes.ts
│   ├── axiosConfig.ts
│   └── index.ts
├── hooks/
│   ├── __tests__/
│   │   └── useApi.test.ts
│   └── useApi.ts
```

## 🎓 Ejemplos Avanzados

### Cancelar petición

```typescript
const { execute, cancel } = useApi();

// Iniciar petición
execute({ method: 'GET', url: '/slow-endpoint' });

// Cancelar si es necesario
cancel();
```

### Resetear estado

```typescript
const { execute, reset, data } = useApi();

// Después de usar
reset(); // Limpia data, error y vuelve a estado idle
```

### Petición condicional

```typescript
const { execute } = useApi({
  enabled: userIsLoggedIn, // Solo ejecuta si está habilitado
});
```

## 📚 Recursos Adicionales

- Ver [useApiExamples.ts](./examples/useApiExamples.ts) para más ejemplos
- Ver los tests en [useApi.test.ts](../hooks/__tests__/useApi.test.ts)
- Documentación de [Axios](https://axios-http.com/)

## 🤝 Contribuir

Para añadir nuevas funcionalidades:

1. Añade los tipos necesarios en `apiTypes.ts`
2. Implementa la funcionalidad en `useApi.ts`
3. Añade tests en `useApi.test.ts`
4. Actualiza esta documentación

## ⚠️ Notas Importantes

- Siempre define los tipos TypeScript para peticiones y respuestas
- Usa validación para datos sensibles
- Los tokens se guardan en localStorage (considera usar httpOnly cookies en producción)
- Los reintentos solo aplican a errores 5xx y errores de red
- La sanitización es básica; añade validación del lado del servidor
