# AGENTS.md - Agentic Coding Rules

This document defines rules and guidelines for AI coding agents working on the CloudDocs Web UI.

## Project Overview

- **Type:** Single Page Application (SPA)
- **Stack:** React 19, TypeScript 5.x, Vite 7.x, Bootstrap 5
- **State:** React Context + Custom Hooks
- **HTTP:** Axios with interceptors
- **Testing:** Jest + React Testing Library

## Directory Structure

```
src/
├── api/           # HTTP client config, interceptors, CSRF handling
├── components/    # Reusable UI components (presentational)
├── pages/         # Route-level components (containers)
├── hooks/         # Custom React hooks
├── services/      # API service functions
├── context/       # React Context providers
├── types/         # TypeScript type definitions
├── constants/     # Application constants
└── assets/        # Static assets (images, fonts)
```

## Component Patterns

### Functional Components Only

Always use functional components with hooks:

```typescript
// ✅ Good
export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  return (
    <Card>
      <Card.Body>
        <Card.Title>{document.name}</Card.Title>
        <Button onClick={() => onDelete(document.id)} disabled={isDeleting}>
          Delete
        </Button>
      </Card.Body>
    </Card>
  );
};

// ❌ Never use class components
class DocumentCard extends React.Component { }
```

### Props Interface

Define props interface directly above component:

```typescript
interface DocumentCardProps {
  document: Document;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;  // Optional props
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ 
  document, 
  onDelete,
  onEdit,
}) => {
  // ...
};
```

### Component Structure

```typescript
// 1. Imports - React, external, internal, types, styles
import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Spinner } from 'react-bootstrap';

import { useAuth } from '../hooks/useAuth';
import { documentService } from '../services/documentService';

import type { Document } from '../types/document.types';

import styles from './DocumentCard.module.css';

// 2. Props interface
interface DocumentCardProps {
  document: Document;
}

// 3. Component
export const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  // Hooks first (useState, useEffect, custom hooks)
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Event handlers
  const handleDelete = useCallback(async () => {
    setLoading(true);
    try {
      await documentService.delete(document.id);
    } finally {
      setLoading(false);
    }
  }, [document.id]);

  // Render
  return (
    <Card className={styles.card}>
      {/* JSX */}
    </Card>
  );
};
```

## Hooks Patterns

### Custom Hooks

Encapsulate reusable logic in custom hooks:

```typescript
// hooks/useDocuments.ts
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
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [folderId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return { documents, loading, error, refetch: fetchDocuments };
};
```

### Hook Rules

1. Call hooks at the top level of components
2. Don't call hooks inside loops, conditions, or nested functions
3. Only call hooks from React functions (components or custom hooks)
4. Name custom hooks with `use` prefix

## Services Pattern

Services wrap API calls:

```typescript
// services/documentService.ts
import { apiClient } from '../api/httpClient.config';
import type { Document, CreateDocumentDto } from '../types/document.types';

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

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/documents/${id}`);
  },
};
```

## TypeScript Rules

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

// DTOs for API requests
export interface CreateDocumentDto {
  filename: string;
  folderId?: string;
}

export interface UpdateDocumentDto {
  filename?: string;
  folderId?: string;
}
```

### Type Imports

Use `import type` for type-only imports:

```typescript
// ✅ Good
import type { Document } from '../types/document.types';
import { documentService } from '../services/documentService';

// ❌ Avoid - imports Document as value
import { Document } from '../types/document.types';
```

### No `any`

Never use `any`, use proper types or `unknown`:

```typescript
// ✅ Good
const handleError = (error: unknown) => {
  if (error instanceof Error) {
    console.error(error.message);
  }
};

// ❌ Bad
const handleError = (error: any) => {
  console.error(error.message);
};
```

## Styling

### Bootstrap Components

Use React Bootstrap components:

```typescript
import { Button, Card, Modal, Form } from 'react-bootstrap';

// Use variant props
<Button variant="primary">Submit</Button>
<Button variant="outline-danger">Delete</Button>
```

### CSS Modules

For custom styles, use CSS Modules:

```typescript
import styles from './DocumentCard.module.css';

<div className={styles.card}>
  <h3 className={styles.title}>{title}</h3>
</div>
```

