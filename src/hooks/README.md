# Hooks Personalizados

Esta carpeta contiene hooks personalizados de React para la aplicación CloudsDocsCopilotFront.

## Hooks Disponibles

### useApi

Hook genérico para consumir APIs REST con validaciones y seguridad integradas.

**Ubicación:** `useApi.ts`

**Características:**
- ✅ Consumo genérico de APIs REST (GET, POST, PUT, PATCH, DELETE)
- ✅ Tipado completo con TypeScript
- ✅ Validación de datos antes de enviar peticiones
- ✅ Sanitización automática para prevenir XSS
- ✅ Reintentos automáticos en errores 5xx
- ✅ Manejo centralizado de errores
- ✅ Interceptors de autenticación
- ✅ Cancelación de peticiones
- ✅ Callbacks personalizables (onSuccess, onError, onSettled)

**Documentación completa:** Ver [API README](../api/README.md)

**Ejemplo básico:**
```typescript
import { useApi } from './hooks/useApi';

const MyComponent = () => {
  const { execute, data, isLoading, error } = useApi<User>();

  const fetchUser = async () => {
    await execute({
      method: 'GET',
      url: '/users/1',
    });
  };

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{data?.name}</div>;
};
```

### useFormValidation

Hook para validación de formularios con reglas personalizables.

**Ubicación:** `useFormValidation.ts`

**Funciones de validación incluidas:**
- `validateEmail`: Valida formato de email
- `validateName`: Valida nombres (solo letras y acentos)
- `validatePhone`: Valida números de teléfono
- `validateUrl`: Valida URLs
- `validateMinLength`: Valida longitud mínima
- `validateMaxLength`: Valida longitud máxima
- `validateRequired`: Valida campos requeridos

### usePageContext

Hook para acceder al contexto de página de la aplicación.

**Ubicación:** `usePageContext.ts`

### usePageInfoTitle

Hook para gestionar el título de la página según la ruta actual.

**Ubicación:** `usePageInfoTitle.ts`

## Tests

Todos los hooks tienen tests unitarios en la carpeta `__tests__/`.

Para ejecutar los tests:

```bash
# Todos los tests
npm test

# Tests específicos de useApi
npm test -- useApi

# Tests con cobertura
npm run test:coverage
```

## Agregar un Nuevo Hook

1. Crear el archivo del hook en esta carpeta
2. Documentar el hook con JSDoc
3. Agregar tipos TypeScript
4. Crear tests unitarios en `__tests__/`
5. Actualizar este README
6. Exportar el hook si es necesario en un archivo index

## Mejores Prácticas

- Siempre tipar los hooks con TypeScript
- Usar `useCallback` para funciones que se pasan como dependencias
- Usar `useMemo` para valores calculados costosos
- Limpiar efectos secundarios en el cleanup de `useEffect`
- Documentar el hook con comentarios JSDoc
- Escribir tests unitarios completos
- Manejar casos de error apropiadamente
