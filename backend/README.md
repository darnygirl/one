# ONE Platform - Headless Backend

**Convex Backend with 6-Dimension Ontology**

> **NOTE**: This is a stub structure. The full backend implementation is coming soon.

## 6-Dimension Ontology

This backend implements the complete 6-dimension ontology:

1. **Groups** – Multi-tenant isolation + hierarchical nesting
2. **People** – Authorization & governance (represented as things with type "creator")
3. **Things** – Entity definitions (66+ types)
4. **Connections** – Relationships (25+ types)
5. **Events** – Actions & audit trail (67+ types)
6. **Knowledge** – Embeddings & RAG

## Quick Start

```bash
# Install dependencies
bun install

# Start Convex dev server
npx convex dev
```

## Schema

The schema is defined in `convex/schema.ts` with 5 tables mapping to the 6 dimensions:

- `groups` - Multi-tenant isolation
- `things` - All entities (including people as type "creator")
- `connections` - All relationships
- `events` - Complete audit trail
- `knowledge` - Vector embeddings for RAG

## Development

```bash
# Start dev server
npx convex dev

# Deploy to production
npx convex deploy

# Run query
npx convex run queries/things:list '{"type": "user"}'
```

## Environment Variables

Create `.env.local`:

```bash
CONVEX_DEPLOYMENT=your-deployment-name
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

## Documentation

- **Ontology**: [one-ie/ontology](https://github.com/one-ie/ontology)
- **Web Template**: [one-ie/web](https://github.com/one-ie/web)
- **CLI**: [one-ie/cli](https://github.com/one-ie/cli)

---

**Built with clarity, simplicity, and infinite scale in mind.**
