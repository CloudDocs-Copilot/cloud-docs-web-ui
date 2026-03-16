# 🎯 Instrucciones de Uso - Diagnóstico CSRF

**Para:** Equipo Frontend  
**Objetivo:** Resolver problemas de CSRF (403 Forbidden) en producción  
**Tiempo:** 5-15 minutos según complejidad

---

## 📋 Archivos Disponibles

| Archivo | Tipo | Duración | Propósito |
|---------|------|----------|----------|
| [QUICK-START-CSRF-DIAGNOSIS.md](QUICK-START-CSRF-DIAGNOSIS.md) | Guía | 5 min | Diagnóstico rápido |
| [FRONTEND-CSRF-DIAGNOSTIC.md](FRONTEND-CSRF-DIAGNOSTIC.md) | Guía completa | 30 min | Análisis exhaustivo |
| [CSRF-ARCHITECTURE-REFERENCE.md](CSRF-ARCHITECTURE-REFERENCE.md) | Referencia | 20 min | Arquitectura técnica |
| [csrf-diagnostic-console.js](csrf-diagnostic-console.js) | Script | 1 min | Diagnóstico automático |

---

## 🚀 Cómo Empezar (Elige tu camino)

### Opción A: "Dame respuesta rápida" (5 min)

```
1. Lee: QUICK-START-CSRF-DIAGNOSIS.md (secciones 1-2)
2. Ejecuta: Copia csrf-diagnostic-console.js en DevTools Console
3. Lee: Resultados e ir a troubleshooting correspondiente
```

**Salvo:** Tendrá respuesta en 5 minutos

---

### Opción B: "Necesito toda la información" (30 min)

```
1. Lee: FRONTEND-CSRF-DIAGNOSTIC.md completo
2. Ejecuta: Pasos de diagnóstico (paso 1️⃣ al 5️⃣)
3. Resuelve: Según checklist al final del documento
```

**Beneficio:** Entenderá CSRF completamente y sabrá diagnosticar similar problemas

---

### Opción C: "Soy architect" (20 min)

```
1. Lee: CSRF-ARCHITECTURE-REFERENCE.md
2. Revisa: Archivos en src/api/httpClient.config.ts y src/context/CsrfProvider.tsx
3. Entiende: El flujo completo y estados esperados
4. Diseña: Mejoras si aplican
```

**Beneficio:** Comprenderá la arquitectura completa de CSRF en el frontend

---

## 🔍 Guía Rápida por Escenario

### Escenario 1: "Obtengo 403 CSRF en producción"

**Pasos:**

1. **Diagnosticar automáticamente:**
   ```bash
   DevTools (F12) → Console
   # Pega contenido de csrf-diagnostic-console.js
   # Presiona Enter
   ```

2. **Revisar resultados:**
   - ✅ Todos los checks PASSED → Ir a sección 4️⃣ de QUICK-START-CSRF-DIAGNOSIS.md
   - ❌ Alguno FAILED → Ir a sección 3️⃣ ("Si Falla")

3. **Network tab:**
   ```bash
   DevTools (F12) → Network tab
   # Recarga página (Cmd/Ctrl + Shift + R)
   # Filtra por "csrf-token"
   # ¿Ves GET /api/csrf-token con 200 OK?
     SÍ  → Ir paso 2
     NO  → Ver "Problema: No se obtiene token GET"
   ```

---

### Escenario 2: "Funciona en desarrollo pero no en producción"

**Causas comunes:**

1. **URLs diferentes:**
   ```javascript
   // Development:
   // Frontend: http://localhost:3000
   // Backend: http://localhost:4000/api
   
   // Production:
   // Frontend: https://cloud-docs-web-ui.vercel.app
   // Backend: https://cloud-docs-api-service.onrender.com/api
   ```

   **Solución:** Verificar archivo [src/config/env.ts](src/config/env.ts)
   ```typescript
   export const API_BASE_URL = 
     process.env.VITE_API_BASE_URL || 'https://cloud-docs-api-service.onrender.com/api';
   ```

2. **HTTPS vs HTTP:**
   - En desarrollo: cookies sin Secure flag
   - En producción: cookies con Secure flag (requieren HTTPS)
   
   **Solución:** Asegurar ambos en HTTPS

3. **Cookies no se envían (SameSite):**
   - Backend debe retornar: `SameSite=None; Secure`
   - Frontend debe tener: `withCredentials: true` ✅ (ya está)

---

### Escenario 3: "¿Por qué el token se obtiene de nuevo después del login?"

**Es correcto que:**
```
Login → [GET /api/csrf-token] ← DEBE estar aquí

Cuando usuario hace login, necesita nuevo token para la nueva sesión.
```

**Verificar en [src/context/AuthProvider.tsx](src/context/AuthProvider.tsx):**
```typescript
async function handleLogin(credentials) {
  const authRes = await login(credentials);
  
  // DESPUÉS de login exitoso:
  await csrfService.refreshToken();  // ← Obtener nuevo token
  
  // Guardar auth
  setUser(authRes.user);
}
```

---

## ✅ Checklist Pre-Deployment

Antes de desplegar a producción, verifica:

