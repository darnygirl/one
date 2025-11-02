# ONE Platform CLI

**Build apps, websites, and AI agents in English**

The official ONE Platform command-line interface for scaffolding and managing projects.

## Installation

```bash
# Global installation
npm install -g oneie

# Or use directly with npx
npx oneie init my-project
```

## Usage

### Initialize a new project

```bash
oneie init my-project
cd my-project
```

### Start development server

```bash
oneie dev
```

Opens http://localhost:4321

### Build for production

```bash
oneie build
```

### Deploy to Cloudflare Pages

```bash
oneie deploy --project=my-project
```

## Commands

### `oneie init [directory]`

Initialize a new ONE Platform project.

**Options:**
- `-t, --template <name>` - Template to use (default, blog, portfolio, ecommerce)

**Example:**
```bash
oneie init my-blog --template blog
```

### `oneie dev`

Start the development server.

**Options:**
- `-p, --port <port>` - Port to run on (default: 4321)

**Example:**
```bash
oneie dev --port 3000
```

### `oneie build`

Build the project for production.

**Options:**
- `--no-check` - Skip type checking

**Example:**
```bash
oneie build --no-check
```

### `oneie deploy`

Deploy to Cloudflare Pages.

**Options:**
- `--project <name>` - Cloudflare project name
- `--branch <name>` - Branch name (default: production)

**Example:**
```bash
oneie deploy --project my-project --branch main
```

## Templates

### Default

Astro 5 + React 19 + Tailwind v4 + shadcn/ui

### Blog

Pre-configured blog with markdown posts and RSS feed

### Portfolio

Personal portfolio with projects showcase

### E-commerce

E-commerce starter with Stripe integration

## Project Structure

Created projects follow this structure:

```
my-project/
├── src/
│   ├── pages/          # File-based routing
│   ├── components/     # React components
│   ├── layouts/        # Page layouts
│   ├── lib/            # Utilities
│   └── styles/         # Global styles
├── public/             # Static assets
├── package.json
├── astro.config.mjs
└── tsconfig.json
```

## Requirements

- Node.js 22+ or Bun 1.2+
- Git

## Development

```bash
# Clone repository
git clone https://github.com/one-ie/cli
cd cli

# Install dependencies
bun install

# Build
bun run build

# Test locally
node dist/index.js init test-project
```

## Publishing

```bash
# Build
bun run build

# Publish to npm
npm publish --access public
```

## Documentation

- **ONE Platform**: [https://one.ie](https://one.ie)
- **Ontology**: [one-ie/ontology](https://github.com/one-ie/ontology)
- **Web Template**: [one-ie/web](https://github.com/one-ie/web)
- **Backend**: [one-ie/backend](https://github.com/one-ie/backend)

## License

ONE Free License – see [LICENSE](LICENSE.md) for details.

---

**Built with simplicity, clarity, and infinite scale in mind.**
