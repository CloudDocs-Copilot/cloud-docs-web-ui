# ♿ SKILL: Accessibility Guidelines

> **Tier 4 - NICE-TO-HAVE**
> Build inclusive applications that work for everyone

---

## Semantic HTML

### Correct Elements

```typescript
// ✅ GOOD - Semantic elements
<header>CloudDocs</header>
<nav>Navigation</nav>
<main>Content</main>
<article>Document</article>
<section>Related items</section>
<footer>Footer</footer>

// ✅ GOOD - Semanticheadings and links
<h1>Main title</h1>
<h2>Section title</h2>
<a href="/documents">View documents</a>

// ❌ WRONG - div for everything
<div className="header">CloudDocs</div>
<div className="nav">Navigation</div>
<div className="link">Click here</div>
```

### Buttons vs Links

```typescript
// ✅ USE <button> FOR:
<button onClick={handleDelete}>Delete</button>

// ✅ USE <a> FOR:
<a href="/documents">View documents</a>

// ❌ DON'T
<div onClick={handleDelete}>Delete</div>
<span onClick={navigateTo}>Link</span>
```

---

## ARIA Attributes

### Live Regions

```typescript
// ✅ GOOD - Announce status changes
export const DocumentUpload: React.FC = () => {
  const [status, setStatus] = useState('');

  return (
    <div>
      <input type="file" onChange={handleFileSelect} />
      <div aria-live="polite" aria-atomic="true" role="status">
        {status}
      </div>
    </div>
  );
};
```

### ARIA Labels

```typescript
// ✅ GOOD - Descriptive labels
<button aria-label="Delete this document">
  <TrashIcon />
</button>

<input
  type="search"
  placeholder="Search documents"
  aria-label="Search for documents"
/>

<div aria-label="Document count">
  Total: 42
</div>
```

### ARIA Descriptions

```typescript
// ✅ GOOD - Additional context
<form aria-describedby="form-help">
  <button type="submit">Upload</button>
  <p id="form-help">
    Max file size: 10MB. Supported formats: PDF, DOCX, XLSX
  </p>
</form>
```

---

## Keyboard Navigation

### Focus Management

```typescript
// ✅ GOOD - Keyboard accessible
export const ModalDialog: React.FC<ModalProps> = ({ onClose, children }) => {
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  // Focus first button on open
  useEffect(() => {
    firstButtonRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div role="dialog" onKeyDown={handleKeyDown}>
      {children}
      <button ref={firstButtonRef} onClick={onClose}>
        Close
      </button>
    </div>
  );
};
```

### Tab Order

```typescript
// ✅ GOOD - Natural tab order
<form>
  <input type="text" placeholder="Name" />
  <input type="email" placeholder="Email" />
  <button type="submit">Submit</button>
</form>

// ✅ IF CUSTOM ORDER NEEDED
<div tabIndex="0">First</div>
<div tabIndex="1">Second</div>

// ❌ AVOID - Breaks keyboard nav
<div tabIndex="-1">Hidden from tab</div>
<div tabIndex="100">Random order</div>
```

---

## Color Contrast

### Text Contrast

```css
/* ✅ GOOD - Sufficient contrast (WCAG AA) */
.text-primary {
  color: #000;           /* 100% on #fff */
  background-color: #fff;
}

.text-secondary {
  color: #666;           /* 70% on #fff */
  background-color: #fff;
}

/* ❌ POOR - Insufficient contrast */
.text-bad {
  color: #ccc;           /* Too light */
  background-color: #fff;
}
```

### Not Color Alone

```typescript
// ❌ WRONG - Color only
<div style={{ color: error ? 'red' : 'green' }}>
  Status
</div>

// ✅ CORRECT - Color + icon/text
<div style={{ color: error ? 'red' : 'green' }}>
  {error ? '❌ Error' : '✅ Success'}
</div>
```

---

## Form Accessibility

### Labels

```typescript
// ✅ GOOD - Explicit labels
<label htmlFor="email-input">Email:</label>
<input id="email-input" type="email" />

// ✅ GOOD - Implicit labels
<label>
  Email:
  <input type="email" />
</label>

// ❌ WRONG - Missing labels
<input type="email" placeholder="Email" />
```

### Error Messages

```typescript
// ✅ GOOD - Linked error messages
<form>
  <label htmlFor="name-field">Name:</label>
  <input
    id="name-field"
    aria-describedby="name-error"
    required
  />
  <span id="name-error" role="alert">
    Name is required
  </span>
</form>
```

### Input Types

```typescript
// ✅ GOOD - Correct input types
<input type="email" />
<input type="tel" />
<input type="date" />
<input type="number" />
<input type="search" />

// Better mobile support and validation
```

---

## Screen Reader Testing

### Test with VoiceOver (Mac)

```bash
# Enable VoiceOver
Cmd + F5

# Navigate
VO + Right Arrow    # Next item
VO + Left Arrow     # Previous item
VO + Space          # Activate
VO + U              # Open rotor
```

### Test with NVDA (Windows)

```bash
# Enable NVDA
# https://www.nvaccess.org/

# Navigate
Insert + Right Arrow  # Next item
Insert + Left Arrow   # Previous item
Space or Enter        # Activate
```

---

## Common Patterns

### Skip Navigation

```typescript
// ✅ GOOD - Skip to main content
export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <>
      <a href="#main-content" className="sr-only">
        Skip to main content
      </a>
      <header>Navigation</header>
      <main id="main-content">{children}</main>
    </>
  );
};
```

### Icon Buttons

```typescript
// ✅ GOOD - Icon with aria-label
<button aria-label="Delete document">
  <TrashIcon />
</button>

// ❌ WRONG - Icon alone
<button>
  <TrashIcon />
</button>
```

### Loading States

```typescript
// ✅ GOOD - Announce loading
<div aria-live="polite" aria-busy={loading}>
  {loading ? (
    <>
      <Spinner aria-hidden="true" />
      Loading...
    </>
  ) : (
    'Content'
  )}
</div>
```

---

## WCAG Checklist

- [ ] Headings in order (h1, h2, h3)
- [ ] Images have alt text
- [ ] Form fields have labels
- [ ] Color contrast ≥ 4.5:1 for text
- [ ] Keyboard navigation works
- [ ] Focus visible
- [ ] Links underlined or otherwise distinct
- [ ] No flashing/scrolling animations
- [ ] Error messages clear
- [ ] Time limits extendable

---

## Testing

### Automated Tools

```bash
# Install axe DevTools
# https://www.deque.com/axe/devtools/

# Install WAVE
# https://wave.webaim.org/

# ESLint plugin
npm install -D eslint-plugin-jsx-a11y
```

### Manual Testing

1. **Keyboard only** - Disable mouse, navigate with keyboard
2. **Screen reader** - Use VoiceOver or NVDA
3. **Color blind** - Use color blind simulator
4. **Zoom** - Test at 200% zoom

---

## Best Practices

### ✅ DO

- ✅ Use semantic HTML elements
- ✅ Provide alt text for images
- ✅ Use ARIA labels when needed
- ✅ Support keyboard navigation
- ✅ Test with real assistive technology
- ✅ Maintain sufficient color contrast

### ❌ DON'T

- ❌ Use div/span for everything
- ❌ Rely on color alone for meaning
- ❌ Use ARIA when HTML will do
- ❌ Create keyboard traps
- ❌ Hide focus indicators
- ❌ Auto-play audio/video

---

**Last Updated:** 2026-04-08
**Skill Level:** Nice-to-Have
**Time to Master:** 3 hours
