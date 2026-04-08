# 🧪 SKILL: Testing Patterns

> **Tier 2 - IMPORTANT**
> Write comprehensive tests using Jest and React Testing Library

---

## Quick Start

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentCard } from '../DocumentCard';

describe('DocumentCard', () => {
  it('renders document filename', () => {
    render(<DocumentCard document={{ id: '1', filename: 'test.pdf' }} onDelete={jest.fn()} />);
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
  });
});
```

---

## Test Structure (AATDD Pattern)

**Arrange → Act → Assert → Display**

```typescript
describe('DocumentCard', () => {
  it('deletes document when delete button clicked', async () => {
    // ARRANGE - Set up test data and render
    const mockDocument = { id: '1', filename: 'test.pdf' };
    const onDelete = jest.fn();
    render(<DocumentCard document={mockDocument} onDelete={onDelete} />);

    // ACT - Perform user action
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await userEvent.click(deleteButton);

    // ASSERT - Verify expected outcome
    expect(onDelete).toHaveBeenCalledWith('1');

    // DISPLAY - Show what was tested
    // → Tested deletion flow: button click → callback invoked
  });
});
```

---

## Query Priority (Use in Order)

### 1. getByRole (PREFERRED)

```typescript
// ✅ BEST - Accessible query
screen.getByRole('button', { name: /edit/i })
screen.getByRole('button', { name: /delete/i })
screen.getByRole('textbox', { name: /email/i })
screen.getByRole('heading', { name: /documents/i })
screen.getByRole('link', { name: /profile/i })

// Use for:
// - All interactive elements (buttons, links, inputs)
// - Headings, labels
// - Accessible form controls
```

### 2. getByLabelText

```typescript
// ✅ GOOD - For labeled form inputs
screen.getByLabelText(/email/i)
screen.getByLabelText(/password/i)

// Use when:
// - Input has associated label
// - Label text clearly identifies input
```

### 3. getByPlaceholderText

```typescript
// ✅ OK - For inputs without labels
screen.getByPlaceholderText(/search documents/i)

// Use when:
// - No label available
// - Placeholder clearly describes input
```

### 4. getByText

```typescript
// ✅ OK - For non-interactive elements
screen.getByText(/no documents found/i)
screen.getByText(/error occurred/i)

// Use for:
// - Static text
// - Error messages
// - Confirmations (last resort)
```

### 5. getByTestId (LAST RESORT)

```typescript
// ⚠️ AVOID unless absolutely necessary
screen.getByTestId('document-card')

// Only when:
// - Element has no accessible role/label/text
// - Temporary workaround
// - Testing implementation detail (not recommended)

// Add to component:
<div data-testid="document-card">...</div>
```

---

## Common Test Patterns

### Component Rendering

```typescript
describe('DocumentCard', () => {
  it('renders without crashing', () => {
    const document = { id: '1', filename: 'test.pdf' };
    render(<DocumentCard document={document} onDelete={jest.fn()} />);
    // If no error, component rendered successfully
  });

  it('displays document props', () => {
    const document = { id: '1', filename: 'test.pdf', size: 1024 };
    render(<DocumentCard document={document} onDelete={jest.fn()} />);

    expect(screen.getByText('test.pdf')).toBeInTheDocument();
    expect(screen.getByText(/1.0 KB/)).toBeInTheDocument();
  });
});
```

### User Interaction

```typescript
describe('LoginForm', () => {
  it('submits form with user input', async () => {
    const onSubmit = jest.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    // Fill form
    await userEvent.type(
      screen.getByLabelText(/email/i),
      'user@example.com'
    );
    await userEvent.type(
      screen.getByLabelText(/password/i),
      'password123'
    );

    // Submit
    await userEvent.click(
      screen.getByRole('button', { name: /sign in/i })
    );

    // Verify
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
  });
});
```

### Async Operations

```typescript
describe('DocumentList', () => {
  it('loads and displays documents', async () => {
    // Mock service
    jest.spyOn(documentService, 'getAll').mockResolvedValue([
      { id: '1', filename: 'doc1.pdf' },
      { id: '2', filename: 'doc2.pdf' },
    ]);

    render(<DocumentList />);

    // Wait for async to complete
    await waitFor(() => {
      expect(screen.getByText('doc1.pdf')).toBeInTheDocument();
      expect(screen.getByText('doc2.pdf')).toBeInTheDocument();
    });
  });

  it('shows error on API failure', async () => {
    jest.spyOn(documentService, 'getAll').mockRejectedValue(
      new Error('API error')
    );

    render(<DocumentList />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    // Mock slow response
    jest.spyOn(documentService, 'getAll').mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve([]), 1000))
    );

    render(<DocumentList />);

    // Should show spinner
    expect(screen.getByRole('status')).toBeInTheDocument(); // aria-busy
  });
});
```

### Error Handling

```typescript
describe('DocumentForm', () => {
  it('shows validation error for invalid email', async () => {
    render(<DocumentForm />); // Note: intentionally not passing email

    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('shows API error when submission fails', async () => {
    const submitFn = jest.fn().mockRejectedValue(
      new Error('Server error')
    );
    render(<DocumentForm onSubmit={submitFn} />);

    await userEvent.type(
      screen.getByLabelText(/title/i),
      'New Document'
    );
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument();
    });
  });
});
```

---

## Mocking Strategies

### Mock Services

```typescript
// __tests__/hooks/useDocuments.test.ts
import * as documentServiceModule from '../../services/documentService';

