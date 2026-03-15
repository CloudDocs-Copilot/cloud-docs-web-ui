/**
 * Utilidades para debuggear el flujo CSRF en el navegador
 * Úsalo en la consola del navegador para verificar los tokens
 */

// Extender Window para agregar propiedades de debug sin usar 'any'
declare global {
  interface Window {
    __CSRF_DEBUG: typeof csrfDebugUtils;
  }
}

// Detectar el entorno y el nombre esperado de la cookie
const isProduction = window.location.protocol === 'https:' && !window.location.hostname.includes('localhost');
const EXPECTED_CSRF_COOKIE_NAME = isProduction ? '__Host-psifi.x-csrf-token' : 'psifi.x-csrf-token';

/**
 * Obtiene el valor de una cookie por su nombre exacto
 */
function getCookieValueByName(name: string): string | null {
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}

/**
 * Obtiene el valor de una cookie por búsqueda parcial (incluye __Host- prefix)
 */
function findCookieByPartial(partial: string): { name: string; value: string } | null {
  const cookies = document.cookie.split('; ');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split('=');
    if (cookieName.includes(partial)) {
      return { name: cookieName, value: decodeURIComponent(cookieValue) };
    }
  }
  return null;
}

/**
 * Obtiene todas las cookies CSRF (cualquier nombre que tenga "csrf" o "token")
 */
function getAllCSRFRelatedCookies(): Record<string, string> {
  return document.cookie.split('; ').reduce(
    (acc, cookie) => {
      const [name, value] = cookie.split('=');
      if (name.includes('csrf') || name.includes('token') || name.includes('Cookie')) {
        acc[name] = value ? `${value.substring(0, 30)}...` : 'EMPTY';
      }
      return acc;
    },
    {} as Record<string, string>
  );
}

/**
 * Obtiene el token CSRF del cliente y del servidor
 * Ejecutar en console del navegador:
 * 
 * await window.__CSRF_DEBUG.checkTokens()
 */
