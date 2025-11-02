#!/usr/bin/env bash

# Release script for one-ie/backend
# Syncs /backend directory to one-ie/backend repository (Convex headless backend)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
SOURCE_DIR="$ROOT_DIR/backend"
REPO_NAME="backend"
REPO_URL="git@github.com:one-ie/backend.git"
TEMP_DIR="/tmp/one-release-$REPO_NAME-$$"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Cleanup on exit
cleanup() {
    if [ -d "$TEMP_DIR" ]; then
        log_info "Cleaning up temporary directory..."
        rm -rf "$TEMP_DIR"
    fi
}
trap cleanup EXIT

main() {
    log_info "========================================="
    log_info "  ONE Platform - Backend Release"
    log_info "========================================="
    log_info ""

    # Check if source directory exists
    if [ ! -d "$SOURCE_DIR" ]; then
        log_error "Source directory not found: $SOURCE_DIR"
        log_error "Run 'bun run setup:backend' first to create backend structure"
        exit 1
    fi

    log_info "Source: $SOURCE_DIR"
    log_info "Target: $REPO_URL"
    log_info ""

    # Create temporary directory
    log_info "Creating temporary directory..."
    mkdir -p "$TEMP_DIR"

    # Clone or update repository
    if [ -d "$TEMP_DIR/.git" ]; then
        log_info "Updating existing repository..."
        cd "$TEMP_DIR"
        git pull origin main
    else
        log_info "Cloning repository..."
        git clone "$REPO_URL" "$TEMP_DIR"
        cd "$TEMP_DIR"
    fi

    # Clear existing content (except .git)
    log_info "Clearing existing content..."
    find . -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +

    # Copy backend source
    log_info "Copying backend source..."
    cp -r "$SOURCE_DIR/"* .

    # Copy .gitignore if it exists
    if [ -f "$SOURCE_DIR/.gitignore" ]; then
        cp "$SOURCE_DIR/.gitignore" .
    fi

    # Create or update README
    log_info "Creating README.md..."
    cat > README.md << 'EOF'
# ONE Platform - Headless Backend

**Convex Backend with 6-Dimension Ontology**

This is the headless backend for the ONE Platform, implementing the 6-dimension ontology:

1. **Groups** – Multi-tenant isolation + hierarchical nesting
2. **People** – Authorization & governance
3. **Things** – Entity definitions (66+ types)
4. **Connections** – Relationships (25+ types)
5. **Events** – Actions & audit trail (67+ types)
6. **Knowledge** – Embeddings & RAG

## Quick Start

```bash
# Clone repository
git clone https://github.com/one-ie/backend
cd backend

# Install dependencies
bun install

# Start Convex dev server
npx convex dev
```

## Project Structure

```
backend/
├── convex/
│   ├── schema.ts         # 6-dimension ontology schema
│   ├── auth.ts           # Better Auth configuration
│   ├── queries/          # Read operations (by dimension)
│   │   ├── groups.ts
│   │   ├── people.ts
│   │   ├── things.ts
│   │   ├── connections.ts
│   │   ├── events.ts
│   │   └── knowledge.ts
│   ├── mutations/        # Write operations (by dimension)
│   ├── actions/          # Server-side actions
│   ├── services/         # Business logic layer
│   └── http.ts           # HTTP endpoints
├── lib/                  # Utilities
├── test/                 # Test suites
└── package.json
```

## Schema (6 Dimensions)

```typescript
// Groups table
{
  _id: Id<"groups">,
  name: string,
  type: "friend_circle" | "business" | "community" | "dao" | "government" | "organization",
  parentGroupId?: Id<"groups">,
  properties: any,
  status: "draft" | "active" | "archived",
  createdAt: number,
  updatedAt: number
}

// All other dimensions include groupId:
things → groupId: Id<"groups">
connections → groupId: Id<"groups">
events → groupId: Id<"groups">
knowledge → groupId: Id<"groups">
people → represented as things with type: "creator"
```

## Development

```bash
# Start dev server
npx convex dev

# Deploy to production
npx convex deploy

# Run query
npx convex run queries/things:list '{"type": "user"}'

# View logs
npx convex logs --history 50
```

## Environment Variables

Create `.env.local`:

```bash
CONVEX_DEPLOYMENT=prod:your-deployment
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

## Testing

```bash
bun test              # Run all tests
bun test:watch        # Watch mode
bun test:coverage     # Coverage report
```

## Deployment

### Production

```bash
npx convex deploy
```

Convex automatically deploys on git push when connected to GitHub.

### Connect to Frontend

In your frontend `.env.local`:

```bash
PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

## Documentation

- **Ontology**: [one-ie/ontology](https://github.com/one-ie/ontology)
- **Web Template**: [one-ie/web](https://github.com/one-ie/web)
- **CLI**: [one-ie/cli](https://github.com/one-ie/cli)
- **ONE Platform**: [https://one.ie](https://one.ie)

## Philosophy

**Simple enough for children. Powerful enough for enterprises.**

- Groups partition the space (hierarchical containers)
- People authorize and govern (role-based access)
- Things exist (entities with flexible properties)
- Connections relate (relationships with metadata)
- Events record (complete audit trail)
- Knowledge understands (embeddings and vectors)

**Everything else is just data.**

## License

ONE Free License – see [LICENSE](LICENSE) for details.

---

**Built with clarity, simplicity, and infinite scale in mind.**
EOF

    # Check if there are changes
    if git diff --quiet && git diff --cached --quiet; then
        log_warn "No changes detected. Skipping release."
        exit 0
    fi

    # Stage all changes
    log_info "Staging changes..."
    git add -A

    # Show what will be committed
    log_info ""
    log_info "Changes to be committed:"
    git status --short
    log_info ""

    # Get version from package.json
    VERSION="$(cat package.json 2>/dev/null | grep '"version"' | head -1 | sed 's/.*"version": "\(.*\)".*/\1/' || echo "1.0.0")"

    # Create commit
    COMMIT_MSG="chore: sync backend v$VERSION"
    log_info "Creating commit: $COMMIT_MSG"
    git commit -m "$COMMIT_MSG"

    log_info ""
    log_warn "========================================="
    log_warn "  DRY RUN - NOT PUSHING TO GITHUB"
    log_warn "========================================="
    log_warn ""
    log_warn "To actually push this release, run:"
    log_warn "  cd $TEMP_DIR"
    log_warn "  git push origin main"
    log_warn ""
    log_warn "Temporary directory preserved for inspection."
    log_warn "It will be cleaned up on next run."

    # Disable cleanup to allow inspection
    trap - EXIT
}

main "$@"
