# ✅ SKILL: Code Review Checklist

> **Tier 4 - NICE-TO-HAVE**
> Review code systematically for quality and consistency

---

## Pre-PR Checklist (For Author)

Before submitting a pull request, verify:

### Code Quality
- [ ] Code passes `npm run lint`
- [ ] Code passes `npm run build`
- [ ] No TypeScript errors (`npm run build` verifies)
- [ ] No `any` types used
- [ ] All interfaces/types properly defined

### Testing
- [ ] `npm test` passes (all tests pass)
- [ ] New code has unit tests (>80% coverage for new components)
- [ ] Test coverage didn't decrease
- [ ] Edge cases are tested (error states, loading, empty data)
- [ ] Async operations have proper waiting (await/waitFor)

### Documentation
- [ ] Code comments for complex logic
- [ ] Component documentation (JSDoc if needed)
- [ ] Type documentation (interface/type descriptions)
- [ ] Breaking changes documented

### Accessibility
- [ ] Keyboard navigation works
- [ ] ARIA labels added where needed
- [ ] Color contrast sufficient
- [ ] Semantic HTML used
- [ ] Screen reader tested (if UI changes)

### Performance
- [ ] No unnecessary re-renders (memoization checked)
- [ ] No large packages added without justification
- [ ] Images optimized
- [ ] Code splitting opportunities considered

### Security
- [ ] No hardcoded secrets
- [ ] User input sanitized
- [ ] API errors don't expose sensitive data
- [ ] CORS properly configured

---

## Code Review Checklist (For Reviewer)

### Architecture & Design
- [ ] Code follows project patterns (CLAUDE.md)
- [ ] Component structure makes sense
- [ ] Service layer used for API calls (not in components)
- [ ] Props interface defined
- [ ] No prop drilling (context used if needed)
- [ ] Naming conventions followed

### TypeScript
- [ ] Types are explicit (no `any`)
- [ ] Interfaces for objects, types for unions
- [ ] Type imports use `import type`
- [ ] Return types specified
- [ ] Generic constraints appropriate

### React Patterns
- [ ] Functional components only (no classes)
- [ ] Hooks used correctly (Rules of Hooks followed)
- [ ] useEffect dependencies correct
- [ ] useCallback used for handler props
- [ ] useMemo used for expensive computations (if needed)
- [ ] Components properly memoized (if needed)

###Testing
- [ ] Tests follow project patterns
- [ ] Tests use accessibility queries (getByRole, etc.)
- [ ] Mocks used appropriately
- [ ] No snapshot tests unless necessary
- [ ] Error cases tested
- [ ] Loading/empty states tested
- [ ] User interactions tested with userEvent

### API Integration
- [ ] Service functions properly typed
- [ ] Error handling present
- [ ] Loading/error states managed
- [ ] Request cancellation implemented (if needed)
- [ ] CSRF token handled (if applicable)
- [ ] Timeout handled

### Styling
- [ ] CSS Modules used (no global CSS)
- [ ] Bootstrap classes used appropriately
- [ ] Class names follow conventions (kebab-case)
- [ ] Responsive design working
- [ ] Color contrast sufficient
- [ ] No inline styles (unless dynamic values)

### Accessibility
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] ARIA labels present
- [ ] Semantic HTML used
- [ ] Alt text for images
- [ ] Form labels connected to inputs
- [ ] Error messages accessible

### Performance
- [ ] Bundle size not significantly increased
- [ ] Images optimized
- [ ] Code splitting opportunities considered
- [ ] No unnecessary dependencies
- [ ] Memoization strategic (not everywhere)

### Security
- [ ] No secrets in code
- [ ] User input validated
- [ ] XSS prevented
- [ ] SQL injection not possible (using APIs)
- [ ] CSRF token used
- [ ] Sensitive data not in localStorage

### Documentation
- [ ] Comments explain why, not what
- [ ] Complex logic documented
- [ ] New public APIs documented
- [ ] README updated if needed
- [ ] No TODO comments left behind

---

## Common Issues to Watch for

### Anti-Patterns