### Naming Convention

CSS classes: kebab-case
```css
/* DocumentCard.module.css */
.document-card { }
.card-title { }
.action-buttons { }
```

## Testing

### Test Structure

```typescript
// __tests__/components/DocumentCard.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentCard } from '../../components/DocumentCard';

const mockDocument = {
  id: '1',
  filename: 'test.pdf',
  mimeType: 'application/pdf',
  size: 1024,
};

describe('DocumentCard', () => {
  it('renders document filename', () => {
    render(<DocumentCard document={mockDocument} onDelete={jest.fn()} />);
    
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
  });

  it('calls onDelete when delete button clicked', async () => {
    const onDelete = jest.fn();
    render(<DocumentCard document={mockDocument} onDelete={onDelete} />);
    
    await userEvent.click(screen.getByRole('button', { name: /delete/i }));
    
    expect(onDelete).toHaveBeenCalledWith('1');
  });
});
```

### Query Priority

Use queries in this order (most to least preferred):

1. `getByRole` - Accessible queries
2. `getByLabelText` - Form inputs
3. `getByPlaceholderText` - Inputs without labels
4. `getByText` - Non-interactive elements
5. `getByTestId` - Last resort

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `DocumentCard.tsx` |
| Hooks | camelCase + use prefix | `useAuth.ts`, `useDocuments.ts` |
| Services | camelCase + Service | `documentService.ts` |
| Types | PascalCase | `Document`, `User` |
| Interfaces | PascalCase | `DocumentCardProps` |
| Constants | SCREAMING_SNAKE_CASE | `API_BASE_URL` |
| CSS Modules | kebab-case | `document-card.module.css` |
| Event handlers | handle + Event | `handleClick`, `handleSubmit` |

## DO NOT

- ❌ Use class components
- ❌ Use `any` type
- ❌ Mutate state directly - use setState or hooks
- ❌ Use `index` as key in lists (unless static)
- ❌ Put API calls directly in components - use services
- ❌ Use inline styles for reusable styling
- ❌ Ignore TypeScript errors with `// @ts-ignore`
- ❌ Store sensitive data in localStorage
- ❌ Skip error handling for async operations
- ❌ Merge code that breaks existing tests
- ❌ Add features without corresponding tests

## DO

- ✅ Use functional components with hooks
- ✅ Define proper TypeScript types
- ✅ Use React Bootstrap components for UI
- ✅ Extract logic into custom hooks
- ✅ Wrap API calls in service functions
- ✅ Handle loading and error states
- ✅ Write tests for components
- ✅ Use semantic HTML elements
- ✅ Follow existing patterns in the codebase
- ✅ Use `useCallback` for handlers passed as props
- ✅ Use `useMemo` for expensive computations
- ✅ Run all tests before committing (`npm test`)
- ✅ Maintain or increase test coverage

## Testing Requirements

### Mandatory Testing Rules

1. **All tests must pass before any code change is merged**
   ```bash
   npm test  # Must exit with code 0
   ```

2. **New features must include tests**
   - Component tests for new UI components
   - Hook tests for custom hooks
   - Coverage should not decrease

3. **Bug fixes must include regression tests**
   - Add test that would have caught the bug
   - Verify fix doesn't break existing functionality

4. **Test coverage requirements**
   ```bash
   npm run test:coverage
   ```
   - Minimum overall coverage: 70%
   - New components should have >80% coverage
   - Critical components (auth, forms) require >90% coverage

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run specific test file
npm test -- src/__tests__/components/DocumentCard.test.tsx

# Run tests in watch mode (development)
npm run test:watch
```

### Testing Best Practices

1. **Query by accessibility** - Use `getByRole`, `getByLabelText` over `getByTestId`
2. **Test behavior** - Focus on what users see and do, not implementation
3. **Avoid testing implementation details** - Don't test state directly
4. **Mock external dependencies** - Services, APIs, timers

### Pre-commit Checklist

Before committing any code change:

- [ ] `npm test` passes
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes
- [ ] Coverage has not decreased
- [ ] New features have tests
- [ ] Components are accessible
