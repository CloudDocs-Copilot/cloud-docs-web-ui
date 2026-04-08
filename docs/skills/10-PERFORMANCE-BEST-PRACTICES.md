# ⚡ SKILL: Performance Best Practices

> **Tier 4 - NICE-TO-HAVE**
> Optimize your React application for speed

---

## Quick Tips

```typescript
// 1. Memoize expensive components
export const DocumentCard = React.memo(({ document }: Props) => {
  return <div>{document.filename}</div>;
});

// 2. Use useMemo for expensive computations
const sortedDocuments = useMemo(
  () => documents.sort((a, b) => a.name.localeCompare(b.name)),
  [documents],
);

// 3. Use useCallback for function props
const handleDelete = useCallback((id: string) => {
  documentService.delete(id);
}, []);

// 4. Code split routes
const Dashboard = lazy(() => import('./pages/Dashboard'));

// 5. Lazy load images
<img loading="lazy" src={image} />
```

---

## Memoization

### React.memo for Components

```typescript
// ✅ GOOD - Component won't re-render if props unchanged
export const DocumentCard = React.memo(
  ({ document, onDelete }: Props) => {
    return (
      <Card>
        <Card.Title>{document.filename}</Card.Title>
        <Button onClick={() => onDelete(document.id)}>Delete</Button>
      </Card>
    );
  },
// Custom comparison function (optional)
  (prevProps, nextProps) => {
    return prevProps.document.id === nextProps.document.id;
  }
);
```

### useMemo Hook

```typescript
export const DocumentList: React.FC<{ documents: Document[] }> = ({
  documents,
}) => {
  // ✅ GOOD - Expensive computation memoized
  const sortedDocuments = useMemo(
    () => documents.sort((a, b) => a.filename.localeCompare(b.filename)),
    [documents],
  );

  const stats = useMemo(() => {
    return {
      total: documents.length,
      totalSize: documents.reduce((sum, d) => sum + d.size, 0),
    };
  }, [documents]);

  return (
    <div>
      <p>Total: {stats.total}</p>
      {sortedDocuments.map(doc => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  );
};
```

### useCallback Hook

```typescript
export const DocumentList: React.FC<{ documents: Document[] }> = ({
  documents,
}) => {
  // ✅ GOOD - Function reference stable across renders
  const handleDelete = useCallback(
    async (id: string) => {
      await documentService.delete(id);
      // Optionally update UI
    },
    [], // Empty deps - function never changes
  );

  return (
    <div>
      {documents.map(doc => (
        <DocumentCard
          key={doc.id}
          document={doc}
          onDelete={handleDelete} // Stable reference
        />
      ))}
    </div>
  );
};
```

---

## Code Splitting

### Route-Based Splitting

```typescript
// ✅ GOOD - Lazy load route components
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Documents = lazy(() => import('./pages/Documents'));
const Settings = lazy(() => import('./pages/Settings'));

export const App = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
};
```

### Component-Based Splitting

```typescript
// ✅ GOOD - Dynamic import for heavy features
const AIDashboard = lazy(() => import('./components/AIDashboard'));

export const DocumentDetail: React.FC = () => {
  const [showAI, setShowAI] = useState(false);

  return (
    <div>
      <DocumentViewer />
      <Button onClick={() => setShowAI(true)}>Show AI Features</Button>
      {showAI && (
        <Suspense fallback={<Spinner />}>
          <AIDashboard />
        </Suspense>
      )}
    </div>
  );
};
```

---

## Virtual Scrolling

```typescript
// ✅ GOOD - For large lists (1000+ items)
import { FixedSizeList } from 'react-window';

export const LargeDocumentList: React.FC<{ documents: Document[] }> = ({
  documents,
}) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <DocumentCard document={documents[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={documents.length}
      itemSize={100}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};
```

---

## Image Optimization

### Lazy Loading

```typescript
// ✅ GOOD - Browser native lazy loading
<img
  src={documentImage}
  loading="lazy"
  alt="Document preview"
/>
```

### Responsive Images

```typescript
// ✅ GOOD - Serve different sizes
<picture>
  <source media="(min-width: 1024px)" srcSet="/large.jpg" />
  <source media="(min-width: 768px)" srcSet="/medium.jpg" />
  <img src="/small.jpg" alt="Document" />
</picture>
```

### Image Component

```typescript
interface ImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export const OptimizedImage: React.FC<ImageProps> = ({
  src,
  alt,
  width,
  height,
}) => {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      width={width}
      height={height}
      decoding="async"
    />
  );
};
```

---

## Bundle Analysis

### Check Bundle Size

```bash
# Analyze bundle
npm run build -- --analyze

# Check what's in node_modules
npm ls -a
```

### Remove Unused Packages

```bash
# Find unused dependencies
npm prune

# Remove package
npm uninstall package-name
```

---

## Best Practices

### ✅ DO

- ✅ Memoize expensive components and computations
- ✅ Use useCallback for props passed to child components
- ✅ Code split routes and heavy features
- ✅ Lazy load images
- ✅ Monitor bundle size
- ✅ Profile with React DevTools

### ❌ DON'T

- ❌ Over-memoize (every component)
- ❌ Create new objects/functions in render
- ❌ Bundle everything upfront
- ❌ Use inline images without optimization
- ❌ Ignore lighthouse scores
- ❌ Premature optimization

---

**Last Updated:** 2026-04-08
**Skill Level:** Nice-to-Have
**Time to Master:** 2 hours
