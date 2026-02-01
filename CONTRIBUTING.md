# Contributing to CloudDocs Web UI

Thank you for your interest in contributing to CloudDocs! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Component Guidelines](#component-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

## Code of Conduct

Please be respectful and constructive in all interactions. We welcome contributors of all backgrounds and experience levels.

## Getting Started

### Prerequisites

- Node.js 20+
- npm 9+
- Docker and Docker Compose (optional, for full stack)
- Git

### Development Setup

#### Option 1: Docker (Full Stack)

Run frontend with backend and database:

```bash
# From the workspace root (parent of cloud-docs-web-ui)
cp .env.example .env
docker-compose up -d

# Frontend available at http://localhost:3000
# Backend API at http://localhost:4000
```

#### Option 2: Local Development (Frontend Only)

1. **Clone and install dependencies:**
   ```bash
   cd cloud-docs-web-ui
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local if backend is running on different port
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   ```
   http://localhost:5173
   ```

> **Note:** You'll need the backend running for full functionality. See backend CONTRIBUTING.md for setup.

## Code Style

### TypeScript Guidelines

- **Strict mode** - All code must pass strict type checking
- **No `any`** - Use `unknown` or proper types
- **Explicit types** - Type function parameters and returns
- **Type imports** - Use `import type` for type-only imports

```typescript
// ✅ Good
import type { User } from '../types/user.types';
import { userService } from '../services/userService';

const getUserById = async (id: string): Promise<User> => {
  return userService.getById(id);
};

// ❌ Bad
const getUserById = async (id) => {
  return userService.getById(id);
};
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `DocumentCard.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth.ts` |
| Services | camelCase with `Service` suffix | `documentService.ts` |
| Types | PascalCase | `User`, `Document` |
| Constants | SCREAMING_SNAKE_CASE | `API_BASE_URL` |
| CSS Modules | kebab-case | `document-card.module.css` |

### File Organization

```typescript
// Component file structure
// 1. Imports (React first, external, internal, types, styles)
import React, { useState, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';

import { useAuth } from '../hooks/useAuth';
import { documentService } from '../services/documentService';

import type { Document } from '../types/document.types';

import styles from './DocumentCard.module.css';

// 2. Types (if local to component)
interface DocumentCardProps {
  document: Document;
  onDelete?: (id: string) => void;
}

// 3. Component
export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onDelete }) => {
  // hooks first
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  // handlers
  const handleDelete = async () => {
    // ...
  };

  // render
  return (
    <Card className={styles.card}>
      {/* ... */}
    </Card>
  );
};

// 4. Default export (if needed)
export default DocumentCard;
```

## Component Guidelines

### Functional Components

Always use functional components with hooks:

```typescript
// ✅ Good
export const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);
  // ...
};

// ❌ Avoid class components
class UserProfile extends React.Component { }
```

### Props

- Define props interface above component
- Use destructuring in function signature
- Provide default values when appropriate

```typescript
interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  onClick: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  disabled = false,
  onClick,
}) => {
  // ...
};
```

### Hooks

- Keep hooks at the top of the component
- Follow the Rules of Hooks
- Extract complex logic into custom hooks

```typescript
// Custom hook example
export const useDocuments = (folderId?: string) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const data = await documentService.getByFolder(folderId);
        setDocuments(data);
      } catch (err) {
        setError('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [folderId]);

  return { documents, loading, error };
};
```

### Error Handling

Use error boundaries for component errors and try-catch for async operations:

```typescript
// In async operations
try {
  await documentService.delete(id);
  showToast('Document deleted successfully');
} catch (error) {
  showToast('Failed to delete document', 'error');
  console.error('Delete error:', error);
}
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, CSS changes
- `refactor`: Code restructuring
- `test`: Adding or fixing tests
- `chore`: Build, config, dependencies

### Examples

```bash
feat(documents): add drag-and-drop upload
fix(auth): handle token expiration correctly
style(dashboard): improve card spacing on mobile
test(hooks): add useAuth unit tests
```

## Pull Request Process

1. **Create a branch:**
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make changes** following code style guidelines

3. **Write/update tests** for new functionality

4. **Run checks locally:**
   ```bash
   npm run lint          # Check for lint errors
   npm test              # Run tests
   npm run build         # Verify build works
   ```

5. **Push and create PR:**
   ```bash
   git push origin feat/your-feature-name
   ```

6. **Fill out PR template** with description and checklist

### PR Requirements

- [ ] Lint passes (`npm run lint`)
- [ ] Tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] New features have tests
- [ ] Components are accessible (keyboard, screen readers)

## Testing

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Writing Tests

Use React Testing Library with user-centric queries:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../components/LoginForm';

describe('LoginForm', () => {
  it('submits credentials on form submit', async () => {
    const onSubmit = jest.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    // Use accessible queries
    await userEvent.type(
      screen.getByLabelText(/email/i),
      'user@example.com'
    );
    await userEvent.type(
      screen.getByLabelText(/password/i),
      'password123'
    );
    await userEvent.click(
      screen.getByRole('button', { name: /sign in/i })
    );

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
  });

  it('shows error message on invalid input', async () => {
    render(<LoginForm onSubmit={jest.fn()} />);

    await userEvent.click(
      screen.getByRole('button', { name: /sign in/i })
    );

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });
});
```

### Testing Best Practices

1. **Query by accessibility** - Use `getByRole`, `getByLabelText` over `getByTestId`
2. **Test behavior** - Focus on what users see and do, not implementation
3. **Avoid testing implementation details** - Don't test state directly
4. **Mock external dependencies** - Services, APIs, timers

## Questions?

- Check existing [documentation](docs/)
- Open an issue for bugs or feature requests
- Reach out to maintainers

Thank you for contributing! 🎉
