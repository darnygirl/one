#!/usr/bin/env bash

# Master release script - orchestrates all repository releases
# Executes: ontology → web → cli → backend → one (aggregated)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
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

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_header() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${MAGENTA}$1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Track failures
FAILED_RELEASES=()

run_release() {
    local name=$1
    local script=$2

    log_header "Releasing: $name"

    if [ ! -f "$SCRIPT_DIR/$script" ]; then
        log_error "Release script not found: $script"
        FAILED_RELEASES+=("$name (script missing)")
        return 1
    fi

    if bash "$SCRIPT_DIR/$script"; then
        log_success "✓ $name release completed"
        return 0
    else
        log_error "✗ $name release failed"
        FAILED_RELEASES+=("$name")
        return 1
    fi
}

main() {
    log_header "ONE Platform - Master Release Pipeline"

    log_info "This will execute releases in the following order:"
    log_info "  1. one-ie/ontology  (documentation)"
    log_info "  2. one-ie/web       (starter template)"
    log_info "  3. one-ie/cli       (CLI + npm package)"
    log_info "  4. one-ie/backend   (Convex backend)"
    log_info "  5. one-ie/one       (aggregated → one.ie)"
    log_info ""
    log_warn "NOTE: This is a DRY RUN. No changes will be pushed."
    log_info ""

    # Confirm before proceeding
    read -p "Continue with release pipeline? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warn "Release cancelled by user"
        exit 0
    fi

    # Release ontology documentation
    run_release "ontology" "release-ontology.sh" || true

    # Release web template
    run_release "web" "release-web.sh" || true

    # Release CLI (if directory exists)
    if [ -d "$(dirname "$SCRIPT_DIR")/cli" ]; then
        run_release "cli" "release-cli.sh" || true
    else
        log_warn "Skipping CLI release (directory not found)"
        log_warn "Run 'bun run setup:cli' to create CLI structure"
    fi

    # Release backend (if directory exists)
    if [ -d "$(dirname "$SCRIPT_DIR")/backend" ]; then
        run_release "backend" "release-backend.sh" || true
    else
        log_warn "Skipping backend release (directory not found)"
        log_warn "Run 'bun run setup:backend' to create backend structure"
    fi

    # Release aggregated one.ie deployment
    run_release "one (aggregated)" "release-one.sh" || true

    # Summary
    log_header "Release Pipeline Summary"

    if [ ${#FAILED_RELEASES[@]} -eq 0 ]; then
        log_success "All releases completed successfully! ✓"
        log_info ""
        log_info "Next steps:"
        log_info "  1. Review the changes in each /tmp/one-release-* directory"
        log_info "  2. When ready, push each repository to GitHub"
        log_info "  3. For CLI, publish to npm: npm publish --access public"
        log_info "  4. Cloudflare will auto-deploy one.ie from one-ie/one"
    else
        log_error "Some releases failed:"
        for release in "${FAILED_RELEASES[@]}"; do
            log_error "  - $release"
        done
        exit 1
    fi

    echo ""
    log_warn "========================================="
    log_warn "  DRY RUN COMPLETE"
    log_warn "========================================="
    log_warn ""
    log_warn "Review temporary directories:"
    echo ""
    ls -ld /tmp/one-release-* 2>/dev/null || log_info "No temporary directories found"
    echo ""
}

main "$@"
