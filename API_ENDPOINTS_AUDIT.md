# API Endpoints Audit - src/services/

## Overview
This document catalogs all API endpoint calls found in the src/services/ directory, organized by service file and endpoint pattern.

---

## Document Service (`document.service.ts`)

### Upload
- **Line 122**: `apiClient.post('/documents/upload', formData, ...)`
  - Endpoint: `/documents/upload`
  - Method: POST with FormData
  - Usage: Document file upload with progress tracking

### Document Listing
- **Line 149**: `apiClient.get<ListDocumentsResponse>('/documents')`
  - Endpoint: `/documents`
  - Method: GET
  - Usage: List all documents

- **Line 165**: `apiClient.get<RecentDocumentsResponse>('/documents/recent/${organizationId}', ...)`
  - Endpoint: `/documents/recent/{organizationId}`
  - Method: GET with params (limit)
  - Usage: Get recent documents for organization

### Document Operations
- **Line 178**: `apiClient.get<GetDocumentResponse>('/documents/${documentId}')`
  - Endpoint: `/documents/{documentId}`
  - Method: GET
  - Usage: Get document details

- **Line 189**: `apiClient.get('/documents/download/${documentId}', { responseType: 'blob' })`
  - Endpoint: `/documents/download/{documentId}`
  - Method: GET with blob response
  - Usage: Download document file

- **Line 203**: `apiClient.delete('/documents/${documentId}')`
  - Endpoint: `/documents/{documentId}`
  - Method: DELETE
  - Usage: Delete document

- **Line 220**: `apiClient.post('/documents/${documentId}/move', { targetFolderId })`
  - Endpoint: `/documents/{documentId}/move`
  - Method: POST
  - Usage: Move document to folder

- **Line 238**: `apiClient.patch('/documents/${documentId}/rename', { filename })`
  - Endpoint: `/documents/{documentId}/rename`
  - Method: PATCH
  - Usage: Rename document

- **Line 256**: `apiClient.post('/documents/${documentId}/copy', { targetFolderId })`
  - Endpoint: `/documents/{documentId}/copy`
  - Method: POST
  - Usage: Copy document to folder

### Document Sharing
- **Line 268**: `apiClient.get<ListDocumentsResponse>('/documents/shared')`
  - Endpoint: `/documents/shared`
  - Method: GET
  - Usage: List shared documents

- **Line 284**: `apiClient.post('/documents/${documentId}/share', { ...shareData })`
  - Endpoint: `/documents/{documentId}/share`
  - Method: POST
  - Usage: Share document

### Membership Operations
- **Line 294**: `apiClient.get<GetActiveOrganizationResponse>('/memberships/active-organization')`
  - Endpoint: `/memberships/active-organization`
  - Method: GET
  - Usage: Get active organization

- **Line 303**: `apiClient.get<OrganizationMembersResponse>('/memberships/organization/${organizationId}/members')`
  - Endpoint: `/memberships/organization/{organizationId}/members`
  - Method: GET
  - Usage: Get organization members

---

## Folder Service (`folder.service.ts`)

### Folder Tree & Contents
- **Line 19**: `apiClient.get<FolderTreeResponse>('/folders/tree', { params: { organizationId } })`
  - Endpoint: `/folders/tree`
  - Method: GET with organizationId param
  - Usage: Get complete folder tree

- **Line 29**: `apiClient.get<FolderContentsResponse>('/folders/${folderId}/contents', { params: { page, limit } })`
  - Endpoint: `/folders/{folderId}/contents`
  - Method: GET with pagination params
  - Usage: Get folder contents

### Folder CRUD
- **Line 39**: `apiClient.post<{ success: boolean; folder: Folder }>('/folders', data)`
  - Endpoint: `/folders`
  - Method: POST
  - Usage: Create new folder

- **Line 48**: `apiClient.patch<{ success: boolean; folder: Folder }>('/folders/${folderId}/move', data)`
  - Endpoint: `/folders/{folderId}/move`
  - Method: PATCH
  - Usage: Move folder

- **Line 59**: `apiClient.patch<{ success: boolean; folder: Folder }>('/folders/${folderId}', data)`
  - Endpoint: `/folders/{folderId}`
  - Method: PATCH
  - Usage: Rename folder (likely)

