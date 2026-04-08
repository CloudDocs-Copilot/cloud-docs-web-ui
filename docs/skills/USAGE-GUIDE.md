# 🎯 Usage Guide - Practical Scenarios

> Real-world situations and which skills to reference

---

## Scenario 1: Implementing a New Component

**Situation:** Product manager asks you to add a "Share Document" button with sharing options.

**Skills to Reference:**

1. **Start:** [01-COMPONENT-ARCHITECTURE](./01-COMPONENT-ARCHITECTURE.md)
   - Read: "Container vs Presentational Components"
   - Read: "File Organization Within Components"
   - Decide: Is this a container or presentational component?

2. **Naming:** [02-NAMING-CONVENTIONS](./02-NAMING-CONVENTIONS.md)
   - Read: "Component Naming"
   - Name your component: `ShareDocumentModal.tsx`
   - Name your hooks: `useDocumentSharing.ts`

3. **Implementation:** [01-COMPONENT-ARCHITECTURE](./01-COMPONENT-ARCHITECTURE.md)
   - Copy component template structure
   - Add proper TypeScript interfaces
   - Use Bootstrap components for UI

4. **Styling:** [06-STYLING-CONVENTIONS](./06-STYLING-CONVENTIONS.md)
   - Create `ShareDocumentModal.module.css`
   - Use CSS Modules for custom styles
   - Bootstrap for buttons

5. **Testing:** [04-TESTING-PATTERNS](./04-TESTING-PATTERNS.md)
   - Write unit tests in `__tests__/ShareDocumentModal.test.tsx`
   - Test rendering, user interactions, error states
   - Target >80% coverage

6. **Accessibility:** [11-ACCESSIBILITY-GUIDELINES](./11-ACCESSIBILITY-GUIDELINES.md)
   - Add aria-labels to buttons
   - Ensure keyboard navigation works
   - Test with screen reader

**Result:** Complete, tested, and accessible component

---

## Scenario 2: Connecting to a New API Endpoint

**Situation:** Backend implemented `/documents/{id}/share` endpoint. You need to integrate it.

**Skills to Reference:**

1. **Types First:** [08-TYPESCRIPT-CONVENTIONS](./08-TYPESCRIPT-CONVENTIONS.md)
   - Define `ShareDocumentDto` interface
   - Define response type
   - Use `import type` for type-only imports

2. **Service Layer:** [07-API-INTEGRATION](./07-API-INTEGRATION.md)
   - Create or update `documentService.ts`
   - Add `share()` method
   - Copy error handling pattern

3. **Component Integration:** [05-STATE-MANAGEMENT](./05-STATE-MANAGEMENT.md)
   - Manage loading/error/success states
   - Handle optimistic updates if needed
   - Use custom hook if complex

4. **Error Handling:** [09-ERROR-HANDLING](./09-ERROR-HANDLING.md)
   - Wrap in try-catch
   - Show user-friendly error messages
   - Never show raw API errors

5. **Testing:** [04-TESTING-PATTERNS](./04-TESTING-PATTERNS.md)
   - Mock the API service
   - Test success and error cases
   - Verify proper error display

**Result:** Type-safe API integration with proper error handling

---

## Scenario 3: Debugging a Failing Component

**Situation:** Component works locally but fails randomly in production. You can't reproduce it.

**Skills to Reference:**

1. **Error Investigation:** [09-ERROR-HANDLING](./09-ERROR-HANDLING.md)
   - Read: "Error Logging"
   - Add error logging/tracking
   - Check error reporting service for clues

2. **Development Tools:** [03-DEVELOPMENT-WORKFLOW](./03-DEVELOPMENT-WORKFLOW.md)
   - Read: "Debugging" section
   - Run in reproduction environment
   - Check network tab for API errors
   - Use browser DevTools breakpoints

3. **State Management:** [05-STATE-MANAGEMENT](./05-STATE-MANAGEMENT.md)
   - Check state initialization
   - Look for race conditions
   - Verify dependency arrays in useEffect

4. **Testing:** [04-TESTING-PATTERNS](./04-TESTING-PATTERNS.md)
   - Write test to reproduce issue
   - Test edge cases (empty data, null, undefined)
   - Test loading/error states

5. **Code Review:** [12-CODE-REVIEW-CHECKLIST](./12-CODE-REVIEW-CHECKLIST.md)
   - Check for missing error handling
   - Verify dependency arrays
   - Look for common anti-patterns

**Result:** Issue identified and fixed with test coverage

---

## Scenario 4: Performance Crisis - App is Slow

**Situation:** Dashboard takes 5+ seconds to load. You need to make it faster.

**Skills to Reference:**

1. **Performance Analysis:** [10-PERFORMANCE-BEST-PRACTICES](./10-PERFORMANCE-BEST-PRACTICES.md)
   - Read: "Bundle Analysis"
   - Run `npm run build` and analyze output
   - Check React DevTools Profiler

