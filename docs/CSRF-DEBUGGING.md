# 🔍 CSRF Token Debugging Guide

## 🚨 Problema Detectado en PRD

Se observó error 403 CSRF con cookies **DIFERENTES** al esperado:
- **Esperado en PRD**: `__Host-psifi.x-csrf-token=<token>`
- **Visto en PRD**: `tokenskey=bDGGCUIR...` ❌
- **Header X-Csrf-Token**: `352567114cccfe02...` (diferente al token en cookie)

### Root Cause
El navegador tiene una **cookie vieja o de otro origen** llamada `tokenskey` que NO es la cookie CSRF esperada. Esto causa mismatch entre:
- Header: `x-csrf-token: 352567114...` (token correcto del servidor)
- Cookie: `tokenskey: bDGGCUIR...` (cookie incorrecta/vieja)

---

## 🛠️ Paso 1: Debugging Rápido (PRD)

Abre la consola (F12) y ejecuta:

```javascript
await window.__CSRF_DEBUG.checkTokens()
```

**Qué mostrará:**
- ✅ Token obtenido del servidor (`GET /api/csrf-token`)
- 🍪 Cookies esperadas por entorno:
  - **PRD**: `__Host-psifi.x-csrf-token`
  - **DEV**: `psifi.x-csrf-token`
- 🔴 Cookies DIFERENTES encontradas (como `tokenskey`)
- 📊 Comparación: ¿Response token === Cookie?
- 🎯 Resultado del test POST

---

## 📋 Verificar Cookie Específica

Si solo quieres revisar la cookie CSRF:

```javascript
// Checar la cookie esperada
window.__CSRF_DEBUG.checkCSRFCookie()

// Ver TODAS las cookies
window.__CSRF_DEBUG.getAllCookies()

// Ver ambiente
window.__CSRF_DEBUG.getEnvironmentInfo()
```

---

## 🔍 Nombres de Cookie por Entorno

Tu backend usa:

```typescript
// csrf.middleware.ts línea 32
cookieName: isProduction 
  ? '__Host-psifi.x-csrf-token'   // En producción (HTTPS)
  : 'psifi.x-csrf-token'           // En desarrollo (HTTP)
```

| Entorno | Nombre Esperado | Seguridad |
|---------|-----------------|-----------|
| **Producción** | `__Host-psifi.x-csrf-token` | ✅ HttpOnly + Secure + HTTPS only |
| **Desarrollo** | `psifi.x-csrf-token` | ✅ HttpOnly + Lax |

### Prefijo `__Host-`
- Solo se envía por HTTPS
- No puede ser leído por JavaScript (HttpOnly)
- No puede ser enviado a subdominios
- Aumenta seguridad en producción

---

## ✅ Flujo Correcto del Backend

Tu backend hace exactamente lo correcto:

```typescript
// app.ts línea 107-115
app.get('/api/csrf-token', (req: Request, res: Response) => {
  const token = generateCsrfToken(req, res);  // Genera Y setea cookie
  res.json({
    token,  // ← DEVUELVE el MISMO token
    message: '...'
  });
});

// Resultado:
// Cookie: __Host-psifi.x-csrf-token = "a2D2121a4d0c646..."
// JSON: { "token": "a2D2121a4d0c646..." }  ✅ IDÉNTICOS
```

---

## ❓ Qué Podría Estar Mal

### 1. **Cookie vieja no se limpió** ❌
```
Sesión anterior: tokenskey = "bDGGCUIR..." (de otra app o vieja)
Nueva sesión: psifi.x-csrf-token = "352567114..." (correcta)

Problema: El navegador envía AMBAS cookies
El servidor valida contra psifi.x-csrf-token pero ve tokenskey
```

**Solución**: Limpiar cookies o usar Incognito mode

### 2. **CORS bloqueando cookies en PRD**
```
Si CORS no tiene credentials: 'include' ❌
O el servidor no tiene Access-Control-Allow-Credentials: true ❌

Resultado: Cookie NO se envía, solo header
```

