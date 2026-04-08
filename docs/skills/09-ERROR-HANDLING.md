# ⚠️ SKILL: Error Handling

> **Tier 3 - IMPORTANT**
> Build resilient applications with proper error handling

---

## Error Handling Pattern

```typescript
const [error, setError] = useState<string | null>(null);
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);
    const data = await documentService.getAll();
    // Success - update state
  } catch (err) {
    // Handle error
    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError('An unexpected error occurred');
    }
  } finally {
    setLoading(false);
  }
};
```

---

## Error Types

### Network Errors

```typescript
import axios from 'axios';

try {
  await documentService.getAll();
} catch (err) {
  if (axios.isAxiosError(err)) {
    // Axios error
    if (err.code === 'ECONNREFUSED') {
      // Backend not running
    } else if (err.code === 'ECONNABORTED') {
      // Request timeout
    } else if (err.response?.status === 401) {
      // Unauthorized - redirect to login
    } else if (err.response?.status === 403) {
      // Forbidden - access denied
    } else if (err.response?.status >= 500) {
      // Server error
    }
  } else if (err instanceof Error) {
    //Generic error
    console.error(err.message);
  } else {
    // Unknown error
    console.error('Unknown error occurred');
  }
}
```

### Validation Errors

```typescript
interface ValidationError {
  field: string;
  message: string;
}

const handleFormSubmit = async (formData: FormData) => {
  try {
    const result = await documentService.create(formData);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const errors = err.response?.data?.errors as ValidationError[];
      errors.forEach(error => {
        setFieldError(error.field, error.message);
      });
    }
  }
};
```

## Error Boundaries

### Error Boundary Component

```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <Alert variant="danger">
            <h4>Something went wrong</h4>
            <p>{this.state.error?.message}</p>
          </Alert>
        )
      );
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary fallback={<ErrorPage />}>
  <DashboardPage />
</ErrorBoundary>
```

---

## User Feedback

### Toast Notifications

```typescript
interface ToastMessage {
  id: string;
 message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'info' = 'info',
    duration = 5000,
  ) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type, duration }]);

    if (duration) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  };

  return { toasts, showToast };
};

// Usage
const { showToast } = useToast();

try {
  await documentService.delete(id);
  showToast('Document deleted successfully', 'success');
} catch (err) {
  showToast('Failed to delete document', 'error');
}
```

### Alert/Alert Dialog

```typescript
const [showAlert, setShowAlert] = useState(false);
const [alertMessage, setAlertMessage] = useState('');

const handleError = (error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  setAlertMessage(message);
  setShowAlert(true);
};

return (
  <>
    <Alert
      show={showAlert}
      variant="danger"
      onClose={() => setShowAlert(false)}
      dismissible
    >
      {alertMessage}
    </Alert>
  </>
);
```

---

## Error Recovery

### Retry Logic

```typescript
interface RetryOptions {
  maxRetries?: number;
  delayMs?: number;
  backoff?: boolean; // Exponential backoff
}

export const withRetry = async <T,>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> => {
  const { maxRetries = 3, delayMs = 1000, backoff = true } = options;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxRetries - 1) {
        throw err;
      }

      const delay = backoff ? delayMs * Math.pow(2, attempt) : delayMs;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Retry failed');
};

// Usage
const documents = await withRetry(
  () => documentService.getAll(),
  { maxRetries: 3, backoff: true },
);
```

### Fallback UI

```typescript
export const DocumentListWithFallback: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const data = await documentService.getAll();
        setDocuments(data);
      } catch (err) {
        setError('Failed to load documents');
        // Could also load cached data, use default, etc.
      }
    };

    fetchDocuments();
  }, []);

  if (error) {
    return (
      <Alert variant="warning">
        <h4>Could not load documents</h4>
        <p>Please try again or contact support</p>
        <Button variant="outline-warning" onClick={() => location.reload()}>
          Retry
        </Button>
      </Alert>
    );
  }

  return <DocumentList documents={documents} />;
};
```

---

## Logging

### Error Logging

```typescript
// services/errorLogger.ts
export const errorLogger = {
  log: (message: string, context?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service (Sentry, etc.)
      console.error('LOGGED_ERROR', { message, context });
    } else {
      console.error('[ERROR]', message, context);
    }
  },

  warn: (message: string, context?: Record<string, any>) => {
    console.warn('[WARN]', message, context);
  },

  debug: (message: string, context?: Record<string, any>) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[DEBUG]', message, context);
    }
  },
};

// Usage
try {
  await documentService.delete(id);
} catch (err) {
  errorLogger.log('Failed to delete document', { documentId: id, error: err });
}
```

---

## Best Practices

### ✅ DO

- ✅ Always wrap async operations in try-catch
- ✅ Provide user-friendly error messages
- ✅ Log errors for debugging
- ✅ Use error boundaries for React errors
- ✅ Implement retry logic for transient failures
- ✅ Show loading states while operations are pending

### ❌ DON'T

- ❌ Ignore errors silently
- ❌ Show technical error messages to users
- ❌ Mutate state in error handlers
- ❌ Forget to cleanup on error
- ❌ Log sensitive information
- ❌ Use console.error without context

---

## Next Skills

- ✅ Reference: API-INTEGRATION.md (error handling in services)
- ✅ Reference: TESTING-PATTERNS.md (testing error cases)

---

**Last Updated:** 2026-04-08
**Skill Level:** Important
**Time to Master:** 2 hours
