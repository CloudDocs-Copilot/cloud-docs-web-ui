# ⚡ QUICK START - Diagnóstico CSRF en 5 Minutos

**Objetivo:** Diagnosticar por qué devuelve 403 CSRF al crear organización

---

## 🚀 Paso 1: Ejecutar Script Automático (2 min)

### En DevTools Console (F12):

1. **Copia TODO** el contenido de [csrf-diagnostic-console.js](csrf-diagnostic-console.js)
2. **Pega** en DevTools Console
3. **Presiona Enter**

**Esperado:** Verás tabla con ✅ PASSED y ❌ FAILED

```
✅ PASSED (8):
   ✓ Axios installation detected
   ✓ API client configured
   ✓ CSRF token found at window.csrfToken
   ...

❌ FAILED (0):
   (Nada = Todo bien)
```

---

## 📊 Paso 2: Revisar Network Tab (1 min)

### Si el script dice ❌ FAILED, abre DevTools Network tab:

1. **Filtra por "csrf-token"**
   ```
   GET /api/csrf-token            ← Deberías ver AQUÍ
   ✅ Status 200
   ✅ Response: { "token": "..." }
   ```

2. **Filtra por "organizations"**
   ```
   POST /api/organizations        ← Cuando intentes crear org
   ✅ Request Headers:
      x-csrf-token: d4f5e6g7h8i9...
      cookie: psifi_csrf_token=...; token=...;
   ```

**Si falta `x-csrf-token` header → PROBLEMA CRÍTICO (ir a #3)**

---

## 🔧 Paso 3: Si Falla (2 min)

### ❌ Error: "No CSRF Token"

El script dice `csrfToken NOT stored`:

```bash
# En console:
console.log(window.csrfToken)
# Si ves undefined → Token no se almacenó
```

**Solución:** Revisar que CsrfProvider está cargado
```
App.tsx
└── CsrfProvider ← Debe estar AQUÍ
    └── Rutas
```

---

### ❌ Error: "Missing x-csrf-token header"

El POST no incluye el header:

**Solución:** El interceptor de axios NO está funcionando

**Verificar en [src/api/httpClient.config.ts](src/api/httpClient.config.ts):**

```typescript
// Deberías ver:
axiosInstance.interceptors.request.use(async (config) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method)) {
    if (!csrfToken) await fetchCsrfToken();
    config.headers['x-csrf-token'] = csrfToken;  // ← DEBE estar
  }
  return config;
});
```

Si NO está, revisar ese archivo completo.

---

### ❌ Error: "No request interceptor found"

Axios no tiene interceptor configura.

**Solución:** Abrir [src/api/httpClient.config.ts](src/api/httpClient.config.ts) y verificar que `createAxiosInstance()` crea interceptors.

---

## 🎯 Paso 4: Verificar en Consola (Copiar-Pegar)

```javascript
// 1. Ver token actual
__CSRF_DEBUG__.getToken()

// 2. Ver cookies CSRF
const cookies = document.cookie.split(';').filter(c => c.includes('csrf') || c.includes('token'));
console.log('Cookies:', cookies)

// 3. Simular qué se enviaría en POST
__CSRF_DEBUG__.simulatePost()
```

---

## ✅ Checklist Ráp... ido de 30 segundos

Marca V o X:

- [ ] Script automático muestra ✅ en token storage
- [ ] Network tab muestra GET /csrf-token con 200 OK
- [ ] Network tab POST /organizations tiene x-csrf-token header
- [ ] GET /csrf-token aparece DESPUÉS de login (si hiciste login)

Si TODAS tienen ✅ → **CSRF está configurado correctamente**

---

## 📋 Si todo está bien ¿Por qué da 403?

Posibles causas:

| Causa | Síntoma | Test |
|-------|---------|------|
| **Token expirado** | Token fue obtenido hace >30min | Actualizar página, ejecutar `__CSRF_DEBUG__.refreshToken()` |
| **Dominio diferente** | Frontend en vercel.app, backend en onrender | Verificar URL en Network tab |
| **Cookies HttpOnly** | El header está pero falta cookie | Network tab → Cookies solicitadas |
| **Backend rechaza** | Incluso Postman da 403 | Revisar logs del backend |

---

## 🆘 Yo ejecuté todo ¿Qué hago ahora?

1. **Guarda los resultados:**
   ```javascript
   console.save(__CSRF_DIAGNOSTIC_RESULTS__, 'csrf-results.json');
   ```

2. **Copia el output de la console**

3. **Comparte en el issue:**
   - Imagen del Network tab (GET /csrf-token y POST /organizations)
   - Output del script automático
   - URL del frontend
   - ¿Cuando ocurre el problema? (login / crear org / siempre)

---

## 📞 Documentación Completa

Para detalles técnicos profundos, ver:
- [FRONTEND-CSRF-DIAGNOSTIC.md](FRONTEND-CSRF-DIAGNOSTIC.md) - Guía de 300+ líneas con todo

---

**Creado:** 16 Marzo 2026  
**Última actualización:** Hoy
