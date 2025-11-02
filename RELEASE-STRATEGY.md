# ONE Platform Release Strategy

**Version**: 1.0.0
**Date**: 2025-11-02
**Status**: Implementation Ready

---

## Repository Restructuring Overview

Transform monorepo into 5 specialized repositories + 1 aggregated deployment target.

### Current State (Monorepo)

```
one/ (one-ie/one on GitHub)
├── .claude/          # Claude Code configuration
├── one/              # 6-dimension ontology documentation (41 files)
├── web/              # Astro 5 + React 19 application
├── *.md              # Root documentation (README, LICENSE, AGENTS, CLAUDE, SECURITY)
└── wrangler.toml     # Cloudflare configuration
```

### Target State (Multi-Repo)

```
one-ie/
├── ontology        # Documentation repository (/one → here)
├── web             # Template repository (/web → here)
├── cli             # CLI package (/cli → here + npm: oneie)
├── backend         # Headless backend (/backend → here)
└── one             # Aggregated deployment (one + web + .claude + docs → here → one.ie)
```

---

## Repository Specifications

### 1. one-ie/ontology

**Purpose**: 6-dimension ontology documentation
**Source**: `/one` directory
**Target**: `https://github.com/one-ie/ontology`

**Contents**:
```
ontology/
├── connections/      # Protocols, workflows, integrations
├── things/           # Specifications, plans, architecture
├── events/           # Event specs, deployment history
├── knowledge/        # RAG, AI, implementation guides
├── people/           # Roles, governance
├── groups/           # Group-specific documentation
├── .claude/          # Claude skills for ontology
└── README.md         # Ontology overview
```

**Release Command**: `bun run release:ontology`

### 2. one-ie/web

**Purpose**: Astro starter template (standalone, reusable)
**Source**: `/web` directory
**Target**: `https://github.com/one-ie/web`

**Contents**:
```
web/
├── src/              # Astro application source
├── public/           # Static assets
├── package.json      # Dependencies
├── astro.config.mjs  # Astro configuration
├── tsconfig.json     # TypeScript config
├── .gitignore
└── README.md         # Template usage guide
```

**Release Command**: `bun run release:web`

### 3. one-ie/cli

**Purpose**: CLI tooling (`npx oneie`)
**Source**: `/cli` directory
**Target**:
- GitHub: `https://github.com/one-ie/cli`
- npm: `oneie`

**Contents**:
```
cli/
├── src/
│   ├── commands/
│   │   ├── init.ts       # Initialize new project
│   │   ├── dev.ts        # Start dev server
│   │   ├── build.ts      # Build for production
│   │   └── deploy.ts     # Deploy to Cloudflare
│   ├── templates/        # Project templates
│   ├── utils/            # CLI utilities
│   └── index.ts          # CLI entry point
├── bin/
│   └── oneie.js          # Executable
├── package.json          # name: "oneie"
├── tsconfig.json
└── README.md
```

**Release Command**: `bun run release:cli`
**npm Publish**: `npm publish` (after GitHub release)

### 4. one-ie/backend

**Purpose**: Headless Convex backend (6-dimension schema)
**Source**: `/backend` directory
**Target**: `https://github.com/one-ie/backend`

**Contents**:
```
backend/
├── convex/
│   ├── schema.ts         # 6-dimension ontology (groups, people, things, connections, events, knowledge)
│   ├── auth.ts           # Better Auth configuration
│   ├── queries/          # Read operations (by dimension)
│   ├── mutations/        # Write operations (by dimension)
│   ├── actions/          # Server-side actions
│   ├── services/         # Business logic layer
│   └── http.ts           # HTTP endpoints
├── lib/                  # Utilities
├── test/                 # Test suites
├── package.json
└── README.md
```

**Release Command**: `bun run release:backend`

### 5. one-ie/one (Builder Template)

**Purpose**: Builder template that users clone to create their own sites
**Source**: `/one` + `/web` + `.claude` + root docs
**Target**: `https://github.com/one-ie/one`
**Usage**:
- Users clone this repository to build their own sites
- You clone this to build the one.ie marketing site

**Contents**:
```
one/
├── one/              # Ontology documentation
├── web/              # Astro application
├── .claude/          # Claude Code configuration
├── README.md         # Platform overview
├── LICENSE.md
├── AGENTS.md
├── CLAUDE.md
├── SECURITY.md
├── wrangler.toml     # Cloudflare Pages config
└── package.json      # Workspace dependencies
```

**Release Command**: `bun run release:one`
**After Release**: Clone one-ie/one to build one.ie or any custom site

---

## Release Workflow

### Automated Release Pipeline

```bash
# 1. Release all individual repos
bun run release:all

# This executes in order:
# → release:ontology   (one → one-ie/ontology)
# → release:web        (web → one-ie/web)
# → release:cli        (cli → one-ie/cli + npm)
# → release:backend    (backend → one-ie/backend)
# → release:one        (aggregated → one-ie/one → Cloudflare)
```

### Individual Releases

```bash
# Release specific repo
bun run release:ontology
bun run release:web
bun run release:cli
bun run release:backend
bun run release:one

# Or use slash command
/release ontology
/release web
/release cli
/release backend
/release one
/release all
```

### Release Steps (Per Repo)

