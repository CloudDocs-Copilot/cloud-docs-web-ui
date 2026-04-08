# 🔧 SKILL: Development Workflow

> **Tier 1 - ESSENTIAL**
> Learn how to set up, run, and test the CloudDocs frontend locally

---

## Quick Start (5 minutes)

```bash
# 1. Clone and install
git clone <repo-url>
cd cloud-docs-web-ui
npm install

# 2. Start dev server
npm run dev

# 3. Open http://localhost:5173
```

**Backend requirement:** Backend API must be running on port 4000
(Or set `VITE_API_BASE_URL` in `.env.local`)

---

## npm Scripts Reference

### Development

```bash
# Start dev server with hot reload (HMR)
npm run dev
# → Opens at http://localhost:5173 (or next available port)
# → Watches files for changes
# → Reloads browser automatically

# Build for production
npm run build
# → Runs TypeScript type checking
# → Bundles with Vite
# → Output in dist/

# Preview production build locally
npm run preview
# → Simulates production server
# → Useful for testing before deploy
```

### Testing

```bash
# Run all tests once
npm test
# → Jest runner
# → Runs **/*.test.ts and **/*.test.tsx files
# → Shows coverage summary

# Watch mode (rerun on file change)
npm run test:watch
# → Best during development
# → Press 'q' to quit
# → Press 'a' to run all tests
# → Press 'f' to run failed tests
# → Press 'p' to filter by filename
# → Press 't' to filter by test name

# Generate coverage report
npm run test:coverage
# → Shows coverage % for each file
# → Opens browser report in coverage/lcov-report/index.html
# → Goal: >70% coverage
```

### Code Quality

```bash
# Run linter (ESLint)
npm run lint
# → Checks code style and errors
# → Fixes auto-fixable issues with --fix flag
# → Shows what needs manual fixing

# Build check (validates TypeScript + Vite bundle)
npm run build
# → Runs before production deploys
# → Catches type errors
# → Tests bundle is valid
```

---

## Environment Setup

### .env Files Priority

Files are loaded in this order (later overrides earlier):

1. `.env.example` - Default values (committed to repo)
2. `.env` - Base configuration
3. `.env.local` - Local overrides (NOT committed - git-ignored)
4. `.env.[mode]` - Environment-specific (e.g., `.env.development`)
5. `.env.[mode].local` - Environment-specific local (NOT committed)

### Setup Steps

```bash
# 1. Copy example env file (optional, defaults are auto-loaded)
cp .env.example .env.local

# 2. Edit if needed (usually only to change API URL)
# VITE_API_BASE_URL=http://localhost:4000/api

# 3. Backend must be running
# See ../cloud-docs-api-service README for backend setup
```

### Key Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `VITE_API_BASE_URL` | Backend API endpoint | `http://localhost:4000/api` | `http://api.example.com/api` |
| `VITE_APP_ENV` | Environment name | `development` | `staging`, `production` |
| `VITE_LOG_LEVEL` | Console log verbosity | `info` | `debug`, `warn` |

See `.env.example` for complete list.

---

## Development Workflow

### Typical Flow

```bash
# 1. Create feature branch
git checkout -b feat/my-feature

# 2. Start dev server
npm run dev

# 3. Make changes, watch hot reload

# 4. Write tests (TDD preferred)
npm run test:watch

# 5. Before committing
npm run lint          # Fix style issues
npm test              # Run all tests
npm run build         # Verify builds

# 6. Commit and push
git add .
git commit -m "feat(scope): description"
git push origin feat/my-feature

# 7. Create pull request
```

### Git Workflow

```bash
# Create feature branch from main
git checkout -b feat/new-feature
# or
git checkout -b fix/bug-fix
# or
git checkout -b refactor/style-refactor

# Keep updated with main
git fetch origin
git rebase origin/main

# Push and create PR
git push -u origin feat/new-feature
```

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style, formatting
- `refactor`: Code restructuring (no feature change)
- `test`: Test additions/fixes
- `chore`: Build, deps, config
- `ci`: CI/CD changes

**Examples:**

```bash
git commit -m "feat(documents): add drag-and-drop upload"
git commit -m "fix(auth): handle token expiration on 401"
git commit -m "style(dashboard): improve mobile card spacing"
git commit -m "test(hooks): add useAuth unit tests"
git commit -m "refactor(api): extract common request logic"
git commit -m "docs(readme): update setup instructions"
git commit -m "chore: update dependencies"
```

---

## Testing Workflow

### Before Committing (Pre-commit Checklist)

```bash
# 1. Run linter
npm run lint
# Fix any issues (auto-fixes some)
# npm run lint -- --fix

# 2. Run tests
npm test
# All tests must pass
# Add tests for new features

# 3. Check coverage
npm run test:coverage
# Should maintain >70% overall coverage
# New components should target >80%

# 4. Build verification
npm run build
# Must succeed without errors

# 5. Manual testing
# Test your feature manually in browser
npm run dev
```

### Test File Organization

