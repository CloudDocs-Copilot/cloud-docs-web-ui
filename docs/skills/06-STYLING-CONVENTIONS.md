# 🎨 SKILL: Styling Conventions

> **Tier 2 - IMPORTANT**
> Apply Bootstrap 5 and CSS Modules effectively

---

## CSS Modules (Primary)

### File Structure

```typescript
// components/DocumentCard.tsx
import styles from './DocumentCard.module.css';

export const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  return (
    <div className={styles['document-card']}>
      <h3 className={styles['card-title']}>{document.filename}</h3>
    </div>
  );
};
```

```css
/* DocumentCard.module.css */
.document-card {
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}
```

### Class Naming

```css
/* ✅ CORRECT - kebab-case, semantic names */
.document-list { }
.document-item { }
.document-item-active { }
.action-buttons { }
.delete-button { }

/* ❌ WRONG */
.documentList { } /* camelCase */
.DocumentList { } /* PascalCase */
.dl { } /* abbreviation */
```

### Scoping with Modules

```typescript
// Module scopes classes to component automatically
// No naming conflicts across components!

// components/DocumentCard/DocumentCard.module.css
.card { } // Only affects DocumentCard

// components/FolderCard/FolderCard.module.css
.card { } // Only affects FolderCard

// Usage - both can use .card independently
<div className={documentStyles.card}>
<div className={folderStyles.card}>
```

---

## Bootstrap 5 Components

### React Bootstrap

```typescript
import { Button, Card, Modal, Alert, Form, Spinner } from 'react-bootstrap';

// Button variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Danger</Button>
<Button variant="outline-primary">Outline</Button>

// Card structure
<Card>
  <Card.Header>Header</Card.Header>
  <Card.Body>
    <Card.Title>Title</Card.Title>
    <Card.Text>Content</Card.Text>
  </Card.Body>
  <Card.Footer>Footer</Card.Footer>
</Card>

// Modal
<Modal show={isOpen} onHide={handleClose}>
  <Modal.Header closeButton>
    <Modal.Title>Title</Modal.Title>
  </Modal.Header>
  <Modal.Body>Content</Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={handleClose}>Close</Button>
    <Button variant="primary" onClick={handleSave}>Save</Button>
  </Modal.Footer>
</Modal>

// Alert
<Alert variant="success" dismissible>Success message</Alert>
<Alert variant="danger">Error message</Alert>

// Form
<Form>
  <Form.Group className="mb-3">
    <Form.Label>Email</Form.Label>
    <Form.Control type="email" placeholder="Enter email" />
  </Form.Group>
  <Button type="submit">Submit</Button>
</Form>
```

### Bootstrap Utilities

```typescript
// Spacing (margin/padding)
<div className="p-2">Padding</div>
<div className="m-3">Margin</div>
<div className="mt-4">Margin-top</div>
<div className="ps-5">Padding-start (left in LTR)</div>

// Display
<div className="d-flex gap-2">Flex with gap</div>
<div className="d-none d-md-block">Hidden on small, visible on medium+</div>

// Text alignment
<p className="text-center">Centered</p>
<p className="text-end">Right aligned</p>

// Colors
<Alert variant="primary">Primary</Alert>
<Alert variant="warning">Warning</Alert>
<Alert variant="success">Success</Alert>
<Alert variant="danger">Danger</Alert>
```

### Grid System

```typescript
// Container and rows
<div className="container">
  <div className="row">
    <div className="col-md-6">Half width on medium+</div>
    <div className="col-md-6">Half width on medium+</div>
  </div>
  <div className="row">
    <div className="col-lg-4">Third width on large+</div>
    <div className="col-lg-4">Third width on large+</div>
    <div className="col-lg-4">Third width on large+</div>
  </div>
</div>
```

---

## Responsive Design

### Breakpoints

```css
/* Bootstrap breakpoints */
xs: 0px (default)
sm: 576px
md: 768px
lg: 992px
xl: 1200px
xxl: 1400px
```

### Mobile-First Approach

```typescript
// ✅ GOOD - Mobile first
<div className="col-12 col-md-6 col-lg-4">
  {/* Full width by default, half on md+, third on lg+ */}
</div>

// ✅ GOOD - Hide/show responsive
<div className="d-none d-md-block">
  {/* Hidden on mobile, visible on md+ */}
</div>

// ✅ GOOD - Responsive spacing
<div className="p-2 p-md-3 p-lg-4">
  {/* Small padding on mobile, more on larger screens */}
</div>
```

### Custom Responsive Styles

```css
/* DocumentCard.module.css */
.document-card {
  padding: 1rem;
  grid-template-columns: 1fr;
}

/* Medium screens and up */
@media (min-width: 768px) {
  .document-card {
    padding: 1.5rem;
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Large screens */
@media (min-width: 992px) {
  .document-card {
    padding: 2rem;
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## Design Tokens

### Colors

```css
/* Use Bootstrap's predefined colors */
:root {
  --bs-primary: #0d6efd;
  --bs-danger: #dc3545;
  --bs-warning: #ffc107;
  --bs-success: #198754;
  --bs-info: #0dcaf0;
  --bs-light: #f8f9fa;
  --bs-dark: #212529;
}

/* In components */
.success-badge {
  background-color: var(--bs-success);
  color: white;
}
```

### Size Scale

```css
/* Size consistency */
:root {
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
}

.card {
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}
```

---

## Combining Bootstrap + CSS Modules

### Best Practice

```typescript
import { Button, Card } from 'react-bootstrap';
import styles from './DocumentCard.module.css';

export const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  return (
    <Card className={styles['document-card']}>
      <Card.Body>
        <Card.Title className={styles['card-title']}>
          {document.filename}
        </Card.Title>
        <Card.Text className="mb-3">
          {document.description}
        </Card.Text>
        <div className={styles['action-buttons']}>
          <Button variant="primary" className="me-2">Edit</Button>
          <Button variant="outline-danger">Delete</Button>
        </div>
      </Card.Body>
    </Card>
  );
};
```

```css
/* DocumentCard.module.css */
.document-card {
  transition: all 0.2s ease;
}

.document-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-weight: 600;
  color: #212529;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}
```

---

## Dark Mode (Future-Ready)

```css
/* DocumentCard.module.css - already works with Bootstrap dark mode */
.document-card {
  background-color: var(--bs-body-bg);
  color: var(--bs-body-color);
  border: 1px solid var(--bs-border-color);
}

/* Automatically adapts in dark mode */
```

---

## Performance

### ✅ DO

- ✅ Use Bootstrap utilities when possible
- ✅ Keep CSS Modules scoped
- ✅ Reuse common patterns
- ✅ Use design tokens for consistency
- ✅ Lazy load heavy stylesheets

### ❌ DON'T

- ❌ Use inline styles (except for dynamic values)
- ❌ Use global CSS (except for resets)
- ❌ Duplicate Bootstrap styling
- ❌ Create overly specific selectors
- ❌ Include unnecessary CSS frameworks

---

## Quick Reference

| Use Case | Method | Example |
|----------|--------|---------|
| Button | Bootstrap | `<Button variant="primary">` |
| Card layout | Bootstrap | `<Card><Card.Body>` |
| Spacing | Bootstrap | `className="p-3 m-2"` |
| Custom styling | CSS Modules | `className={styles.custom}` |
| Responsive | Bootstrap | `className="col-md-6"` |
| Colors | Bootstrap vars | `background-color: var(--bs-primary)` |

---

## Next Skills

- ✅ Reference: CLAUDE.md Styling Guidelines

---

**Last Updated:** 2026-04-08
**Skill Level:** Important
**Time to Master:** 2 hours
