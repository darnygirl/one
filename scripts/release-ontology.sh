#!/usr/bin/env bash

# Release script for one-ie/ontology
# Syncs /one directory to one-ie/ontology repository

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
SOURCE_DIR="$ROOT_DIR/one"
REPO_NAME="ontology"
REPO_URL="git@github.com:one-ie/ontology.git"
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
    log_info "  ONE Platform - Ontology Release"
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

    # Copy ontology documentation
    log_info "Copying ontology documentation..."
    cp -r "$SOURCE_DIR/"* .

    # Create README if it doesn't exist
    if [ ! -f "README.md" ]; then
        log_info "Creating README.md..."
        cat > README.md << 'EOF'
# ONE Platform Ontology

**6-Dimension Ontology Documentation**

This repository contains the complete documentation for the ONE Platform's 6-dimension ontology:

1. **Groups** – Multi-tenant isolation + hierarchical nesting
2. **People** – Authorization & governance
3. **Things** – Entity definitions (66+ types)
4. **Connections** – Relationships (25+ types)
5. **Events** – Actions & audit trail (67+ types)
6. **Knowledge** – Embeddings & RAG

## Structure

```
ontology/
├── connections/   # Protocols, workflows, integrations
├── things/        # Specifications, plans, architecture
├── events/        # Event specs, deployment history
├── knowledge/     # RAG, AI, implementation guides
├── people/        # Roles, governance
├── groups/        # Group-specific documentation
└── .claude/       # Claude skills for ontology
```

## Documentation

- **Complete Ontology**: [knowledge/ontology.md](knowledge/ontology.md)
- **Architecture**: [knowledge/architecture.md](knowledge/architecture.md)
- **Workflow**: [connections/workflow.md](connections/workflow.md)
- **Rules**: [knowledge/rules.md](knowledge/rules.md)

## Usage

This ontology is used by:
- [one-ie/web](https://github.com/one-ie/web) - Astro starter template
- [one-ie/backend](https://github.com/one-ie/backend) - Convex backend
- [one-ie/cli](https://github.com/one-ie/cli) - CLI tooling (`npx oneie`)
- [one-ie/one](https://github.com/one-ie/one) - Master assembly (one.ie)

## Philosophy

**Simple enough for children. Powerful enough for enterprises.**

Everything maps to 6 dimensions. Everything else is just data.

---

**Built with clarity, simplicity, and infinite scale in mind.**
EOF
    fi

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

    # Get version from root package.json if it exists
    VERSION="$(cat "$ROOT_DIR/package.json" 2>/dev/null | grep '"version"' | head -1 | sed 's/.*"version": "\(.*\)".*/\1/' || echo "unknown")"

    # Create commit
    COMMIT_MSG="chore: sync ontology documentation v$VERSION"
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