- **Line 69**: `apiClient.delete('/folders/${folderId}', { params: { force } })`
  - Endpoint: `/folders/{folderId}`
  - Method: DELETE with force param
  - Usage: Delete folder

---

## Preview Service (`preview.service.ts`)

### URL Generation (Hardcoded Base URL)
⚠️ **ISSUE FOUND**: Hardcoded fallback URLs with full `/api` path

- **Line 189-190**: 
  ```typescript
  const baseUrl = API_BASE_URL || 'http://localhost:4000/api';
  const url = `${baseUrl}/documents/preview/${document.id}`;
  ```
  - Endpoint: `/documents/preview/{documentId}`
  - Pattern: Concatenates `API_BASE_URL` + `/documents/preview/{id}`
  - Issue: Hardcoded fallback includes full path including `/api`

- **Line 199-200**:
  ```typescript
  const baseUrl = API_BASE_URL || 'http://localhost:4000/api';
  const url = `${baseUrl}/documents/download/${document.id}`;
  ```
  - Endpoint: `/documents/download/{documentId}`
  - Pattern: Concatenates `API_BASE_URL` + `/documents/download/{id}`
  - Issue: Hardcoded fallback includes full path including `/api`

---

## AI Service (`ai.service.ts`)

### Base Path
- **Line 22**: `const AI_BASE = '/ai';`
  - All AI endpoints use `/ai` prefix

### AI Queries (RAG)
- **Line 49**: `apiClient.post<AiApiResponse<RagResponse>>('${AI_BASE}/ask', request)`
  - Endpoint: `/ai/ask`
  - Method: POST
  - Usage: Ask question across organization documents

- **Line 73**: `apiClient.post<AiApiResponse<RagResponse>>('${AI_BASE}/documents/${documentId}/ask', request)`
  - Endpoint: `/ai/documents/{documentId}/ask`
  - Method: POST
  - Usage: Ask question about specific document

### Text Extraction
- **Line 94**: `apiClient.get<AiApiResponse<ExtractTextResult>>('${AI_BASE}/documents/${documentId}/extract-text')`
  - Endpoint: `/ai/documents/{documentId}/extract-text`
  - Method: GET
  - Usage: Extract text from document

### Document Processing & Analysis
- **Line 117**: `apiClient.post<AiApiResponse<ProcessingResult>>('${AI_BASE}/documents/${documentId}/process', ...)`
  - Endpoint: `/ai/documents/{documentId}/process`
  - Method: POST
  - Usage: Process document for vectorization

- **Line 139**: `apiClient.delete<AiApiResponse<DeleteChunksResult>>('${AI_BASE}/documents/${documentId}/chunks')`
  - Endpoint: `/ai/documents/{documentId}/chunks`
  - Method: DELETE
  - Usage: Delete document chunks

- **Line 160**: `apiClient.post<AiApiResponse<ClassifyResult>>('${AI_BASE}/documents/${documentId}/classify', request)`
  - Endpoint: `/ai/documents/{documentId}/classify`
  - Method: POST
  - Usage: Classify document

- **Line 180**: `apiClient.post<AiApiResponse<SummarizeResult>>('${AI_BASE}/documents/${documentId}/summarize', request)`
  - Endpoint: `/ai/documents/{documentId}/summarize`
  - Method: POST
  - Usage: Summarize document

---

## AI Conversation Service (`ai-conversation.service.ts`)

### Base Path
- **Line 21**: `const BASE = '/ai/conversations';`
  - All conversation endpoints use `/ai/conversations` prefix

### Conversation Operations
- **Listado**: `apiClient.get<ListConversationsResponse>(BASE, { params: query })`
  - Endpoint: `/ai/conversations`
  - Method: GET with optional query params
  
- **Create**: `apiClient.post<CreateConversationResponse>(BASE, data)`
  - Endpoint: `/ai/conversations`
  - Method: POST
  - Usage: Create new conversation

- **Get**: `apiClient.get<GetConversationResponse>('${BASE}/${conversationId}')`
  - Endpoint: `/ai/conversations/{conversationId}`
  - Method: GET
  - Usage: Get conversation with all messages

