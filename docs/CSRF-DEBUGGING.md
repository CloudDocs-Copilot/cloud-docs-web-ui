# 🔍 CSRF Token Debugging Guide

## Problema Detectado en PRD
Se observó error 403 CSRF con 2 tokens diferentes:
- **Cookie**: `tokenskey=bDGGCUIR...`
- **Header X-Csrf-Token**: `352567114cccfe02c6b9925909b1c0068...`

**Esto indica que el token del response body que guarda el cliente NO coincide con la cookie que el servidor setea.**

---

## 🛠️ Paso 1: Debugging en el Navegador (PRD)

### Opción A: Usar la utilidad incorporada
Abre la consola (F12) y ejecuta:

```javascript
await window.__CSRF_DEBUG.checkTokens()
```

Esto mostrará:
1. ✅ Token obtenido del servidor (`GET /api/csrf-token`)
2. 🍪 Cookies presentes en el navegador  
3. 🎯 Token almacenado en memoria (Axios)
4. 📋 Result de un POST test

### Opción B: Debugging manual
```javascript
// 1. Obtener token CSRF
const response = await fetch('https://[PRD-URL]/api/csrf-token', {
  method: 'GET',
  credentials: 'include'
});
const data = await response.json();
console.log('Token from response:', data.token);
console.log('Token length:', data.token?.length);

// 2. Ver todas las cookies
console.log('document.cookie:', document.cookie);

// 3. Obtener token de Axios (si está disponible)
const { getCsrfToken } = await import('./src/api/httpClient.config');
console.log('Axios stored token:', getCsrfToken());
```

---

## 🛠️ Paso 2: Debugging en el Servidor (Backend)

Agrega logs temporales en el backend para ver qué recibe:

```typescript
// csrf.middleware.ts - línea ~120
export const csrfProtectionMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (CSRF_EXCLUDED_ROUTES.includes(req.path)) {
    return next();
  }

  // 🔍 TEMPORARY DEBUG
  if (process.env.NODE_ENV !== 'test') {
    console.log('[CSRF-VALIDATION]', {
      path: req.path,
      method: req.method,
      headerToken: req.headers['x-csrf-token'] ? 
        `${String(req.headers['x-csrf-token']).substring(0, 30)}... (length: ${String(req.headers['x-csrf-token']).length})` : 
        'MISSING',
      cookieToken: req.cookies['psifi.x-csrf-token'] ? 
        `${req.cookies['psifi.x-csrf-token'].substring(0, 30)}... (length: ${req.cookies['psifi.x-csrf-token'].length})` : 
        'MISSING',
      match: req.cookies['psifi.x-csrf-token'] === req.headers['x-csrf-token'],
      // Debug: mostrar TODAS las cookies
      allCookies: Object.keys(req.cookies)
    });
  }

  return csrfProtection.doubleCsrfProtection(req, res, next);
};
```

Luego observa los logs cuando falla la validación.

---

## ❓ Preguntas para identificar la causa

### 1. ¿El token del response === token de la cookie?
```javascript
// En navegador:
const resp = await fetch('/api/csrf-token', { credentials: 'include' });
const token = (await resp.json()).token;
console.log('Response token:', token);
console.log('Cookie has:', document.cookie);
// ¿Son iguales o diferentes?
```

**Si son DIFERENTES**: El backend está generando 2 tokens en el endpoint `/csrf-token`

### 2. ¿El cliente está enviando el token CORRECTO?
```javascript
// Verificar qué se envía en el header
const tokenToSend = token;  // Del response body
console.log('Sending in header x-csrf-token:', tokenToSend);

// Hace POST
const postResp = await fetch('/api/documents', {
  method: 'POST',
  credentials: 'include',  // ✅ CRÍTICO: debe estar
  headers: { 'x-csrf-token': tokenToSend },
  body: new FormData()
});
```

