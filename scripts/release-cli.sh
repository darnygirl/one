#!/usr/bin/env bash

# Release script for one-ie/cli
# Syncs /cli directory to one-ie/cli repository AND publishes to npm as "oneie"

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
SOURCE_DIR="$ROOT_DIR/cli"
REPO_NAME="cli"
REPO_URL="git@github.com:one-ie/cli.git"
NPM_PACKAGE="oneie"
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
    log_info "  ONE Platform - CLI Release"
    log_info "  Package: $NPM_PACKAGE"
    log_info "========================================="
    log_info ""

    # Check if source directory exists
    if [ ! -d "$SOURCE_DIR" ]; then
        log_error "Source directory not found: $SOURCE_DIR"
        log_error "Run 'bun run setup:cli' first to create CLI structure"
        exit 1
    fi

    log_info "Source: $SOURCE_DIR"
    log_info "GitHub: $REPO_URL"
    log_info "npm: $NPM_PACKAGE"
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

    # Copy CLI source
    log_info "Copying CLI source..."
    cp -r "$SOURCE_DIR/"* .

    # Copy .gitignore if it exists
    if [ -f "$SOURCE_DIR/.gitignore" ]; then
        cp "$SOURCE_DIR/.gitignore" .
    fi

    # Verify package.json has correct name
    if [ -f "package.json" ]; then
        PACKAGE_NAME=$(cat package.json | grep '"name"' | head -1 | sed 's/.*"name": "\(.*\)".*/\1/')
        if [ "$PACKAGE_NAME" != "$NPM_PACKAGE" ]; then
            log_warn "Updating package name from '$PACKAGE_NAME' to '$NPM_PACKAGE'"
            sed -i 's/"name": "[^"]*"/"name": "oneie"/' package.json
        fi
    else
        log_error "package.json not found in CLI source"
        exit 1
    fi

    # Build the CLI
    if [ -f "package.json" ]; then
        log_info "Installing dependencies..."
        bun install

        log_info "Building CLI..."
        if grep -q '"build"' package.json; then
            bun run build
        else
            log_warn "No build script found, skipping build step"
        fi
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

    # Get version from package.json
    VERSION="$(cat package.json 2>/dev/null | grep '"version"' | head -1 | sed 's/.*"version": "\(.*\)".*/\1/' || echo "1.0.0")"

    # Create commit
    COMMIT_MSG="chore: release CLI v$VERSION"
    log_info "Creating commit: $COMMIT_MSG"
    git commit -m "$COMMIT_MSG"

    log_info ""
    log_warn "========================================="
    log_warn "  DRY RUN - NOT PUSHING OR PUBLISHING"
    log_warn "========================================="
    log_warn ""
    log_warn "To actually release, run:"
    log_warn ""
    log_warn "1. Push to GitHub:"
    log_warn "   cd $TEMP_DIR"
    log_warn "   git push origin main"
    log_warn ""
    log_warn "2. Publish to npm:"
    log_warn "   cd $TEMP_DIR"
    log_warn "   npm publish --access public"
    log_warn ""
    log_warn "   (Requires npm login with access to 'oneie' package)"
    log_warn ""
    log_warn "Temporary directory preserved for inspection."
    log_warn "It will be cleaned up on next run."

    # Disable cleanup to allow inspection
    trap - EXIT
}

main "$@"
