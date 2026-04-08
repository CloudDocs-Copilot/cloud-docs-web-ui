# 📘 SKILL: TypeScript Conventions

> **Tier 3 - IMPORTANT**
> Write type-safe, maintainable TypeScript code

---

## Quick Rules

```typescript
// ✅ ALWAYS DO
import type { User } from '../types/user.types';  // Type imports
interface Props { name: string; }                 // Use interfaces for objects
type Status = 'active' | 'inactive';             // Use types for unions
const value: string = 'test';                     // Explicit types

// ❌ NEVER DO
import { User } from '../types/user.types';      // Don't mix types with values
const value: any = 'test';                        // Never use any
const value = 'test';                             // No implicit any
```

---

## Type Imports

### Correct Usage

```typescript
// ✅ CORRECT - Separate type imports
import type { User, Document, Permission } from '../types/user.types';
import { userService } from '../services/userService';

export const UserCard: React.FC<UserCardProps> = ({ user }) => {
  return <div>{user.name}</div>;
};

// ❌ WRONG - Mixed imports
import { User, userService } from '../services/userService';

// ❌ WRONG - Default type import
import User from '../types/user.types';
```

### Benefits

- **Cleaner bundle:** Type imports stripped in compiled JavaScript
- **Clear intent:** Shows what's types vs values
- **Better tree-shaking:** Bundler can optimize better

---

## Interface vs Type

### Interfaces (Object Shapes)

```typescript
// ✅ GOOD - Interface for object shapes
export interface Document {
  id: string;
  filename: string;
  size: number;
  createdAt: Date;
}

export interface DocumentCardProps {
  document: Document;
  onDelete: (id: string) => void;
}

// ✅ GOOD - Extending interfaces
export interface PremiumDocument extends Document {
  premiumFeatures: string[];
}

// ✅ GOOD - Merging interfaces
interface WindowCustom {
  globalConfig: Config;
}
declare global {
  interface Window extends WindowCustom {}
}
```

### Types (Unions, Aliases, Primitives)

```typescript
// ✅ GOOD - Type for unions
export type DocumentStatus = 'draft' | 'published' | 'archived';
export type UserRole = 'admin' | 'user' | 'viewer';

// ✅ GOOD - Type for functions
export type OnDocumentDelete = (id: string) => void;
export type OnFormSubmit = (data: FormData) => Promise<void>;

// ✅ GOOD - Type for complex unions
export type Response<T> =
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

// ✅ GOOD - Type for mapped types
export type DocumentKeys = keyof Document;
export type DocumentReadonly = Readonly<Document>;
```

---

## Never Use `any`

### Problem

```typescript
// ❌ WRONG - Loses all type safety
const handleError = (error: any) => {
  console.error(error.message); // Could be undefined!
  return error.statusCode;      // Might not exist
};
```

### Solutions

```typescript
// ✅ GOOD - Use unknown
const handleError = (error: unknown) => {
  if (error instanceof Error) {
    console.error(error.message);
  } else if (typeof error === 'string') {
    console.error(error);
  } else {
    console.error('Unknown error');
  }
};

// ✅ GOOD - Use specific type
interface ErrorResponse {
  message: string;
  statusCode: number;
}
const handleError = (error: ErrorResponse) => {
  console.error(error.message);
};

// ✅ GOOD - Use generic
function handle<T>(value: T): T {
  return value;
}
```

---

## Function Types

### With Explicit Return Types

```typescript
// ✅ GOOD - Explicit return type
export const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString();
};

// ✅ GOOD - Async functions
export const fetchUser = async (id: string): Promise<User> => {
  const { data } = await apiClient.get(`/users/${id}`);
  return data;
};

// ✅ GOOD - Function with multiple parameters
export const updateDocument = (
  id: string,
  updates: UpdateDocumentDto,
  options?: UpdateOptions,
): Promise<Document> => {
  return apiClient.put(`/documents/${id}`, updates);
};
```

### Arrow Function Types

