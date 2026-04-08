# 📡 SKILL: API Integration

> **Tier 3 - IMPORTANT**
> Integrate with backend APIs securely and efficiently

---

## Quick Setup

```typescript
// services/documentService.ts
import { apiClient } from '../api/httpClient.config';
import type { Document, CreateDocumentDto } from '../types/document.types';

export const documentService = {
  getAll: async (): Promise<Document[]> => {
    const { data } = await apiClient.get('/documents');
    return data.data;
  },

  create: async (dto: CreateDocumentDto): Promise<Document> => {
    const { data } = await apiClient.post('/documents', dto);
    return data.data;
  },
};
```

---

## API Client Configuration

### HTTP Client Setup

```typescript
// api/httpClient.config.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true, // Send cookies with requests
});

// Request interceptor - add auth header
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expired
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## Service Layer Pattern

### CRUD Operations

```typescript
// services/documentService.ts
export const documentService = {
  // READ - Get all
  getAll: async (): Promise<Document[]> => {
    const { data } = await apiClient.get('/documents');
    return data.data;
  },

  // READ - Get one
  getById: async (id: string): Promise<Document> => {
    const { data } = await apiClient.get(`/documents/${id}`);
    return data.data;
  },

  // READ - Filter
  getByFolder: async (folderId: string): Promise<Document[]> => {
    const { data } = await apiClient.get(`/documents?folderId=${folderId}`);
    return data.data;
  },

  // CREATE
  create: async (dto: CreateDocumentDto): Promise<Document> => {
    const { data } = await apiClient.post('/documents', dto);
    return data.data;
  },

  // UPDATE
  update: async (id: string, dto: UpdateDocumentDto): Promise<Document> => {
    const { data } = await apiClient.put(`/documents/${id}`, dto);
    return data.data;
  },

  // DELETE
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/documents/${id}`);
  },
};
```

---

## Request/Response Patterns

### Type-Safe Responses

```typescript
// types/api.types.ts
export interface ApiResponse<T> {
  data: T;
  code: number;
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// services/documentService.ts
export const documentService = {
  getAll: async (): Promise<Document[]> => {
    const { data } = await apiClient.get<ApiResponse<Document[]>>('/documents');
    return data.data; // Unwrap nested data
  },

  getPaginated: async (page: number, pageSize: number) => {
    const { data } = await apiClient.get<PaginatedResponse<Document>>(
      `/documents?page=${page}&pageSize=${pageSize}`
    );
    return data;
  },
};
```

### Request DTOs

```typescript
// types/document.types.ts
export interface CreateDocumentDto {
  filename: string;
  folderId?: string;
  description?: string;
}

export interface UpdateDocumentDto {
  filename?: string;
  folderId?: string;
  description?: string;
}

// Usage in service
export const documentService = {
  create: async (dto: CreateDocumentDto): Promise<Document> => {
    const { data } = await apiClient.post('/documents', dto);
    return data.data;
  },
};
```

---

## Error Handling

### Global Error Handler

```typescript
// api/interceptors.ts
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Forbidden
      console.error('Access denied');
    } else if (error.response?.status >= 500) {
      // Server error
      console.error('Server error:', error.response.data);
    } else if (error.code === 'ECONNABORTED') {
      // Timeout
      console.error('Request timeout');
    }
    return Promise.reject(error);
  }
);
```

### Component-Level Error Handling

```typescript
export const DocumentForm: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: CreateDocumentDto) => {
    try {
      setLoading(true);
      setError(null);
      await documentService.create(formData);
      // Success
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to create document');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form>
      {error && <Alert variant="danger">{error}</Alert>}
      <FormFields onSubmit={handleSubmit} disabled={loading} />
    </form>
  );
};
```

---

## Loading/Error States

### State Management Pattern

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
  }, []);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (documents.length === 0) return <p>No documents found</p>;

  return <DocumentCardList documents={documents} />;
};
```

### Skeleton Loaders

```typescript
export const DocumentListSkeleton: React.FC = () => {
  return (
    <div>
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="mb-3">
          <Card.Body>
            <div className="placeholder-glow">
              <span className="placeholder col-6"></span>
              <span className="placeholder col-8"></span>
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};
```

---

## Request Cancellation

```typescript
// hooks/useFetch.ts
export const useFetch = <T,>(
  fetchFn: () => Promise<T>,
  deps: React.DependencyList = [],
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetchFn();

        // Only update state if request wasn't cancelled
        if (!controller.signal.aborted) {
          setData(result);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup - cancel request on unmount
    return () => controller.abort();
  }, deps);

  return { data, loading, error };
};
```

---

## Optimistic Updates

```typescript
export const DocumentList: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);

  const handleDelete = async (id: string) => {
    // Optimistic update - remove immediately
    setDocuments(prev => prev.filter(d => d.id !== id));

    try {
      await documentService.delete(id);
      // Success - nothing to do, state already updated
    } catch (err) {
      // Failure - revert the optimistic update
      const deleted = await documentService.getById(id);
      setDocuments(prev => [...prev, deleted].sort((a, b) => a.id.localeCompare(b.id)));
      showErrorToast('Failed to delete document');
    }
  };

  return (
    <div>
      {documents.map(doc => (
        <DocumentCard
          key={doc.id}
          document={doc}
          onDelete={() => handleDelete(doc.id)}
        />
      ))}
    </div>
  );
};
```

---

## Polling for Updates

```typescript
export const DocumentDetail: React.FC<{ id: string }> = ({ id }) => {
  const [document, setDocument] = useState<Document | null>(null);

  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const updated = await documentService.getById(id);
        setDocument(updated);
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval); // Cleanup
  }, [id]);

  return <DocumentView document={document} />;
};
```

---

## Best Practices

### ✅ DO

- ✅ Always use service layer for API calls
- ✅ Type all API responses
- ✅ Handle loading and error states
- ✅ Cancel requests on component unmount
- ✅ Extract common patterns into custom hooks
- ✅ Use DTOs for type safety

### ❌ DON'T

- ❌ Make API calls directly from components
- ❌ Ignore error responses
- ❌ Store sensitive data in localStorage
- ❌ Make synchronous API calls
- ❌ Forget AbortController for cleanup

---

## Next Skills

- ✅ Read: TYPESCRIPT-CONVENTIONS.md (type your APIs)
- ✅ Read: ERROR-HANDLING.md (handle edge cases)

---

**Last Updated:** 2026-04-08
**Skill Level:** Important
**Time to Master:** 3 hours
