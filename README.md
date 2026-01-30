<div align="center">

# CloudDocs Web UI

Modern React application for cloud document management with real-time collaboration.

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

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Backend API running (see [backend setup](../cloud-docs-api-service/README.md))

### Local Development (2 minutes)

```bash
# 1. Clone and install
git clone <repository-url>
cd cloud-docs-web-ui
npm install

# 2. Start development server
npm run dev

# 3. Open http://localhost:5173
```

**That's it!** No `.env` setup required - the app automatically loads `.env.example` as defaults.

> **Note:** The backend API must be running on port 4000. See [backend quickstart](../cloud-docs-api-service/README.md).

### Test Accounts

If you've run `npm run seed:dev` in the backend:

| Email | Password |
|-------|----------|
| admin@clouddocs.local | Test@1234 |
| john@clouddocs.local | Test@1234 |
| jane@clouddocs.local | Test@1234 |

### Using Docker Compose (Full Stack)

```bash
# From the workspace root (parent directory)
docker-compose up -d

# Frontend available at http://localhost:3000
# Backend API at http://localhost:4000
```

## 🌐 Environment Variables

The app loads environment files in this priority order (later overrides earlier):

1. `.env.example` - Defaults (committed to repo)
2. `.env` - Base configuration
3. `.env.local` - Local overrides (not committed)
4. `.env.[mode]` - Environment-specific
5. `.env.[mode].local` - Environment-specific local

Key variables (see `.env.example` for full list):

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:4000/api` |
| `VITE_APP_ENV` | Environment name | `development` |

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/ARCHITECTURE.md) | Component structure and patterns |
| [Contributing](CONTRIBUTING.md) | Development setup and guidelines |
| [API Integration](src/api/README.md) | HTTP client configuration |

## 🛠️ Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run Jest tests |
| `npm run test:coverage` | Tests with coverage report |

## 📁 Project Structure

```
src/
├── api/           # HTTP client and API config
├── components/    # Reusable UI components
├── pages/         # Route-level components
├── hooks/         # Custom React hooks
├── services/      # API service functions
├── context/       # React Context providers
├── types/         # TypeScript definitions
└── constants/     # Application constants
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed documentation.

## 🌐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:4000/api` |
| `VITE_APP_ENV` | Environment name | `development` |

## 🧪 Testing

```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage report
```

## 🐳 Docker

Build and run with Nginx:

```bash
docker build -t clouddocs-frontend .
docker run -p 3000:80 clouddocs-frontend
```

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

**[Documentation](docs/)** · **[Report Bug](../../issues)** · **[Request Feature](../../issues)**

</div>