```typescript
// ❌ Prop drilling (too many levels)
<Parent prop={data}><Child prop={data}><GrandChild prop={data} /></Child></Parent>

// ✓ Use Context if crossing 2+ levels

// ❌ Missing error handling
await documentService.getAll(); // Could throw

// ✓ Wrap in try-catch

// ❌ Direct API calls in components
useEffect(() => {
  fetch('/api/documents').then(setDocuments);
}, []);

// ✓ Use service layer

// ❌ Prop drilling for callbacks
<Component onDelete={onDelete} onEdit={onEdit} onSelect={onSelect} />

// ✓ Extract to custom hook or context

// ❌ Mutating state
setState(state => {
  state.items.push(newItem); // ❌ Mutation
  return state;
});

// ✓ Create new object
setState(state => ({...state, items: [...state.items, newItem]}));
```

### Missing Tests

```typescript
// ❌ Component with no tests
export const Complex Component: React.FC = () => {...}

// ✓ Every component should have tests
describe('ComplexComponent', () => {
  it('renders', () => {...});
  it('handles error', () => {...});
  it('responds to user interaction', () => {...});
});

// ❌ Async function not awaited in test
it('fetches data', () => {
  render(<Component />);
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// ✓ Use await/waitFor
it('fetches data', async () => {
  render(<Component />);
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});
```

### Type Issues

```typescript
// ❌ Implicit any
const handleChange = (e) => {...}  // e is implicitly any

// ✓ Explicit type
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {...}

// ❌ Union type without checking
const getData = (id: string | null) => {
  return api.get(`/data/${id}`); // Could be null!
};

// ✓ Check before using
const getData = (id: string | null) => {
  if (!id) throw new Error('ID required');
  return api.get(`/data/${id}`);
};
```

---

## Review Phases

### Phase 1: Architecture (2-5 min)
- Overall design makes sense?
- Follows project patterns?
- Reasonable file structure?

### Phase 2: Implementation (5-15 min)
- Code is correct?
- Edge cases handled?
- Error handling present?

### Phase 3: Quality (5-10 min)
- Tests adequate?
- TypeScript strict?
- Performance OK?

### Phase 4: Polish (2-5 min)
- Accessibility good?
- Documentation clear?
- Naming sensible?

---

## Approval Criteria

**Approve only when:**
- ✅ All tests pass
- ✅ No TypeScript errors
- ✅ Linter passes
- ✅ Build succeeds
- ✅ Follows project patterns
- ✅ Code is understandable
- ✅ No major security issues
- ✅ Documentation adequate

**Request changes for:**
- ❌ Coverage decreased
- ❌ Tests missing or failing
- ❌ Architecture doesn't fit
- ❌ Type safety compromised
- ❌ Performance concerns
- ❌ Accessibility issue
- ❌ Security vulnerability

**Comment without blocking for:**
- ✓ Suggestions for future refactoring
- ✓ Alternative approaches
- ✓ "Nice to have" improvements
- ✓ Questions for clarification

---

## Quick Checklist for Reviewers

```
□ Read the PR description
□ Understand what changed and why
□ Run tests locally: npm test
□ Check linting: npm run lint
□ Run build: npm run build
□ Review architecture/design
□ Review code quality
□ Check for common mistakes
□ Look for missing tests
□ Verify accessibility
□ Check performance impact
□ Provide constructive feedback
□ Approve only when ready
```

---

## Giving Feedback

### Good Feedback

```
// ✅ Specific and actionable
"This useEffect is missing `userId` from the dependency array.
Without it, the function will use a stale userId if the prop changes.
Consider: useEffect(() => {...}, [userId]);"

// ✅ Educational
"Consider using getByRole instead of getByTestId for better accessibility testing.
getByRole makes sure our component is accessible to screen readers."

// ✅ Appreciative tone
"Nice optimization here! Using useMemo prevented unnecessary re-renders.
Just double-check the dependency array is complete."
```

### Poor Feedback

```
// ❌ Vague
"This is wrong"

// ❌ Condescending
"You should know better than to use any type"

// ❌ Personal criticism
"This code is terrible"
```

---

## When to Auto-Approve

- Documentation-only changes
- Config updates (no code logic)
- Dependency updates (if tests pass)
- Formatting/style fixes

---

**Last Updated:** 2026-04-08
**Skill Level:** Nice-to-Have
**Time to Master:** 1 hour (reference)
