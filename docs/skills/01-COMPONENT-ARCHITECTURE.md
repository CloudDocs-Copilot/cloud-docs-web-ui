# 🏗️ SKILL: Component Architecture

> **Tier 1 - ESSENTIAL**
> Learn how to structure and organize React components in CloudDocs

---

## Overview

This skill teaches you how to build components following the CloudDocs patterns:
- Functional components with React hooks
- Container vs Presentational patterns
- Component composition best practices
- Directory organization
- File structure conventions

---

## Functional Components with Hooks

### ✅ Always Use Functional Components

```typescript
// ✅ CORRECT - Functional component with hooks
export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onDelete }) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Effect logic
  }, []);

  return (
    <Card>
      <Card.Body>{document.filename}</Card.Body>
    </Card>
  );
};

// ❌ AVOID - Class components
class DocumentCard extends React.Component {
  render() {
    return <div>{this.props.document.filename}</div>;
  }
}
```

### Hook Rules (Critical)

1. **Call hooks at top level** - Only inside functional components/custom hooks
2. **Don't call conditionally** - No `if` statements around hooks
3. **Dependencies matter** - Keep `useEffect` dependencies correct
4. **Custom hooks** - Extract logic into custom hooks for reuse

```typescript
// ✅ CORRECT - Hooks at top level
export const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [userId]); // Dependency array correct

  return <div>{user?.name}</div>;
};

// ❌ WRONG - Conditional hook
if (userId) {
  const [user, setUser] = useState<User | null>(null); // ❌ Hook inside if!
}

// ❌ WRONG - Missing dependency
useEffect(() => {
  fetchUser(userId); // userId used but not in dependency array
}, []); // ❌ Will cause stale closures
```

---

## Container vs Presentational Components

### Container Components (Smart)

- **Purpose:** Handle logic, state, API calls
- **Location:** `pages/` or `components/` (with `-Container` suffix)
- **What they do:** Fetch data, manage state, calculate derived values

```typescript
// containers/DocumentListContainer.tsx
export const DocumentListContainer: React.FC<DocumentListContainerProps> = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const data = await documentService.getAll();
        setDocuments(data);
      } catch (err) {
        setError('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return <DocumentList documents={documents} />;
};
```

### Presentational Components (Dumb)

- **Purpose:** Render UI only
- **Location:** `components/`
- **What they do:** Display props, call callback functions
- **Why:** Reusable, testable, easy to style

```typescript
// components/DocumentList.tsx
export interface DocumentListProps {
  documents: Document[];
  onDelete?: (id: string) => void;
  onSelect?: (id: string) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onDelete,
  onSelect,
}) => {
  if (documents.length === 0) {
    return <p>No documents found</p>;
  }

  return (
    <div className="document-list">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          onDelete={onDelete}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};
```

---

## Component Composition Patterns

### Composition Over Props Drilling

**Problem:** Passing props through many levels becomes messy

```typescript
// ❌ AVOID - Prop drilling
<Parent>
  <Child>
    <GrandChild user={user} onDelete={onDelete} onSelect={onSelect} />
  </Child>
</Parent>
```

**Solution:** Use React Context or composition

```typescript
// ✅ CORRECT - Using Context
const UserContext = React.createContext<User | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

// In component:
const user = useContext(UserContext);

// ✅ CORRECT - Using composition
export const Dashboard: React.FC = () => {
  return (
    <Layout>
      <Header />
      <MainContent />
      <Footer />
    </Layout>
  );
};
```

### Render Props Pattern (Advanced)

```typescript
// Flexible component that lets parent control rendering
interface FormProps<T> {
  onSubmit: (data: T) => Promise<void>;
  children: (state: FormState<T>) => React.ReactNode;
}

export const Form = <T,>({ onSubmit, children }: FormProps<T>) => {
  const [formData, setFormData] = useState<T>({} as T);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (err) {
      setError('Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return children({ formData, setFormData, loading, error, handleSubmit });
};

// Usage:
<Form onSubmit={handleSubmit}>
  {({ formData, setFormData, loading, error }) => (
    <div>
      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      {error && <p>{error}</p>}
      <button disabled={loading}>Submit</button>
    </div>
  )}
</Form>
```

---

## Directory Organization

### Recommended Structure

