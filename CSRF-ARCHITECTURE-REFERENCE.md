# 🏗️ Arquitectura CSRF - Referencia Técnica

**Estado:** Implementado en el frontend  
**Patrón:** Double Submit Cookie (validación estática, sin regeneración)  
**Framework:** React 18 + TypeScript + Axios  

---

## 📐 Flujo Actual

```
USER → BROWSER → FRONTEND → AXIOS INTERCEPTOR → BACKEND
                    ↓
                CsrfProvider
                    ↓
            GET /api/csrf-token
                    ↓
            Response: { token: "..." }
                    ↓
            setCsrfToken(token)
                ↓
        Almacenado: window.csrfToken
                ↓
        POST /api/organizations
                ↓
        Interceptor agrega:
        x-csrf-token: window.csrfToken
        credentials: 'include'
                ↓
        BACKEND VALIDA:
        header token === cookie token
        (no regenera, solo valida)
```

---

## 📁 Archivos Principales

### 1. `src/api/httpClient.config.ts`

**Responsabilidad:** Configurar axios a nivel global + gestion de token CSRF

**Componentes clave:**

```typescript
// Variable global: almacena token de sesión
let csrfToken: string = '';

// Función: obtiene token del servidor (una sola vez)
const fetchCsrfToken = async (): Promise<string>

// Función: crea instancia de axios configurada
const createAxiosInstance = (): AxiosInstance

// Request interceptor: agrega x-csrf-token header a POST/PUT/PATCH/DELETE
axiosInstance.interceptors.request.use(async (config) => { ... })

// Response interceptor: maneja errores 401, 403, 500
axiosInstance.interceptors.response.use(
  (response) => { ... },
  async (error) => { ... }
)

// Función exportada: sincroniza token desde React (CsrfProvider)
export const setCsrfToken = (token: string): void

// Instancia exportada: para usar en componentes
export default axiosInstance
```

**Configuración:**

```typescript
axios.create({
  baseURL: API_BASE_URL,           // https://cloud-docs-api-service.onrender.com/api
  timeout: 30000,                   // 30 segundo timeout
  withCredentials: true,            // ⚠️ CRÍTICO: enviar cookies
  headers: {
    'Content-Type': 'application/json'
  }
})
```

---

### 2. `src/context/CsrfProvider.tsx`

**Responsabilidad:** Provider React que obtiene y sincroniza token CSRF

**Props:**
- `children: React.ReactNode` - Componentes hijos que necesitan el contexto

**State:**
```typescript
token: string | null              // Token actual
isInitialized: boolean            // Si se completó init
isLoading: boolean                // Si está fetch operación
error: Error | null               // Ultimo error
```

**Funciones:**

```typescript
// Obtiene token del servidor
const fetchToken = useCallback(async (): Promise<string>

// Se ejecuta al montar el provider (useEffect)
useEffect(() => { ... }, [fetchToken])

// Para refrescar token si es necesario
const refreshToken = useCallback(async (): Promise<string>
```

**Uso en App.tsx:**
```tsx
<CsrfProvider>
  <Routes>
    {/* Todas las rutas tienen acceso al contexto */}
  </Routes>
</CsrfProvider>
```

---

### 3. `src/utils/csrfDebug.ts`

**Responsabilidad:** Herramientas de debug para consola del navegador

**Funciones exportadas:**

```typescript
// Hace GET /csrf-token y verifica cookies
await window.__CSRF_DEBUG.checkTokens()

// Imprime todas las cookies CSRF
window.__CSRF_DEBUG.getDCSRFCookies()

// Valida que los tokens en cookie y respuesta son iguales
await window.__CSRF_DEBUG.validateTokenMatch()

// Muestra la configuración esperada vs actual
window.__CSRF_DEBUG.compareExpectedVsActual()
```

**Inicialización:**
```typescript
// Se importa en main.tsx
import './utils/csrfDebug';

// Expone window.__CSRF_DEBUG en compile time
declare global {
  interface Window {
    __CSRF_DEBUG: typeof csrfDebugUtils;
  }
}
```

---

### 💡 Nota: Funciones de Debug Disponibles

El archivo `src/utils/csrfDebug.ts` expone herramientas en la consola del navegador:

### Primera Petición POST (por ejemplo, crear organización):

1. **Usuario hace clic en "Crear Organización"**
2. **Componente: `<CreateOrganization />`**
   ```tsx
   const handleSubmit = async (data) => {
     const response = await apiClient.post('/organizations', data);
     // apiClient es axios instance
   }
   ```

3. **Axios Request Interceptor se ejecuta:**
   ```typescript
   if (!csrfToken) {
     // Token no está en memoria, obtenerlo AHORA
     await fetchCsrfToken();  // GET /api/csrf-token
   }
   
   config.headers['x-csrf-token'] = csrfToken;
   ```