export const csrfDebugUtils = {
  /**
   * Comprueba qué tokens están en el navegador vs servidor
   */
  async checkTokens() {
    console.clear();
    console.warn('=== 🔐 CSRF TOKEN DEBUG ===');
    console.log(`Environment: ${isProduction ? '🌐 PRODUCTION' : '🖥️  DEVELOPMENT'}`);
    console.log(`Expected cookie name: "${EXPECTED_CSRF_COOKIE_NAME}"\n`);

    // 1. Obtener token del servidor
    try {
      console.log('1️⃣  Fetching CSRF token from GET /api/csrf-token...');
      const response = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();
      const serverToken = data.token || data.csrfToken;

      console.log('   ✅ Response status:', response.status);
      console.log(`   📦 Token from response: ${serverToken ? `${serverToken.substring(0, 40)}...` : 'MISSING'}`);
      console.log(`   📏 Token length: ${serverToken?.length || 0}`);
    } catch (error) {
      console.error('   ❌ Error fetching token:', error);
    }

    // 2. Verificar cookies del navegador - EXACTO Y BÚSQUEDA
    console.log('\n2️⃣  Checking cookies in browser...');
    console.log(`   🔍 Looking for EXACT cookie name: "${EXPECTED_CSRF_COOKIE_NAME}"`);

    const exactCookie = getCookieValueByName(EXPECTED_CSRF_COOKIE_NAME);
    if (exactCookie) {
      console.log(`   ✅ Found exact cookie: ${exactCookie.substring(0, 40)}...`);
      console.log(`   📏 Length: ${exactCookie.length}`);
    } else {
      console.warn(`   ❌ Exact cookie NOT found`);
    }

    // Buscar por parcial (en caso de que el nombre sea ligeramente diferente)
    const partialCookie = findCookieByPartial('psifi');
    if (partialCookie && partialCookie.name !== EXPECTED_CSRF_COOKIE_NAME) {
      console.warn(`   ⚠️  Found DIFFERENT CSRF cookie: "${partialCookie.name}"`);
      console.log(`      Value: ${partialCookie.value.substring(0, 40)}...`);
      console.log(`      📏 Length: ${partialCookie.value.length}`);
    }

    // Todas las cookies relacionadas
    console.log(`\n   🍪 ALL cookies with "csrf", "token", or "Cookie":`);
    const allCookies = getAllCSRFRelatedCookies();
    if (Object.keys(allCookies).length === 0) {
      console.warn('   ⚠️  No CSRF-related cookies found');
    } else {
      Object.entries(allCookies).forEach(([name, value]) => {
        console.log(`      • ${name}: ${value}`);
      });
    }

    // 3. Obtener token del cliente desde el header axios
    console.log('\n3️⃣  Checking Axios CSRF token in memory...');
    try {
      // Importar la función getCsrfToken de httpClient
      const { getCsrfToken } = await import('../api/httpClient.config');
      const axiosToken = getCsrfToken();
      if (axiosToken) {
        console.log(`   ✅ Axios in-memory token: ${axiosToken.substring(0, 40)}...`);
        console.log(`   📏 Length: ${axiosToken.length}`);
      } else {
        console.warn('   ❌ Axios token is EMPTY - never fetched or cleared');
      }
    } catch (error) {
      console.error('   ❌ Could not get Axios token:', error);
    }

    // 4. COMPARACIÓN CRÍTICA
    console.log('\n4️⃣  TOKEN COMPARISON (Critical)...');
    try {
      const csrfResp = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'include',
      });
      const csrfData = await csrfResp.json();
      const responseToken = csrfData.token;
      const cookieToken = exactCookie || (partialCookie?.value);

      console.log('\n   📊 Comparison:');
      console.log(`   • Response token: ${responseToken.substring(0, 40)}...`);
      console.log(`   • Cookie token:   ${cookieToken ? cookieToken.substring(0, 40) + '...' : 'MISSING'}`);
      
      if (responseToken === cookieToken) {
        console.log('   ✅ MATCH! Response === Cookie (correct)');
      } else {
        console.error('   ❌ MISMATCH! Response !== Cookie (THIS IS THE PROBLEM)');
        console.error('      The server returned a different token than what it set in the cookie');
      }
    } catch (error) {
      console.error('   ❌ Error during comparison:', error);
    }

    // 5. Hacer un POST test y capturar detailed info
    console.log('\n5️⃣  Testing with a sample POST request...');
    try {
      const testResponse = await fetch('/api/csrf-token', {  // Usamos mismo endpoint para test
        method: 'POST',  // Cambiar a POST para que valide CSRF
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: true }),
      });

      console.log(`   📊 Response status: ${testResponse.status}`);
      if (testResponse.status === 403) {
        console.error('   ❌ 403 Forbidden - CSRF validation failed');
        const error = await testResponse.json();
        console.error('   Error details:', error);
      } else if (testResponse.status === 405) {
        console.log('   ℹ️  Method Not Allowed (endpoint not for POST, but CSRF would have validated)');
      } else {
        console.log('   ✅ Request succeeded');
      }
    } catch (error) {
      console.error('   Error during test POST:', error);
    }

    console.warn('=== END DEBUG ===\n');
    console.log('💡 Next steps:');
    console.log('   1. Check if MISMATCH? If yes, backend is setting wrong cookie');
    console.log('   2. Check if cookie token is MISSING? If yes, withCredentials might not work');
    console.log(`   3. Expected cookie name: "${EXPECTED_CSRF_COOKIE_NAME}"`);
    console.log('   4. Share output with backend team if something is wrong');
  },

  /**
   * Listar TODAS las cookies (incluyendo httpOnly que no se ven)
   * El servidor puede loguear esto
   */
  getAllCookies() {
    console.log('All visible cookies:');
    const cookies = document.cookie.split('; ').reduce(
      (acc, cookie) => {
        const [name, value] = cookie.split('=');
        acc[name] = value ? `${value.substring(0, 50)}...` : 'EMPTY';
        return acc;
      },
      {} as Record<string, string>
    );
    console.table(cookies);
  },

  /**
   * Verificar específicamente la cookie CSRF
   */
  checkCSRFCookie() {
    console.log(`🔍 Checking for CSRF cookie: "${EXPECTED_CSRF_COOKIE_NAME}"`);
    const cookie = getCookieValueByName(EXPECTED_CSRF_COOKIE_NAME);
    if (cookie) {
      console.log(`✅ Found: ${cookie}`);
      return cookie;
    } else {
      console.warn(`❌ Not found`);
      console.log('   Available CSRF-related cookies:');
      getAllCSRFRelatedCookies();
      return null;
    }
  },

  /**
   * Forzar un re-fetch del token
   */
  async refetchToken() {
    console.log('🔄 Refetching CSRF token...');
    try {
      const response = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      console.log('✅ New token fetched:', data.token ? `${data.token.substring(0, 40)}...` : 'MISSING');
      
      // Verificar si la cookie se actualizó
      const cookie = getCookieValueByName(EXPECTED_CSRF_COOKIE_NAME);
      if (cookie) {
        console.log('✅ Cookie also updated:', `${cookie.substring(0, 40)}...`);
      } else {
        console.warn('❌ Cookie was NOT updated by the server');
      }
      
      return data.token;
    } catch (error) {
      console.error('❌ Error refetching token:', error);
    }
  },

  /**
   * Información del entorno
   */
  getEnvironmentInfo() {
    return {
      isProduction,
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      expectedCookieName: EXPECTED_CSRF_COOKIE_NAME,
      currentCSRFCookie: getCookieValueByName(EXPECTED_CSRF_COOKIE_NAME),
    };
  },
};

// Exponer en window para acceso desde consola
if (typeof window !== 'undefined') {
  window.__CSRF_DEBUG = csrfDebugUtils;
  console.log('💡 CSRF Debug utils loaded. Available methods:');
  console.log('   • await window.__CSRF_DEBUG.checkTokens() - Full diagnostic');
  console.log('   • window.__CSRF_DEBUG.checkCSRFCookie() - Check just the cookie');
  console.log('   • await window.__CSRF_DEBUG.refetchToken() - Force new token');
  console.log('   • window.__CSRF_DEBUG.getAllCookies() - List all cookies');
  console.log('   • window.__CSRF_DEBUG.getEnvironmentInfo() - Environment details');
}

export default csrfDebugUtils;

