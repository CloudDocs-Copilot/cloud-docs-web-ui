# CLAUDE.md - AI Assistant Instructions for CloudDocs Web UI

This document contains specific instructions for Claude when working on the CloudDocs Web UI project. Always follow these rules and patterns.

## Project Context

- **Project Type:** Single Page Application (SPA)
- **Tech Stack:** React 19, TypeScript 5.x, Vite 7.x, Bootstrap 5
- **State Management:** React Context + Custom Hooks
- **HTTP Client:** Axios with interceptors
- **Testing Framework:** Jest + React Testing Library
- **Styling:** Bootstrap 5 + CSS Modules

## Core Principles

1. **Always use functional components with hooks** - Never use class components
2. **TypeScript strict mode** - No `any` types, use proper typing
3. **Test coverage mandatory** - All tests must pass before changes are merged
4. **Service layer pattern** - Never put API calls directly in components
5. **Accessibility first** - Use semantic HTML and ARIA attributes

## Directory Structure Reference

```s
src/
├── api/           # HTTP client config, interceptors, CSRF handling
├── components/    # Reusable UI components (presentational)
├── pages/         # Route-level components (containers)
├── hooks/         # Custom React hooks
├── services/      # API service functions
├── context/       # React Context providers
├── types/         # TypeScript type definitions
├── constants/     # Application constants
└── assets/        # Static assets
```

## Component Pattern (MANDATORY)

Always follow this exact structure:

```typescript
// 1. Imports (React first, then external, then internal, then types, then styles)
import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Spinner } from 'react-bootstrap';

import { useAuth } from '../../hooks/useAuth';
import { documentService } from '../../services/documentService';

import type { Document } from '../../types/document.types';

import styles from './DocumentCard.module.css';

// 2. Props interface directly above component
interface DocumentCardProps {
  document: Document;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
}

// 3. Component export
export const DocumentCard: React.FC<DocumentCardProps> = ({ 
  document, 
  onDelete,
  onEdit,
}) => {
  // 4. Hooks (useState, useEffect, custom hooks)
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 5. Event handlers (use useCallback for handlers passed as props)
  const handleDelete = useCallback(async () => {
    setLoading(true);
    try {
      await documentService.delete(document.id);
      onDelete(document.id);
    } catch (err) {
      setError('Failed to delete document');
    } finally {
      setLoading(false);
    }
  }, [document.id, onDelete]);

  // 6. Effects
  useEffect(() => {
    // Effect logic
  }, []);

  // 7. Render
  return (
    <Card className={styles.card}>
      <Card.Body>
        <Card.Title>{document.filename}</Card.Title>
        <Button onClick={handleDelete} disabled={loading}>
          Delete
        </Button>
      </Card.Body>
    </Card>
  );
};

export default DocumentCard;
```

## Custom Hooks Pattern

Encapsulate reusable logic in custom hooks:

```typescript
// hooks/useDocuments.ts
import { useState, useEffect, useCallback } from 'react';
import { documentService } from '../services/documentService';
import type { Document } from '../types/document.types';

export const useDocuments = (folderId?: string) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await documentService.getByFolder(folderId);
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [folderId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return { 
    documents, 
    loading, 
    error, 
    refetch: fetchDocuments 
  };
};
```

## Service Layer Pattern

Always wrap API calls in service functions:

```typescript
// services/documentService.ts
import { apiClient } from '../api/httpClient.config';
import type { Document, CreateDocumentDto, UpdateDocumentDto } from '../types/document.types';

export const documentService = {
  getAll: async (): Promise<Document[]> => {
    const response = await apiClient.get('/documents');
    return response.data.data;
  },

  getById: async (id: string): Promise<Document> => {
    const response = await apiClient.get(`/documents/${id}`);
    return response.data.data;
  },

  create: async (data: CreateDocumentDto): Promise<Document> => {
    const response = await apiClient.post('/documents', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateDocumentDto): Promise<Document> => {
    const response = await apiClient.put(`/documents/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/documents/${id}`);
  },
};
```

## TypeScript Rules (STRICT)

### Type Definitions

