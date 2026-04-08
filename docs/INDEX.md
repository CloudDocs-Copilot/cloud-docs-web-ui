# Documentation Index & Metadata

> **Last Updated:** 2026-04-08
> **Purpose:** Quick reference for all documentation with metadata for smart loading

---

## Quick Stats

- **Total docs:** 20+
- **Total lines:** ~5,000
- **Always-load docs:** 1 (CLAUDE.md - 548 lines)
- **Context groups:** 6 categories
- **Context reduction:** 89% when using targeted skills

---

## Root Level Documentation

### 🔵 CLAUDE.md (548 lines) - **CORE - ALWAYS LOAD**
- **Keywords:** Patterns, conventions, testing, component structure, TypeScript rules
- **Sections:**
  - Project context & tech stack
  - Component patterns (mandatory structure)
  - Custom hooks pattern
  - Service layer pattern
  - TypeScript strict rules
  - Testing requirements & structure
  - Naming conventions
  - Error handling & state management
  - Pre-commit checklist
- **Load when:** ALWAYS - Contains core instructions
- **Related:** All other docs reference this

### 📖 README.md (182 lines)
- **Keywords:** Project overview, quick start, tech stack, features, scripts
- **Best for:** First-time setup, understanding what the project does
- **Load when:**
  - Getting started (first time)
  - Explaining project to newcomers
- **Links to:** CONTRIBUTING.md, docs/ARCHITECTURE.md, tests, docker
- **Related:** CONTRIBUTING.md, ENVIRONMENT-CONFIG.md

### 🔧 CONTRIBUTING.md (375 lines)
- **Keywords:** Development setup, testing commands, guidelines, commit rules
- **Best for:** Getting dev environment ready, running tests
- **Load when:**
  - Setting up development environment
  - Debugging test failures
  - Publishing changes
- **Sections:** Prerequisites, setup steps, test commands, linting, building
- **Related:** README.md, ENVIRONMENT-CONFIG.md, CLAUDE.md

### 🌍 ENVIRONMENT-CONFIG.md (145 lines)
- **Keywords:** Environment variables, .env files, configuration priority
- **Best for:** Setting up local environment, debugging config issues
- **Load when:**
  - Configuring new environment
  - Debugging environment-related issues
  - Adding new environment variables
- **Related:** README.md, CONTRIBUTING.md

### 👥 ROLES.md (51 lines)
- **Keywords:** Team roles, responsibilities, points of contact
- **Best for:** Understanding who does what on the team
- **Load when:**
  - First-time intro
  - Need to know responsibilities
- **Related:** README.md, CONTRIBUTING.md

---

## API Documentation

### 📡 API_ENDPOINTS_QUICK_REFERENCE.md (262 lines)
- **Keywords:** Endpoint URLs, HTTP methods, quick lookup, purpose
- **Best for:** Quick lookup of endpoints without deep analysis
- **Format:** Tables organized by URL pattern
- **Endpoints covered:**
  - `/documents/*` (upload, list, get, delete, move, rename, copy, share, download)
  - `/folders/*` (tree, contents, create, move, rename, delete)
  - `/ai/*` (ask, classify, summarize, extract text, process)
  - `/ai/conversations/*`
  - `/organizations/*`
  - `/auth/*`
  - `/users/*`
  - `/invitations/*`
  - `/shares/*`
- **Load when:**
  - Making API calls to backend
  - Need quick endpoint reference
  - Urgent endpoint lookup
- **⚠️ Note:** Contains hardcoded preview/download URLs - needs attention

### 🔍 API_ENDPOINTS_AUDIT.md (433 lines)
- **Keywords:** Endpoint analysis, issues, patterns, deep-dive review
- **Best for:** Detailed analysis, finding patterns, identifying issues
- **Sections:**
  - Endpoint organization analysis
  - Issue audit (hardcoded URLs, missing docs, etc.)
  - Duplicate endpoints
  - RESTful consistency review
  - Security concerns
- **Load when:**
  - Refactoring API integration
  - Architecture review
  - Deep analysis needed
  - Fixing endpoint issues
- **Related:** API_ENDPOINTS_QUICK_REFERENCE.md, API_CLIENT_CONFIGURATION_ANALYSIS.md

### ⚙️ API_CLIENT_CONFIGURATION_ANALYSIS.md (274 lines)
- **Keywords:** HTTP client config, Axios setup, interceptors, request/response handling
- **Best for:** Understanding how API client is configured, debugging HTTP issues
- **Covers:**
  - Axios instance configuration
  - Token handling
  - Error interceptors
  - Request/response transformation
  - CSRF token integration
- **Load when:**
  - Modifying API client
  - Debugging HTTP issues
  - Working with interceptors
  - Understanding CSRF flow
- **Related:** CSRF-ARCHITECTURE-REFERENCE.md, API_ENDPOINTS_AUDIT.md

### 🔐 CSRF-ARCHITECTURE-REFERENCE.md (454 lines)
- **Keywords:** CSRF protection, token handling, security architecture
- **Best for:** Understanding security implementation, debugging CSRF issues
- **Deep-dives:**
  - CSRF vulnerability explanation
  - Token handling in frontend
  - Backend validation flow
  - Session management
  - Security best practices
- **Load when:**
  - Working on authentication/security
  - Debugging CSRF token issues
  - Security review
  - Understanding token flow
- **Related:** API_CLIENT_CONFIGURATION_ANALYSIS.md, CLAUDE.md

---

## Feature & Issue Documentation

### 🧪 PENDING-TESTS-ISSUE.md (381 lines)
- **Keywords:** Test failures, debugging tips, pending tests, Jest config issues
- **Best for:** Fixing test failures, understanding known issues
- **Content:**
  - List of pending/failing tests
  - Root cause analysis
  - Debugging techniques
  - Jest/RTL configuration notes
