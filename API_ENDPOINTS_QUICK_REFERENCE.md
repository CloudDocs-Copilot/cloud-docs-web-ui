# Quick Reference: API Endpoints by Service

## Search Index

**Last Updated**: March 15, 2026

---

## 📋 By URL Pattern

### `/documents/*`
| Endpoint | Method | File | Line | Purpose |
|----------|--------|------|------|---------|
| `/documents/upload` | POST | document.service.ts | 122 | Upload file |
| `/documents` | GET | document.service.ts | 149 | List all documents |
| `/documents/recent/{orgId}` | GET | document.service.ts | 165 | Get recent documents |
| `/documents/{id}` | GET | document.service.ts | 178 | Get document details |
| `/documents/download/{id}` | GET | document.service.ts | 189 | Download document |
| `/documents/{id}` | DELETE | document.service.ts | 203 | Delete document |
| `/documents/{id}/move` | POST | document.service.ts | 220 | Move document |
| `/documents/{id}/rename` | PATCH | document.service.ts | 238 | Rename document |
| `/documents/{id}/copy` | POST | document.service.ts | 256 | Copy document |
| `/documents/shared` | GET | document.service.ts | 268 | List shared documents |
| `/documents/{id}/share` | POST | document.service.ts | 284 | Share document |
| `/documents/preview/{id}` | - | preview.service.ts | 190 | Preview URL (hardcoded) ⚠️ |
| `/documents/download/{id}` | - | preview.service.ts | 200 | Download URL (hardcoded) ⚠️ |

### `/folders/*`
| Endpoint | Method | File | Line | Purpose |
|----------|--------|------|------|---------|
| `/folders/tree` | GET | folder.service.ts | 19 | Get folder tree |
| `/folders/{id}/contents` | GET | folder.service.ts | 29 | Get folder contents |
| `/folders` | POST | folder.service.ts | 39 | Create folder |
| `/folders/{id}/move` | PATCH | folder.service.ts | 48 | Move folder |
| `/folders/{id}` | PATCH | folder.service.ts | 59 | Rename folder |
| `/folders/{id}` | DELETE | folder.service.ts | 69 | Delete folder |

### `/ai/*`
| Endpoint | Method | File | Line | Purpose |
|----------|--------|------|------|---------|
| `/ai/ask` | POST | ai.service.ts | 49 | Ask org-wide question |
| `/ai/documents/{id}/ask` | POST | ai.service.ts | 73 | Ask about document |
| `/ai/documents/{id}/extract-text` | GET | ai.service.ts | 94 | Extract text |
| `/ai/documents/{id}/process` | POST | ai.service.ts | 117 | Process document |
| `/ai/documents/{id}/chunks` | DELETE | ai.service.ts | 139 | Delete chunks |
| `/ai/documents/{id}/classify` | POST | ai.service.ts | 160 | Classify document |
| `/ai/documents/{id}/summarize` | POST | ai.service.ts | 180 | Summarize document |

### `/ai/conversations/*`
| Endpoint | Method | File | Line | Purpose |
|----------|--------|------|------|---------|
| `/ai/conversations` | GET | ai-conversation.service.ts | - | List conversations |
| `/ai/conversations` | POST | ai-conversation.service.ts | - | Create conversation |
| `/ai/conversations/{id}` | GET | ai-conversation.service.ts | - | Get conversation |
| `/ai/conversations/{id}` | PATCH | ai-conversation.service.ts | - | Update conversation |
| `/ai/conversations/{id}` | DELETE | ai-conversation.service.ts | - | Delete conversation |

### `/comments/*`
| Endpoint | Method | File | Line | Purpose |
|----------|--------|------|------|---------|
| `/comments/documents/{docId}` | GET | comments.service.ts | 10 | Get comments |
| `/comments/documents/{docId}` | POST | comments.service.ts | 15 | Create comment |
| `/comments/{id}` | PATCH | comments.service.ts | 20 | Update comment |

### `/search/*`
| Endpoint | Method | File | Line | Purpose |
|----------|--------|------|------|---------|
| `/search?q=...` | GET | search.service.ts | 85 | Search documents |
| `/search/autocomplete?q=...` | GET | search.service.ts | 106 | Autocomplete suggestions |

### `/users/*`
| Endpoint | Method | File | Line | Purpose |
|----------|--------|------|------|---------|
| `/users/profile` | GET | user.service.ts | 53 | Get profile |
| `/users/profile` | PUT | user.service.ts | 61 | Update profile |
| `/users/password` | PUT | user.service.ts | 69 | Change password |
| `/users/profile` | DELETE | user.service.ts | 77 | Delete account |
| `/users/profile/image` | POST | user.service.ts | 89 | Upload image |
| `/users/search?email=...` | GET | user.service.ts | 119 | Search users |

### `/notifications/*`
| Endpoint | Method | File | Line | Purpose |
|----------|--------|------|------|---------|
| `/notifications` | GET | notification.service.ts | 12 | List notifications |
| `/notifications/{id}/read` | PATCH | notification.service.ts | 25 | Mark as read |
| `/notifications/read-all` | PATCH | notification.service.ts | 33 | Mark all as read |

### `/memberships/*`
| Endpoint | Method | File | Line | Purpose |
|----------|--------|------|------|---------|
| `/memberships/active-organization` | GET | document.service.ts | 294 | Get active org |
| `/memberships/organization/{orgId}/members` | GET | document.service.ts | 303 | Get org members |
| `/memberships/organization/{orgId}/members` | GET | dashboard.service.ts | 50 | Get org members |
| `/memberships/organization/{orgId}/members` | POST | membership.service.ts | 24 | Add member |
| `/memberships/pending-invitations` | GET | invitation.service.ts | 14 | Get invitations |
| `/memberships/invitations/{id}/accept` | POST | invitation.service.ts | 24 | Accept invitaton |
| `/memberships/invitations/{id}/reject` | POST | invitation.service.ts | 35 | Reject invitation |