Tu código tiene `withCredentials: true` ✅

### 3. **Token se obtiene pero se sobrescribe**
```
GET /csrf-token → token="ABC"
GET /csrf-token (2da vez) → token="XYZ"
Cookie cambia a "XYZ" pero header sigue siendo "ABC"
```

Tu código previene con `MAX_CSRF_FETCH_ATTEMPTS = 1` ✅

### 4. **Dominio/Puerto diferente en PRD**
```
Frontend: https://app.clouddocs.com
Backend: https://api.clouddocs.com

Si no es same-site, la cookie podría no enviarse
```

Verifica que frontend y backend usen mismo dominio o CORS correcto

---

## 🎯 Diagnóstico Paso a Paso

### Paso 1: Ejecutar debug
```javascript
await window.__CSRF_DEBUG.checkTokens()
```

### Paso 2: Identificar el problema

**Si muestra MISMATCH:**
```
• Response token: a2D2121a4d0c646...
• Cookie token:   bDGGCUIR... (¡diferentes!)
❌ MISMATCH! Response !== Cookie
```
→ **Backend está devolviendo token diferente al que setea en cookie**

**Si muestra cookie MISSING:**
```
❌ Exact cookie NOT found
   Available cookies: (vacío o solo "tokenskey")
```
→ **Cookie no se está seteando o no se está enviando**

**Si muestra cookie INCORRECTA:**
```
⚠️ Found DIFFERENT CSRF cookie: "tokenskey"
   Value: bDGGCUIR...
```
→ **Hay una cookie vieja que debe ser limpiada**

### Paso 3: Compartir información

Si hay problema, comparte:
```javascript
// Esto te dará toda la información
const info = window.__CSRF_DEBUG.getEnvironmentInfo();
console.log(JSON.stringify(info, null, 2));
```

---

## 🧹 Limpiar Cookie Vieja (Temporalmente)

Si hay `tokenskey` u otras cookies viejas:

```javascript
// En consola del navegador
// Borrar cookies viejas
document.cookie = "tokenskey=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

// Luego recargar página
location.reload();

// Checar si la nueva cookie se setea
window.__CSRF_DEBUG.checkCSRFCookie();
```

---

## 🔐 Verificación Completa

**En el navegador:**

- [ ] `await window.__CSRF_DEBUG.checkTokens()` completa sin errores
- [ ] Expected cookie name es `__Host-psifi.x-csrf-token` (PRD) o `psifi.x-csrf-token` (DEV)
- [ ] ✅ MATCH! Response === Cookie
- [ ] NO hay cookies viejas como `tokenskey`
- [ ] POST test devuelve 200, no 403

**En el servidor (logs):**

```bash
# Verificar localmente
curl -v http://localhost:3000/api/csrf-token 2>&1 | grep -E "(Set-Cookie|\"token\")"
```

Debería mostrar:
```
Set-Cookie: psifi.x-csrf-token=a2D2121a4d...; Path=/; HttpOnly; SameSite=Lax
{"token":"a2D2121a4d..."}
```

**Ambos valores después de `=` son IDÉNTICOS** ✅

---

## 📞 Si el Problema Persiste

1. **Ejecuta el debug**: `await window.__CSRF_DEBUG.checkTokens()`
2. **Toma screenshot** de la salida
3. **Verifica el nombre exacto** de la cookie esperada según entorno
4. **Limpia cookies viejas** (Incognito mode)
5. **Comparte output** con backend team con esta información:
   - Entorno (PRD/DEV)
   - Nombre de cookie esperado vs recibido
   - Respuesta vs Cookie comparison
   - Logs del servidor para esa request

---

## 🚀 Resumen

- ✅ Backend **CORRECTO**: devuelve mismo token en JSON que setea en cookie
- ✅ Frontend **CORRECTO**: envía el token en header y usa `withCredentials: true`
- ❌ **PROBLEMA**: Cookie vieja/incorrecta o validación incorrecta
- 🔧 **SOLUCIÓN**: Usar debug util para identificar exactamente qué está mal