1. **Prepare**: Copy source files to temp directory
2. **Version**: Update version in package.json (if applicable)
3. **Commit**: Create release commit with semantic versioning
4. **Tag**: Create git tag (e.g., `v3.6.14`)
5. **Push**: Push to GitHub repository
6. **Publish**: Publish to npm (CLI only)
7. **Clone**: Users/you clone one-ie/one to build sites (including one.ie)

---

## Directory Structure (New)

```
one/ (root monorepo)
├── .claude/              # Claude Code configuration
│   ├── commands/
│   │   └── release.md    # /release slash command
│   ├── agents/
│   ├── hooks/
│   └── state/
│
├── one/                  # Ontology documentation
│   ├── connections/
│   ├── things/
│   ├── events/
│   ├── knowledge/
│   ├── people/
│   └── groups/
│
├── web/                  # Astro starter template
│   ├── src/
│   ├── public/
│   └── package.json
│
├── cli/                  # CLI package (NEW)
│   ├── src/
│   ├── bin/
│   └── package.json      # name: "oneie"
│
├── backend/              # Headless backend (NEW)
│   ├── convex/
│   │   ├── schema.ts     # 6-dimension ontology
│   │   ├── queries/
│   │   └── mutations/
│   ├── lib/
│   └── package.json
│
├── apps/                 # Applications (NEW)
│   └── one/              # Master assembly for one.ie
│       ├── one/          # → Synced from one-ie/ontology
│       ├── web/          # → Synced from one-ie/web
│       └── .claude/      # → Synced from root
│
├── scripts/              # Release automation (NEW)
│   ├── release-ontology.sh
│   ├── release-web.sh
│   ├── release-cli.sh
│   ├── release-backend.sh
│   ├── release-one.sh
│   ├── release-all.sh
│   ├── cloudflare-deploy.sh
│   └── validate-deployment.sh
│
├── README.md             # Platform overview (updated)
├── LICENSE.md
├── AGENTS.md
├── CLAUDE.md
├── SECURITY.md
├── RELEASE-STRATEGY.md   # This file
└── package.json          # Root workspace
```

---

## Building Sites from one-ie/one

### one.ie Marketing Site

**Source**: Clone `one-ie/one` (the builder template)
**Process**:
1. Clone one-ie/one to a new repository for one.ie
2. Customize content for marketing site
3. Deploy to Cloudflare Pages

**Build Command**: `cd web && bun run build`
**Output Directory**: `web/dist`
**Platform**: Cloudflare Pages

### User Sites

**Source**: Users clone `one-ie/one`
**Process**:
```bash
# User clones the builder template
git clone https://github.com/one-ie/one my-site
cd my-site

# Install and develop
bun install
bun run dev

# Build and deploy
bun run build
wrangler pages deploy web/dist --project-name=my-site
```

---

## Git Strategy

### Branch Protection

All repositories use protected `main` branch:
- Require pull request reviews
- Require status checks
- No force pushes
- No deletions

### Release Branches

```
claude/restructure-repos-release-{sessionId}
  → PR to main
  → Merge triggers release
```

### Version Tagging

Semantic versioning: `v{major}.{minor}.{patch}`

Example:
```bash
v3.6.13  # Current
v3.6.14  # Next release
v4.0.0   # Major version (breaking changes)
```

---

## Implementation Checklist

### Phase 1: Structure Setup
- [x] Create RELEASE-STRATEGY.md (this file)
- [ ] Create `/scripts` directory
- [ ] Create `/cli` directory with package.json
- [ ] Create `/backend` directory with schema.ts stub
- [ ] Create `/apps/one` directory structure

### Phase 2: Release Scripts
- [ ] Create `scripts/release-ontology.sh`
- [ ] Create `scripts/release-web.sh`
- [ ] Create `scripts/release-cli.sh`
- [ ] Create `scripts/release-backend.sh`
- [ ] Create `scripts/release-one.sh`
- [ ] Create `scripts/release-all.sh`
- [ ] Create `scripts/cloudflare-deploy.sh`

### Phase 3: Integration
- [ ] Create `.claude/commands/release.md` slash command
- [ ] Update root `package.json` with release scripts
- [ ] Update `README.md` with new structure
- [ ] Update `CLAUDE.md` with release workflow

### Phase 4: Testing
- [ ] Test `release:ontology` script
- [ ] Test `release:web` script
- [ ] Test `release:cli` script
- [ ] Test `release:backend` script
- [ ] Test `release:one` script
- [ ] Test Cloudflare deployment
- [ ] Validate all GitHub repos

### Phase 5: Documentation
- [ ] Document release process in `/one/events/`
- [ ] Create release notes template
- [ ] Update contributing guidelines
- [ ] Create deployment troubleshooting guide

---

## Success Metrics

- ✅ 5 repositories successfully created
- ✅ CLI published to npm as `oneie`
- ✅ one.ie deployed to Cloudflare Pages
- ✅ All releases automated via `/release` command
- ✅ Zero manual steps required for deployment
- ✅ Documentation complete and accurate

---

## Next Steps

1. **Create directory structure** (Phase 1)
2. **Implement release scripts** (Phase 2)
3. **Test release workflow** (Phase 3)
4. **Execute first release** (Phase 4)
5. **Monitor and iterate** (Phase 5)

---

**Status**: Ready for implementation
**Owner**: Claude Code
**Timeline**: 14 tasks → Complete in this session
