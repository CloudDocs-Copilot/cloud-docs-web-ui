# Contributing to CloudDocs Web UI

Thank you for your interest in contributing to CloudDocs! This is a short guide. Detailed documentation is in **[docs/skills/](./docs/skills/)**.

## Quick Start (5 minutes)

```bash
# 1. Setup
git clone <repo>
cd cloud-docs-web-ui
npm install

# 2. Run
npm run dev
# → http://localhost:5173

# 3. Before committing
npm run lint && npm test && npm run build
```

## Learning Resources

**New to the project?** Start here in order:
1. [03-DEVELOPMENT-WORKFLOW](./docs/skills/03-DEVELOPMENT-WORKFLOW.md) - Setup & tools (30 min)
2. [01-COMPONENT-ARCHITECTURE](./docs/skills/01-COMPONENT-ARCHITECTURE.md) - How to build components (2-3 hours)
3. [02-NAMING-CONVENTIONS](./docs/skills/02-NAMING-CONVENTIONS.md) - Consistent naming (1-2 hours)

**Building a feature?** Reference these:
- [05-STATE-MANAGEMENT](./docs/skills/05-STATE-MANAGEMENT.md) - Manage state
- [07-API-INTEGRATION](./docs/skills/07-API-INTEGRATION.md) - Connect to backend
- [04-TESTING-PATTERNS](./docs/skills/04-TESTING-PATTERNS.md) - Write tests
- [09-ERROR-HANDLING](./docs/skills/09-ERROR-HANDLING.md) - Handle errors

**Full list:** See [docs/skills/README.md](./docs/skills/README.md) for all 12 skills and quick navigation.

## Code of Conduct

Please be respectful and constructive in all interactions.

## Pre-Commit Checklist

Before pushing code, verify:

```bash
npm run lint          # Fix lint errors
npm test              # All tests pass
npm run build         # Build succeeds
npm run test:coverage # Coverage maintained (>70%)
```

See [12-CODE-REVIEW-CHECKLIST](./docs/skills/12-CODE-REVIEW-CHECKLIST.md) for detailed review criteria.

## Development Workflow

1. **Create branch:** `git checkout -b feat/your-feature`
2. **Reference skills** as you code (see above)
3. **Run checks** locally before pushing
4. **Push:** `git push origin feat/your-feature`
5. **Create PR** with description

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat(scope): description
fix(scope): description
test(scope): description
docs: description
```

Examples: `feat(documents): add drag-and-drop`, `fix(auth): handle token expiration`

## Key Patterns

**CLAUDE.md has the official patterns:**
- See [CLAUDE.md](./CLAUDE.md) for core rules
- See [docs/skills/](./docs/skills/) for deep dives on each topic

**Quick references:**
- Component structure → [01-COMPONENT-ARCHITECTURE](./docs/skills/01-COMPONENT-ARCHITECTURE.md#file-organization-within-components)
- Naming rules → [02-NAMING-CONVENTIONS](./docs/skills/02-NAMING-CONVENTIONS.md#quick-reference-table)
- TypeScript → [08-TYPESCRIPT-CONVENTIONS](./docs/skills/08-TYPESCRIPT-CONVENTIONS.md)

## Testing

All new code needs tests (>80% coverage):

```bash
npm test                    # Run tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
```

See [04-TESTING-PATTERNS](./docs/skills/04-TESTING-PATTERNS.md) for examples and best practices.

## Questions?

1. **Check skills first** - [docs/skills/](./docs/skills/) has answers for most questions
2. **See CLAUDE.md** - Core patterns and rules
3. **Search GitHub issues** - Someone may have asked before
4. **Ask maintainers** - Open issue if still stuck

---

**New?** Start with [docs/skills/03-DEVELOPMENT-WORKFLOW.md](./docs/skills/03-DEVELOPMENT-WORKFLOW.md)

**Have a question?** Check [docs/skills/USAGE-GUIDE.md](./docs/skills/USAGE-GUIDE.md) for practical scenarios

Thank you for contributing! 🎉
