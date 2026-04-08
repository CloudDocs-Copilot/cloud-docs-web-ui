# 📋 SKILL: Naming Conventions

> **Tier 1 - ESSENTIAL**
> Master the naming rules used throughout CloudDocs

---

## Quick Reference Table

| Type | Convention | Examples | File Pattern |
|------|-----------|----------|--------------|
| **Components** | PascalCase | `DocumentCard.tsx`, `LoginForm.tsx` | `*.tsx` |
| **Hooks** | `use` + PascalCase | `useAuth.ts`, `useDocuments.ts` | `use*.ts` |
| **Services** | camelCase + `Service` | `documentService.ts`, `authService.ts` | `*Service.ts` |
| **Types/Interfaces** | PascalCase | `User`, `Document`, `DocumentCardProps` | `*.types.ts` |
| **Constants** | SCREAMING_SNAKE_CASE | `API_BASE_URL`, `MAX_FILE_SIZE` | In `constants/*.ts` |
| **CSS Modules** | kebab-case | `document-card.module.css` | `*.module.css` |
| **Variables** | camelCase | `isLoading`, `userData`, `documentList` | In code |
| **Functions** | camelCase | `fetchDocuments()`, `handleDelete()` | In code |
| **Event handlers** | `handle` + Event | `handleClick`, `handleSubmit`, `handleChange` | In code |
| **Boolean variables** | `is`/`has`/`can` prefix | `isLoading`, `hasError`, `canDelete` | In code |
| **Folders** | kebab-case (plural) | `components/`, `services/`, `hooks/` | Directories |

---

## Component Naming

### Files

```typescript
// ✅ CORRECT - PascalCase with .tsx extension
DocumentCard.tsx
LoginForm.tsx
UserProfile.tsx
FolderTree.tsx
AuthGuard.tsx

// ❌ WRONG
document-card.tsx         // lowercase
documentCard.tsx          // not .tsx
DocumentCard.jsx          // not .jsx
document_card.tsx         // snake_case
```

### Exports

```typescript
// ✅ CORRECT - Named export with PascalCase
export const DocumentCard: React.FC<DocumentCardProps> = ({...}) => {...};

// Optional: Default export
export default DocumentCard;

// ❌ WRONG
export const documentCard = ... // lowercase
const DocumentCard = ... // no export

// ✅ CORRECT - If component needs suffix
export const DocumentCardContainer: React.FC = ({...}) => {...};  // Container version
export const DocumentCardErrors: React.FC = ({...}) => {...};     // Error version
```

### Component Composition

```typescript
// ✅ GOOD - Clear purpose in name
<DocumentList />           // List of documents
<DocumentListContainer />  // Container managing document list
<DocumentCard />          // Single document display
<DocumentCardLoading />   // Loading skeleton for card
<DocumentActions />       // Action buttons for document
```

---

## Hook Naming

### File Names

```typescript
// ✅ CORRECT - use + PascalCase
useAuth.ts
useDocuments.ts
useHttpRequest.ts
useLocalStorage.ts
useFetch.ts

// ❌ WRONG
auth.ts              // missing use prefix
hooks/authHook.ts    // "Hook" suffix unnecessary
UserHook.ts          // PascalCase (should be camelCase after "use")
```

### Hook Export

```typescript
// ✅ CORRECT - Named export
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  return { user, isAuthenticated: !!user };
};

// Usage
const { user, isAuthenticated } = useAuth();

// ❌ WRONG
const useAuth = ... // no export
export default useAuth; // use default export
```

### Return Values

```typescript
// ✅ CORRECT - Clear return object
export const useDocuments = (folderId?: string) => {
  return {
    documents,    // array
    loading,      // boolean
    error,        // string | null
    refetch,      // function
  };
};

// ❌ WRONG
export const useDocuments = () => {
  return { docs: documents, isLoading: loading }; // inconsistent naming
};
```

---

## Service Naming

### Files

```typescript
// ✅ CORRECT - camelCase + Service suffix
documentService.ts
authService.ts
organizationService.ts
aiService.ts

// ❌ WRONG
DocumentService.ts         // PascalCase
document-service.ts        // kebab-case
documents.ts              // no Service suffix
```

### Exports

```typescript
// ✅ CORRECT - Named export as singleton
export const documentService = {
  getAll: async () => { ... },
  getById: async (id: string) => { ... },
  create: async (data: CreateDocumentDto) => { ... },
  update: async (id: string, data: UpdateDocumentDto) => { ... },
  delete: async (id: string) => { ... },
};

// Usage
import { documentService } from '../services/documentService';
await documentService.getAll();

// ❌ WRONG
export class DocumentService { ... }  // Use objects, not classes
export default documentService;        // Use named export
```

### Method Names