### `/organizations/*`
| Endpoint | Method | File | Line | Purpose |
|----------|--------|------|------|---------|
| `/organizations/{id}/stats` | GET | dashboard.service.ts | 45 | Get org stats |

---

## 🔍 By Service File

### ai-conversation.service.ts
- **Prefix**: `/ai/conversations`
- **Pattern**: `const BASE = '/ai/conversations'`
- **Methods**: list, create, get, update, delete

### ai.service.ts  
- **Prefix**: `/ai`
- **Pattern**: `const AI_BASE = '/ai'`
- **Methods**: askOrganization, askDocument, extractText, process, *chunks, classify, summarize

### comments.service.ts
- **Prefix**: `/comments`
- **Endpoints**: 3
- **Pattern**: Direct route strings

### dashboard.service.ts
- **Prefix**: `/organizations`, `/memberships`
- **Endpoints**: 2
- **Purpose**: Stats and member listing

### deletion.service.ts
- **Purpose**: Document/folder deletion
- **Referenced**: In document.service.ts

### document.service.ts
- **Prefix**: `/documents`, `/memberships`
- **Endpoints**: 12 API calls
- **Pattern**: Direct route strings in function calls
- **Special**: Upload with FormData (line 122)

### folder.service.ts
- **Prefix**: `/folders`
- **Endpoints**: 6
- **Pattern**: Exported `folderService` object with methods
- **Special**: Tree structure (line 19)

### invitation.service.ts
- **Prefix**: `/memberships/invitations`
- **Endpoints**: 3
- **Pattern**: Get invitations, accept, reject

### membership.service.ts
- **Prefix**: `/memberships/organization`
- **Endpoints**: 1
- **Purpose**: Add members to organization

### notification.service.ts
- **Prefix**: `/notifications`
- **Endpoints**: 3
- **Pattern**: List, mark read, mark all read

### preview.service.ts  
- **Prefix**: `/documents`
- **Special**: ⚠️ **Hardcoded URL construction** (2 methods)
- **Lines**: 189-190, 199-200
- **Issue**: Manual URL concatenation instead of using apiClient

### search.service.ts
- **Prefix**: `/search`
- **Endpoints**: 2
- **Pattern**: URLSearchParams for query params
- **Methods**: search, autocomplete

### socket-client.service.ts
- **Purpose**: Socket.io configuration
- **Function**: stripApiFromBase() removes `/api` from API_BASE_URL
- **Line 15**: URL regex pattern (may need robustness improvement)

### user.service.ts
- **Prefix**: `/users`
- **Endpoints**: 7
- **Pattern**: Direct route strings
- **Special**: Profile image upload (line 89)

---

## 🚨 Issues Identified

### HIGH Priority
- [ ] **preview.service.ts lines 189-200**: Hardcoded URL construction
  - Methods: `getPreviewUrl()`, `getDownloadUrl()`
  - Fix: Use consistent pattern with other services

### MEDIUM Priority
- [ ] **socket-client.service.ts line 15**: URL regex might be fragile
  - Function: `stripApiFromBase()`
  - Fix: Add validation and documentation
  
- [ ] **Missing validation**: API_BASE_URL format not validated at startup
  - Risk: Silent failures if format changes
  - Fix: Add startup validation

### LOW Priority
- [ ] Consider centralizing endpoint constants (like AI_BASE)
- [ ] Add JSDoc comments for endpoint patterns
- [ ] Add URL construction tests

---

## 📊 Statistics

```
Total Endpoints:     52+
Files:               14 service files
Standard Pattern:    96% (apiClient usage)
Manual URL Build:    4% (preview.service.ts only)
With Base Const:     25% (AI services)

By HTTP Method:
  GET:    25 endpoints
  POST:   17 endpoints
  PATCH:   7 endpoints
  DELETE:  3 endpoints
```

---

## 🔧 Configuration Files

### httpClient.config.ts
- **Lines 6-40**: API_BASE_URL resolution
- **Lines 74-80**: Axios instance creation with baseURL
- **Default**: `'http://localhost:4000/api'`
- **Format**: Must include `/api` path segment

### config/env.ts
- Source of CONFIG_API_BASE_URL
- Check this if endpoints aren't resolving correctly

---

## 📝 Notes

- ✅ **Good**: 96% of services use consistent apiClient pattern
- ✅ **Good**: AI services use base constants for maintainability
- ❌ **Issue**: 2 methods manually construct full URLs
- ⚠️ **Fragile**: Socket URL stripping assumes `/api` format

---

## 💡 Quick Tips

1. **All endpoints start with `/`** - apiClient adds the baseURL
2. **API_BASE_URL includes `/api`** - Don't add it again!
3. **Use string templates** - For dynamic path segments like `${id}`
4. **Use URLSearchParams** - For query parameters (see search.service.ts)
5. **FormData for uploads** - See document.service.ts line 122 example

---

## 🔗 Related Documentation

- [API_ENDPOINTS_AUDIT.md](./API_ENDPOINTS_AUDIT.md) - Complete endpoint inventory with line numbers
- [API_CLIENT_CONFIGURATION_ANALYSIS.md](./API_CLIENT_CONFIGURATION_ANALYSIS.md) - Detailed configuration analysis and fixes
- [httpClient.config.ts](./src/api/httpClient.config.ts) - Axios configuration