4. **Navegador envía:**
   ```http
   POST /api/organizations HTTP/1.1
   Host: cloud-docs-api-service.onrender.com
   
   Headers:
   - x-csrf-token: d4f5e6g7h8i9...
   - Content-Type: application/json
   - Cookie: psifi_csrf_token=...; token=...;
   
   Body:
   { "name": "My Org", "plan": "FREE" }
   ```

5. **Backend valida:**
   ```
   1. Extrae token del header x-csrf-token
   2. Extrae token de la cookie psifi_csrf_token
   3. Compara: header === cookie
      ✅ Si son iguales → Permite (201 Created)
      ❌ Si son diferentes → Rechaza (403 Forbidden)
   ```

6. **Response:**
   ```json
   // ✅ Éxito
   { "success": true, "data": { id: "123", ... } }
   
   // ❌ Fallo
   { "error": "Invalid or missing CSRF token. Fetch from GET /api/csrf-token" }
   ```

---

## 🛡️ Seguridad

### Por qué Double Submit Cookie es seguro:

1. **Cookie (servidor)**
   - Almacenada en navegador
   - HttpOnly flag (XSS no puede robar)
   - Secure flag (solo HTTPS)
   - SameSite=None (permite cross-origin)
   - Frontend NO puede acceder

2. **Header (frontend)**
   - Almacenado en variable React/memoria
   - Enviado en header x-csrf-token
   - Un sitio CSRF no puede leerlo (Same-Origin Policy)
   - Frontend PUEDE acceder y configurar

3. **Validación (backend)**
   - Compara ambos valores
   - Si atacante puede leer header → puede leer cookie (Same-Origin)
   - Si es cross-origin → no puede leer header (CORS)
   - Ataque CSRF bloqueado

---

## 🔍 Rutas Excluidas de CSRF

Según `httpClient.config.ts`:

```typescript
const CSRF_EXCLUDED_ROUTES = [
  '/auth/login',         // No requiere CSRF (credenciales nuevas)
  '/auth/register',      // No requiere CSRF (nuevo usuario)
  '/csrf-token'          // Obtener token (no authenticated)
];

// Otros (del backend):
// /confirm/:token
// /api/auth/forgot-password
// /api/auth/reset-password
```

---

## 📊 Estados Esperados

### ✅ Correctamente Configurado

**Network tab muestra:**

```
GET https://cloud-docs-api-service.onrender.com/api/csrf-token    200 OK
  Response:
    {
      "token": "d4f5e6g7h8i9j0k1l2m3n4o5p6q7r8s9..."
    }
  Headers:
    Set-Cookie: psifi_csrf_token=...; HttpOnly; Secure; SameSite=None

POST https://cloud-docs-api-service.onrender.com/api/organizations   201 Created
  Request Headers:
    x-csrf-token: d4f5e6g7h8i9j0k1l2m3n4o5p6q7r8s9...
    Cookie: psifi_csrf_token=...; token=...;
  Response:
    { "success": true, "data": { id: "...", ... } }
```

**Console muestra:**

```
[CSRF-Provider] Token obtenido y sincronizado exitosamente
[CSRF] ✅ Added x-csrf-token header: d4f5e6... (length: 64)
[CSRF] 📋 Method: POST, URL: /organizations
```

---

### ❌ Error: 403 CSRF

**Network tab muestra:**

```
POST https://cloud-docs-api-service.onrender.com/api/organizations   403 Forbidden
  Request Headers:
    x-csrf-token: [MISSING o DIFERENTE]
    Cookie: [MISSING o DIFERENTE]
  Response:
    {
      "error": "Invalid or missing CSRF token. Fetch a new token from GET /api/csrf-token",
      "code": "EBADCSRFTOKEN"
    }
```

**Causas posibles:**

1. **Token no se obtiene:** GET /csrf-token no aparece en Network
2. **Token no se guarda:** `window.csrfToken` es undefined en console
3. **Header no se envía:** POST no tiene `x-csrf-token`
4. **Cookies no se envían:** POST no tiene `Cookie` header
5. **Token expirado:** Fue obtenido pero luego expiró (>30 min)
6. **Diferente sesión:** Usuario cambió de navegador/pestaña

---

## 🔧 Troubleshooting Matriz