```typescript
// ✅ GOOD - Callback types
interface ButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onHover?: (isHovering: boolean) => void;
}

// Usage
<Button
  onClick={(e) => console.log(e)}
  onHover={(isHovering) => console.log(isHovering)}
/>
```

---

## Generic Types

### Generic Functions

```typescript
// ✅ GOOD - Generic with constraints
export const getProperty = <T, K extends keyof T>(
  obj: T,
  key: K,
): T[K] => {
  return obj[key];
};

const user = { name: 'John', age: 30 };
const name = getProperty(user, 'name'); // ✓ Works
// getProperty(user, 'email'); // ✗ Error: 'email' not in user

// ✅ GOOD - Generic with default
export const createArray = <T = string>(value: T): T[] => {
  return [value];
};

createArray('hello');      // string[]
createArray<number>(42);   // number[]
```

### Generic Components

```typescript
// ✅ GOOD - Generic component
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

export const List = <T,>({ items, renderItem, keyExtractor }: ListProps<T>) => {
  return (
    <ul>
      {items.map((item) => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
};

// Usage
<List
  items={documents}
  renderItem={(doc) => doc.filename}
  keyExtractor={(doc) => doc.id}
/>
```

---

## Utility Types

### Common Utility Types

```typescript
// ✅ GOOD - Partial (all fields optional)
type UpdateDto = Partial<Document>;

// ✅ GOOD - Pick (select specific fields)
type DocumentPreview = Pick<Document, 'id' | 'filename'>;

// ✅ GOOD - Omit (exclude specific fields)
type DocumentWithoutId = Omit<Document, 'id'>;

// ✅ GOOD - Record (map of items)
type PermissionMap = Record<UserRole, Permission[]>;

// ✅ GOOD - Readonly (immutable)
type ReadonlyDocument = Readonly<Document>;

// ✅ GOOD - Required (all required)
type RequiredDocument = Required<Document>;
```

---

## Typing Events

### React Events

```typescript
// ✅ GOOD - Form events
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  // ...
};

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value; // Type-safe
};

// ✅ GOOD - Mouse events
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
};

// ✅ GOOD - Keyboard events
const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
  if (e.key === 'Enter') {
    // ...
  }
};
```

---

## Strict Mode Benefits

### TypeScript Config

```json
{
  "compilerOptions": {
    "strict": true,  // Enables all strict checks
    "noImplicitAny": true,           // Error on implicit any
    "strictNullChecks": true,        // Error on null/undefined
    "strictFunctionTypes": true,     // Strict function signatures
    "strictBindCallApply": true,     // Strict bind/call/apply
    "strictPropertyInitialization": true  // Class props must initialize
  }
}
```

### Benefits

```typescript
// Strict mode catches these errors:
let x;                    // ✗ Error: Implicit any
const fn = (x) => {};     // ✗ Error: Parameter has implicit any
const obj = { x: 1 };
obj.y;                    // ✗ Error: Property 'y' doesn't exist

// Strict mode requires explicitly typing:
let x: string;            // ✓ OK
const fn = (x: number) => {}; // ✓ OK
const obj: { x: number } = { x: 1 }; // ✓ OK
```

---

## Best Practices

### ✅ DO

- ✅ Use `import type` for type-only imports
- ✅ Use interfaces for object shapes
- ✅ Use types for unions and aliases
- ✅ Provide explicit return types
- ✅ Use generics for reusable code
- ✅ Practice strict mode

### ❌ DON'T

- ❌ Use `any` type
- ❌ Mix type and value imports
- ❌ Use interfaces for function types
- ❌ Leave implicit any errors
- ❌ Use unsafe type assertions (`as any`)

---

## Next Skills

- ✅ Reference: COMPONENT-ARCHITECTURE.md (typing components)
- ✅ Reference: API-INTEGRATION.md (typing API responses)

---

**Last Updated:** 2026-04-08
**Skill Level:** Important
**Time to Master:** 2-3 hours