### 3. ¿El cliente llamó a `GET /csrf-token` antes del primer POST?
```javascript
// En CsrfProvider o al inicializar:
// ¿Se llama a initializeCsrfToken()?

// Si NO, el csrfToken está vacío
const { getCsrfToken } = await import('./api/httpClient.config');
console.log('Token in memory:', getCsrfToken() || 'EMPTY - never fetched');
```

### 4. ¿La cookie se está enviando automáticamente?
En DevTools Network:
- Request a `POST /api/documents`
- Ir a tab "Cookies"
- ¿Está presente `psifi.x-csrf-token`?
- ¿Su valor coincide con el que está en el header `x-csrf-token`?

---

## 🎯 Checklist de Verificación

**En el navegador (consola):**

- [ ] `await window.__CSRF_DEBUG.checkTokens()` muestra 4 pasos sin errores
- [ ] Token del response `GET /csrf-token` es NO-VACÍO
- [ ] Al menos una cookie relacionada con csrf/token existe
- [ ] POST test devuelve 200, no 403

**En el servidor (logs):**

- [ ] El endpoint `GET /csrf-token` devuelve un token
- [ ] `Set-Cookie` incluye `psifi.x-csrf-token` con valor
- [ ] Cuando `POST /api/documents` llega:
  - [ ] header `x-csrf-token` está presente
  - [ ] cookie `psifi.x-csrf-token` está presente
  - [ ] AMBOS tienen el MISMO valor
  - [ ] "match": true en los logs

---

## 🚨 Escenarios Problemáticos Comunes

### Escenario A: Token en response ≠ Cookie
```
GET /api/csrf-token
Response body: { token: "ABC123..." }
Set-Cookie: psifi.x-csrf-token=XYZ999...
↓
MISMATCH en el servidor: ABC123 ≠ XYZ999
```

**Solución**: Backend debe devolver el MISMO token que setea en la cookie.

### Escenario B: Cliente obtiene token pero lo guarda mal
```javascript
// ❌ INCORRECTO:
const token = response.data.someOtherField;  // No es el CSRF token

// ✅ CORRECTO:
const token = response.data.token;  // Del campo "token"
```

Tu código lo hace correcto (línea 91 en httpClient.config.ts).

### Escenario C: Múltiple llamadas a GET /csrf-token
```
Llamada 1: GET /csrf-token → token="ABC123" → cookie="ABC123"
Llamada 2: GET /csrf-token → token="XYZ999" → cookie="XYZ999" (REEMPLAZA)

POST con token="ABC123" pero cookie="XYZ999"
↓
MISMATCH
```

Tu código evita esto con `MAX_CSRF_FETCH_ATTEMPTS = 1` ✅

### Escenario D: CORS bloqueando cookies
```javascript
// ❌ SI ESTO FALTA:
credentials: 'include'

// ✅ DEBE SER:
fetch(url, {
  credentials: 'include,  // ← CRÍTICO
  ...
})
```

Tu código lo tiene (`withCredentials: true`) ✅

---

## 📋 Pasos para Resolver

1. **Ejecutar `await window.__CSRF_DEBUG.checkTokens()`** en PRD
2. **Identificar cuál de los 4 escenarios anteriores es tu caso**
3. **Si es Escenario A**: Revisar backend `GET /csrf-token`
   - ¿Devuelve en body el MISMO token que setea en cookie?
4. **Si es Escenario C**: Verificar si se llama múltiples veces
   - Network tab → filtrar por `/csrf-token`
   - ¿Cuántas llamadas hay?
5. **Si es Escenario D**: Verificar `credentials: 'include'`
   - Tu código ya lo tiene ✅

---

## 📞 Próximos Pasos

1. Corre el debug en PRD
2. Compartir el output de `window.__CSRF_DEBUG.checkTokens()`
3. Compartir los logs del servidor para esa request
4. Podremos identificar exactamente dónde está el desajuste

**Documento de logging agregado a**: `src/utils/csrfDebug.ts`
