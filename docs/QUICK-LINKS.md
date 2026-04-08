# 🚀 Quick Links & Context Navigation

> **Smart navigation guide** for loading the right documentation at the right time
> Avoid context bloat - load only what you need!

---

## 🎯 Quick Jump by Task

### New Developer Setup
```
START HERE → README.md (5 min)
    ↓
    → CONTRIBUTING.md (dev setup)
    → ENVIRONMENT-CONFIG.md (if env issues)
    → ROLES.md (understand team)
```
**Total context:** ~750 lines
**Time:** 15 minutes

---

### Making API Requests / Backend Integration
```
QUICK LOOKUP → API_ENDPOINTS_QUICK_REFERENCE.md (find endpoint)
    ↓
    For integration details:
    → API_CLIENT_CONFIGURATION_ANALYSIS.md
    → CSRF-ARCHITECTURE-REFERENCE.md (if auth needed)
```
**Total context:** ~700 lines
**Time:** 10 minutes

---

### Debugging API Issues / Deep Analysis
```
START → API_ENDPOINTS_QUICK_REFERENCE.md (what endpoint?)
    ↓
    → API_ENDPOINTS_AUDIT.md (detailed analysis)
    → API_CLIENT_CONFIGURATION_ANALYSIS.md (client config)
    → CSRF-ARCHITECTURE-REFERENCE.md (security/tokens)
```
**Total context:** ~1,100 lines
**Time:** 30 minutes

---

### Building New Component / Feature
```
FOUNDATION → CLAUDE.md - Component Pattern section
    ↓
    → docs/ARCHITECTURE.md (structure)
    → docs/AI-INTEGRATION.md (if AI feature)
    ↓
    OPTIONAL REFERENCE:
    → US-43-IMPLEMENTATION-SUMMARY.md (real example)
    → Relevant RFE proposal (if planning AI feature)
```
**Total context:** ~900 lines
**Time:** 20 minutes

---

### Tests Failing / Coverage Issues
```
UNDERSTANDING → PENDING-TESTS-ISSUE.md (what's wrong?)
    ↓
    → CLAUDE.md - Testing Requirements section
    → CONTRIBUTING.md - test commands
```
**Total context:** ~600 lines
**Time:** 15 minutes

---

### Architecture Review / Refactoring
```
DESIGN → docs/ARCHITECTURE.md (current structure)
    ↓
    → CLAUDE.md (patterns & conventions)
    → API_ENDPOINTS_AUDIT.md (if redesigning API layer)
```
**Total context:** ~900 lines
**Time:** 25 minutes

---

### CSRF / Security Issues
```
SECURITY → CSRF-ARCHITECTURE-REFERENCE.md (architecture)
    ↓
    → API_CLIENT_CONFIGURATION_ANALYSIS.md (implementation)
    → CLAUDE.md (security patterns)
```
**Total context:** ~800 lines
**Time:** 20 minutes

---

### User Invitation Workflow / Feature
```
WORKFLOW → docs/INVITATION-FLOW.md (complete flow)
    ↓
    → docs/ARCHITECTURE.md (component structure)
    → CLAUDE.md (patterns)
```
**Total context:** ~1,100 lines
**Time:** 30 minutes

---

### Implementing AI Features
```
OVERVIEW → docs/AI-INTEGRATION.md (AI capabilities)
    ↓
    → Relevant RFE proposal (RFE-UI-001/002/003/004)
    ↓
    FOUNDATION:
    → docs/ARCHITECTURE.md
    → CLAUDE.md
```
**Total context:** ~800-1,000 lines
**Time:** 25 minutes

---

## 📚 Document Dependency Map

```
CLAUDE.md (Core - ALWAYS LOAD)
    ↓
    ├─→ CONTRIBUTING.md ┐
    ├─→ ROLES.md       ├─→ README.md (overview)
    └─→ docs/ARCHITECTURE.md

API Integration Track:
    API_ENDPOINTS_QUICK_REFERENCE.md
    ├─→ API_ENDPOINTS_AUDIT.md (detailed analysis)
    ├─→ API_CLIENT_CONFIGURATION_ANALYSIS.md
    └─→ CSRF-ARCHITECTURE-REFERENCE.md

Feature Development Track:
    docs/ARCHITECTURE.md
    ├─→ CLAUDE.md (component pattern)
    ├─→ US-43-IMPLEMENTATION-SUMMARY.md (reference)
    └─→ docs/RFE/* (for AI features)

Testing Track:
    PENDING-TESTS-ISSUE.md
    └─→ CLAUDE.md (Testing Requirements)
    └─→ CONTRIBUTING.md (test commands)
```

---

## 🔑 Key Documents by Category

### 🏗️ Architecture & Design
| Doc | Focus | Lines |
|-----|-------|-------|
| docs/ARCHITECTURE.md | Overall structure | 319 |
| CLAUDE.md | Patterns & conventions | 548 |
| US-43-IMPLEMENTATION-SUMMARY.md | Real implementation ref | 178 |

### 📡 API Reference
| Doc | Focus | Lines |
|-----|-------|-------|
| API_ENDPOINTS_QUICK_REFERENCE.md | Quick lookup | 262 |
| API_ENDPOINTS_AUDIT.md | Deep analysis | 433 |
| API_CLIENT_CONFIGURATION_ANALYSIS.md | Client config | 274 |