```
src/
├── components/
│   ├── common/                    # Reusable components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   ├── documents/                 # Feature-specific components
│   │   ├── DocumentCard.tsx
│   │   ├── DocumentList.tsx
│   │   └── DocumentPreview.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ProtectedRoute.tsx
│   └── index.ts                   # Export all components
├── pages/                         # Route-level containers
│   ├── Dashboard.tsx
│   ├── DocumentsPage.tsx
│   ├── LoginPage.tsx
│   └── NotFound.tsx
├── hooks/                         # Custom React hooks
│   ├── useAuth.ts
│   ├── useDocuments.ts
│   └── useHttpRequest.ts
├── services/                      # API service functions
│   ├── documentService.ts
│   ├── authService.ts
│   └── index.ts
├── context/                       # React Context providers
│   ├── AuthContext.tsx
│   ├── OrganizationContext.tsx
│   └── index.ts
├── types/                         # TypeScript definitions
│   ├── document.types.ts
│   ├── auth.types.ts
│   └── index.ts
├── constants/                     # Application constants
│   ├── api.constants.ts
│   ├── routes.constants.ts
│   └── index.ts
├── api/                           # HTTP client config
│   ├── httpClient.config.ts
│   ├── interceptors.ts
│   └── dataSanitizer.ts
└── assets/                        # Images, fonts, icons
    ├── images/
    ├── icons/
    └── fonts/
```

---

## File Organization Within Components

### Standard Structure

```typescript
// 1. Imports (organized priority)
import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Spinner } from 'react-bootstrap';

import { useAuth } from '../../hooks/useAuth';
import { documentService } from '../../services/documentService';

import type { Document } from '../../types/document.types';

import styles from './DocumentCard.module.css';

// 2. Props interface
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
  // 4. Hooks (state first, custom hooks, effect hooks)
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 5. Event handlers
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

  // 6. Effects (after handlers)
  useEffect(() => {
    // Effect logic
  }, []);

  // 7. Render
  return (
    <Card className={styles.card}>
      <Card.Body>
        <Card.Title>{document.filename}</Card.Title>
        <Button onClick={handleDelete} disabled={loading}>
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </Card.Body>
    </Card>
  );
};

// 8. Named export (optional default export)
export default DocumentCard;
```

---

## Component Composition Best Practices

### ✅ DO

- ✅ Keep components small and focused (single responsibility)
- ✅ Use composition over inheritance
- ✅ Extract constants outside components
- ✅ Memoize expensive computations with `useMemo`
- ✅ Memoize callback functions with `useCallback`
- ✅ Use React Context for cross-cutting concerns

```typescript
// ✅ GOOD - Small, focused components
export const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  return (
    <Card>
      <DocumentHeader document={document} />
      <DocumentMetadata document={document} />
      <DocumentActions document={document} />
    </Card>
  );
};
```

### ❌ DON'T

- ❌ Create massive components (>300 lines)
- ❌ Use inheritance-based components
- ❌ Put business logic in render
- ❌ Create new objects/functions on every render without memoization
- ❌ Forget dependency arrays in hooks
- ❌ Use array index as key in lists

```typescript
// ❌ BAD - Too much logic in component
export const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  const [canDelete, setCanDelete] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [canArchive, setCanArchive] = useState(false);
  // ... 100 more lines of logic
};

// ✅ GOOD - Extract logic to custom hook
export const useDocumentPermissions = (document: Document) => {
  const [permissions, setPermissions] = useState({...});
  // Logic here
  return permissions;
};

export const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  const { canDelete, canEdit, canShare } = useDocumentPermissions(document);
  return <Card>...</Card>;
};
```

---

## Component Props Guidelines

### Props Interface

```typescript
// ✅ GOOD - Clear, typed props
interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  disabled = false,
  onClick,
  className,
}) => {
  return (
    <button
      className={`btn btn-${variant}`}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
};
```

### Destructuring Props

```typescript
// ✅ GOOD - Destructure in signature
export const Component: React.FC<ComponentProps> = ({ prop1, prop2, prop3 }) => {
  return <div>{prop1}</div>;
};

// ❌ AVOID - Using props object
export const Component: React.FC<ComponentProps> = (props) => {
  return <div>{props.prop1}</div>;
};
```

---

## Styling Components

### CSS Modules

```typescript
// components/DocumentCard.tsx
import styles from './DocumentCard.module.css';

export const DocumentCard = ({ document }) => {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{document.filename}</h3>
      <p className={styles.description}>{document.description}</p>
    </div>
  );
};
```

```css
/* DocumentCard.module.css */
.card {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.description {
  color: #666;
  font-size: 0.875rem;
}
```

---

## Summary

| Pattern | Use When | Example |
|---------|----------|---------|
| Functional Component | Always | `export const MyComponent: React.FC<Props> = ({...}) => {...}` |
| Container Component | Managing state/API | `DocumentListContainer` |
| Presentational Component | Just rendering | `DocumentList` |
| Custom Hook | Reusing logic | `useDocuments`, `useAuth` |
| React Context | Cross-cutting state | `AuthContext`, `OrgContext` |
| Composition | Building complex UIs | `<Layout><Header/><Content/></Layout>` |

---

## Next Steps

- ✅ Read: NAMING-CONVENTIONS.md (how to name your components)
- ✅ Read: DEVELOPMENT-WORKFLOW.md (how to run and test)
- ✅ Reference: CLAUDE.md Component Pattern section

---

**Last Updated:** 2026-04-08
**Skill Level:** Essential
**Time to Master:** 2-3 hours