- **Update**: `apiClient.patch<UpdateConversationResponse>('${BASE}/${conversationId}', data)`
  - Endpoint: `/ai/conversations/{conversationId}`
  - Method: PATCH
  - Usage: Update conversation (title)

- **Delete**: `apiClient.delete<DeleteConversationResponse>('${BASE}/${conversationId}')`
  - Endpoint: `/ai/conversations/{conversationId}`
  - Method: DELETE
  - Usage: Soft delete conversation

---

## Comments Service (`comments.service.ts`)

### Comments Operations
- **Line 10**: `apiClient.get('/comments/documents/${documentId}')`
  - Endpoint: `/comments/documents/{documentId}`
  - Method: GET
  - Usage: Get document comments

- **Line 15**: `apiClient.post('/comments/documents/${documentId}', { content })`
  - Endpoint: `/comments/documents/{documentId}`
  - Method: POST
  - Usage: Create comment

- **Line 20**: `apiClient.patch('/comments/${commentId}', { content })`
  - Endpoint: `/comments/{commentId}`
  - Method: PATCH
  - Usage: Update comment

---

## Dashboard Service (`dashboard.service.ts`)

- **Line 45**: `apiClient.get<OrgStatsResponse>('/organizations/${orgId}/stats')`
  - Endpoint: `/organizations/{orgId}/stats`
  - Method: GET
  - Usage: Get organization statistics

- **Line 50**: `apiClient.get('/memberships/organization/${orgId}/members')`
  - Endpoint: `/memberships/organization/{orgId}/members`
  - Method: GET
  - Usage: Get organization members/stats

---

## Search Service (`search.service.ts`)

### Search Operations
- **Line 85**: `apiClient.get<SearchResponse>('/search?${queryParams.toString()}')`
  - Endpoint: `/search`
  - Method: GET with query parameters (q, organizationId, mimeType, fromDate, toDate, limit, offset)
  - Usage: Search documents with filters

- **Line 106**: `apiClient.get<AutocompleteResponse>('/search/autocomplete?${queryParams.toString()}')`
  - Endpoint: `/search/autocomplete`
  - Method: GET with query parameters (q, organizationId, limit)
  - Usage: Get autocomplete suggestions

---

## Notification Service (`notification.service.ts`)

- **Line 12**: `apiClient.get<ListNotificationsResponse>('/notifications', { params: { limit, offset } })`
  - Endpoint: `/notifications`
  - Method: GET with pagination
  - Usage: Get notifications

- **Line 25**: `apiClient.patch<{ success: boolean; message?: string }>('/notifications/${id}/read')`
  - Endpoint: `/notifications/{id}/read`
  - Method: PATCH
  - Usage: Mark notification as read

- **Line 33**: `apiClient.patch('/notifications/read-all', {})`
  - Endpoint: `/notifications/read-all`
  - Method: PATCH
  - Usage: Mark all notifications as read

---

## User Service (`user.service.ts`)

### Profile Operations
- **Line 53**: `apiClient.get<UserProfileResponse>('/users/profile')`
  - Endpoint: `/users/profile`
  - Method: GET
  - Usage: Get user profile

- **Line 61**: `apiClient.put<UpdateUserProfileResponse>('/users/profile', data)`
  - Endpoint: `/users/profile`
  - Method: PUT
  - Usage: Update user profile

- **Line 69**: `apiClient.put<{ success: boolean; message: string }>('/users/password', data)`
  - Endpoint: `/users/password`
  - Method: PUT
  - Usage: Change password

- **Line 77**: `apiClient.delete<{ success: boolean; message: string }>('/users/profile')`
  - Endpoint: `/users/profile`
  - Method: DELETE
  - Usage: Delete user account

- **Line 89**: `apiClient.post<UploadImageResponse>('/users/profile/image', formData, ...)`
  - Endpoint: `/users/profile/image`
  - Method: POST with FormData
  - Usage: Upload profile image

- **Line 104**: `apiClient.put<UpdateUserProfileResponse>('/users/profile', { preferences })`
  - Endpoint: `/users/profile`
  - Method: PUT
  - Usage: Update user preferences

