# 🔍 Guía Completa de Diagnóstico CSRF - Frontend

**Última actualización:** Marzo 2026  
**Estado:** En producción con problemas de validación CSRF 403  
**Objetivo:** Detectar y solucionar errores de CSRF en la app React/TypeScript

---

## 📋 Tabla de Contenidos

1. [Entendimiento del CSRF](#entendimiento-del-csrf)
2. [Pasos de Diagnóstico](#pasos-de-diagnóstico)
3. [Checklist Rápido](#checklist-rápido)
4. [Script Automático](#script-automático)
5. [Código Mínimo Correcto](#código-mínimo-correcto)
6. [Preguntas Críticas](#preguntas-críticas)
7. [Troubleshooting](#troubleshooting)

---

## Entendimiento del CSRF

### ¿Qué es CSRF?

Cross-Site Request Forgery (CSRF) es un ataque donde un sitio malicioso hace una solicitud en tu nombre sin tu consentimiento. Para prevenirlo, usamos el patrón **Double Submit Cookie**:

```
1. Frontend llama GET /api/csrf-token
   ↓
2. Backend responde con:
   - JSON { token: "d4f5e6g7h8i9j0k1l2m3..." }
   - Header: Set-Cookie: psifi_csrf_token=...
3. Frontend guarda el token en memoria/estado
4. Frontend envía POST/PUT/PATCH/DELETE CON:
   - Header: x-csrf-token: d4f5e6g7h8i9j0k1l2m3...
   - Cookies incluidas: psifi_csrf_token=...
5. Backend valida: header token === cookie token
   ✅ Si son iguales → Permitir
   ❌ Si son diferentes → 403 Forbidden
```

### Por qué está fallando

Causas comunes de error 403 CSRF:

| Causa | Síntoma | Solución |
|-------|---------|----------|
| No se obtiene token | No hay GET /csrf-token en Network | Llamar a `/api/csrf-token` al montar app |
| Token no se guarda | `csrfToken` es undefined | Guardar en estado global o context |
| Token no se envía | Header `x-csrf-token` falta | Agregar token a headers en POST/PUT/PATCH/DELETE |
| Sin credentials | Cookies no se envían | Agregar `withCredentials: true` en axios/fetch |
| Token expirado | Token viejo después de login | Llamar a `/api/csrf-token` POST login |
| Header incorrecto | Usando otro header | Usar **exactamente** `x-csrf-token` |

---

## Pasos de Diagnóstico

### Paso 1️⃣: ¿Se está llamando a `/api/csrf-token`?

**Abre DevTools (F12) → Network tab**

1. Recarga la página (Cmd/Ctrl + Shift + R)
2. Filtra por "csrf-token" en la búsqueda
3. Deberías ver:

```
GET https://cloud-docs-api-service.onrender.com/api/csrf-token    200 OK
```

**Verifica la respuesta:**

```json
{
  "token": "d4f5e6g7h8i9j0k1l2m3n4o5p6q7r8s9t0..."  // 64 caracteres
}
```

**Verifica los headers:**

```
Response Headers:
  Set-Cookie: psifi_csrf_token=...; HttpOnly; Secure; SameSite=None
  Content-Type: application/json
```

**Si NO ves esta petición:**

❌ **ESTADO CRÍTICO:** El frontend NO está llamando a `/api/csrf-token`

🔧 **Solución:**
- Abre [src/api/httpClient.config.ts](src/api/httpClient.config.ts)
- Busca `fetchCsrfToken()`
- Confirma que se llama al inicializar la app (revisar `CsrfProvider`)
- Si no existe, crear función que llame GET `/api/csrf-token` con `withCredentials: true`

---

### Paso 2️⃣: ¿Se guarda el token en estado?

**Abre DevTools → Console**

Ejecuta:

```javascript
// Si usas window.csrfToken
console.log('CSRF Token:', window.csrfToken);

// O si lo guardas en localStorage
console.log('CSRF From LocalStorage:', localStorage.getItem('csrf_token'));

// O revisa el contexto React
console.log('CSRF Context:', window.__CSRF_TOKEN__);
```

**Esperado:**

```
CSRF Token: d4f5e6g7h8i9j0k1l2m3n4o5p6q7r8s9t0...
```

**Si ves `undefined` o `null`:**

❌ **PROBLEMA:** El token se obtiene pero NO se guarda

🔧 **Solución:**
- El token debe guardarse después de `fetchCsrfToken()`
- Revisar que `CsrfProvider` o el componente que obtiene el token lo almacena

---

### Paso 3️⃣: ¿Se envía el token en POST?

**Network tab → Intenta crear una organización**

1. Filtra por "organizations"
2. Haz clic en la petición POST
3. Vé a la pestaña "Headers"

**Request Headers - Busca:**

```
x-csrf-token: d4f5e6g7h8i9j0k1l2m3n4o5p6q7r8s9t0...
cookie: psifi_csrf_token=...; token=...; other=...
```

**Si NO ves `x-csrf-token` header:**

❌ **PROBLEMA CRÍTICO:** El token NO se está enviando

🔧 **Solución:**
```javascript
// En axios (actual en tu proyecto):
instance.interceptors.request.use(config => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method?.toUpperCase())) {
    config.headers['x-csrf-token'] = csrfToken; // ← AGREGAN ESTO
  }
  return config;
});
```

**Si NO ves cookies:**

❌ **PROBLEMA:** `withCredentials` no está configurado

🔧 **Solución:**
```javascript
// En axios:
const instance = axios.create({
  withCredentials: true,  // ← Debe estar TRUE
});

// O en fetch:
fetch(url, {
  credentials: 'include',  // ← Debe ser 'include'
});
```

---

### Paso 4️⃣: ¿Son idénticos los tokens?

**En la consola ejecuta:**

```javascript
// 1. Obtén el token que está guardado
const storedToken = window.csrfToken || localStorage.getItem('csrf_token');
console.log('Stored Token:', storedToken);

// 2. Ahora crea una organización y revisa Network
// 3. En Network → POST /organizations → Headers
// 4. Copia el valor de x-csrf-token
// 5. En consola ejecuta:

const headerToken = 'd4f5e6g7h8i9j0k1l2m3n4o5p6q7r8s9t0...'; // Lo que copiaste
const stored = window.csrfToken;

if (headerToken === stored) {
  console.log('✅ Tokens son idénticos - BIEN');
} else {
  console.log('❌ Tokens diferentes - PROBLEMA:', { headerToken, stored });
}
```

**Si son diferentes:**

❌ **PROBLEMA:** Estás usando un token viejo o generado por otra sesión

🔧 **Solución:**
- Llamar a `/api/csrf-token` de nuevo
- Guardar el nuevo token
- Reintentar el POST

---

### Paso 5️⃣: ¿Se obtiene token DESPUÉS de login?

**Teoría:** Si el usuario hizo login en otra pestaña o hace mucho tiempo, el token anterior está expirado.

**Network tab:**

1. Haz login
2. Después de que login sea exitoso, deberías ver:

```
POST /api/auth/login              201 Created
GET  /api/csrf-token              200 OK     ← ¿Está aquí?
```

**Si NO ves GET /csrf-token después de login:**

❌ **PROBLEMA:** No se obtiene token nuevo después de autenticarse

🔧 **Solución:**
```javascript
// En tu AuthProvider o servicio de login:

async function handleLogin(email, password) {
  // 1. Login
  const loginRes = await authService.login(email, password);
  
  // 2. UNA VEZ logueado, obtener CSRF token nuevo
  await csrfService.fetchCsrfToken();
  
  // 3. Guardar token en estado
  setUserToken(loginRes.token);
  setCsrfToken(csrfToken);
  
  // 4. Redirigir
  navigate('/dashboard');
}
```

---

## Checklist Rápido

Marca ✅ o ❌ para cada punto:

```
OBTENCIÓN DE TOKEN:
- [ ] GET /api/csrf-token aparece en Network al cargar la app
- [ ] Status 200 OK (no 404, no 500)
- [ ] Response body tiene { "token": "..." }
- [ ] Response headers incluyen Set-Cookie: psifi_csrf_token

ALMACENAMIENTO:
- [ ] window.csrfToken tiene valor después de obtener token
- [ ] O localStorage.getItem('csrf_token') tiene valor
- [ ] El valor es un string de 64+ caracteres

ENVÍO EN PETICIONES:
- [ ] POST /api/organizations tiene header x-csrf-token
- [ ] El header x-csrf-token no está vacío
- [ ] El valor del header = valor almacenado (sin espacios)

COOKIES:
- [ ] Request cookies incluyen psifi_csrf_token
- [ ] Request cookies incluyen token (auth)
- [ ] Ambas cookies tienen valores (no vacías)

CONFIGURACION:
- [ ] axios.create() tiene withCredentials: true
- [ ] O fetch() tiene credentials: 'include'
- [ ] El método es exactamente x-csrf-token (no X-CSRF-TOKEN)

POST LOGIN:
- [ ] Después de login exitoso, aparece nuevo GET /csrf-token
- [ ] El nuevo token se almacena en estado
- [ ] Los POST posteriores usan el nuevo token
```

---

## Script Automático

### Cómo usar

1. Abre DevTools (F12)
2. Ve a la Console tab
3. Copia TODO el contenido del archivo [csrf-diagnostic-console.js](csrf-diagnostic-console.js)
4. Pégalo en la consola
5. Presiona Enter

### Qué te dirá

```
✅ CSRF Token Initialization: OK
✅ Token Storage: OK
✅ Header Configuration: OK
✅ Credentials Setup: OK
❌ POST Request: MISSING X-CSRF-TOKEN
   → Posible causa: Token no se está enviando en headers

RECOMENDACIÓN: Ejecutar POST /api/organizations y revisar Network
```

---

## Código Mínimo Correcto

### 1️⃣ HTTP Client Configuration

**Archivo:** [src/api/httpClient.config.ts](src/api/httpClient.config.ts)

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://cloud-docs-api-service.onrender.com/api';

// Almacenar token en memoria (al obtenerlo del servidor)
let csrfToken: string = '';

// Obtener token CSRF del servidor (UNA SOLA VEZ)
export const fetchCsrfToken = async (): Promise<string> => {
  if (csrfToken) return csrfToken; // Ya lo tenemos
  
  try {
    const response = await axios.get(`${API_BASE_URL}/csrf-token`, {
      withCredentials: true, // ⚠️ CRÍTICO: Enviar cookies
    });
    
    csrfToken = response.data.token; // Guardar para reutilizar
    console.log('✅ CSRF Token obtained:', csrfToken.substring(0, 20) + '...');
    return csrfToken;
  } catch (error) {
    console.error('❌ Error fetching CSRF token:', error);
    return '';
  }
};

// Crear instancia de axios con interceptors
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // ⚠️ CRÍTICO: Permitir cookies cross-origin
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Agregar token CSRF en POST/PUT/PATCH/DELETE
axiosInstance.interceptors.request.use(async (config) => {
  const isModifyingRequest = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(
    config.method?.toUpperCase() || ''
  );

  if (isModifyingRequest) {
    // Si no tenemos token, obtenerlo AHORA
    if (!csrfToken) {
      await fetchCsrfToken();
    }
    
    // Agregar token al header (SIEMPRE)
    if (csrfToken) {
      config.headers['x-csrf-token'] = csrfToken; // ⚠️ Exacto: x-csrf-token
      console.debug(`✅ Added CSRF token to ${config.method} ${config.url}`);
    } else {
      console.warn(`⚠️ No CSRF token for ${config.method} ${config.url}`);
    }
  }

  return config;
});

// Interceptor: Manejar errores 403 (CSRF fallido)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403) {
      console.error('❌ CSRF validation failed (403). Trying to get new token...');
      
      // Obtener token nuevo
      csrfToken = '';
      await fetchCsrfToken();
      
      // Reintentar la petición original CON el nuevo token
      // (La mayoría de librerías no lo hacen automáticamente)
      console.log('Retry needed after CSRF refresh');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

---

### 2️⃣ CSRF Provider (Context)

**Archivo:** [src/context/CsrfProvider.tsx](src/context/CsrfProvider.tsx)

```typescript
import React, { useEffect } from 'react';
import { fetchCsrfToken } from '../api/httpClient.config';

const CsrfProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Obtener token al montar la app
    console.log('🔄 CsrfProvider: Fetching CSRF token on app load...');
    
    fetchCsrfToken().then((token) => {
      if (token) {
        console.log('✅ CSRF token ready');
      } else {
        console.warn('⚠️ CSRF token fetch failed, but continuing');
      }
    });
  }, []);

  return <>{children}</>;
};

export { CsrfProvider };
```

---

### 3️⃣ Después de Login

**En tu AuthProvider o servicio de login:**

```typescript
async function handleLogin(credentials: LoginCredentials) {
  try {
    // 1. Login
    const authResponse = await authService.login(credentials);
    
    // 2. UNA VEZ logueado, obtener CSRF token NUEVO
    console.log('🔄 Login successful. Fetching fresh CSRF token...');
    const csrfToken = await fetchCsrfToken();
    
    if (!csrfToken) {
      console.warn('⚠️ Could not get CSRF token after login');
    }
    
    // 3. Guardar auth token
    localStorage.setItem('auth_token', authResponse.token);
    
    console.log('✅ Login complete and CSRF token refreshed');
    return authResponse;
  } catch (error) {
    console.error('❌ Login failed:', error);
    throw error;
  }
}
```

---

### 4️⃣ Crear Organización (Ejemplo POST)

**En tu componente o servicio:**

```typescript
async function createOrganization(name: string) {
  try {
    // axios ya está configurado con token en interceptor
    const response = await apiClient.post('/organizations', {
      name,
      plan: 'FREE',
    });
    
    console.log('✅ Organization created:', response.data);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 403) {
      console.error('❌ CSRF failed. Error:', error.response.data);
      // El interceptor ya intenta refrescar el token
      // Aquí podrías mostrar un error al usuario
    }
    throw error;
  }
}
```

---

## Preguntas Críticas

Si después de seguir todos estos pasos sigue fallando 403, haz estas preguntas al equipo o revisa estas cosas:

### 1. ¿Está usando axios o fetch?

**axios (recomendado):**
```typescript
axios.create({
  withCredentials: true,  // ✅ Necesario
});
```

**fetch:**
```javascript
fetch(url, {
  credentials: 'include',  // ✅ Necesario
  headers: {
    'x-csrf-token': token,
  },
});
```

### 2. ¿Dónde se guarda el CSRF token?

- [ ] En `window.csrfToken` (variable global)
- [ ] En `localStorage.getItem('csrf_token')`
- [ ] En `sessionStorage.getItem('csrf_token')`
- [ ] En estado de React (Context, Zustand, etc.)
- [ ] En la instancia de axios

### 3. ¿Cuál es la URL exacta del backend?

**Debe ser:**
```
https://cloud-docs-api-service.onrender.com/api
```

**NO:**
```
https://cloud-docs-api-service.onrender.com/  ← Falta /api
https://api.cloud-docs.com                      ← Dominio diferente
```

### 4. ¿El frontend está en HTTPS?

**Para que funcione CSRF con SameSite=None:**
- Frontend DEBE estar en HTTPS
- Backend DEBE estar en HTTPS
- Else: Cookies no se envían correctamente

Verifica:
```javascript
console.log('Frontend URL:', window.location.href);
// ✅ https://cloud-docs-web-ui.vercel.app
// ❌ http://localhost:3000
```

### 5. ¿Se limpian las cookies entre despliegues?

Si cambias el backend URL entre ambientes, las cookies viejas pueden causar problemas.

**Solución:**
```javascript
// Al cambiar URL de backend, limpiar tokens
function clearCsrfToken() {
  window.csrfToken = '';
  localStorage.removeItem('csrf_token');
  // El navegador limpia cookies automáticamente si dominio es diferente
}
```

### 6. ¿El token se inicializa en el layout principal?

**Debe estar en un componente que SIEMPRE se renderiza:**

```
App.tsx
├── CsrfProvider ← DEBE estar AQUÍ (nivel superior)
└── Routes
    └── Todas las páginas
```

❌ **MALO:** Inicializar token solo en `CreateOrganization.tsx`  
✅ **BIEN:** Inicializar token en `App.tsx` o `main.tsx`

---

## Troubleshooting

### Problema: 403 CSRF en desarrollo, funciona en producción

**Causa:** Dominios diferentes (localhost vs vercel.app)

**Solución:**
```javascript
// En tu .env.local:
VITE_API_BASE_URL=http://localhost:4000/api

// Las cookies se configuran para localhost automáticamente
// No necesitas SameSite=None en desarrollo
```

---

### Problema: Token válido pero sigue dando 403

**Causa:** El backend regenera tokens (no debería)

**Verificación en backend:**
```bash
# Ejecutar en backend logs
grep -i "csrf.*regenerate" logs/
```

**Solución:** El backend DEBE reutilizar el mismo token (Double Submit Cookie estático)

---

### Problema: Funciona en Postman pero no en navegador

**Causa:** Las cookies no se están enviando

**Verificación:**
```javascript
// En Network tab, REQUEST HEADERS, busca:
cookie: psifi_csrf_token=...; token=...;

// Si ves "Cookie" vacío o no existe:
// ❌ FALTA withCredentials: true o credentials: 'include'
```

---

### Problema: El script de diagnóstico no encuentra axios

**Causa:** axios no está en scope global

**Solución:**
```javascript
// En consola, verificar que httpClient está importado:
import axiosInstance from './api/httpClient.config';

// Exponer globalmente para debugging:
window.apiClient = axiosInstance;

// En consola ahora puedes hacer:
window.apiClient.get('/csrf-token')
```

---

## 🔗 Archivos Relacionados

| Archivo | Propósito |
|---------|----------|
| [src/api/httpClient.config.ts](src/api/httpClient.config.ts) | Configuración de axios + interceptors |
| [src/context/CsrfProvider.tsx](src/context/CsrfProvider.tsx) | Provider que obtiene token al montar |
| [csrf-diagnostic-console.js](csrf-diagnostic-console.js) | Script automático para diagnóstico |
| [src/utils/csrfDebug.ts](src/utils/csrfDebug.ts) | Utilidades de debug para CSRF |

---

## 📞 Contacto y Recursos

- **Backend CSRF Docs:** Ver [docs/CSRF-PRD-INVESTIGATION.md](../docs/CSRF-PRD-INVESTIGATION.md)
- **API Client Config:** Ver [src/api/README.md](src/api/README.md)
- **Environment Setup:** Ver [docs/ENVIRONMENT-CONFIG.md](../docs/ENVIRONMENT-CONFIG.md)

---

## Última Verificación Antes de Desplegar

```javascript
// En la consola de navegador:
function verifyCsrfSetup() {
  const checks = {
    'Token exists': !!window.csrfToken,
    'Token length >= 32': window.csrfToken?.length >= 32,
    'Axios configured': !!window.apiClient?.defaults?.withCredentials,
    'API URL correct': window.apiClient?.defaults?.baseURL?.includes('cloud-docs'),
  };
  
  console.table(checks);
  
  return Object.values(checks).every(v => v);
}

verifyCsrfSetup();  // ✅ true = Está listo para desplegar
```

---

**Documento compilado:** 16 de Marzo de 2026  
**Versión:** 1.2 stable