2. **Memoization:** [10-PERFORMANCE-BEST-PRACTICES](./10-PERFORMANCE-BEST-PRACTICES.md)
   - Use React.memo for expensive components
   - Add useMemo for expensive computations
   - Use useCallback for handler props

3. **Code Splitting:** [10-PERFORMANCE-BEST-PRACTICES](./10-PERFORMANCE-BEST-PRACTICES.md)
   - Split heavy features (AI Dashboard, etc.)
   - Lazy load routes
   - Use Suspense for loading states

4. **Testing Performance:** [04-TESTING-PATTERNS](./04-TESTING-PATTERNS.md)
   - Can also test performance regressions
   - Benchmark critical operations
   - Track metrics over time

**Result:** Dashboard loads in <2 seconds

---

## Scenario 5: Adding Form Validation

**Situation:** Login form needs better validation (email format, password strength).

**Skills to Reference:**

1. **State Management:** [05-STATE-MANAGEMENT](./05-STATE-MANAGEMENT.md)
   - Read: "useForm hook example"
   - Manage form state, errors, loading

2. **Custom Hooks:** [01-COMPONENT-ARCHITECTURE](./01-COMPONENT-ARCHITECTURE.md)
   - Extract validation logic into custom hook
   - Keep component focused on rendering

3. **Testing:** [04-TESTING-PATTERNS](./04-TESTING-PATTERNS.md)
   - Test valid/invalid inputs
   - Test error messages appear
   - Test form submission
   - Use getByRole queries

4. **Error Display:** [09-ERROR-HANDLING](./09-ERROR-HANDLING.md)
   - Show field-level errors
   - Highlight invalid fields
   - Provide helpful messages

5. **Accessibility:** [11-ACCESSIBILITY-GUIDELINES](./11-ACCESSIBILITY-GUIDELINES.md)
   - Connect labels to inputs
   - ARIA descriptions for errors
   - Field-specific error messages

**Result:** Robust form with validation and accessible errors

---

## Scenario 6: Code Review - Reviewing Someone's PR

**Situation:** Team member submitted PR with new feature. You're assigned as reviewer.

**Skills to Reference:**

1. **Pre-Review:** [12-CODE-REVIEW-CHECKLIST](./12-CODE-REVIEW-CHECKLIST.md)
   - Read PR description
   - Pull locally
   - Run tests + lint + build

2. **Architecture Check:** [01-COMPONENT-ARCHITECTURE](./01-COMPONENT-ARCHITECTURE.md)
   - Does it follow patterns?
   - Component structure reasonable?
   - Service layer used?

3. **Quality Check:** [02-NAMING-CONVENTIONS](./02-NAMING-CONVENTIONS.md) + [08-TYPESCRIPT-CONVENTIONS](./08-TYPESCRIPT-CONVENTIONS.md)
   - Naming consistent?
   - No `any` types?
   - Proper interfaces?

4. **Testing:** [04-TESTING-PATTERNS](./04-TESTING-PATTERNS.md)
   - Adequate test coverage?
   - Edge cases tested?
   - Using accessible queries?

5. **Best Practices:** [12-CODE-REVIEW-CHECKLIST](./12-CODE-REVIEW-CHECKLIST.md)
   - Check accessibility
   - Verify error handling
   - Look for anti-patterns
   - Performance OK?

6. **Comments:** Use specific, actionable feedback
   - Reference relevant skill if suggesting pattern change
   - Ask questions to understand intent
   - Praise good choices

**Result:** Constructive review that helps team improve

---

## Scenario 7: Accessibility Audit

**Situation:** Manager requests accessibility audit. Site needs to be WCAG AA compliant.

**Skills to Reference:**

1. **Guidelines:** [11-ACCESSIBILITY-GUIDELINES](./11-ACCESSIBILITY-GUIDELINES.md)
   - Read entire document
   - Print WCAG checklist
   - Audit each component

2. **Semantic HTML:** [11-ACCESSIBILITY-GUIDELINES](./11-ACCESSIBILITY-GUIDELINES.md)
   - Check all buttons are `<button>` elements
   - Check all links are `<a>` elements
   - Headings in order (h1, h2, h3)

3. **Keyboard Navigation:** [11-ACCESSIBILITY-GUIDELINES](./11-ACCESSIBILITY-GUIDELINES.md)
   - Disable mouse
   - Tab through entire app
   - Verify focus is visible

4. **Screen Reader:** [11-ACCESSIBILITY-GUIDELINES](./11-ACCESSIBILITY-GUIDELINES.md)
   - Download VoiceOver (Mac) or NVDA (Windows)
   - Test with screen reader
   - Verify all content is readable

