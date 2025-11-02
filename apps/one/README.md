# ONE Platform - Master Assembly

**Aggregated Repository for one.ie Deployment**

This directory is the staging area for the `one-ie/one` repository, which combines:

- `/one` - Ontology documentation
- `/web` - Astro web application
- `/.claude` - AI configuration
- Root documentation files (README, LICENSE, etc.)

## Purpose

The `one-ie/one` repository is the **master assembly** that gets deployed to one.ie via Cloudflare Pages.

## Release Process

When you run `bun run release:one`, the script:

1. Creates a temporary directory
2. Copies `/one` → `one/`
3. Copies `/web` → `web/`
4. Copies `/.claude` → `.claude/`
5. Copies root docs (README, LICENSE, etc.)
6. Commits and prepares for push to `one-ie/one`
7. Cloudflare Pages auto-deploys to one.ie

## Structure

After release, `one-ie/one` looks like:

```
one-ie/one/
├── one/              # Ontology documentation
├── web/              # Astro application
├── .claude/          # AI configuration
├── README.md
├── LICENSE.md
├── AGENTS.md
├── CLAUDE.md
├── SECURITY.md
├── wrangler.toml     # Cloudflare config
└── package.json      # Workspace config
```

## Deployment

Cloudflare Pages is configured to:

- **Build command**: `cd web && bun run build`
- **Output directory**: `web/dist`
- **Auto-deploy**: Push to `main` → Deploy to one.ie

## Usage

```bash
# From root of monorepo
bun run release:one

# This creates the aggregated release
# Review in /tmp/one-release-one-*
# Then push when ready
```

---

**This directory is for documentation only. The actual assembly happens during the release process.**