```typescript
// ✅ CORRECT - Clear CRUD operations
documentService.getAll()              // fetch all
documentService.getById(id)           // fetch one
documentService.getByFolder(folderId) // fetch filtered
documentService.create(data)          // create
documentService.update(id, data)      // update
documentService.delete(id)            // delete

// ✅ CORRECT - Other operations
documentService.search(query)         // search
documentService.export(format)        // export
documentService.import(file)          // import
documentService.share(documentId)     // share

// ❌ WRONG
documentService.queryAll()   // use get*
documentService.put(...)     // use update
documentService.remove(...)  // use delete
```

---

## Type/Interface Naming

### Files

```typescript
// ✅ CORRECT - PascalCase, .types.ts suffix
document.types.ts
user.types.ts
auth.types.ts
common.types.ts

// ❌ WRONG
documentTypes.ts      // camelCase
document-types.ts     // kebab-case
types/document.ts     // no .types suffix
```

### Interface Names

```typescript
// ✅ CORRECT - PascalCase
export interface Document {
  id: string;
  filename: string;
  // ...
}

export interface DocumentCardProps {
  document: Document;
  onDelete: (id: string) => void;
}

export interface CreateDocumentDto {
  filename: string;
  folderId?: string;
}

// Good suffixes:
// - Props     (for component props)
// - Dto       (Data Transfer Object for API requests/responses)
// - State     (for state interfaces)
// - Options   (for configuration objects)
// - Response  (for API responses)
// - Request   (for API requests)

// ❌ WRONG
export interface DocumentProps { }  // too generic, should be DocumentCardProps
export interface IDocument { }      // Hungarian notation, avoid
export interface DocumentInterface { } // redundant suffix
```

### Type Aliases

```typescript
// ✅ CORRECT - PascalCase for union types
export type DocumentStatus = 'draft' | 'published' | 'archived';
export type UserRole = 'admin' | 'user' | 'viewer';
export type NotificationType = 'info' | 'warning' | 'error' | 'success';

// ✅ CORRECT - Callback types
export type OnDocumentDelete = (id: string) => void;
export type OnDocumentSelect = (id: string) => Promise<void>;

// ❌ WRONG
export type documentStatus = ... // lowercase
export type DOCUMENT_STATUS = ... // SCREAMING_SNAKE_CASE
```

---

## Constants Naming

### Files

```typescript
// ✅ CORRECT - camelCase file names
api.constants.ts
routes.constants.ts
validation.constants.ts
styling.constants.ts

// ❌ WRONG
API_CONSTANTS.ts          // SCREAMING_SNAKE_CASE
api-constants.ts          // kebab-case
```

### Constant Values

```typescript
// ✅ CORRECT - SCREAMING_SNAKE_CASE for constants
export const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MIN_USERNAME_LENGTH = 3;
export const DEFAULT_PAGE_SIZE = 20;
export const TOAST_AUTO_HIDE_MS = 5000;

// Grouping related constants
export const API_ENDPOINTS = {
  DOCUMENTS: '/documents',
  FOLDERS: '/folders',
  AUTH: '/auth',
  AI: '/ai',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
} as const;

// Time constants
export const TIME_MS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
} as const;

// ❌ WRONG
export const maxFileSize = 10 * 1024 * 1024; // camelCase
export const MaxFileSize = 10 * 1024 * 1024; // PascalCase
```

---

## Variable Naming

### Local Variables

```typescript
// ✅ CORRECT - camelCase
const userData = user;
const documentList = documents;
const isLoading = true;
const hasError = false;
const canDelete = user?.role === 'admin';

// State variables
const [isOpen, setIsOpen] = useState(false);
const [documents, setDocuments] = useState<Document[]>([]);
const [error, setError] = useState<string | null>(null);

// Boolean prefixes
const isActive = true;
const isVisible = false;
const hasPermission = true;
const canEdit = true;
const shouldFetch = true;
const didLoad = false;
```

### Collections

```typescript
// ✅ CORRECT - Plural names for arrays
const documents: Document[] = [];
const users: User[] = [];
const errors: string[] = [];

// Dictionary/Map names
const documentById = new Map<string, Document>();
const userPermissions: Record<string, Permission> = {};

// ❌ WRONG
const document: Document[] = []; // singular for array
const documentArray = [];         // unnecessary "Array" suffix
const documentList = [];          // inconsistent with array names
```

---

## Function Naming

### Event Handlers

```typescript
// ✅ CORRECT - handle + EventName
const handleClick = () => { ... };
const handleSubmit = (e: React.FormEvent) => { ... };
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { ... };
const handleDelete = (id: string) => { ... };
const handleKeyDown = (e: React.KeyboardEvent) => { ... };

// Callback props - pass as "on" prefix
interface ButtonProps {
  onClick?: () => void;
  onSubmit?: (data: FormData) => void;
  onLoadingChange?: (loading: boolean) => void;
}

// Arrow functions in render
<Button onClick={handleDelete} />
<Input onChange={handleChange} />

// ❌ WRONG
const onDelete = () => {};        // "on" for handlers, "handle" for handlers
const deleteDocument = () => {};   // unclear if event handler
const handleDocumentDelete = () => {};  // too verbose
```