### 🔐 Security
| Doc | Focus | Lines |
|-----|-------|-------|
| CSRF-ARCHITECTURE-REFERENCE.md | CSRF protection | 454 |
| API_CLIENT_CONFIGURATION_ANALYSIS.md | Client auth | 274 |

### 🧪 Testing & Debugging
| Doc | Focus | Lines |
|-----|-------|-------|
| PENDING-TESTS-ISSUE.md | Known issues | 381 |
| CLAUDE.md | Testing rules | (section) |

### 🚀 Setup & Configuration
| Doc | Focus | Lines |
|-----|-------|-------|
| README.md | Project overview | 182 |
| CONTRIBUTING.md | Dev setup | 375 |
| ENVIRONMENT-CONFIG.md | Env vars | 145 |

### 🤖 AI Features
| Doc | Focus | Lines |
|-----|-------|-------|
| docs/AI-INTEGRATION.md | AI overview | 100 |
| RFE proposals | Feature specs | ~200 each |

---

## 💡 Pro Tips

### Maximize Efficiency
1. **Bookmark this file** for quick access
2. **Use Ctrl+F** to search task type above
3. **Load ONLY recommended docs** - ignore others
4. **Open multiple tabs** - one per recommended doc

### Minimize Context Load
```
✅ DO: Load API_ENDPOINTS_QUICK_REFERENCE for quick lookup
❌ DON'T: Load both QUICK_REFERENCE + AUDIT if only doing simple lookup

✅ DO: Load docs/ARCHITECTURE for component design
❌ DON'T: Load all docs just to build one component

✅ DO: Use smart loading guide above
❌ DON'T: Load all 20 docs every session
```

### Context Reduction Strategy
- **Baseline:** CLAUDE.md (548 lines) - ALWAYS
- **+** Task-specific docs: 400-700 lines
- **Total:** 950-1,250 lines per session
- **Savings:** 75-80% less than loading all docs

---

## 🔄 Document Relationships

### A. Setup Chain
```
README.md → CONTRIBUTING.md → ENVIRONMENT-CONFIG.md
```

### B. API Integration Chain
```
API_ENDPOINTS_QUICK_REFERENCE.md → [AUDIT or CLIENT CONFIG]
```

### C. Development Chain
```
CLAUDE.md → docs/ARCHITECTURE.md → [RELEVANT FEATURE DOCS]
```

### D. Security Chain
```
CSRF-ARCHITECTURE-REFERENCE.md → API_CLIENT_CONFIGURATION_ANALYSIS.md
```

### E. Testing Chain
```
PENDING-TESTS-ISSUE.md → CLAUDE.md (Testing section)
```

---

## 🎯 Decision Tree

```
START: What are you doing?

├─ "Setting up new environment"
│  └─ → README.md, CONTRIBUTING.md, ENVIRONMENT-CONFIG.md
│
├─ "Working with API endpoints"
│  ├─ "Just need the URL?" → API_ENDPOINTS_QUICK_REFERENCE.md
│  └─ "Need deep dive?" → API_ENDPOINTS_QUICK_REFERENCE.md + AUDIT + CLIENT CONFIG
│
├─ "Building a component"
│  └─ → CLAUDE.md, docs/ARCHITECTURE.md, [+RFE if AI]
│
├─ "Debugging tests"
│  └─ → PENDING-TESTS-ISSUE.md, CLAUDE.md (Testing), CONTRIBUTING.md
│
├─ "Security/CSRF issues"
│  └─ → CSRF-ARCHITECTURE-REFERENCE.md + CONFIG
│
└─ "Architecture review"
   └─ → docs/ARCHITECTURE.md, CLAUDE.md, [+API AUDIT if needed]
```

---

## 📊 Context Loading Matrix

| Task | CLAUDE.md | ARCH | API | CSRF | PENDING | CONTRIB | Other | **Total Lines** |
|------|:---------:|:----:|:----:|:----:|:-------:|:-------:|:-----:|:---------------:|
| Setup | ✓ | - | - | - | - | ✓ | README,ENV,ROLES | ~700 |
| API Quick | ✓ | - | ✓ | - | - | - | - | ~810 |
| API Deep | ✓ | - | ✓✓ | ✓ | - | - | - | ~1,100 |
| Component | ✓ | ✓ | - | - | - | - | US-43 | ~900 |
| Testing | ✓ | - | - | - | ✓ | ✓ | - | ~1,300 |
| Security | ✓ | - | - | ✓ | - | - | API_CONFIG | ~800 |
| AI Feature | ✓ | ✓ | - | - | - | - | AI-INT,RFE | ~1,000 |

> ✓ = Load this doc
> ✓✓ = Load this doc + related
> Lines shown are approximate totals

---

## 🔗 External References

### Within Project
- Backend docs: `../cloud-docs-api-service/docs/`
- Backend AI: `../cloud-docs-api-service/docs/AI-MODULE.md`
- Workspace root: `../`

### Development
- Node.js docs: https://nodejs.org/docs/
- React docs: https://react.dev
- TypeScript docs: https://www.typescriptlang.org/docs/
- Jest docs: https://jestjs.io/docs/getting-started
- Bootstrap docs: https://react-bootstrap.github.io/

---

## 📝 Notes

- This guide reduces context loading from ~5,000 lines to ~1,000-1,250 lines per session
- Saves 75-80% context budget while maintaining all necessary information
- Designed for efficiency - most common tasks < 20 minutes
- Update this file if you find new patterns or frequently-needed doc combinations

---

**Last Updated:** 2026-04-08
**Maintained By:** Deivis
