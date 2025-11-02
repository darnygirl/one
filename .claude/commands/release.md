---
allowed-tools: Bash(./scripts/release-*.sh:*), Bash(cd web && bun run build:*), Bash(cd web && wrangler pages deploy:*), Bash(cd cli && npm publish:*), Bash(git status:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(git tag:*), Bash(npm view oneie:*)
description: Execute full ONE Platform release - npm, GitHub, and Cloudflare Pages (project)
---

# /release - ONE Platform Multi-Repo Release

**Purpose:** Execute releases to 5 specialized repositories + Cloudflare Pages deployment.

## Context

- Current directory: !`pwd`
- Release scripts: !`ls -lh scripts/release-*.sh | wc -l` scripts available
- CLI exists: !`[ -d cli ] && echo "✓ CLI ready" || echo "✗ CLI not found"`
- Backend exists: !`[ -d backend ] && echo "✓ Backend ready" || echo "✗ Backend not found"`
- Current git status: !`git status --short | head -10`

## Release Targets

### Individual Releases
```bash
/release ontology  # → one-ie/ontology (documentation)
/release web       # → one-ie/web (starter template)
/release cli       # → one-ie/cli + npm (oneie)
/release backend   # → one-ie/backend (Convex)
/release one       # → one-ie/one → one.ie (aggregated)
```

### Complete Pipeline
```bash
/release all       # → All 5 repositories in sequence
```

## Your Task

Based on the target requested:

### For: /release ontology
1. Run `./scripts/release-ontology.sh`
2. Review output - shows what would be committed
3. Check temporary directory: `/tmp/one-release-ontology-*`
4. Report to user: DRY RUN complete, ready for manual push

### For: /release web
1. Run `./scripts/release-web.sh`
2. Review output - shows template sync
3. Check temporary directory: `/tmp/one-release-web-*`
4. Report to user: DRY RUN complete, ready for manual push

### For: /release cli
1. Run `./scripts/release-cli.sh`
2. Review output - shows CLI package preparation
3. Check temporary directory: `/tmp/one-release-cli-*`
4. Report to user: DRY RUN complete
5. Remind: After push, run `npm publish --access public`

### For: /release backend
1. Run `./scripts/release-backend.sh`
2. Review output - shows backend schema sync
3. Check temporary directory: `/tmp/one-release-backend-*`
4. Report to user: DRY RUN complete, ready for manual push

### For: /release one
1. Run `./scripts/release-one.sh`
2. Review output - shows builder template assembly
3. Check temporary directory: `/tmp/one-release-one-*`
4. Report to user: DRY RUN complete
5. Remind: After push, users can clone one-ie/one to build their sites
6. Remind: Clone one-ie/one to build one.ie marketing site

### For: /release all
1. Run `./scripts/release-all.sh`
2. This executes all 5 releases in sequence
3. Review summary of successes/failures
4. Check all temporary directories
5. Report complete status to user

### Final Summary Report
Provide a concise summary:
```
✅ Release Pipeline Complete!

📚 ontology: /tmp/one-release-ontology-* (review)
🌐 web: /tmp/one-release-web-* (review)
📦 cli: /tmp/one-release-cli-* (review + npm publish)
⚙️ backend: /tmp/one-release-backend-* (review)
🏗️ one: /tmp/one-release-one-* (review → builder template)

Next steps:
1. Review each /tmp directory
2. Push to GitHub when ready:
   cd /tmp/one-release-[target]-*
   git push origin main
3. For CLI: npm publish --access public
4. For one: Users clone one-ie/one to build their sites
5. For one.ie: Clone one-ie/one and customize for marketing site
```

## Important Notes

**All releases are DRY RUNS by default:**
- ✅ Scripts prepare releases in /tmp directories
- ✅ Show exactly what would be committed
- ✅ Do NOT automatically push to GitHub
- ✅ Require manual verification before push
- ✅ Provide clear instructions for manual push

**Safety First:**
- ❌ No automatic pushes to production
- ❌ No automatic npm publishes
- ❌ No automatic Cloudflare deploys
- ✅ Review everything before pushing
- ✅ Full control at every step

## Repository Structure

After restructuring:
```
one/ (monorepo)
├── one/          → one-ie/ontology
├── web/          → one-ie/web
├── cli/          → one-ie/cli + npm
├── backend/      → one-ie/backend
├── .claude/      → included in one-ie/one
└── scripts/      → release automation
```

## Error Handling

### If release script fails:
1. Check script output for specific errors
2. Verify source directory exists
3. Report to user with suggested fixes
4. Do NOT continue to next release

### If directory not found (CLI/Backend):
1. Report missing directory
2. Suggest running setup command
3. Skip that release
4. Continue with other releases

## When to Use

Use `/release` when you want to:
- ✅ Prepare releases for multiple repositories
- ✅ Sync ontology documentation to one-ie/ontology
- ✅ Sync web template to one-ie/web
- ✅ Package CLI for npm publication
- ✅ Sync backend to one-ie/backend
- ✅ Create aggregated deployment for one.ie
- ✅ Execute complete release pipeline

## When NOT to Use

Do NOT use `/release` if:
- ❌ You're still developing/testing
- ❌ There are uncommitted changes (unless intentional)
- ❌ You haven't tested locally
- ❌ You want to actually push (use manual push instead)

**Remember:** All releases are DRY RUNS. Review first, push manually.

## Example Usage

**User:** `/release all`

**Claude:**
1. Runs `./scripts/release-all.sh`
2. Prepares ontology release → /tmp/one-release-ontology-*
3. Prepares web release → /tmp/one-release-web-*
4. Prepares CLI release → /tmp/one-release-cli-*
5. Prepares backend release → /tmp/one-release-backend-*
6. Prepares aggregated release → /tmp/one-release-one-*
7. Reports summary with all temp directories
8. Provides manual push instructions

**User:** `/release ontology`

**Claude:**
1. Runs `./scripts/release-ontology.sh`
2. Syncs /one → /tmp/one-release-ontology-*
3. Shows what would be committed
4. Reports: "DRY RUN complete. Review and push when ready."

## Prerequisites

Before running `/release`, ensure:
- ✅ You're in the ONE root directory
- ✅ Release scripts exist in `scripts/`
- ✅ Source directories exist (one, web, cli, backend)
- ✅ You're ready to review releases

After manual push:
- ✅ For CLI: Login to npm (`npm whoami`)
- ✅ For one: Wrangler authenticated for Cloudflare

## Post-Release Tasks

After reviewing and pushing releases:
1. **ontology**: GitHub only, documentation repository
2. **web**: GitHub only, used as standalone template
3. **cli**: Push to GitHub + `npm publish --access public`
4. **backend**: GitHub only, used as backend reference
5. **one**: Push to GitHub → Users clone to build their sites (including one.ie)

---

**Multi-Repo Release Pipeline: Safe, Reviewable, Manual Control! 🚀**