### Utility Functions

```typescript
// ✅ CORRECT - Descriptive verb+noun
const formatDate = (date: Date): string => { ... };
const parseJSON = (str: string) => { ... };
const validateEmail = (email: string): boolean => { ... };
const sanitizeInput = (input: string): string => { ... };
const calculateTotal = (items: Item[]): number => { ... };

// Predicates (functions that return boolean)
const isValidEmail = (email: string): boolean => { ... };
const hasPermission = (user: User, action: string): boolean => { ... };
const canDelete = (user: User, document: Document): boolean => { ... };

// ❌ WRONG
const format = () => {};  // too generic
const check = () => {};   // unclear what's being checked
const do = () => {};      // reserved keyword
```

---

## CSS and Styling

### CSS Module Classes

```css
/* DocumentCard.module.css */

/* ✅ CORRECT - kebab-case class names */
.document-card {
  padding: 1rem;
  border: 1px solid #ddd;
}

.card-header {
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
}

.card-body {
  padding: 0.5rem 0;
}

.card-title {
  font-size: 1.5rem;
  font-weight: bold;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.action-button-delete {
  background-color: #dc3545;
  color: white;
}

/* Modifier classes */
.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-button:hover:not(:disabled) {
  opacity: 0.9;
}

/* ❌ WRONG */
.DocumentCard { } /* PascalCase */
.document_card { } /* snake_case */
.documentCard { } /* camelCase */
.cardTitle { } /* camelCase */
```

### CSS Class Usage in Components

```typescript
// ✅ CORRECT
import styles from './DocumentCard.module.css';

export const DocumentCard = ({ document }) => {
  return (
    <div className={styles['document-card']}>
      <h3 className={styles['card-title']}>{document.filename}</h3>
      <div className={styles['action-buttons']}>
        <button className={styles['action-button']}>Edit</button>
        <button className={styles['action-button-delete']}>Delete</button>
      </div>
    </div>
  );
};

// Or with object property access (better for long names)
export const DocumentCard = ({ document }) => {
  return (
    <div className={styles.documentCard}> {/* if CSS file had .documentCard */}
      {/* ... */}
    </div>
  );
};
```

---

## Folder Organization

### Naming Conventions

```
src/
├── components/     # ✅ Plural
├── pages/         # ✅ Plural
├── hooks/         # ✅ Plural
├── services/      # ✅ Plural
├── context/       # ✅ Plural
├── types/         # ✅ Plural
├── constants/     # ✅ Plural
├── utils/         # ✅ Plural
├── assets/        # ✅ Plural
├── api/           # ✅ Plural
├── styles/        # ✅ Plural
└── __tests__/     # ✅ Plural

// ❌ WRONG
├── Component/     # Singular
├── Page/         # Singular
├── Hook/         # Singular
```

### Feature-Based Organization

```
components/
├── common/              # Reusable components
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Navigation.tsx
├── documents/           # Feature: document management
│   ├── DocumentCard.tsx
│   ├── DocumentList.tsx
│   ├── DocumentPreview.tsx
│   └── index.ts
├── auth/               # Feature: authentication
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── index.ts
└── index.ts            # Export all components
```

---

## Summary Table for Quick Reference

```typescript
// COMPONENTS
export const MyComponent: React.FC<MyComponentProps> = ({...}) => {...};

// HOOKS
export const useMyHook = () => { return {...}; };

// SERVICES
export const myService = { method: async () => {...} };

// TYPES
export interface MyInterface { }
export type MyType = 'value1' | 'value2';

// CONSTANTS
export const MY_CONSTANT = 'value';

// VARIABLES
let myVariable = 'value';
const isActive = true;
const hasError = false;

// FUNCTIONS
const handleClick = () => { ... };
const formatDate = (date: Date) => { ... };
const isValidEmail = (email: string) => { ... };

// CSS
.my-class-name { }
```

---

## Quick Fixes

| Current | Should Be | Why |
|---------|-----------|-----|
| `getUserData.tsx` | `GetUserData.tsx` | Components = PascalCase |
| `useAuth().ts` | `useAuth.ts` | Hooks use camelCase after "use" |
| `AuthService.ts` | `authService.ts` | Services = camelCase + Service |
| `Document` | `DocumentCardProps` | Props interfaces need suffix |
| `API_URL` (in variable) | `apiUrl` | Local vars = camelCase |
| `handleOnClick` | `handleClick` | Just "handle" prefix |
| `isLoadingBool` | `isLoading` | Unnecessary type suffix |

---

## Next Steps

- ✅ Read: COMPONENT-ARCHITECTURE.md (how to structure)
- ✅ Read: DEVELOPMENT-WORKFLOW.md (run and test)
- ✅ Reference: CLAUDE.md Naming Conventions section

---

**Last Updated:** 2026-04-08
**Skill Level:** Essential
**Time to Master:** 1-2 hours
