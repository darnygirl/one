#!/usr/bin/env bash

# Release script for one-ie/web
# Syncs /web directory to one-ie/web repository (starter template)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
SOURCE_DIR="$ROOT_DIR/web"
REPO_NAME="web"
REPO_URL="git@github.com:one-ie/web.git"
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
    log_info "  ONE Platform - Web Template Release"
    log_info "========================================="
    log_info ""

    # Check if source directory exists
    if [ ! -d "$SOURCE_DIR" ]; then
        log_error "Source directory not found: $SOURCE_DIR"
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

    # Copy web template
    log_info "Copying web template..."
    cp -r "$SOURCE_DIR/"* .

    # Copy .gitignore if it exists
    if [ -f "$SOURCE_DIR/.gitignore" ]; then
        cp "$SOURCE_DIR/.gitignore" .
    fi

    # Update package.json name to "oneie-starter"
    if [ -f "package.json" ]; then
        log_info "Updating package.json..."
        sed -i 's/"name": "[^"]*"/"name": "oneie-starter"/' package.json
    fi

    # Create or update README
    log_info "Creating README.md..."
    cat > README.md << 'EOF'
# ONE Platform - Astro Starter Template

**Astro 5 + React 19 + Tailwind v4 + shadcn/ui**

This is the official ONE Platform starter template. Use it to bootstrap new projects with best practices built-in.

## Quick Start

```bash
# Option 1: Use with CLI
npx oneie init my-project

# Option 2: Clone directly
git clone https://github.com/one-ie/web my-project
cd my-project
bun install
bun run dev
```

## Features

- ✅ **Astro 5.14+** - SSR + SSG with islands architecture
- ✅ **React 19** - Latest React with server components
- ✅ **Tailwind v4** - CSS-based configuration
- ✅ **shadcn/ui** - 50+ accessible components pre-installed
- ✅ **TypeScript 5.9+** - Strict mode with path aliases
- ✅ **Better Auth** - Multi-method authentication ready
- ✅ **Vitest** - Fast unit testing configured

## Project Structure

```
web/
├── src/
│   ├── pages/           # File-based routing
│   ├── components/      # React components + shadcn/ui
│   ├── layouts/         # Page layouts
│   ├── lib/             # Utilities
│   ├── styles/          # Global CSS + Tailwind config
│   └── types/           # TypeScript types
├── public/              # Static assets
├── package.json
├── astro.config.mjs    # Astro configuration
└── tsconfig.json        # TypeScript config
```

## Development

```bash
bun run dev        # Start dev server (localhost:4321)
bun run build      # Build for production
bunx astro check   # Type checking
bun run lint       # Run linter
bun run format     # Format code
bun test           # Run tests
```

## Deployment

### Cloudflare Pages

```bash
bun run build
wrangler pages deploy dist --project-name=my-project
```

Auto-deployment configured for Git repositories.

## Configuration

### Environment Variables

Create `.env.local`:

```bash
PUBLIC_SITE_URL=http://localhost:4321
# Add your environment variables here
```

### Tailwind v4

Styles are configured in `src/styles/global.css`:

```css
@theme {
  --color-background: 0 0% 100%;
  --color-foreground: 222.2 84% 4.9%;
}
```

### shadcn/ui

Add components:

```bash
bunx shadcn@latest add button
bunx shadcn@latest add card
```

## Backend Integration

This template is designed to work with:

- [one-ie/backend](https://github.com/one-ie/backend) - Convex headless backend
- [one-ie/ontology](https://github.com/one-ie/ontology) - 6-dimension ontology

## Documentation

- **ONE Platform**: [https://one.ie](https://one.ie)
- **Ontology**: [one-ie/ontology](https://github.com/one-ie/ontology)
- **CLI**: [one-ie/cli](https://github.com/one-ie/cli)

## License

ONE Free License – see [LICENSE](LICENSE) for details.

---

**Built with simplicity, clarity, and infinite scale in mind.**
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
    COMMIT_MSG="chore: sync web template v$VERSION"
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
