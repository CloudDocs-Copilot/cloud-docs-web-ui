# API Client Configuration Analysis

## How apiClient Handles Base URLs

### Configuration (src/api/httpClient.config.ts)

```typescript
const API_BASE_URL = 'http://localhost:4000/api'  // Default fallback
// OR from VITE_API_BASE_URL environment variable

const createAxiosInstance = (): AxiosInstance => {
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,  // FULL URL including /api
    timeout: REQUEST_TIMEOUT_MS,
    // ... other config
  });
```

**Key Point**: `baseURL` is set to the FULL URL including `/api`

### URL Construction

When a service calls:
```typescript
apiClient.get('/documents')
```

Axios combines it as:
```
baseURL + route = 'http://localhost:4000/api' + '/documents'
                = 'http://localhost:4000/api/documents' ✅
```

---

## Issue Found in preview.service.ts

### Current Implementation (Lines 189-200)

```typescript
public getPreviewUrl(document: PreviewDocument): string {
  const baseUrl = API_BASE_URL || 'http://localhost:4000/api';
  const url = `${baseUrl}/documents/preview/${document.id}`;
  return url;
}

getDownloadUrl(document: PreviewDocument): string {
  const baseUrl = API_BASE_URL || 'http://localhost:4000/api';
  const url = `${baseUrl}/documents/download/${document.id}`;
  return url;
}
```

### The Problem

1. **Inconsistent URL construction**: These methods manually build the full URL
2. **Not using apiClient**: Unlike all other services that use `apiClient.post/get/etc`
3. **Potential double `/api`**: If there's any misconfiguration or future changes

### Why This Is Problematic

Since `API_BASE_URL` already includes `/api`, these URLs become:
- `http://localhost:4000/api/documents/preview/{id}` ✅ Currently works correctly

BUT:
- If someone later changes the code to expect `API_BASE_URL` to be just the domain (e.g., `http://localhost:4000`), this will break
- The pattern is inconsistent with the rest of the codebase
- These are the ONLY methods doing manual URL construction

### Recommended Solution

**Option 1: Use apiClient directly** (Recommended - Consistent)
```typescript
public async getPreviewUrl(document: PreviewDocument): Promise<string> {
  // Let apiClient handle the URL construction
  return apiClient.getUri({
    url: `/documents/preview/${document.id}`
  });
}

// If you need the raw URL for client-side usage:
public getPreviewUrl(document: PreviewDocument): string {
  // Use the same URL that apiClient would construct
  return `${API_BASE_URL}/documents/preview/${document.id}`;
}
```

**Option 2: Use URL object** (More robust)
```typescript
public getPreviewUrl(document: PreviewDocument): string {
  const baseUrl = new URL(API_BASE_URL);
  baseUrl.pathname += `/documents/preview/${document.id}`;
  return baseUrl.toString();
}
```

**Option 3: Add validation** (Minimal change)
```typescript
public getPreviewUrl(document: PreviewDocument): string {
  // Ensure API_BASE_URL includes /api
  let baseUrl = API_BASE_URL || 'http://localhost:4000/api';
  if (!baseUrl.endsWith('/api')) {
    baseUrl += '/api';
  }
  const url = `${baseUrl}/documents/preview/${document.id}`;
  return url;
}
```

---

## Related Issue in socket-client.service.ts

### Current Implementation (Line 15)

```typescript
function stripApiFromBase(apiBaseStr: string): string {
  // Remove trailing "/api" if present
  return apiBaseStr.replace(/\/api\/?$/, '');
}
```

### The Assumption

This function assumes `API_BASE_URL` ALWAYS ends with `/api`:
- Input: `'http://localhost:4000/api'`
- Output: `'http://localhost:4000'`

### Context

This is used to construct the socket.io URL because socket servers typically run on the base domain, not the `/api` sub-path.

### Potential Issues

1. If `API_BASE_URL` is misconfigured without `/api` (e.g., `http://localhost:4000`):
   - The regex won't match
   - Socket URL becomes `http://localhost:4000` (possibly correct anyway)
   - But it's fragile

2. If `API_BASE_URL` is something like `http://localhost:4000/api/v1`:
   - The regex removes only the last `/api`
   - Result: `http://localhost:4000/v1` ❌ Wrong socket URL

### Recommended Fix