```typescript
// types/document.types.ts

// Use interface for object shapes
export interface Document {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

// Use type for unions, intersections, primitives
export type DocumentStatus = 'draft' | 'published' | 'archived';

// DTOs for API requests/responses
export interface CreateDocumentDto {
  filename: string;
  folderId?: string;
}

export interface UpdateDocumentDto {
  filename?: string;
  folderId?: string;
}
```

### Type Import Rules

**ALWAYS use `import type` for type-only imports:**

```typescript
// ✅ CORRECT
import type { Document } from '../types/document.types';
import type { User } from '../types/user.types';
import { documentService } from '../services/documentService';

// ❌ WRONG
import { Document } from '../types/document.types';
```

### Never Use `any`

```typescript
// ✅ CORRECT - Use proper types or unknown
const handleError = (error: unknown) => {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error('An unknown error occurred');
  }
};

// ❌ WRONG - Never use any
const handleError = (error: any) => {
  console.error(error.message);
};
```

## Styling Guidelines

### Bootstrap Components Usage

```typescript
import { Button, Card, Modal, Form, Alert, Spinner } from 'react-bootstrap';

// Use Bootstrap variants
<Button variant="primary">Save</Button>
<Button variant="outline-danger">Delete</Button>
<Alert variant="success">Success message</Alert>
```

### CSS Modules for Custom Styles

```typescript
import styles from './DocumentCard.module.css';

<div className={styles.card}>
  <h3 className={styles.title}>{title}</h3>
  <div className={styles.actionButtons}>
    <button className={styles.deleteBtn}>Delete</button>
  </div>
</div>
```

### CSS Naming Convention

Use kebab-case in CSS files:

```css
/* DocumentCard.module.css */
.document-card {
  padding: 1rem;
}

.card-title {
  font-size: 1.5rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}
```

## Testing Requirements (MANDATORY)

### Before ANY Code Change

```bash
# 1. Run all tests
npm test

# 2. Check test coverage
npm run test:coverage

# 3. Run linter
npm run lint

# 4. Build check
npm run build
```

### Test Structure

```typescript
// __tests__/components/DocumentCard.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentCard } from '../../components/DocumentCard';
import type { Document } from '../../types/document.types';

const mockDocument: Document = {
  id: '1',
  filename: 'test.pdf',
  mimeType: 'application/pdf',
  size: 1024,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('DocumentCard', () => {
  it('renders document filename', () => {
    render(<DocumentCard document={mockDocument} onDelete={jest.fn()} />);
    
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
  });

  it('calls onDelete when delete button clicked', async () => {
    const onDelete = jest.fn();
    render(<DocumentCard document={mockDocument} onDelete={onDelete} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith('1');
    });
  });

  it('handles error state', async () => {
    const onDelete = jest.fn().mockRejectedValue(new Error('Delete failed'));
    render(<DocumentCard document={mockDocument} onDelete={onDelete} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to delete/i)).toBeInTheDocument();
    });
  });
});
```

### Query Priority (Use in Order)

1. **`getByRole`** - Most accessible (preferred)
2. **`getByLabelText`** - For form inputs
3. **`getByPlaceholderText`** - Inputs without labels
4. **`getByText`** - Non-interactive elements
5. **`getByTestId`** - Last resort only

### Coverage Requirements

- **Minimum overall coverage:** 70%
- **New components:** >80% coverage
- **Critical components (auth, forms):** >90% coverage

## Naming Conventions (STRICT)

| Type | Convention | Example |
| --- | --- | --- |
| Components | PascalCase | `DocumentCard.tsx` |
| Hooks | camelCase + `use` prefix | `useAuth.ts`, `useDocuments.ts` |
| Services | camelCase + `Service` suffix | `documentService.ts` |
| Types/Interfaces | PascalCase | `Document`, `User`, `DocumentCardProps` |
| Constants | SCREAMING_SNAKE_CASE | `API_BASE_URL`, `MAX_FILE_SIZE` |
| CSS Modules | kebab-case | `document-card.module.css` |
| Event handlers | `handle` + Event | `handleClick`, `handleSubmit`, `handleChange` |
| Variables | camelCase | `isLoading`, `userData`, `documentList` |