- **Load when:**
  - Tests failing
  - Investigating test coverage gaps
  - Understanding known issues
  - Setting up test environment
- **Related:** CLAUDE.md (Testing Requirements), CONTRIBUTING.md

### 📋 US-43-IMPLEMENTATION-SUMMARY.md (178 lines)
- **Keywords:** Feature implementation example, patterns, real-world implementation
- **Best for:** Reference pattern for similar feature implementations
- **Shows:** Real implementation walkthrough
- **Load when:**
  - Implementing similar features
  - Need implementation reference
  - Understanding project patterns in practice

---

## Feature Request Proposals (AI Features)

Located in: `docs/RFE/`

### 🤖 RFE-UI-001-AI-TYPES-SERVICE.md
- **Keywords:** AI types, service layer, hooks for AI functionality
- **Status:** Proposed
- **Load when:** Planning AI feature implementation

### 🏷️ RFE-UI-002-DOCUMENT-CARD-AI.md
- **Keywords:** AI badges, document card enhancements
- **Status:** Proposed
- **Load when:** Working on document card UI

### ❓ RFE-UI-003-SEARCH-BAR-QA.md
- **Keywords:** Search integration, Q&A mode
- **Status:** Proposed
- **Load when:** Implementing search improvements

### 📊 RFE-UI-004-AI-DASHBOARD.md
- **Keywords:** AI dashboard, statistics, analytics
- **Status:** Proposed
- **Load when:** Building AI dashboard features

### 📤 DOCUMENT-UPLOAD.md
- **Keywords:** Upload flow, file handling
- **Status:** Documentation
- **Load when:** Working on upload functionality

---

## Technical Documentation

### 🏗️ docs/ARCHITECTURE.md (319 lines)
- **Keywords:** Component structure, directory layout, patterns, design decisions
- **Sections:**
  - Overview & tech stack
  - Directory structure
  - Component architecture
  - Hooks architecture
  - Context architecture
  - Styling patterns
  - Error handling
- **Load when:**
  - Designing new components
  - Understanding project structure
  - Architecture review
  - Refactoring components
- **Related:** CLAUDE.md, CONTRIBUTING.md, US-43-IMPLEMENTATION-SUMMARY.md

### 🤖 docs/AI-INTEGRATION.md (100 lines)
- **Keywords:** AI features overview, backend AI API
- **Best for:** Quick overview of AI capabilities
- **Load when:**
  - Planning AI feature
  - Need overview of AI capabilities
  - Integrating with backend AI endpoints

### 🔄 docs/INVITATION-FLOW.md (845 lines)
- **Keywords:** User invitation workflow, features, implementation details
- **Status:** Detailed feature documentation
- **Best for:** Understanding invitation feature deeply
- **Load when:**
  - Working on invitation features
  - Understanding user workflow
  - Debugging invitation issues

---

## Smart Loading Guide

### By Task Type

#### 🎯 "I'm new, setting up environment"
```
README.md
→ CONTRIBUTING.md
→ ENVIRONMENT-CONFIG.md
→ Optional: ROLES.md
```

#### 🎯 "Making API calls / debugging backend integration"
```
API_ENDPOINTS_QUICK_REFERENCE.md
→ API_CLIENT_CONFIGURATION_ANALYSIS.md
→ Optional: API_ENDPOINTS_AUDIT.md (if detailed analysis)
→ Optional: CSRF-ARCHITECTURE-REFERENCE.md (if security concern)
```

#### 🎯 "Building new component / feature"
```
docs/ARCHITECTURE.md
→ CLAUDE.md (component pattern section)
→ Optional: Relevant RFE proposal
→ Optional: US-43-IMPLEMENTATION-SUMMARY.md (reference)
```

#### 🎯 "Tests failing / debugging tests"
```
PENDING-TESTS-ISSUE.md
→ CLAUDE.md (Testing Requirements section)
→ CONTRIBUTING.md (test commands)
```

#### 🎯 "Architecture review / refactoring"
```
docs/ARCHITECTURE.md
→ CLAUDE.md (patterns & conventions)
→ API_ENDPOINTS_AUDIT.md (if API-heavy)
```

#### 🎯 "Security concerns / CSRF issues"
```
CSRF-ARCHITECTURE-REFERENCE.md
→ API_CLIENT_CONFIGURATION_ANALYSIS.md
→ CLAUDE.md (security section)
```

#### 🎯 "AI feature implementation"
```
docs/AI-INTEGRATION.md
→ Relevant RFE proposal
→ docs/ARCHITECTURE.md
→ CLAUDE.md
```

---

## File Sizes for Context Planning

| Document | Lines | Size Impact | Load Frequency |
|----------|-------|-------------|-----------------|
| CLAUDE.md | 548 | ⭐⭐⭐⭐ Core | ALWAYS |
| FRAMEWORK docs | ~1,000 | ⭐⭐⭐ High | Variable |
| API docs | ~1,100 | ⭐⭐⭐ High | Variable |
| Feature docs | ~1,000 | ⭐⭐ Medium | Periodic |
| RFE proposals | ~800 | ⭐ Low | Occasional |

---

## How to Use This Index

1. **Find task type** in "Smart Loading Guide"
2. **Identify recommended docs** for your task
3. **Load those docs** in your next prompt
4. **Total context** = CLAUDE.md + task-specific docs (~600-1200 lines)
5. **Avoid** loading all 20+ docs every time

---

## Future Optimizations

- [ ] Split API_ENDPOINTS_AUDIT into REST vs Conversations
- [ ] Create quickstart checklists for common tasks
- [ ] Add code example references to docs
- [ ] Monitor doc load patterns and optimize grouping
- [ ] Add timestamps to docs for version tracking
