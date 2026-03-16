# 🧪 CSRF Fix - Test It Now

**Para probar el fix AHORA MISMO**

---

## 🚀 En 3 Pasos

### 1️⃣ Recarga la página (Hard Refresh)

```
Presiona: Ctrl+Shift+R  (Windows/Linux)
O: Cmd+Shift+R  (Mac)
```

Esto borra el caché y recarga el código nuevo.

---

### 2️⃣ Abre DevTools Console (F12)

```
F12 → Console tab
```

Deberías ver logs como estos:

```
[CSRF-Provider] 🔄 Fetching token from: https://cloud-docs-api-service.onrender.com/api/csrf-token
[CSRF-Provider] 📦 Response from /api/csrf-token: {
  hasToken: true,
  tokenLength: 128,
  keys: ['token', 'message']
}
[CSRF-Provider] ✅ Token obtenido y sincronizado exitosamente: {
  tokenLength: 128,
  tokenPreview: "4759c8d90a1a4013c6e2...",
  storedInWindow: true
}
```

✅ **Si ves esto → El fix funciona**

❌ **Si ves logs repetidos → Aún hay problema**

---

### 3️⃣ Ejecuta en la Console

```javascript
console.log(window.__CSRF_STATE__)
```

**Deberías ver:**

```javascript
{
  token: "4759c8d90a1a4013c6e24c0f7c4a121218a23410ca38390bb99dbdfdd6ec5805...",
  tokenLength: 128,
  isInitialized: true,
  isLoading: false,
  error: null,
  hasWindowCsrfToken: true,
  windowCsrfToken: "4759c8d90a1a4013c6e24c0f7c4a121218a23410ca38390bb99dbdfdd6ec5805..."
}
```

### Checklist ✅

- [ ] `token` NO es null (tiene valor)
- [ ] `tokenLength` es 128
- [ ] `isInitialized` es true
- [ ] `error` es null
- [ ] `hasWindowCsrfToken` es true
- [ ] `windowCsrfToken` comienza con "4759c8d90a..."

**Si TODOS están ✅ → El fix funciona correctamente**

---

## 🎯 Prueba Completa: Crear Organización

### Paso 1: Abre Network Tab
```
F12 → Network
```

### Paso 2: Intenta crear una organización
```
1. Ve a crear organización
2. Llena el formulario
3. Presiona "Crear"
```

### Paso 3: Busca la petición POST

En Network tab, busca:
```
POST https://cloud-docs-api-service.onrender.com/api/organizations
```

### Paso 4: Verifica los headers

Haz clic en la petición → Tab "Headers" → Busca "x-csrf-token"

✅ **CORRECTO:**
```
x-csrf-token: 4759c8d90a1a4013c6e24c0f7c4a121218a23410ca38390bb99...
```

❌ **INCORRECTO:**
```
(No aparece el header)
```

### Paso 5: Verifica las cookies

Tab "Cookies" → Busca "psifi_csrf_token"

✅ **CORRECTO:**
```
psifi_csrf_token: [long value]
```

### Paso 6: Verifica la respuesta

Tab "Response"

✅ **CORRECTO (Status 201):**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "...",
    ...
  }
}
```

❌ **INCORRECTO (Status 403):**
```json
{
  "error": "Invalid or missing CSRF token"
}
```

---

## 📊 Quick Diagnostic

**Copia y pega en console:**

```javascript
// Quick check
console.log('=== CSRF STATE ===');
console.log('Token in window:', !!window.csrfToken);
console.log('Token length:', window.csrfToken?.length);
console.log('Token preview:', window.csrfToken?.substring(0, 30) + '...');
console.log('State object:', window.__CSRF_STATE__);
console.log('Initialized:', window.__CSRF_STATE__?.isInitialized);
console.log('Has error:', window.__CSRF_STATE__?.error);
```

**Output esperado:**
```
=== CSRF STATE ===
Token in window: true
Token length: 128
Token preview: 4759c8d90a1a4013c6e2...
State object: {token: "4759c8d90a...", ...}
Initialized: true
Has error: null
```

---

## 🧰 Herramientas de Debug

**En la console, estén disponibles:**

```javascript
// Ver token actual
__CSRF_DEBUG__.getToken()

// Refrescar token
await __CSRF_DEBUG__.refreshToken()

// Ver qué se enviaría en POST
__CSRF_DEBUG__.simulatePost()

// Ver todas las cookies
__CSRF_DEBUG__.getCookies()
```

---

## 🔄 Si aún hay problema

### Intenta esto:

1. **Limpia todo y reinicia:**
```javascript
__CSRF_DEBUG__.clearToken()
// Espera 2 segundos
await __CSRF_DEBUG__.refreshToken()
console.log(window.__CSRF_STATE__)
```

2. **Recarga la página completamente:**
```
Ctrl+Shift+R  (Hard refresh)
Espera a que cargar completamente
Abre console
```

3. **Verifica que el endpoint responde:**
```javascript
fetch('https://cloud-docs-api-service.onrender.com/api/csrf-token', {
  credentials: 'include'
}).then(r => r.json()).then(d => console.log('Response:', d))
```

---

## ✅ Success Criteria

| Item | Valor Esperado | Tu Resultado |
|------|---|---|
| Logs sin repetición | Uno solo | ✅ |
| `window.__CSRF_STATE__.token` | String 128+ char | ✅ |
| `window.__CSRF_STATE__.isInitialized` | true | ✅ |
| `window.csrfToken` | Definido | ✅ |
| POST header x-csrf-token | Presente | ✅ |
| POST response status | 201 (no 403) | ✅ |

---

## 📞 Si sigue fallando

1. **Copia el output de:**
```javascript
console.log(JSON.stringify(window.__CSRF_STATE__, null, 2))
```

2. **Captura el Network tab:**
   - GET /csrf-token response
   - POST /organizations request headers
   - POST response

3. **Ejecuta el script automático:**
```javascript
// Pega contenido de csrf-diagnostic-console.js
```

4. **Comparte los resultados** con el equipo de backend para investigar 403

---

**¿Qué ves en `window.__CSRF_STATE__`?**