## Absolute DON'Ts ❌

1. **❌ Never use class components** - Only functional components with hooks
2. **❌ Never use `any` type** - Use proper types or `unknown`
3. **❌ Never mutate state directly** - Always use setState or hooks
4. **❌ Never use array `index` as key** - Unless list is truly static
5. **❌ Never put API calls in components** - Always use service layer
6. **❌ Never use inline styles for reusable styling** - Use CSS Modules
7. **❌ Never ignore TypeScript errors with `// @ts-ignore`**
8. **❌ Never store sensitive data in localStorage**
9. **❌ Never skip error handling for async operations**
10. **❌ Never merge code that breaks tests**
11. **❌ Never add features without tests**
12. **❌ Never use default exports inconsistently** - Use named exports for components

## Always DO ✅

1. **✅ Use functional components with hooks**
2. **✅ Define proper TypeScript types and interfaces**
3. **✅ Use React Bootstrap components for UI**
4. **✅ Extract logic into custom hooks**
5. **✅ Wrap all API calls in service functions**
6. **✅ Handle loading, error, and success states**
7. **✅ Write tests for all components**
8. **✅ Use semantic HTML elements**
9. **✅ Follow existing patterns in the codebase**
10. **✅ Use `useCallback` for handlers passed as props**
11. **✅ Use `useMemo` for expensive computations**
12. **✅ Run `npm test` before committing**
13. **✅ Maintain or increase test coverage**
14. **✅ Use accessibility attributes (ARIA)**
15. **✅ Import types with `import type`**

## Error Handling Pattern

Always handle errors properly:

```typescript
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);
    const data = await documentService.getAll();
    setDocuments(data);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred');
    console.error('Error fetching documents:', err);
  } finally {
    setLoading(false);
  }
};
```

## State Management Pattern

```typescript
// For local component state - useState
const [isOpen, setIsOpen] = useState(false);

// For shared state - Context
const { user, loading } = useAuth();

// For forms - controlled components
const [formData, setFormData] = useState({ name: '', email: '' });

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData(prev => ({
    ...prev,
    [e.target.name]: e.target.value
  }));
};
```

## Pre-Commit Checklist

Before committing any code:

- [ ] `npm test` passes with 0 failures
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] Coverage has not decreased
- [ ] New features have unit tests
- [ ] Components are accessible
- [ ] TypeScript strict mode passes
- [ ] No `any` types used
- [ ] All async operations have error handling
- [ ] Service layer used for API calls

## When Creating New Features

1. **Create types first** - Define interfaces in `types/`
2. **Create service** - Add API methods in `services/`
3. **Create custom hook** - Add logic in `hooks/` if needed
4. **Create component** - Build UI in `components/` or `pages/`
5. **Write tests** - Add tests in `__tests__/`
6. **Update documentation** - If public API changes

## Common Patterns

### Loading State

```typescript
{loading && <Spinner animation="border" />}
{!loading && data && <ComponentContent data={data} />}
```

### Error State

```typescript
{error && (
  <Alert variant="danger" dismissible onClose={() => setError(null)}>
    {error}
  </Alert>
)}
```

### Conditional Rendering

```typescript
{user?.role === 'admin' && <AdminPanel />}
{documents.length > 0 ? (
  <DocumentList documents={documents} />
) : (
  <EmptyState message="No documents found" />
)}
```

### Form Handling

```typescript
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  
  try {
    setLoading(true);
    await documentService.create(formData);
    onSuccess();
  } catch (err) {
    setError('Failed to create document');
  } finally {
    setLoading(false);
  }
};
```

## Remember

- **Follow the existing patterns** in the codebase
- **Test everything** - No exceptions
- **Type everything** - No `any` types
- **Services for API calls** - Never in components
- **Accessibility matters** - Use semantic HTML and ARIA
- **Error handling is mandatory** - Always handle async errors
- **Coverage must not decrease** - Maintain >70% overall

---

**When in doubt, check existing components in the codebase for reference patterns.**
