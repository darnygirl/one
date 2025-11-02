#!/usr/bin/env bash

# Release script for one-ie/one (Builder Template)
# Combines /one + /web + /.claude + root docs → one-ie/one (the builder that users clone)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
REPO_NAME="one"
REPO_URL="git@github.com:one-ie/one.git"
TEMP_DIR="/tmp/one-release-$REPO_NAME-$$"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
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
    log_info "  ONE Platform - Builder Template"
    log_info "  Target: one-ie/one (OPEN SOURCE)"
    log_info "========================================="
    log_info ""

    log_info "Source components (OPEN SOURCE):"
    log_info "  ✓ /one (ontology documentation)"
    log_info "  ✓ /web (Astro application)"
    log_info "  ✓ /.claude (AI configuration)"
    log_info "  ✓ Root docs (README, LICENSE, etc.)"
    log_info ""
    log_info "NOT INCLUDED (not open source yet):"
    log_info "  ✗ /cli (private)"
    log_info "  ✗ /backend (private)"
    log_info ""
    log_info "Target: $REPO_URL"
    log_info "Purpose: Open source builder template"
    log_info "Example: Clone one-ie/one to build one.ie marketing site"
    log_info ""

    # Create temporary directory
    log_step "Creating temporary directory..."
    mkdir -p "$TEMP_DIR"

    # Clone or update repository
    if [ -d "$TEMP_DIR/.git" ]; then
        log_step "Updating existing repository..."
        cd "$TEMP_DIR"
        git pull origin main
    else
        log_step "Cloning repository..."
        git clone "$REPO_URL" "$TEMP_DIR"
        cd "$TEMP_DIR"
    fi

    # Clear existing content (except .git)
    log_step "Clearing existing content..."
    find . -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +

    # Copy ontology documentation
    if [ -d "$ROOT_DIR/one" ]; then
        log_step "Copying ontology documentation (/one)..."
        mkdir -p one
        cp -r "$ROOT_DIR/one/"* one/
    else
        log_error "Ontology directory not found: $ROOT_DIR/one"
        exit 1
    fi

    # Copy web application
    if [ -d "$ROOT_DIR/web" ]; then
        log_step "Copying web application (/web)..."
        mkdir -p web
        cp -r "$ROOT_DIR/web/"* web/
        # Copy .gitignore too
        [ -f "$ROOT_DIR/web/.gitignore" ] && cp "$ROOT_DIR/web/.gitignore" web/
    else
        log_error "Web directory not found: $ROOT_DIR/web"
        exit 1
    fi

    # Copy .claude configuration
    if [ -d "$ROOT_DIR/.claude" ]; then
        log_step "Copying Claude Code configuration (/.claude)..."
        cp -r "$ROOT_DIR/.claude" .
    else
        log_warn ".claude directory not found, skipping"
    fi

    # Copy root documentation files
    log_step "Copying root documentation..."
    [ -f "$ROOT_DIR/README.md" ] && cp "$ROOT_DIR/README.md" .
    [ -f "$ROOT_DIR/LICENSE.md" ] && cp "$ROOT_DIR/LICENSE.md" .
    [ -f "$ROOT_DIR/AGENTS.md" ] && cp "$ROOT_DIR/AGENTS.md" .
    [ -f "$ROOT_DIR/CLAUDE.md" ] && cp "$ROOT_DIR/CLAUDE.md" .
    [ -f "$ROOT_DIR/SECURITY.md" ] && cp "$ROOT_DIR/SECURITY.md" .

    # Copy Cloudflare configuration
    if [ -f "$ROOT_DIR/wrangler.toml" ]; then
        log_step "Copying Cloudflare configuration..."
        cp "$ROOT_DIR/wrangler.toml" .
    else
        log_warn "wrangler.toml not found, creating default..."
        cat > wrangler.toml << 'EOF'
name = "one"
compatibility_date = "2024-01-01"