describe('useDocuments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches documents on mount', async () => {
    const mockDocuments = [{ id: '1', filename: 'test.pdf' }];

    jest.spyOn(documentServiceModule, 'documentService', 'get').mockReturnValue({
      getAll: jest.fn().mockResolvedValue(mockDocuments),
    } as any);

    const { result } = renderHook(() => useDocuments());

    await waitFor(() => {
      expect(result.current.documents).toEqual(mockDocuments);
    });
  });
});
```

### Mock Context

```typescript
// Mock AuthContext for components that depend on it
const mockAuthContext = {
  user: { id: '1', name: 'Test User' },
  isAuthenticated: true,
};

const renderWithAuth = (component: React.ReactElement) => {
  return render(
    <AuthContext.Provider value={mockAuthContext}>
      {component}
    </AuthContext.Provider>
  );
};

describe('AdminPanel', () => {
  it('shows admin content when user is admin', () => {
    renderWithAuth(<AdminPanel />);
    expect(screen.getByText(/admin settings/i)).toBeInTheDocument();
  });
});
```

### Mock API

```typescript
// __mocks__/api/httpClient.config.ts
export const apiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};
```

---

## Test Coverage

### Coverage Report

```bash
npm run test:coverage

# Output shows:
# FILE                    LINES   FUNCTIONS   BRANCHES
# components/
#   DocumentCard.tsx      90%     91%         85%
#   DocumentList.tsx      78%     80%         72%
# Overall               81%     82%         77%
```

### Coverage Targets

| Category | Target | Requirement |
|----------|--------|-------------|
| Overall Coverage | >70% | Mandatory |
| New Components | >80% | Expected |
| Critical Components | >90% | Auth, forms, API |
| Branches | >70% | Include edge cases |

### Improving Coverage

```typescript
// ❌ LOW COVERAGE - Only tests happy path
it('renders document card', () => {
  render(<DocumentCard {...props} />);
  expect(screen.getByText('test.pdf')).toBeInTheDocument();
});

// ✅ GOOD COVERAGE - Tests multiple paths
describe('DocumentCard', () => {
  it('renders when document exists', () => {
    render(<DocumentCard document={document} onDelete={jest.fn()} />);
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
  });

  it('shows error when deletion fails', async () => {
    const onDelete = jest.fn().mockRejectedValue(new Error('Delete failed'));
    render(<DocumentCard document={document} onDelete={onDelete} />);

    await userEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to delete/i)).toBeInTheDocument();
    });
  });

  it('disables button while loading', async () => {
    const onDelete = jest.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );
    render(<DocumentCard document={document} onDelete={onDelete} />);

    await userEvent.click(screen.getByRole('button', { name: /delete/i }));

    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

---

## Best Practices

### ✅ DO

- ✅ Test behavior, not implementation
- ✅ Use descriptive test names
- ✅ Test error cases
- ✅ Keep tests independent
- ✅ Mock external dependencies
- ✅ Use accessibility queries
- ✅ Test user interactions
- ✅ Cover edge cases

### ❌ DON'T

- ❌ Test internal state directly
- ❌ Test implementation details
- ❌ Share state between tests
- ❌ Use `fireEvent` (use `userEvent` instead)
- ❌ Mock everything indiscriminately
- ❌ Write snapshot tests for components
- ❌ Test third-party library behavior
- ❌ Use `getByTestId` as first choice

---

## Pre-commit Testing

```bash
# Before every commit
npm run lint          # Fix style issues
npm test              # All tests must pass
npm run test:coverage # Coverage shouldn't decrease
npm run build         # Build must succeed
```

---

## Next Skills

- ✅ Read: COMPONENT-ARCHITECTURE.md (what to test)
- ✅ Reference: CLAUDE.md Testing Requirements section

---

**Last Updated:** 2026-04-08
**Skill Level:** Important
**Time to Master:** 3-4 hours