```
src/
├── components/
│   ├── DocumentCard.tsx
│   └── __tests__/
│       └── DocumentCard.test.tsx
├── hooks/
│   ├── useAuth.ts
│   └── __tests__/
│       └── useAuth.test.ts
├── services/
│   ├── documentService.ts
│   └── __tests__/
│       └── documentService.test.ts
└── pages/
    ├── Dashboard.tsx
    └── __tests__/
        └── Dashboard.test.tsx
```

### Writing Tests

```typescript
// components/__tests__/DocumentCard.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DocumentCard } from '../DocumentCard';

describe('DocumentCard', () => {
  it('renders document filename', () => {
    const document = { id: '1', filename: 'test.pdf' };
    render(<DocumentCard document={document} onDelete={jest.fn()} />);

    expect(screen.getByText('test.pdf')).toBeInTheDocument();
  });

  it('calls onDelete when button clicked', async () => {
    const onDelete = jest.fn();
    const document = { id: '1', filename: 'test.pdf' };
    render(<DocumentCard document={document} onDelete={onDelete} />);

    await userEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith('1');
    });
  });
});
```

---

## Debugging

### Console Debugging

```typescript
// Basic logging
console.log('Value:', value);
console.error('Error:', error);
console.warn('Warning:', warning);

// Conditional logging
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info (dev only):', data);
}

// Performance
console.time('operation');
// ... code to measure
console.timeEnd('operation');
```

### Browser DevTools

1. **Open DevTools:** F12 or Ctrl+Shift+I (Windows), Cmd+Opt+I (Mac)
2. **Console Tab:** See errors and logs
3. **Network Tab:** Debug API calls
4. **Sources Tab:** Set breakpoints and step through code
5. **React DevTools Extension:** Inspect component props/state

### Common Issues

#### Port Already in Use

```bash
# If 5173 is in use
npm run dev -- --port 5174

# Or kill process on port 5173
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5173
kill -9 <PID>
```

#### Modules Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or on Windows
rmdir /s node_modules
del package-lock.json
npm install
```

#### TypeScript Errors After Update

```bash
# Rebuild
npm run build

# Or clean build
rm -rf dist
npm run build
```

#### Tests Failing After Changes

```bash
# Update snapshots (if intentional)
npm test -- -u

# Or regenerate all
npm run test:coverage

# Debug single test
npm test -- DocumentCard.test.tsx
npm test -- --testNamePattern="renders document"
```

---

## Docker Setup (Optional)

### Full Stack (Backend + Frontend + DB)

```bash
# From workspace root
cd ..
docker-compose up -d

# Frontend: http://localhost:3000
# Backend: http://localhost:4000
# Database: localhost:5432

# View logs
docker-compose logs frontend

# Stop
docker-compose down
```

### Frontend Only Docker

```bash
# Build image
docker build -t clouddocs-frontend .

# Run container
docker run -p 3000:80 clouddocs-frontend

# Frontend: http://localhost:3000
```

---

## Performance Tips

### Dev Server Optimization

- **Keep dependencies up to date:** `npm update`
- **Use npm ci for CI/CD:** More predictable than npm install
- **Restart dev server** if changes don't appear (rare)

### Build Optimization

- **Code splitting:** Vite does this automatically
- **Lazy route loading:** Built into React Router setup
- **Image optimization:** Use optimized images in assets/
- **Bundle analysis:** `npm run build` shows bundle size

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Hot reload not working | Restart `npm run dev` |
| API calls fail | Check backend is running on port 4000 |
| Port already in use | `npm run dev -- --port 5174` |
| Tests fail with "Cannot find module" | `rm -rf node_modules && npm install` |
| TypeScript errors in editor | Restart IDE / VS Code |
| Coverage reports not generated | Run `npm run test:coverage` |
| Build fails with type errors | Run `npm run build` to see full errors |
| CSS not applying | Clear browser cache, restart dev server |
| API token expired | Try logging in again or restart backend |

---

## CI/CD Integration

### GitHub Actions (if configured)

```yaml
# Automatically runs on PR:
- npm install
- npm run lint
- npm test
- npm run build

# Must pass all checks before merge
```

### Local Pre-commit

```bash
# Run these before every commit
npm run lint -- --fix
npm test
npm run build

# If all pass, safe to commit
```

---

## Setup Checklist

- [ ] Node.js 20+ installed (`node --version`)
- [ ] npm 9+ installed (`npm --version`)
- [ ] Repository cloned
- [ ] `npm install` completed
- [ ] Backend running on port 4000
- [ ] `npm run dev` works (opens browser)
- [ ] Can log in with test account
- [ ] `npm test` passes
- [ ] `npm run build` succeeds

---

## Next Skills

- ✅ Read: COMPONENT-ARCHITECTURE.md (what to build)
- ✅ Read: NAMING-CONVENTIONS.md (how to name things)
- ✅ Learn: TESTING-PATTERNS.md (how to test)

---

**Last Updated:** 2026-04-08
**Skill Level:** Essential
**Time to Master:** 30-45 minutes
