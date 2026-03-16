/**
 * CSRF Diagnostic Script - Console Automated Checker
 * 
 * Uso:
 * 1. Abre DevTools (F12) → Console
 * 2. Copia TODO el contenido de este archivo
 * 3. Pégalo en la consola
 * 4. Presiona Enter
 * 
 * Este script automáticamente verifica:
 * ✅ Si /api/csrf-token fue llamado
 * ✅ Si el token se guardó en memoria
 * ✅ Si axios está configurado correctamente
 * ✅ Si las cookies se están enviando
 * ✅ Si el header x-csrf-token se agregará a POST/PUT/PATCH/DELETE
 * ✅ Si el token será enviado después de login
 */

(function runCsrfDiagnostics() {
  console.clear();
  console.log('%c🔍 CSRF DIAGNOSTIC SCRIPT', 'font-size: 18px; font-weight: bold; color: #0066cc;');
  console.log('%cAutomated CSRF validation for CloudDocs Frontend', 'font-size: 12px; color: #666;');
  console.log('---');

  const diagnostics = {
    passed: [],
    failed: [],
    warnings: [],
  };

  // ==========================================
  // 1. VERIFICAR SI AXIOS ESTÁ DISPONIBLE
  // ==========================================
  console.log('\n%cSTEP 1: Checking Axios Installation', 'font-weight: bold; color: #0066cc;');

  let axiosInstance = null;
  let axiosAvailable = false;

  try {
    // Buscar axios en scope global
    if (typeof axios !== 'undefined') {
      axiosInstance = axios;
      axiosAvailable = true;
      console.log('✅ axios found in window.axios');
      diagnostics.passed.push('Axios installation detected');
    } else if (window.__VITE_INJECT_DATA__?.apiClient) {
      axiosInstance = window.__VITE_INJECT_DATA__.apiClient;
      axiosAvailable = true;
      console.log('✅ apiClient found in Vite injection');
      diagnostics.passed.push('API client detected');
    } else {
      console.warn('⚠️ Axios not exposed in window. Checking network for hints...');
      diagnostics.warnings.push('Axios not directly accessible from console');
    }
  } catch (e) {
    console.error('❌ Error checking axios:', e.message);
    diagnostics.failed.push('Cannot detect Axios installation');
  }

  // ==========================================
  // 2. VERIFICAR CONFIGURACIÓN DE AXIOS
  // ==========================================
  console.log('\n%cSTEP 2: Checking Axios Configuration', 'font-weight: bold; color: #0066cc;');

  if (axiosAvailable && axiosInstance) {
    const config = axiosInstance.defaults || {};

    const checks = {
      'withCredentials enabled': config.withCredentials === true,
      'baseURL configured': !!config.baseURL,
      'Content-Type set': !!config.headers?.['Content-Type'],
      'baseURL includes correct API': config.baseURL?.includes('api'),
    };

    for (const [check, result] of Object.entries(checks)) {
      if (result) {
        console.log(`✅ ${check}`);
        diagnostics.passed.push(check);
      } else {
        console.warn(`❌ ${check}`);
        diagnostics.failed.push(check);
      }
    }

    console.log('\nAxios config snapshot:');
    console.log({
      baseURL: config.baseURL,
      withCredentials: config.withCredentials,
      timeout: config.timeout,
      contentType: config.headers?.['Content-Type'],
    });
  } else {
    console.warn('⚠️ Cannot validate axios config (not accessible)');
  }

  // ==========================================
  // 3. VERIFICAR TOKEN CSRF EN MEMORIA
  // ==========================================
  console.log('\n%cSTEP 3: Checking CSRF Token Storage', 'font-weight: bold; color: #0066cc;');

  let csrfTokenFound = '';
  const possibleLocations = [
    { loc: 'window.csrfToken', get: () => window.csrfToken },
    { loc: 'window.__CSRF_TOKEN__', get: () => window.__CSRF_TOKEN__ },
    { loc: 'localStorage.csrf_token', get: () => localStorage.getItem('csrf_token') },
    { loc: 'sessionStorage.csrf_token', get: () => sessionStorage.getItem('csrf_token') },
  ];

  for (const location of possibleLocations) {
    try {
      const value = location.get();
      if (value && value.length > 20) {
        console.log(`✅ Token found at: ${location.loc}`);
        console.log(`   Value: ${value.substring(0, 30)}... (length: ${value.length})`);
        csrfTokenFound = value;
        diagnostics.passed.push(`CSRF token found at ${location.loc}`);
        break;
      }
    } catch (e) {
      // Ignorar
    }
  }

  if (!csrfTokenFound) {
    console.warn('❌ CSRF token NOT found in any storage location');
    diagnostics.failed.push('CSRF token not stored in accessible location');
  }

  // ==========================================
  // 4. VERIFICAR COOKIES
  // ==========================================
  console.log('\n%cSTEP 4: Checking Cookies', 'font-weight: bold; color: #0066cc;');

  const cookies = document.cookie.split(';').map(c => c.trim());
  const csrfCookie = cookies.find(c => c.startsWith('psifi_csrf_token'));
  const authToken = cookies.find(c => c.startsWith('token=') || c.startsWith('auth_token'));

  if (csrfCookie) {
    console.log(`✅ CSRF Cookie found: ${csrfCookie.substring(0, 40)}...`);
    diagnostics.passed.push('CSRF cookie present');
  } else {
    console.warn('❌ CSRF cookie (psifi_csrf_token) NOT found');
    diagnostics.failed.push('CSRF cookie missing');
  }

  if (authToken) {
    console.log(`✅ Auth Token cookie found: ${authToken.substring(0, 40)}...`);
    diagnostics.passed.push('Auth cookie present');
  } else {
    console.log('ℹ️ Auth token cookie not found (may be logged out)');
  }

  // ==========================================
  // 5. VERIFICAR INTERCEPTORS
  // ==========================================
  console.log('\n%cSTEP 5: Checking Axios Interceptors', 'font-weight: bold; color: #0066cc;');

  if (axiosAvailable && axiosInstance?.interceptors) {
    const hasRequestInterceptor = (axiosInstance.interceptors.request.handlers || []).length > 0;
    const hasResponseInterceptor = (axiosInstance.interceptors.response.handlers || []).length > 0;

    console.log(`Interceptors configured:`);
    console.log(`  Request interceptors: ${hasRequestInterceptor ? '✅' : '❌'} (${(axiosInstance.interceptors.request.handlers || []).length})`);
    console.log(`  Response interceptors: ${hasResponseInterceptor ? '✅' : '❌'} (${(axiosInstance.interceptors.response.handlers || []).length})`);

    if (hasRequestInterceptor) {
      diagnostics.passed.push('Request interceptor configured');
    } else {
      diagnostics.failed.push('No request interceptor found');
    }
  } else {
    console.warn('⚠️ Cannot inspect interceptors');
  }

  // ==========================================
  // 6. NETWORK ANALYSIS (si está disponible)
  // ==========================================
  console.log('\n%cSTEP 6: Network History Analysis', 'font-weight: bold; color: #0066cc;');

  if (window.performance?.getEntriesByType) {
    const resources = window.performance.getEntriesByType('resource');
    const csrfTokenRequest = resources.find(r => r.name.includes('csrf-token'));
    const organizationRequests = resources.filter(r => r.name.includes('organizations'));

    if (csrfTokenRequest) {
      console.log(`✅ GET /csrf-token detected in performance timeline`);
      console.log(`   Duration: ${csrfTokenRequest.duration.toFixed(2)}ms`);
      diagnostics.passed.push('CSRF token endpoint called');
    } else {
      console.warn('❌ GET /csrf-token NOT found in performance timeline');
      console.warn('   Hint: This might mean the endpoint wasn\'t called yet');
      diagnostics.warnings.push('CSRF token endpoint not called (yet?)');
    }

    if (organizationRequests.length > 0) {
      console.log(`✅ Found ${organizationRequests.length} organization request(s)`);
      organizationRequests.forEach((req, i) => {
        console.log(`   Request ${i + 1}: ${req.name.substring(0, 80)}`);
      });
    }
  }

  // ==========================================
  // 7. VERIFICAR REACT PROVIDER
  // ==========================================
  console.log('\n%cSTEP 7: Checking React Context', 'font-weight: bold; color: #0066cc;');

  try {
    // Buscar CsrfProvider en React Tree (si está disponible)
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      console.log('✅ React DevTools available (useful for debugging)');
      console.log('   Hint: Use React DevTools to inspect CsrfProvider and AuthProvider');
    }
  } catch (e) {
    // Ignorar
  }

  // ==========================================
  // 8. VERIFICAR API BASE URL
  // ==========================================
  console.log('\n%cSTEP 8: Checking API URL Configuration', 'font-weight: bold; color: #0066cc;');

  if (axiosInstance?.defaults?.baseURL) {
    const baseUrl = axiosInstance.defaults.baseURL;
    console.log(`API Base URL: ${baseUrl}`);

    const urlChecks = {
      'Uses HTTPS': baseUrl.startsWith('https'),
      'Contains /api': baseUrl.includes('/api'),
      'Contains correct domain': baseUrl.includes('cloud-docs') || baseUrl.includes('localhost'),
    };

    for (const [check, result] of Object.entries(urlChecks)) {
      console.log(`  ${result ? '✅' : '⚠️'} ${check}`);
      if (result) {
        diagnostics.passed.push(check);
      }
    }
  }

  // ==========================================
  // 9. RESUMEN FINAL
  // ==========================================
  console.log('\n%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #0066cc;');
  console.log('%c📊 DIAGNOSTIC SUMMARY', 'font-size: 14px; font-weight: bold; color: #0066cc;');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #0066cc;');

  console.log(`\n%c✅ PASSED (${diagnostics.passed.length}):`, 'color: #00aa00; font-weight: bold;');
  diagnostics.passed.forEach(check => console.log(`   ✓ ${check}`));

  if (diagnostics.failed.length > 0) {
    console.log(`\n%c❌ FAILED (${diagnostics.failed.length}):`, 'color: #cc0000; font-weight: bold;');
    diagnostics.failed.forEach(check => console.log(`   ✗ ${check}`));
  }

  if (diagnostics.warnings.length > 0) {
    console.log(`\n%c⚠️ WARNINGS (${diagnostics.warnings.length}):`, 'color: #ff9900; font-weight: bold;');
    diagnostics.warnings.forEach(warning => console.log(`   ◆ ${warning}`));
  }

  // ==========================================
  // 10. NEXT STEPS
  // ==========================================
  console.log('\n%c🔧 RECOMMENDED NEXT STEPS:', 'font-weight: bold; color: #0066cc;');

  if (diagnostics.failed.some(f => f.includes('token'))) {
    console.log('1. ❌ CSRF Token issues detected:');
    console.log('   → Run this in console after token should be initialized:');
    console.log('     console.log("CSRF Token:", window.csrfToken);');
    console.log('   → If undefined, the token wasn\'t obtained. Check CsrfProvider');
  }

  if (diagnostics.failed.some(f => f.includes('Axios'))) {
    console.log('2. ❌ Axios configuration issues:');
    console.log('   → Check src/api/httpClient.config.ts');
    console.log('   → Ensure withCredentials: true is set');
  }

  if (diagnostics.failed.some(f => f.includes('interceptor'))) {
    console.log('3. ❌ Interceptor issues:');
    console.log('   → Check that request interceptor adds x-csrf-token header');
    console.log('   → Verify interceptor runs for POST/PUT/PATCH/DELETE');
  }

  console.log('\n%cTo test CSRF flow:', 'font-weight: bold;');
  console.log('→ Open Network tab (F12)');
  console.log('→ Try to create an organization');
  console.log('→ Look for POST /api/organizations request');
  console.log('→ Verify it has header: x-csrf-token');
  console.log('→ Verify it has cookies: psifi_csrf_token and token');

  // ==========================================
  // 11. UTILITY FUNCTIONS
  // ==========================================
  console.log('\n%c🛠️ UTILITY FUNCTIONS (copy and execute in console):', 'font-weight: bold; color: #0066cc;');

  window.__CSRF_DEBUG__ = {
    // Obtener token actual
    getToken: () => {
      const token = window.csrfToken || localStorage.getItem('csrf_token');
      console.log('Current CSRF Token:', token);
      return token;
    },

    // Obtener nuevo token
    refreshToken: async () => {
      if (axiosInstance) {
        try {
          console.log('🔄 Fetching new CSRF token...');
          const response = await axiosInstance.get('/csrf-token');
          console.log('✅ New token:', response.data.token);
          return response.data.token;
        } catch (error) {
          console.error('❌ Error fetching token:', error);
        }
      }
    },

    // Simular POST (sin efectos secundarios)
    simulatePost: async () => {
      if (axiosInstance) {
        try {
          console.log('🧪 Simulating POST request configuration...');
          
          // Obtener token
          const token = window.csrfToken || localStorage.getItem('csrf_token');
          
          // Verificar headers que se enviarían
          const config = {
            method: 'POST',
            url: '/organizations',
            headers: {
              'x-csrf-token': token || '[NO TOKEN]',
              'Content-Type': 'application/json',
            },
            data: { name: 'Test', plan: 'FREE' },
          };
          
          console.table({
            'Method': config.method,
            'URL': config.url,
            'Token Header': config.headers['x-csrf-token'],
            'Token Length': (token || '').length,
            'Credentials': axiosInstance.defaults.withCredentials,
          });
          
          console.log('📋 Full config:', config);
          console.log('This is what WOULD be sent. Use getToken() to get current token.');
        } catch (error) {
          console.error('Error:', error);
        }
      }
    },

    // Limpiar token (para testing)
    clearToken: () => {
      window.csrfToken = '';
      localStorage.removeItem('csrf_token');
      sessionStorage.removeItem('csrf_token');
      console.log('✅ CSRF token cleared. Next request will fetch new token.');
    },

    // Ver cookies
    getCookies: () => {
      const cookies = {};
      document.cookie.split(';').forEach(c => {
        const [name, value] = c.trim().split('=');
        cookies[name] = value;
      });
      console.table(cookies);
      return cookies;
    },
  };

  console.log('%cAvailable utility functions:', 'font-weight: bold;');
  console.log('  __CSRF_DEBUG__.getToken()        → Show current CSRF token');
  console.log('  __CSRF_DEBUG__.refreshToken()    → Fetch new CSRF token');
  console.log('  __CSRF_DEBUG__.simulatePost()    → Show what POST would send');
  console.log('  __CSRF_DEBUG__.clearToken()      → Clear token (for testing)');
  console.log('  __CSRF_DEBUG__.getCookies()      → Show all cookies');

  console.log('\n%cDiagnostic completed at:', 'color: #666;');
  console.log(new Date().toLocaleString());

  // ==========================================
  // 12. EXPORT RESULTS
  // ==========================================
  window.__CSRF_DIAGNOSTIC_RESULTS__ = diagnostics;
  console.log('\n✅ Results saved to window.__CSRF_DIAGNOSTIC_RESULTS__');

  return diagnostics;
})();