[site]
bucket = "./web/dist"

[[pages_build_output]]
path = "./web/dist"
EOF
    fi

    # Create workspace package.json if needed
    if [ ! -f "package.json" ]; then
        log_step "Creating workspace package.json..."
        cat > package.json << 'EOF'
{
  "name": "one-platform",
  "version": "3.6.13",
  "private": true,
  "type": "module",
  "packageManager": "bun@1.2.19",
  "workspaces": [
    "web"
  ],
  "scripts": {
    "dev": "cd web && bun run dev",
    "build": "cd web && bun run build",
    "preview": "cd web && bun run preview",
    "deploy": "cd web && bun run deploy",
    "check": "cd web && bunx astro check"
  },
  "description": "ONE Platform - Build apps, websites, and AI agents in English",
  "keywords": [
    "astro",
    "react",
    "tailwind",
    "convex",
    "ontology",
    "ai",
    "6-dimension"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/one-ie/one"
  },
  "homepage": "https://one.ie",
  "author": "ONE Platform",
  "license": "SEE LICENSE IN LICENSE.md"
}
EOF
    fi

    # Create .gitignore if needed
    if [ ! -f ".gitignore" ]; then
        log_step "Creating .gitignore..."
        cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js
bun.lockb

# Testing
coverage/
.nyc_output

# Production
dist/
build/
.astro/

# Environment
.env
.env.local
.env.*.local

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Cloudflare
.wrangler/
wrangler.toml.backup
EOF
    fi

    # Check if there are changes
    if git diff --quiet && git diff --cached --quiet; then
        log_warn "No changes detected. Skipping release."
        exit 0
    fi

    # Stage all changes
    log_step "Staging changes..."
    git add -A

    # Show what will be committed
    log_info ""
    log_info "Changes to be committed:"
    git status --short | head -20
    TOTAL_CHANGES=$(git status --short | wc -l)
    if [ "$TOTAL_CHANGES" -gt 20 ]; then
        log_info "... and $(($TOTAL_CHANGES - 20)) more files"
    fi
    log_info ""

    # Get version from web/package.json or root
    if [ -f "web/package.json" ]; then
        VERSION="$(cat web/package.json | grep '"version"' | head -1 | sed 's/.*"version": "\(.*\)".*/\1/')"
    else
        VERSION="$(cat package.json 2>/dev/null | grep '"version"' | head -1 | sed 's/.*"version": "\(.*\)".*/\1/' || echo "3.6.13")"
    fi

    # Create commit
    COMMIT_MSG="chore: release v$VERSION"
    log_step "Creating commit: $COMMIT_MSG"
    git commit -m "$COMMIT_MSG"

    log_info ""
    log_warn "========================================="
    log_warn "  DRY RUN - NOT PUSHING"
    log_warn "========================================="
    log_warn ""
    log_warn "To actually release the builder template:"
    log_warn ""
    log_warn "1. Push to GitHub:"
    log_warn "   cd $TEMP_DIR"
    log_warn "   git push origin main"
    log_warn ""
    log_warn "2. Users can now clone one-ie/one to build their sites:"
    log_warn "   git clone https://github.com/one-ie/one my-site"
    log_warn "   cd my-site"
    log_warn "   bun install && bun run dev"
    log_warn ""
    log_warn "3. To build one.ie marketing site:"
    log_warn "   Clone one-ie/one and customize for one.ie"
    log_warn "   Deploy to Cloudflare Pages"
    log_warn ""
    log_warn "Temporary directory preserved for inspection."
    log_warn "It will be cleaned up on next run."

    # Show build info
    log_info ""
    log_info "Builder template ready:"
    log_info "  Repository: one-ie/one"
    log_info "  Purpose: Template for users to clone and build their sites"
    log_info "  Includes: /one (docs) + /web (Astro) + /.claude (AI)"
    log_info ""

    # Disable cleanup to allow inspection
    trap - EXIT
}

main "$@"