| Problema | Síntoma | Verificación | Solución |
|----------|---------|--------------|----------|
| **Sin token GET** | No ver GET /csrf-token en Network | Network tab filtra "csrf-token" | Inicializar CsrfProvider en App.tsx |
| **Token no guardado** | `window.csrfToken` → undefined | Console: `console.log(window.csrfToken)` | Verificar que CsrfProvider llama setCsrfToken() |
| **Sin header** | POST sin `x-csrf-token` | Network → Request Headers | Verificar interceptor request en httpClient.config.ts |
| **Sin cookies** | POST sin `Cookie` header | Network → Request Headers | Agregar `withCredentials: true` en axios |
| **Token diferente** | Header ≠ Cookie | Network → comparar valores | Obtener token nuevo con refreshToken() |
| **403 persistente** | Sigue dando 403 tras todo | Backend logs | Backend rechaza la validación (issue del backend) |

---

## � Historial: Bug CSRF Identificado y Resuelto

### 🚨 El Problema (16 Marzo 2026)

**Síntoma observado:**
```
GET /api/csrf-token → 200 OK ✅
POST /api/organizations → 403 Forbidden ❌
```

**Causa Raíz:** En `src/context/CsrfProvider.tsx` línea 88, el `useEffect` tenía `fetchToken` en las dependencias:

```typescript
// ❌ INCORRECTO (causaba infinite loop)
useEffect(() => {
  fetchToken();
}, [fetchToken])  // ← fetchToken es creada cada render, causa loop
```

**Por qué:**
1. `fetchToken` es una función creada por `useCallback`
2. Cada render crea una nueva referencia de `fetchToken`
3. El `useEffect` se ejecuta cada vez que las **dependencias cambian**
4. Esto causaba **re-renders infinitos** → el token se sobrescribía constantemente
5. Resultado: `window.csrfToken` quedaba `undefined` justo cuando axios lo necesitaba

### ✅ La Solución Aplicada

**Cambio principal:** Vaciar el array de dependencias

```typescript
// ✅ CORRECTO (se ejecuta solo una vez al montar)
useEffect(() => {
  fetchToken();
}, [])  // Empty array = ejecutar UNA VEZ al montar el provider
```

**Mejoras adicionales implementadas:**
1. **isMounted flag** - Previene state updates después de desmontar el componente
2. **Logs mejorados** - Console logs con contexto de debugging
3. **Window debug state** - `window.__CSRF_STATE__` para inspeccionar estado
4. **Mejor error handling** - Stacktrace completo en caso de error

**Verificación del fix:**
```javascript
// En DevTools Console:
window.csrfToken  // ✅ Debe tener valor (no undefined)

// Deep check:
await window.__CSRF_DEBUG.checkTokens()  // Debe mostrar ✅ PASSED
```

### Commits realizados:
- `7761685` - Fix CSRF token initialization infinite loop
- `6865d30` - Add CSRF fix verification guide

---

## 🛠️ Debugging en Consola Developer

Para verificar el estado actual de CSRF, abre DevTools (F12) y ejecuta:

```javascript
// Ver token en memoria
console.log('Token:', window.csrfToken);

// Ver cookies CSRF
console.log('Cookies:', document.cookie);

// Verificación completa
await window.__CSRF_DEBUG.checkTokens();

// Ver todas las cookies
window.__CSRF_DEBUG.getAllCookies();

// Ambiente (DEV vs PRD)
window.__CSRF_DEBUG.getEnvironmentInfo();

// Ver estado completamente inicializado
console.log('Estado CSRF:', window.__CSRF_STATE__);
```

**Estado esperado después del fix:**

```javascript
window.__CSRF_STATE__ = {
  token: "4759c8d90a1a4013c6e2...",
  tokenLength: 128,
  isInitialized: true,
  isLoading: false,
  error: null,
  hasWindowCsrfToken: true,
  windowCsrfToken: "4759c8d90a1a4013c6e2..."
}
```

**Qué significa cada propiedad:**
- `isInitialized: true` - Inicialización completada
- `hasWindowCsrfToken: true` - Token disponible para axios
- `error: null` - Sin errores de obtención
- `windowCsrfToken` - Copia del token para verificación

---

## 🚀 Próximos Pasos (si continúa el problema)

1. **Usar funciones debug:** Ejecuta en consola `await window.__CSRF_DEBUG.checkTokens()`
2. **Revisar Network tab:** GET /csrf-token y POST /organizations
3. **Consultar logs del backend:** ¿Qué token recibe vs qué valida?
4. **Verificar dominio:** ¿Frontend y backend en HTTPS? ¿Mismo dominio?
5. **Refrescar token:** `await window.__CSRF_DEBUG.refreshToken()`
6. **Backend check:** ¿Endpoint /csrf-token devuelve token correcto?

---

**Documento:** Arquitectura CSRF Frontend  
**Versión:** 2.0 (Consolidado)  
**Actualizado:** 17 Marzo 2026  
**Mantenedor:** Frontend Team