5. **Testing:** [04-TESTING-PATTERNS](./04-TESTING-PATTERNS.md)
   - Write accessibility tests
   - Use getByRole queries
   - Catch regressions

**Result:** WCAG AA compliant application

---

## Scenario 8: Onboarding New Developer

**Situation:** New team member joins. They need to understand project setup and patterns.

**Skills to Reference (In Order):**

1. **Day 1 - Setup:**
   - [03-DEVELOPMENT-WORKFLOW](./03-DEVELOPMENT-WORKFLOW.md) - Full read
   - Get local environment running
   - Run `npm run dev`

2. **Day 1-2 - Patterns:**
   - [01-COMPONENT-ARCHITECTURE](./01-COMPONENT-ARCHITECTURE.md) - Full read
   - Review existing components
   - Understand folder structure

3. **Day 2 - Naming:**
   - [02-NAMING-CONVENTIONS](./02-NAMING-CONVENTIONS.md) - Quick reference
   - Use during first coding
   - Reference when uncertain

4. **Day 3 - Implementation:**
   - [04-TESTING-PATTERNS](./04-TESTING-PATTERNS.md) - Test section
   - [05-STATE-MANAGEMENT](./05-STATE-MANAGEMENT.md) - If using state
   - [07-API-INTEGRATION](./07-API-INTEGRATION.md) - If calling APIs

5. **Ongoing:**
   - [08-TYPESCRIPT-CONVENTIONS](./08-TYPESCRIPT-CONVENTIONS.md) - Reference as needed
   - [06-STYLING-CONVENTIONS](./06-STYLING-CONVENTIONS.md) - When styling
   - [11-ACCESSIBILITY-GUIDELINES](./11-ACCESSIBILITY-GUIDELINES.md) - For components

6. **PRs:**
   - [12-CODE-REVIEW-CHECKLIST](./12-CODE-REVIEW-CHECKLIST.md) - Before submitting PR

**Result:** New developer productive in 1 week

---

## Scenario 9: Creating Reusable Component Library

**Situation:** Team wants to create shared UI components (Button variants, Card layouts, etc.).

**Skills to Reference:**

1. **Architecture:** [01-COMPONENT-ARCHITECTURE](./01-COMPONENT-ARCHITECTURE.md)
   - Read: Presentational Components section
   - Design components to be reusable
   - Accept flexible props

2. **TypeScript:** [08-TYPESCRIPT-CONVENTIONS](./08-TYPESCRIPT-CONVENTIONS.md)
   - Type all props thoroughly
   - Use generics where flexible
   - Document with JSDoc

3. **Styling:** [06-STYLING-CONVENTIONS](./06-STYLING-CONVENTIONS.md)
   - CSS Modules for each component
   - Bootstrap classes for common UI
   - Ensure responsive

4. **Testing:** [04-TESTING-PATTERNS](./04-TESTING-PATTERNS.md)
   - Test all prop variations
   - Test all states (hover, active, disabled)
   - Target >90% coverage

5. **Accessibility:** [11-ACCESSIBILITY-GUIDELINES](./11-ACCESSIBILITY-GUIDELINES.md)
   - Semantic HTML
   - ARIA attributes
   - Keyboard navigation

6. **Documentation:**
   - Add stories or examples
   - Document prop types
   - Show usage patterns

**Result:** Polished, tested component library

---

## Scenario 10: Handling Complex Async Operations

**Situation:** New feature requires multiple API calls in sequence with conditional logic and retries.

**Skills to Reference:**

1. **State Management:** [05-STATE-MANAGEMENT](./05-STATE-MANAGEMENT.md)
   - Read: "useReducer for Complex State"
   - Manage multiple async states
   - Track loading/error for each operation

2. **API Integration:** [07-API-INTEGRATION](./07-API-INTEGRATION.md)
   - Read: "Request Cancellation"
   - Read: "Retry Logic"
   - Chain multiple calls safely

3. **Error Handling:** [09-ERROR-HANDLING](./09-ERROR-HANDLING.md)
   - Handle errors gracefully
   - Provide retry mechanisms
   - Show user-friendly messages

4. **Custom Hooks:** [01-COMPONENT-ARCHITECTURE](./01-COMPONENT-ARCHITECTURE.md)
   - Extract complex logic into custom hook
   - Keep component clean
   - Make logic reusable

5. **Testing:** [04-TESTING-PATTERNS](./04-TESTING-PATTERNS.md)
   - Mock all API calls
   - Test success path
   - Test error paths
   - Test retry logic

**Result:** Robust feature with proper error handling and testing

---

## How to Use This Guide

1. **Find your situation** above
2. **Follow recommended skills** in order
3. **Read only relevant sections** of each skill
4. **Apply patterns** to your code
5. **Reference again** if you get stuck

---

**Last Updated:** 2026-04-08
**Scenarios:** 10 real-world situations
**Time to read:** 2-5 minutes per scenario
