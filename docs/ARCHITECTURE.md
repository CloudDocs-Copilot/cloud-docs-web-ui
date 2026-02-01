# Architecture

This document describes the architecture and code organization of the CloudDocs Web UI.

## Overview

CloudDocs Web UI is a modern React single-page application built with:

- **Framework:** React 19 with React Compiler
- **Language:** TypeScript 5.x
- **Build Tool:** Vite 7.x
- **Styling:** Bootstrap 5 + React Bootstrap
- **HTTP Client:** Axios with interceptors
- **Testing:** Jest + React Testing Library

## Directory Structure

```
cloud-docs-web-ui/
├── src/
│   ├── main.tsx                  # Application entry point
│   ├── App.tsx                   # Root component with routing
│   ├── App.css                   # Global styles
│   ├── index.css                 # CSS reset and base styles
│   │
│   ├── api/                      # HTTP client configuration
│   │   ├── httpClient.config.ts  # Axios instance + CSRF handling
│   │   ├── dataSanitizer.ts      # Input sanitization
│   │   └── README.md             # API usage guide
│   │
│   ├── components/               # Reusable UI components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── DocumentCard.tsx
│   │   ├── FolderTree.tsx
│   │   └── ...
│   │
│   ├── pages/                    # Route-level components
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Documents.tsx
│   │   └── ...
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useDocuments.ts
│   │   ├── useHttpRequest.ts
│   │   └── ...
│   │
│   ├── services/                 # API service functions
│   │   ├── authService.ts
│   │   ├── documentService.ts
│   │   ├── organizationService.ts
│   │   └── ...
│   │
│   ├── context/                  # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── OrganizationContext.tsx
│   │
│   ├── types/                    # TypeScript type definitions
│   │   ├── api.types.ts
│   │   ├── document.types.ts
│   │   ├── user.types.ts
│   │   └── ...
│   │
│   ├── constants/                # Application constants
│   │   └── routes.ts
│   │
│   ├── assets/                   # Static assets (images, fonts)
│   │
│   └── __tests__/                # Component tests
│
├── public/                       # Static files (served as-is)
│
├── docs/                         # Documentation
│   └── ARCHITECTURE.md           # This file
│
└── [config files]                # Vite, TypeScript, Jest configs
```

## Component Architecture

### Component Hierarchy

```
App
├── AuthContext.Provider
│   └── OrganizationContext.Provider
│       └── Router
│           ├── PublicRoutes
│           │   ├── Login
│           │   └── Register
│           │
│           └── ProtectedRoutes (requires auth)
│               ├── Layout
│               │   ├── Header
│               │   └── Footer
│               │
│               └── Main Content
│                   ├── Dashboard
│                   ├── Documents
│                   ├── Folders
│                   └── Settings
```

### Component Types

| Type | Location | Purpose |
|------|----------|---------|
| Pages | `src/pages/` | Route-level components, handle data fetching |
| Components | `src/components/` | Reusable UI elements, receive props |
| Layouts | `src/components/Layout/` | Page structure wrappers |

## State Management

### Context API

Used for global state that many components need:

```typescript
// AuthContext - User authentication state
interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => void;
}

// OrganizationContext - Current organization
interface OrgContextValue {
  organization: Organization | null;
  switchOrganization: (orgId: string) => void;
}
```

### Local State

Use `useState` for component-specific state:
- Form inputs
- UI toggles (modals, dropdowns)
- Loading states

### Custom Hooks

Encapsulate reusable logic:

```typescript
// useHttpRequest - Generic API call handler
const { data, loading, error, execute } = useHttpRequest<User>(
  () => userService.getProfile()
);

// useAuth - Authentication operations
const { user, login, logout, isAuthenticated } = useAuth();
```

## API Layer

### HTTP Client

Configured Axios instance with:
- Base URL from environment
- CSRF token handling
- Request/response interceptors
- Automatic error handling

```typescript
// src/api/httpClient.config.ts
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,  // Send cookies
  timeout: 30000,
});
```

### Service Functions

Organized by domain:

```typescript
// src/services/documentService.ts
export const documentService = {
  getAll: () => apiClient.get('/documents'),
  getById: (id: string) => apiClient.get(`/documents/${id}`),
  create: (data: CreateDocumentDto) => apiClient.post('/documents', data),
  update: (id: string, data: UpdateDocumentDto) => apiClient.patch(`/documents/${id}`, data),
  delete: (id: string) => apiClient.delete(`/documents/${id}`),
};
```

## Routing

Using React Router DOM v6:

```typescript
// Route structure
<Routes>
  {/* Public routes */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  {/* Protected routes */}
  <Route element={<ProtectedRoute />}>
    <Route path="/" element={<Dashboard />} />
    <Route path="/documents" element={<Documents />} />
    <Route path="/documents/:id" element={<DocumentDetail />} />
    <Route path="/folders" element={<Folders />} />
    <Route path="/settings" element={<Settings />} />
  </Route>

  {/* 404 */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

## Styling

### Bootstrap + React Bootstrap

```typescript
import { Button, Card, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// Usage
<Button variant="primary" onClick={handleClick}>
  Submit
</Button>
```

### CSS Modules (for custom styles)

```typescript
import styles from './DocumentCard.module.css';

<div className={styles.card}>
  <h3 className={styles.title}>{document.name}</h3>
</div>
```

## Testing

### Test Structure

```
src/__tests__/
├── components/
│   ├── DocumentCard.test.tsx
│   └── Header.test.tsx
├── hooks/
│   └── useAuth.test.ts
└── pages/
    └── Login.test.tsx
```

### Testing Patterns

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentCard } from '../components/DocumentCard';

describe('DocumentCard', () => {
  it('renders document title', () => {
    render(<DocumentCard document={mockDocument} />);
    expect(screen.getByText(mockDocument.name)).toBeInTheDocument();
  });

  it('calls onDelete when delete button clicked', async () => {
    const onDelete = jest.fn();
    render(<DocumentCard document={mockDocument} onDelete={onDelete} />);
    
    await userEvent.click(screen.getByRole('button', { name: /delete/i }));
    
    expect(onDelete).toHaveBeenCalledWith(mockDocument.id);
  });
});
```

## Build & Deployment

### Development

```bash
npm run dev          # Start Vite dev server (HMR enabled)
```

### Production Build

```bash
npm run build        # TypeScript check + Vite build
npm run preview      # Preview production build locally
```

### Docker

```bash
# Build and run with Nginx
docker build -t clouddocs-frontend .
docker run -p 3000:80 clouddocs-frontend
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:4000/api` |
| `VITE_APP_ENV` | Environment name | `development` |

## TypeScript Configuration

- **Strict mode** enabled
- **Path aliases** configured: `@/` maps to `src/`
- **React Compiler** for automatic optimizations

## Related Documentation

- [API Usage Guide](../src/api/README.md)
- [Contributing Guide](../CONTRIBUTING.md)
