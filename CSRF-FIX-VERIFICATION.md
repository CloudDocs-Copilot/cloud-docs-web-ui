# 🎯 CSRF Fix Applied - Verification Guide

**Commit:** `7761685` - Fix CSRF token initialization infinite loop  
**Fecha:** 16 Marzo 2026

---

## ✅ Cambios Realizados

### El Problema
```
useEffect(() => { ... }, [fetchToken])
                        ↑
                 Dependencia infinita
                 Causaba re-renders cada vez
```

### La Solución
```typescript
useEffect(() => {
  // ... inicialización
}, []);  // Empty array = Solo ejecutar UNA VEZ al montar
```

---

## 🔍 Cómo Verificar el Fix

### Paso 1: Recargar la página

```bash
F12 → Console tab
Cmd/Ctrl + Shift + R  (hard refresh)
```

### Paso 2: Ver los logs de CSRF

En la console deberías ver:

```
[CSRF-Provider] 🔄 Fetching token from: https://cloud-docs-api-service.onrender.com/api/csrf-token
[CSRF-Provider] 📦 Response from /api/csrf-token: {
  hasToken: true
  tokenLength: 128
  keys: ['token', 'message']
}
[CSRF-Provider] ✅ Token obtenido y sincronizado exitosamente: {
  tokenLength: 128
  tokenPreview: "4759c8d90a1a4013c6e2..."
  storedInWindow: true
}
```

**Qué significa:**
- ✅ `hasToken: true` → El servidor retorna token
- ✅ `tokenLength: 128` → Token tiene longitud correcta  
- ✅ `storedInWindow: true` → Se guardó en `window.csrfToken`

### Paso 3: Verifica en consola

```javascript
// En DevTools console, ejecuta:
console.log(window.__CSRF_STATE__)
```

**Esperado:**

```javascript
{
  token: "4759c8d90a1a4013c6e2...",
  tokenLength: 128,
  isInitialized: true,
  isLoading: false,
  error: null,
  hasWindowCsrfToken: true,
  windowCsrfToken: "4759c8d90a1a4013c6e2..."
}
```

**Si todo está ✅:**
- `hasWindowCsrfToken: true` → Token está disponible
- `isInitialized: true` → Inicialización completada
- `error: null` → Sin errores

---

## 🧪 Prueba el Flujo Completo

### 1. Ejecuta el script de diagnóstico

```javascript
// En consola, pega csrf-diagnostic-console.js
// Deberías ver AHORA:
✅ PASSED (más items)
  ✓ CSRF token found at window.csrfToken
  ✓ CSRF cookie present
  ✓ Request interceptor configured
```

### 2. Intenta crear una organización

1. **Network tab abierta (F12)**
2. **Crea una organización nueva**
3. **Verifica POST /api/organizations:**

```
Request Headers:
  ✅ x-csrf-token: 4759c8d90a1a4013c6e2...
  ✅ Cookie: psifi_csrf_token=...; token=...;

Response:
  ✅ Status: 201 Created (no 403)
  ✅ Body: { "success": true, "data": { ... } }
```

---

## 📊 Comparación Antes vs Después

### ❌ ANTES (el problema)

```
[CSRF-Provider] Initializing CSRF token on mount...  [x5 veces]
[CSRF-Provider] Initializing CSRF token on mount...
[CSRF-Provider] Initializing CSRF token on mount...
[CSRF] GET /csrf-token response:... [múltiples]
```

**Síntomas:**
- Logs repetidos in consola
- Token se obtiene múltiples veces
- `window.csrfToken` undefined (se borraba/sobrescribía)

### ✅ DESPUÉS (solucionado)

```
[CSRF-Provider] Initializing CSRF token on mount...  [UNA SOLA VEZ]
[CSRF-Provider] 📦 Response from /api/csrf-token: {...}
[CSRF-Provider] ✅ Token obtenido y sincronizado exitosamente: {...}
```

**Síntomas:**
- Logs limpios, sin duplicados
- Token se obtiene UNA SOLA VEZ
- `window.csrfToken` está disponible y consistente

---

## 🔧 Utilidades de Debug Disponibles

### Ver estado CSRF actual
```javascript
console.log(window.__CSRF_STATE__)
```

### Ver token en localStorage
```javascript
console.log('window.csrfToken:', window.csrfToken)
console.log('localStorage:', localStorage.getItem('csrf_token'))
```

### Refrescar token manualmente
```javascript
__CSRF_DEBUG__.refreshToken()
```

### Simular POST
```javascript
__CSRF_DEBUG__.simulatePost()
```

---

## 📋 Checklist de Verificación

- [ ] Logs muestran token se obtiene UNA VEZ (no múltiples)
- [ ] `window.__CSRF_STATE__.hasWindowCsrfToken` es `true`
- [ ] `window.__CSRF_STATE__.isInitialized` es `true`
- [ ] `window.__CSRF_STATE__.error` es `null`
- [ ] Script de diagnóstico muestra más ✅ (token storage, cookies, etc)
- [ ] POST /api/organizations incluye `x-csrf-token` header
- [ ] POST retorna 201 (no 403)

---

## 🚀 Si aún da 403 Forbidden

Si después de estos cambios **SIGUE dando 403**, entonces el problema es:

### Opción A: Backend rechaza el token
```
GET /csrf-token → 200 ✅
POST /api/organizations → 403 ❌
```

**Causa:** El backend NO reconoce el token válido  
**Solución:** Revisar logs del backend

### Opción B: Token NO se envía en header
```
Network → POST /organizations → Headers
❌ x-csrf-token header FALTA
```

**Causa:** Axios interceptor NO agrega el header  
**Solución:** Revisar src/api/httpClient.config.ts interceptor

### Opción C: Cookies NO se envían
```
Network → POST /organizations → Cookies
❌ psifi_csrf_token FALTA
```

**Causa:** `withCredentials: true` no está configurado  
**Solución:** Verificar axios config

---

## 📞 Debugging Avanzado

Si necesitas más detalles:

```javascript
// Ver TODA la respuesta de /api/csrf-token
const resp = await fetch('https://cloud-docs-api-service.onrender.com/api/csrf-token', {
  credentials: 'include'
});
const data = await resp.json();
console.log('Full response:', data);
console.log('Token:', data.token);
console.log('Token length:', data.token?.length);
```

---

## ✅ Resumen

| Item | Estado | Verificación |
|------|--------|--------------|
| Fix aplicado | ✅ | Commit `7761685` |
| useEffect | ✅ | Dependency array vacío `[]` |
| Token obtenido | ✅ | Una sola vez |
| Token guardado | ✅ | `window.csrfToken` definido |
| Cookie CSRF | ✅ | `psifi_csrf_token` presente |
| Debug window | ✅ | `window.__CSRF_STATE__` accesible |

---

**Siguiente paso:** Recargar la app y ejecutar las verificaciones arriba.

¿Qué resultado ves en `window.__CSRF_STATE__`?