### User Search
- **Line 119**: `apiClient.get<SearchUsersResponse>('/users/search', { params: { email } })`
  - Endpoint: `/users/search`
  - Method: GET with email parameter
  - Usage: Search users by email

---

## Invitation Service (`invitation.service.ts`)

- **Line 14**: `apiClient.get<InvitationResponse>('/memberships/pending-invitations')`
  - Endpoint: `/memberships/pending-invitations`
  - Method: GET
  - Usage: Get pending invitations

- **Line 24**: `apiClient.post('/memberships/invitations/${membershipId}/accept')`
  - Endpoint: `/memberships/invitations/{membershipId}/accept`
  - Method: POST
  - Usage: Accept invitation

- **Line 35**: `apiClient.post('/memberships/invitations/${membershipId}/reject')`
  - Endpoint: `/memberships/invitations/{membershipId}/reject`
  - Method: POST
  - Usage: Reject invitation

---

## Membership Service (`membership.service.ts`)

- **Line 24**: `apiClient.post('/memberships/organization/${organizationId}/members', payload)`
  - Endpoint: `/memberships/organization/{organizationId}/members`
  - Method: POST
  - Usage: Add members to organization

---

## Socket Client Service (`socket-client.service.ts`)

### URL Helper Functions
- **Line 2**: `import { API_BASE_URL } from '../config/env';`
- **Line 11**: `const apiBase = API_BASE_URL;`
- **Line 15**: `return apiBaseStr.replace(/\/api\/?$/, '');`
  - **Issue**: Removes trailing `/api` from API_BASE_URL to construct socket URL
  - Note: Assumes API_BASE_URL includes full `/api` path

---

## Summary of Issues Found

### 🔴 Critical Issues

1. **Hardcoded `/api` in Fallback URLs** (preview.service.ts)
   - Lines 189-190, 199-200
   - Problem: `API_BASE_URL || 'http://localhost:4000/api'`
   - If `API_BASE_URL = 'http://localhost:4000/api'`, this creates: `http://localhost:4000/api/documents/preview/{id}` ✅ Correct
   - But the hardcoded fallback assumes API_BASE_URL DOES NOT include `/api`
   - If `API_BASE_URL` already has `/api`, you'd get: URL duplication issues

2. **Socket Client URL Stripping** (socket-client.service.ts)
   - Line 15: `apiBaseStr.replace(/\/api\/?$/, '')`
   - Assumes API_BASE_URL ends with `/api`
   - Could be fragile if convention changes

### ⚠️ Observations

1. **Consistent Pattern**: All services use `apiClient.post/get/put/patch/delete` with routes starting with `/`
   - Good: No duplication of base URL in route strings
   - Expected behavior: apiClient already handles the base URL

2. **AI Services Use Base Constants**
   - `ai.service.ts`: `const AI_BASE = '/ai';`
   - `ai-conversation.service.ts`: `const BASE = '/ai/conversations';`
   - Good practice for maintainability

3. **No Hardcoded /api in Routes**: All service calls use routes like `/documents`, `/folders`, etc.
   - apiClient must be configured to handle the base URL

---

## API Endpoint Inventory

| Service | Count | Base Path |
|---------|-------|-----------|
| Documents | 12 | `/documents` |
| Folders | 6 | `/folders` |
| Comments | 3 | `/comments` |
| AI | 8 | `/ai` |
| AI Conversations | 5 | `/ai/conversations` |
| Dashboard | 2 | `/organizations`, `/memberships` |
| Search | 2 | `/search` |
| Notifications | 3 | `/notifications` |
| Users | 7 | `/users` |
| Invitations | 3 | `/memberships/invitations` |
| Memberships | 1 | `/memberships` |
| **Total** | **52** | |

---

## Recommendations

1. **Fix preview.service.ts**: Ensure consistent URL construction
   - Option: Use apiClient directly instead of hardcoding base URL
   - `apiClient.getUri()` or similar to get full URL

2. **Review socket-client.service.ts**: Validate API_BASE_URL format expectations
   - Document clearly what format API_BASE_URL must be in (with or without `/api`)
   - Add validation/assertions

3. **Centralize endpoint constants** (Future refactoring)
   - Consider moving all endpoints to a central config
   - Similar to how AI services use `AI_BASE` constant
