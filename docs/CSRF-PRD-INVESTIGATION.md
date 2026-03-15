# 🔥 CSRF Mismatch Investigation (PRD)

## Problem Identified
Tu captura de pantalla muestra:

```
Cookie: tokenskey=bDGGCUIR...
Header: x-csrf-token: 352567114cccfe02...
Result: ❌ 403 Forbidden - CSRF validation failed
```

**Pero el backend dice que debería ser:**

```
Cookie: __Host-psifi.x-csrf-token=a2D2121a4d...
Header: x-csrf-token: a2D2121a4d...
Result: ✅ 200 OK
```

---

## 🔍 Investigación en PRD

### Paso 1: ¿Qué cookie está siendo enviada?

Haz esto en la consola del navegador en PRD:

```javascript
// 1. Listar EXACTAMENTE qué cookies se están enviando
console.log('=== ALL COOKIES ===');
document.cookie.split('; ').forEach(cookie => {
  const [name, value] = cookie.split('=');
  console.log(`${name}: ${value.substring(0, 40)}...`);
});

// 2. Buscar específicamente la cookie esperada
const csrf1 = document.cookie.includes('__Host-psifi.x-csrf-token');
const csrf2 = document.cookie.includes('psifi.x-csrf-token');
const oldTokenskey = document.cookie.includes('tokenskey');

console.log('Has __Host-psifi.x-csrf-token?', csrf1);
console.log('Has psifi.x-csrf-token?', csrf2);
console.log('Has OLD tokenskey?', oldTokenskey);  // ← Esta es la culpable
```

**Esperado resultado:**
- ✅ `__Host-psifi.x-csrf-token: YES`
- ❌ `tokenskey: NO`

**Si ves `tokenskey` pero NO `__Host-psifi.x-csrf-token`:**
→ **Esa es tu culpable. La cookie vieja no se limpió.**

---

### Paso 2: ¿El servidor está seteando la cookie correcta?

```javascript
// Hacer GET /csrf-token y ver qué pasa
console.log('=== CHECKING CSRF TOKEN ENDPOINT ===');

const resp = await fetch('/api/csrf-token', {
  method: 'GET',
  credentials: 'include'
});

const data = await resp.json();

console.log('Response status:', resp.status);
console.log('Token in response:', data.token.substring(0, 40) + '...');

// AHORA checar si la cookie cambió
console.log('\n=== AFTER GET /csrf-token ===');
document.cookie.split('; ').forEach(cookie => {
  const [name, value] = cookie.split('=');
  if (name.includes('csrf') || name.includes('token')) {
    console.log(`${name}: ${value.substring(0, 40)}...`);
  }
});
```

**Esperado resultado:**
```
Response status: 200
Token in response: a2D2121a4d0c646...

=== AFTER GET /csrf-token ===
__Host-psifi.x-csrf-token: a2D2121a4d0c646...
(NO other token cookies)
```

**Problemas detectables:**
- ❌ Response token diferente al cookie → Backend error
- ❌ Varias cookies CSRF-related → Pool de cookies vieja
- ❌ Cookie NO se setea → navegador CORS issue

---

### Paso 3: ¿El cliente está enviando el token correcto?

En NetworkTab de DevTools:

```
1. Haz un POST a /api/documents (u otro endpoint que fallar con 403)
2. Abre ese request
3. Ir a tab "Headers"
4. Buscar:
   - Request Headers → x-csrf-token: 352567114...
   - Cookies → __Host-psifi.x-csrf-token: a2D2121a4d...
5. ¿Son iguales? NO ❌
```

**Si son diferentes:**
- Cliente obtiene `352567114...` del response body
- Pero cookie tiene `a2D2121a4d...`
- **El servidor está devolviendo un token diferente al que setea en cookie**

---

### Paso 4: Uso la herramienta automática

Ejecuta lo que creé para ti:

```javascript
await window.__CSRF_DEBUG.checkTokens()
```

Te dirá:
- ✅ Qué token se obtiene del servidor
- 🍪 Qué cookies están presentes
- 📊 Si hay MISMATCH entre response y cookie
- 🎯 El resultado de un POST test

---

## 📊 Matriz de Diagnosis

| Escenario | Síntoma | Root Cause | Solución |
|-----------|---------|-----------|----------|
| **A** | Cookie `tokenskey` visible | Vieja sesión sin limpiar | Clear cookies, incognito mode |
| **B** | Response token ≠ Cookie token | Backend devuelve otro | Backend: verifica generateCsrfToken |
| **C** | Cookie `psifi.x-csrf-token` vacío | No se está seteando | Backend check Set-Cookie header |
| **D** | Cookie no se envía al POST | CORS/credentials issue | Frontend: `withCredentials: true` |
| **E** | Todo correcto pero sigue fallando | Validación backend incorrecta | Backend: verifica csrf.middleware.ts |

---

## 🎯 Preguntas Clave

1. **¿Cuál es el nombre EXACTO de la cookie que ves en DevTools?**
   - Si es `tokenskey` → vieja, limpiarla
   - Si es `__Host-psifi.x-csrf-token` → correcta
   - Si es `psifi.x-csrf-token` → correcta pero DEV no PRD

2. **¿El valor en la cookie === el valor en el header x-csrf-token?**
   - SÍ → Cookie se está enviando correctamente
   - NO → El cliente obtiene un token diferente del que se setea en cookie

3. **¿El servidor generó la cookie en GET /csrf-token?**
   - Revisa Network tab → GET /csrf-token → Response Headers
   - ¿Ves `Set-Cookie: __Host-psifi.x-csrf-token=...`?

---

## 🚀 Pasos a Ejecutar (Ahora)

```javascript
// En consola del navegador en PRD:

// 1. Ver TODAS las cookies
console.clear();
console.log('=== ALL COOKIES ===');
const allCookies = document.cookie.split('; ');
allCookies.forEach(c => console.log(c));

// 2. Ejecutar el debug completo
await window.__CSRF_DEBUG.checkTokens();

// 3. Ver ambiente
const env = window.__CSRF_DEBUG.getEnvironmentInfo();
console.table(env);
```

Luego compartir:
- Output de los 3 commands arriba
- Screenshot de Network tab → GET /csrf-token → Response Headers
- Screenshot de Network tab → POST /api/documents → Request Headers/Cookies (donde falla 403)

---

## 📝 Próxima Acción

1. **Ejecuta los 3 commands** arriba
2. **Toma screenshots**
3. **Comparte con backend team:**
   - Nombre exacto de cookie que ves
   - Si hay mismatch entre response y cookie
   - Si Set-Cookie se está enviando

**De allí podemos identificar si es:**
- 👤 **Frontend issue** (mi código) → Puedo arreglarlo
- 🖥️ **Backend issue** (su código) → Ellos pueden arreglarlo
- 🔗 **Communication issue** (entre frontend/backend) → Coordinamos la solución