```
OBTENCIÓN DE TOKEN:
- [ ] GET /api/csrf-token retorna 200 OK
- [ ] Response body: { "token": "..." }
- [ ] Response header: Set-Cookie: psifi_csrf_token=...; HttpOnly; Secure; SameSite=None
- [ ] Token tiene 64+ caracteres

ALMACENAMIENTO:
- [ ] window.csrfToken existe y tiene valor
- [ ] Token se obtiene AL MONTAR APP (en CsrfProvider)
- [ ] Token se RENUEVA DESPUÉS de login

ENVÍO:
- [ ] POST /api/organizations tiene header: x-csrf-token
- [ ] Request incluye cookies (Cookie header)
- [ ] axios tiene: withCredentials: true
- [ ] Interceptor agrega header a POST/PUT/PATCH/DELETE

VALIDACIÓN:
- [ ] Token enviado en header = token recibido en respuesta
- [ ] Cookie psifi_csrf_token en ambas direcciones (request/response)
- [ ] Errores 403 CSRF tienen estructura: { code: "E...", message: "..." }

URLS:
- [ ] Frontend: https://cloud-docs-web-ui.vercel.app
- [ ] Backend: https://cloud-docs-api-service.onrender.com/api
- [ ] Ambos en HTTPS (no HTTP)

LOGS:
- [ ] "✅ Token fetched (length: 64)"
- [ ] "✅ Added x-csrf-token header"
- [ ] NO "❌ Error fetching CSRF token"
- [ ] NO "⚠️ MISMATCH: Could not obtain CSRF token"
```

---

## 🆘 Problemas Frecuentes

### P: "El script no encuentra axios"

**R:** Axios podría no estar expuesto globalmente. Solución:
```typescript
// En src/api/httpClient.config.ts (al final):
if (typeof window !== 'undefined') {
  (window as any).apiClient = axiosInstance;
}
```

---

### P: "¿Por qué el token se regenera después de cada petición?"

**R:** NO debería regenerarse. Si ves múltiples GET /csrf-token:
- ❌ Malo: GET /csrf-token, POST /org, GET /csrf-token, PUT /config
- ✅ Bien: GET /csrf-token (al inicio), luego POST, PUT sin regenerar

**Verificar:** `httpClient.config.ts` línea 54-58:
```typescript
if (csrfToken) {
  console.debug('[CSRF] Usando token almacenado (no regenerar)');
  return csrfToken;  // ← Debe reutilizar el token
}
```

---

### P: "¿Las cookies deben tener el prefijo __Host-?"

**R:** Es una buena práctica de seguridad:
- **Desarrollo:** `psifi_csrf_token` (sin prefijo)
- **Producción:** `__Host-psifi_csrf_token` (con prefijo)

El prefijo `__Host-` requiere:
- Secure flag (HTTPS)
- SameSite=None
- No el atributo Domain

**Actual:** Backend lo configura, frontend no necesita tocar.

---

## 📞 Si continúa fallando

**Reúne esta información:**

1. **Screenshot de Network tab:**
   - GET /api/csrf-token (Status, Response)
   - POST /api/organizations (Request Headers, Status)

2. **Output del script:**
   ```javascript
   // Copia en console:
   JSON.stringify(window.__CSRF_DIAGNOSTIC_RESULTS__, null, 2)
   ```

3. **Console logs:**
   - Filtra por "[CSRF]" en la console
   - Copia los logs completos

4. **Metadata:**
   - ¿Cuándo inicia el problema? (justo al cargar, después de login, siempre)
   - ¿Qué navegador? (Chrome, Firefox, Safari)
   - ¿Estado del token?
     ```javascript
     window.__CSRF_DEBUG__.getToken()
     window.__CSRF_DEBUG__.getCookies()
     ```

5. **Backend info:**
   - ¿Qué retorna GET /api/csrf-token?
   - ¿Qué valida el backend en 403 CSRF?
   - ¿Los logs del backend muestran qué tokens recibe?

**Con esto podremos diagnosticar en minutos.**

---

## 📚 Referencias

### Documentación Interna

- [src/api/httpClient.config.ts](src/api/httpClient.config.ts) - Configuración axios
- [src/context/CsrfProvider.tsx](src/context/CsrfProvider.tsx) - Provider React
- [src/utils/csrfDebug.ts](src/utils/csrfDebug.ts) - Funciones debug
- [docs/CSRF-PRD-INVESTIGATION.md](../docs/CSRF-PRD-INVESTIGATION.md) - Investigación backend

### OWASP y Seguridad

- OWASP: CSRF Prevention
- Double Submit Cookie Pattern
- SameSite Cookie Attribute

---

## 🎓 Para Aprender Más

Si quieres entender CSRF a profundidad:

1. **OWASP CSRF Prevention Cheat Sheet**
2. **Double Submit Cookie pattern** (lo que usamos)
3. **SameSite Cookie attribute**
4. **Credentials in Fetch API**

**En nuestro proyecto:**
- El backend valida (no regenera)
- El frontend envía el token
- Axios maneja automáticamente con interceptors

---

## 🚀 Próximas Mejoras (Futuro)

- [ ] Agregar retry automático en 403 CSRF
- [ ] Implementar refrescono automático de token (>30 min)
- [ ] Analytics: tracking de CSRF failures
- [ ] UI: notificación al usuario de "sesión expirada"

---

**Documento:** Instrucciones de Uso  
**Versión:** 1.0  
**Actualizado:** 16 Marzo 2026  
**Mantenedor:** Equipo Frontend
