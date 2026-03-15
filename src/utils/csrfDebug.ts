/**
 * Utilidades para debuggear el flujo CSRF en el navegador
 * Úsalo en la consola del navegador para verificar los tokens
 */

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
    console.warn('=== CSRF TOKEN DEBUG ===');

    // 1. Obtener token del servidor
    try {
      console.log('1️⃣  Fetching new token from GET /api/csrf-token...');
      const response = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();
      const serverToken = data.token || data.csrfToken;

      console.log('   ✅ Response status:', response.status);
      console.log('   📦 Response body:', data);
      console.log('   🔑 Token from body:', serverToken ? `${serverToken.substring(0, 30)}...` : 'MISSING');
    } catch (error) {
      console.error('   ❌ Error fetching token:', error);
    }

    // 2. Verificar cookies del navegador
    console.log('\n2️⃣  Checking cookies in browser...');
    const cookies = document.cookie.split('; ').reduce(
      (acc, cookie) => {
        const [name, value] = cookie.split('=');
        if (name.includes('csrf') || name.includes('token')) {
          acc[name] = value ? `${value.substring(0, 30)}...` : 'EMPTY';
        }
        return acc;
      },
      {} as Record<string, string>
    );

    if (Object.keys(cookies).length === 0) {
      console.warn('   ⚠️  No CSRF-related cookies found');
    } else {
      console.log('   🍪 Cookies:', cookies);
    }

    // 3. Obtener token del cliente desde el header axios
    console.log('\n3️⃣  Checking Axios CSRF token in memory...');
    try {
      // Importar la función getCsrfToken de httpClient
      const { getCsrfToken } = await import('../api/httpClient.config');
      const axiosToken = getCsrfToken();
      console.log(`   🎯 Axios in-memory token: ${axiosToken ? `${axiosToken.substring(0, 30)}...` : 'EMPTY'}`);
    } catch (error) {
      console.error('   ❌ Could not get Axios token:', error);
    }

    // 4. Hacer un POST test y capturar qué se envía
    console.log('\n4️⃣  Testing with a sample POST request...');
    try {
      const testResponse = await fetch('/api/test-csrf', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: true }),
      });

      console.log('   Response status:', testResponse.status);
      if (testResponse.status === 403) {
        console.error('   ❌ 403 Forbidden - CSRF validation failed');
        const error = await testResponse.json();
        console.log('   Error:', error);
      } else {
        console.log('   ✅ Request succeeded');
      }
    } catch (error) {
      console.error('   Error during test POST:', error);
    }

    console.warn('=== END DEBUG ===\n');
  },

  /**
   * Listar TODAS las cookies (incluyendo httpOnly que no se ven)
   * El servidor puede loguear esto
   */
  getAllCookies() {
    console.log('All cookies (visible ones):');
    console.log(document.cookie);
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
      console.log('✅ New token fetched:', data.token ? `${data.token.substring(0, 30)}...` : 'MISSING');
      return data.token;
    } catch (error) {
      console.error('❌ Error refetching token:', error);
    }
  },
};

// Exponer en window para acceso desde consola
if (typeof window !== 'undefined') {
  (window as any).__CSRF_DEBUG = csrfDebugUtils;
  console.log('💡 CSRF Debug utils available. Run: await window.__CSRF_DEBUG.checkTokens()');
}

export default csrfDebugUtils;
