# Configuración de Variables de Entorno

## Arquitectura

Este proyecto utiliza una arquitectura separada para manejar variables de entorno en diferentes contextos:

### Estructura

```text
src/
├── config/
│   ├── env.ts              # Configuración para app (dev/build)
│   └── __mocks__/
│       └── env.ts          # Mock para tests (Jest)
```

### ¿Cómo funciona?

#### 1. **En Desarrollo/Build (Vite)**

- El archivo `src/config/env.ts` usa `import.meta.env`
- Vite **reemplaza** `import.meta.env.VITE_API_BASE_URL` con el valor real del archivo `.env` en **tiempo de compilación**
- El resultado final es código JavaScript con el valor literal (sin referencia a import.meta)

#### 2. **En Tests (Jest)**

- Jest **automáticamente** usa `src/config/__mocks__/env.ts` gracias a la configuración en `jest.config.ts`
- El mock lee de `process.env` que Jest puede configurar fácilmente
- No hay dependencia de `import.meta` que causaría errores en Node.js

#### 3. **En CI/CD**

- El workflow de GitHub Actions puede establecer variables de entorno:

  ```yaml
  env:
    VITE_API_BASE_URL: http://localhost:4000/api

  ```
  
- Vite las recoge durante el build

## Configuración TypeScript

### `tsconfig.app.json` (Aplicación)

```jsonc
{
  "types": ["vite/client"],  // Solo tipos de Vite (no Node.js)
  "exclude": [
    "src/**/__mocks__/*"      // Excluye mocks del build
  ]
}
```

### `tsconfig.test.json` (Tests)

```jsonc
{
  "types": ["jest", "@testing-library/jest-dom", "node"],  // Incluye tipos de Node
  "moduleResolution": "node"  // Resolución de módulos compatible con Jest
}
```

## Uso

### Agregar nueva variable de entorno

1. **Agregar al archivo `.env`:**

   ```env
   VITE_NEW_VARIABLE=valor
   ```

2. **Agregar a `src/config/env.ts`:**

   ```typescript
   export const NEW_VARIABLE = getEnvVar('VITE_NEW_VARIABLE', 'default-value');
   ```

3. **Agregar al mock `src/config/__mocks__/env.ts`:**

   ```typescript
   export const NEW_VARIABLE = process.env.VITE_NEW_VARIABLE || 'default-value';
   ```

4. **Usar en tu código:**

   ```typescript
   import { NEW_VARIABLE } from '../config/env';
   
   console.log(NEW_VARIABLE);
   ```

### En Tests

Si necesitas cambiar una variable en un test específico:

```typescript
describe('Mi componente', () => {
  it('usa la variable de entorno', () => {
    // Nota: El mock ya está configurado automáticamente
    // Usa process.env si necesitas cambiar el valor en runtime
    process.env.VITE_API_BASE_URL = 'http://test-server.com/api';
    
    // Tu test aquí
  });
});
```

## Verificación

### Lint

```bash
npm run lint
```

### Build

```bash
npm run build
```

### Tests

```bash
npm test
```

Todos deben pasar sin errores relacionados con configuración de entorno.

## Ventajas de esta Arquitectura

✅ **Separación clara**: Configuración diferente para app y tests

✅ **Sin hacks**: No usa `new Function()` ni trucos dinámicos

✅ **Type-safe**: TypeScript valida correctamente en ambos contextos

✅ **CI/CD friendly**: Funciona perfectamente en integración continua

✅ **Fácil de testear**: Jest puede mockear fácilmente con `process.env`

✅ **Build optimizado**: Vite elimina código muerto y reemplaza variables en tiempo de compilación