```typescript
function stripApiFromBase(apiBaseStr: string): string {
  // More robust: remove "/api" path segment if it exists
  // Handle cases like: http://localhost:4000/api or http://localhost:4000/api/
  try {
    const url = new URL(apiBaseStr);
    // Remove /api or /api/ from pathname
    url.pathname = url.pathname.replace(/\/api\/?$/, '') || '/';
    return url.toString().replace(/\/$/, ''); // Remove trailing slash
  } catch {
    // Fallback for malformed URLs
    return apiBaseStr.replace(/\/api\/?$/, '');
  }
}
```

Or with documentation:
```typescript
/**
 * Removes the `/api` path segment from an API base URL to get the socket server URL.
 * 
 * Examples:
 * - 'http://localhost:4000/api' → 'http://localhost:4000'
 * - 'http://localhost:4000/api/' → 'http://localhost:4000'
 * - 'http://example.com/api' → 'http://example.com'
 * 
 * @param apiBaseStr - Full API base URL (must end with /api or /api/)
 * @returns Base URL without /api segment
 */
function stripApiFromBase(apiBaseStr: string): string {
  return apiBaseStr.replace(/\/api\/?$/, '');
}
```

---

## Endpoint Summary by Pattern

### Pattern Type 1: Standard apiClient Usage ✅ (50 endpoints)
```typescript
// Most common - let apiClient handle base URL
apiClient.get('/documents')
apiClient.post('/documents/upload', formData)
apiClient.patch('/documents/{id}', data)
```

**Pattern**: Service + apiClient handles everything
**Consistency**: High ✅

### Pattern Type 2: Hardcoded URL Construction ❌ (2 methods in preview.service.ts)
```typescript
// Problem: Manual URL construction
const baseUrl = API_BASE_URL || 'http://localhost:4000/api';
const url = `${baseUrl}/documents/preview/${id}`;
```

**Pattern**: Manual concatenation
**Consistency**: Low ❌

### Pattern Type 3: Base Constants ✅ (ai.service.ts, ai-conversation.service.ts)
```typescript
const AI_BASE = '/ai';
apiClient.post(`${AI_BASE}/ask`, request);
```

**Pattern**: Partial route constants + apiClient
**Consistency**: Medium ~ High ✅

---

## Environment Variable Configuration

### Source Hierarchy (httpClient.config.ts):
1. `globalThis.process.env.VITE_API_BASE_URL` (test/runtime injection)
2. `process.env.VITE_API_BASE_URL` (Node.js environment)
3. `globalThis.__VITE_ENV__.VITE_API_BASE_URL` (Vite test global)
4. `CONFIG_API_BASE_URL` (imported from config/env)
5. Default: `'http://localhost:4000/api'`

### Expected Format
- **Must include `/api` path segment**
- **Must be a full URL** (protocol + domain + path)
- Examples:
  - ✅ `http://localhost:4000/api`
  - ✅ `https://api.example.com/api`
  - ✅ `https://dev.cloudsdocs.com/api`
  - ❌ `localhost:4000` (missing protocol)
  - ❌ `http://localhost:4000` (missing `/api`)

---

## Action Items to Fix Issues

### Priority: HIGH 🔴
1. **Fix preview.service.ts** (2 methods)
   - Replace hardcoded URL construction
   - Use consistent pattern with rest of codebase
   - Consider using apiClient.getUri() or static method

### Priority: MEDIUM 🟡  
2. **Document API_BASE_URL format expectations**
   - Add comment in httpClient.config.ts
   - Add warning in socket-client.service.ts
   - Add validation to ensure `/api` is present

3. **Add URL validation**
   - Validate API_BASE_URL format at startup
   - Warn if `/api` is missing
   - Log actual resolved URL for debugging

### Priority: LOW 🟢
4. **Refactor socket-client.service.ts** URL stripping
   - Use URL API for more robust string manipulation
   - Add comments explaining the /api removal
   - Consider unit tests for edge cases

---

## Statistics

| Metric | Value |
|--------|-------|
| Total service files | 16 |
| Total API endpoints | 52+ |
| Using standard apiClient pattern | 50 (~96%) |
| Manually constructing URLs | 2 (~4%) ❌ |
| Using base constants | 13 (25% of functions) |
| Files affected by issues | 2 |
| Lines of code needing review | ~10 |
