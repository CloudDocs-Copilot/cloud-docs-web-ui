<div align="center">

# CloudDocs Web UI

Modern React application for cloud document management with real-time collaboration and AI-powered features.

**Tech Stack:** React 19 · TypeScript · Vite · Bootstrap

[![React](https://img.shields.io/badge/React-19-blue)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

</div>

---

## ✨ Features

- **Document Management** - Upload, organize, and preview documents
- **Folder Hierarchy** - Organize documents in nested folders
- **Multi-Organization** - Switch between organizations seamlessly
- **Responsive Design** - Works on desktop and mobile devices
- **Search** - Find documents quickly with full-text search
- **AI Features (Planned)** - RAG, classification, summarization via backend API

See [RFE proposals](./docs/RFE/) for AI feature details.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Backend API running (see [backend setup](../cloud-docs-api-service/README.md))

### Local Development (2 minutes)

```bash
# 1. Install
git clone <repo>
cd cloud-docs-web-ui
npm install

# 2. Run
npm run dev
# → http://localhost:5173

# Backend must be on port 4000
# (or set VITE_API_BASE_URL in .env.local)
```

### Test Accounts (if backend seeded)
| Email | Password |
|-------|----------|
| admin@clouddocs.local | Test@1234 |
| john@clouddocs.local | Test@1234 |

### Docker (Full Stack)
```bash
docker-compose up -d
# Frontend: http://localhost:3000
# Backend: http://localhost:4000
```

## 📚 Documentation

### For Developers

**Getting started?** Read these in order:
1. [03-DEVELOPMENT-WORKFLOW](./docs/skills/03-DEVELOPMENT-WORKFLOW.md) - Setup & tools
2. [01-COMPONENT-ARCHITECTURE](./docs/skills/01-COMPONENT-ARCHITECTURE.md) - How to build
3. [Contributing](./CONTRIBUTING.md) - Contribution guidelines

**All resources:** [12 Focused Skills Guide](./docs/skills/README.md) covers:
- Component architecture & patterns
- Naming conventions
- Testing strategies
- State management
- Styling (Bootstrap + CSS Modules)
- API integration
- TypeScript conventions
- Error handling
- Performance optimization
- Accessibility guidelines
- Code review process

See [docs/skills/USAGE-GUIDE.md](./docs/skills/USAGE-GUIDE.md) for practical scenarios.

### Architecture & Decisions

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Directory structure & patterns |
| [CLAUDE.md](./CLAUDE.md) | AI assistant instructions |
| [API Integration](./src/api/README.md) | HTTP client configuration |
| [CSRF Architecture](./CSRF-ARCHITECTURE-REFERENCE.md) | Token handling |

### Features in Development

| RFE | Feature | Status |
|-----|---------|--------|
| [RFE-UI-001](./docs/RFE/RFE-UI-001-AI-TYPES-SERVICE.md) | AI types & service layer | Proposed |
| [RFE-UI-002](./docs/RFE/RFE-UI-002-DOCUMENT-CARD-AI.md) | AI badges on cards | Proposed |
| [RFE-UI-003](./docs/RFE/RFE-UI-003-SEARCH-BAR-QA.md) | Search with AI Q&A | Proposed |
| [RFE-UI-004](./docs/RFE/RFE-UI-004-AI-DASHBOARD.md) | AI dashboard | Proposed |

## 🛠️ Development

```bash
npm run dev           # Start dev server (http://localhost:5173)
npm run build         # Build for production
npm run preview       # Preview production build
npm run lint          # Run ESLint
npm test              # Run tests
npm run test:watch    # Watch mode tests
npm run test:coverage # Coverage report
```

### Pre-Commit Checklist
```bash
npm run lint          # Fix lint errors
npm test              # All tests must pass
npm run build         # Build succeeds
```

## 📁 Project Structure

```
src/
├── api/           # HTTP client & interceptors
├── components/    # Reusable UI components
├── pages/         # Route-level components
├── hooks/         # Custom React hooks
├── services/      # API service functions
├── context/       # React Context
├── types/         # TypeScript definitions
└── constants/     # Application constants
```

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for details.

## 🌐 Environment Variables

| Variable | Default |
|----------|---------|
| `VITE_API_BASE_URL` | `http://localhost:4000/api` |
| `VITE_APP_ENV` | `development` |

Set custom values in `.env.local` (git-ignored).

## 🧪 Testing

```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report (target: >70%)
```

See [04-TESTING-PATTERNS](./docs/skills/04-TESTING-PATTERNS.md) for patterns & examples.

## 🐳 Docker

**Build image:**
```bash
docker build -t clouddocs-frontend .
docker run -p 3000:80 clouddocs-frontend
```

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**New developer?** Start with [CONTRIBUTING.md](./CONTRIBUTING.md)

**Documentation:**
- [12 Focused Skills](./docs/skills/README.md)
- [Practical Scenarios](./docs/skills/USAGE-GUIDE.md)
- [Code Patterns](./CLAUDE.md)

**Need help?** Check [docs/skills/](./docs/skills/) for answers.

<div align="center">

**[Documentation](./docs/skills/) · [Report Bug](../../issues) · [Request Feature](../../issues)**

</div>
