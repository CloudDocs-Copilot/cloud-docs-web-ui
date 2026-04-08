# 🔄 SKILL: State Management

> **Tier 2 - IMPORTANT**
> Manage component and application state effectively

---

## Overview

CloudDocs uses multiple state management approaches:
- **Local state:** `useState` for component-specific state
- **Context API:** For cross-cutting concerns (auth, org, theme)
- **Custom hooks:** For reusable stateful logic
- **Server state:** Manage API data separately from UI state

---

## Local Component State

### useState for Simple State

```typescript
export const Counter: React.FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};
```

### useState with Objects

```typescript
interface FormData {
  name: string;
  email: string;
}

export const UserForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({ name: '', email: '' });

  // ✅ Correct way to update nested objects
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ❌ WRONG - Direct mutation
  const handleChangeWrong = (e: React.ChangeEvent<HTMLInputElement>) => {
    formData[e.target.name as keyof FormData] = e.target.value; // ❌ Mutation!
    setFormData(formData);
  };

  return (
    <form>
      <input name="name" value={formData.name} onChange={handleChange} />
      <input name="email" value={formData.email} onChange={handleChange} />
    </form>
  );
};
```

---

## useEffect for Side Effects

### Data Fetching Pattern

```typescript
export const DocumentList: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await documentService.getAll();
        setDocuments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []); // Empty dependency array = run once on mount

  if (loading) return <Spinner />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  return <DocumentCardList documents={documents} />;
};
```

### Dependent Effects

```typescript
export const DocumentDetail: React.FC<DocumentDetailProps> = ({ id }) => {
  const [document, setDocument] = useState<Document | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  // Fetch document when id changes
  useEffect(() => {
    documentService.getById(id).then(setDocument);
  }, [id]); // Re-run when id changes

  // Fetch comments when document loads
  useEffect(() => {
    if (document?.id) {
      commentService.getByDocumentId(document.id).then(setComments);
    }
  }, [document?.id]); // Re-run when document.id changes

  return (
    <div>
      {document && <DocumentHeader document={document} />}
      {comments.map(c => <Comment key={c.id} comment={c} />)}
    </div>
  );
};
```

### Cleanup Effects

```typescript
export const RealtimeDocumentUpdates: React.FC<{ documentId: string }> = ({ documentId }) => {
  const [document, setDocument] = useState<Document | null>(null);

  useEffect(() => {
    const socket = io(API_BASE_URL);

    socket.on(`document:${documentId}:update`, (updatedDoc) => {
      setDocument(updatedDoc);
    });

    // Cleanup function runs on unmount or dependency change
    return () => {
      socket.disconnect();
    };
  }, [documentId]);

  return <DocumentView document={document} />;
};
```

---

## React Context for Shared State

### Creating Context

```typescript
// context/AuthContext.tsx
import React, { useState, useCallback } from 'react';
import type { User } from '../types/user.types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authService.login(email, password);
    setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    authService.logout();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Using Context

```typescript
// hooks/useAuth.ts
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// In components:
export const AdminPanel: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user || user.role !== 'admin') {
    return <p>Access denied</p>;
  }

  return (
    <div>
      <p>Welcome, {user.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

---

## useReducer for Complex State

```typescript
interface DocumentState {
  documents: Document[];
  loading: boolean;
  error: string | null;
}

type DocumentAction =
  | { type: 'LOADING' }
  | { type: 'SUCCESS'; payload: Document[] }
  | { type: 'ERROR'; payload: string };

const documentReducer = (state: DocumentState, action: DocumentAction): DocumentState => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null };
    case 'SUCCESS':
      return { ...state, documents: action.payload, loading: false };
    case 'ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

export const DocumentList: React.FC = () => {
  const [state, dispatch] = useReducer(documentReducer, {
    documents: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchDocuments = async () => {
      dispatch({ type: 'LOADING' });
      try {
        const data = await documentService.getAll();
        dispatch({ type: 'SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'ERROR', payload: 'Failed to fetch' });
      }
    };

    fetchDocuments();
  }, []);

  return (
    <div>
      {state.loading && <Spinner />}
      {state.error && <Alert variant="danger">{state.error}</Alert>}
      {state.documents.map(doc => <DocumentCard key={doc.id} document={doc} />)}
    </div>
  );
};
```

---

## Custom Hooks for State Logic

### Reusable Data Fetching

```typescript
// hooks/useFetch.ts
interface UseFetchOptions {
  skip?: boolean;
}

export const useFetch = <T,>(
  fetchFn: () => Promise<T>,
  deps: React.DependencyList = [],
  options?: UseFetchOptions,
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!options?.skip);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    if (!options?.skip) {
      refetch();
    }
  }, deps);

  return { data, loading, error, refetch };
};

// Usage
export const DocumentList: React.FC = () => {
  const { data: documents, loading, error, refetch } = useFetch(
    () => documentService.getAll(),
    [],
  );

  return (
    <div>
      {loading && <Spinner />}
      {error && <Alert variant="danger">{error}</Alert>}
      {documents?.map(doc => <DocumentCard key={doc.id} document={doc} />)}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
};
```

### Form State Management

```typescript
// hooks/useForm.ts
export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  onSubmit: (values: T) => Promise<void>,
) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<T>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSubmit(values);
    } catch (err) {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  return { values, errors, loading, handleChange, handleSubmit, reset };
};
```

---

## Server State Pattern

### Separate Server and UI State

```typescript
interface DocumentListState {
  // Server state (from API)
  documents: Document[];
  lastFetchTime: Date | null;

  // UI state (local to component)
  selectedId: string | null;
  sortBy: 'name' | 'date';
  filterFolderId: string | null;

  // Loading/error states
  loading: boolean;
  error: string | null;
}

export const DocumentListContainer: React.FC = () => {
  const [state, setState] = useState<DocumentListState>({
    documents: [],
    lastFetchTime: null,
    selectedId: null,
    sortBy: 'name',
    filterFolderId: null,
    loading: true,
    error: null,
  });

  // Server operations
  const fetchDocuments = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await documentService.getAll();
      setState(prev => ({
        ...prev,
        documents: data,
        lastFetchTime: new Date(),
        loading: false,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Unknown error',
        loading: false,
      }));
    }
  }, []);

  // UI operations (don't affect server)
  const handleSelectDocument = (id: string) => {
    setState(prev => ({ ...prev, selectedId: id }));
  };

  const handleSortChange = (sortBy: 'name' | 'date') => {
    setState(prev => ({ ...prev, sortBy }));
  };

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return (
    <DocumentList
      documents={state.documents}
      selectedId={state.selectedId}
      onSelect={handleSelectDocument}
      sortBy={state.sortBy}
      onSortChange={handleSortChange}
      loading={state.loading}
      error={state.error}
    />
  );
};
```

---

## Best Practices

### ✅ DO

- ✅ Keep state as local as possible
- ✅ Use Context for global concerns (auth, theme, org)
- ✅ Extract state logic into custom hooks
- ✅ Separate server and UI state
- ✅ Use proper TypeScript types for state
- ✅ Memoize values passed to Context
- ✅ Use `useCallback` for handlers passed as dependencies

### ❌ DON'T

- ❌ Mutate state directly
- ❌ Use Context for everything
- ❌ Create new context on every render
- ❌ Put all state in one global context
- ❌ Update state in render function
- ❌ Use array index as key when state order can change

---

## Next Skills

- ✅ Read: API-INTEGRATION.md (manage server state)
- ✅ Reference: CLAUDE.md State Management Pattern

---

**Last Updated:** 2026-04-08
**Skill Level:** Important
**Time to Master:** 2-3 hours
