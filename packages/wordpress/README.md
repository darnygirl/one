# @one-platform/wordpress

Complete WordPress + WooCommerce integration package for the ONE Platform. Includes TypeScript providers and a production-ready WordPress plugin.

## Features

✅ **TypeScript Providers** - Seamless frontend integration
✅ **WordPress Plugin** - Complete backend integration
✅ **WooCommerce Support** - Full e-commerce features
✅ **6-Dimension Ontology** - Connections, Events, Knowledge
✅ **REST API** - Complete CRUD endpoints
✅ **Type-Safe** - Full TypeScript definitions

## Installation

### 1. Install Package

```bash
npm install @one-platform/wordpress
# or
yarn add @one-platform/wordpress
# or
pnpm add @one-platform/wordpress
```

### 2. Install WordPress Plugin

```bash
# Copy plugin to WordPress
cp -r node_modules/@one-platform/wordpress/plugin/one-platform-connector /path/to/wp-content/plugins/

# Or use the installation script
npm run install-wp-plugin -- /path/to/wordpress

# Activate via WP-CLI
wp plugin activate one-platform-connector
```

### 3. Configure WordPress

1. Go to **Users → Your Profile** in WordPress admin
2. Scroll to **Application Passwords**
3. Create password: "ONE Platform"
4. Copy the generated password

### 4. Use in Your Astro/React Project

```typescript
// src/lib/wordpress-provider.ts
import { WordPressProviderEnhancedLive } from '@one-platform/wordpress';

export const WordPressLayer = WordPressProviderEnhancedLive({
  url: import.meta.env.WORDPRESS_URL,
  apiKey: import.meta.env.WORDPRESS_API_KEY,
  organizationId: import.meta.env.ORGANIZATION_ID,
});
```

```typescript
// src/pages/blog.astro
---
import { Effect } from 'effect';
import { DataProviderService } from '@one-platform/wordpress';
import { WordPressLayer } from '@/lib/wordpress-provider';

const posts = await Effect.runPromise(
  Effect.gen(function* () {
    const provider = yield* DataProviderService;
    return yield* provider.things.list({
      type: 'blog_post',
      status: 'published',
      limit: 10
    });
  }).pipe(Effect.provide(WordPressLayer))
);
---

<div>
  {posts.map(post => (
    <article>
      <h2>{post.name}</h2>
      <div set:html={post.properties.content} />
    </article>
  ))}
</div>
```

## Environment Variables

Create a `.env` file:

```env
WORDPRESS_URL=https://your-wordpress-site.com
WORDPRESS_API_KEY=xxxx xxxx xxxx xxxx xxxx xxxx
ORGANIZATION_ID=your-org-id

# For WooCommerce
WC_CONSUMER_KEY=ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WC_CONSUMER_SECRET=cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Package Contents

```
@one-platform/wordpress/
├── plugin/                          # WordPress plugin
│   └── one-platform-connector/      # Ready to install
│       ├── one-platform-connector.php
│       ├── includes/                # 7 PHP classes
│       ├── assets/                  # CSS & JS
│       └── README.md
├── src/                             # TypeScript providers
│   ├── index.ts                     # Main exports
│   ├── WordPressProvider.ts         # Basic provider
│   ├── WordPressProviderEnhanced.ts # Full CRUD provider
│   ├── WooCommerceExtension.ts      # E-commerce
│   ├── examples.tsx                 # React examples
│   └── astro-config-example.ts      # Astro config
├── docs/                            # Documentation
└── scripts/                         # Installation helpers
```

## TypeScript Exports

```typescript
import {
  // Providers
  WordPressProviderLive,
  WordPressProviderEnhancedLive,
  wordPressProvider,
  wordPressProviderEnhanced,

  // WooCommerce
  WooCommerceExtension,
  createWooCommerceExtension,

  // Types
  type WordPressProviderConfig,
  type WooCommerceConfig,

  // DataProvider interface
  DataProviderService,

  // Example components
  WordPressBlogList,
  WooCommerceProductGrid,
  CreateWordPressPost,
  WooCommerceOrderHistory,
} from '@one-platform/wordpress';
```

## Quick Start Examples

### List WordPress Posts

```typescript
import { WordPressBlogList } from '@one-platform/wordpress';

export function Blog() {
  return <WordPressBlogList />;
}
```

### Display WooCommerce Products

```typescript
import { WooCommerceProductGrid } from '@one-platform/wordpress';

export function Shop() {
  return <WooCommerceProductGrid />;
}
```

### Create a Post

```typescript
import { CreateWordPressPost } from '@one-platform/wordpress';

export function NewPost() {
  return <CreateWordPressPost />;
}
```

## WordPress Plugin Features

### REST API Endpoints

- `GET/POST /wp-json/one/v1/connections` - Manage connections
- `GET/POST /wp-json/one/v1/events` - Event logging
- `GET/POST /wp-json/one/v1/knowledge` - Knowledge management
- `GET /wp-json/one/v1/health` - Health check

### Automatic Event Logging

**WordPress Events:**
- Post published, updated, deleted
- Comment added
- User registered, logged in
- Categories/tags assigned

**WooCommerce Events:**
- Product created, updated, deleted
- Order created, status changed
- Payment completed
- Customer created

### Database Tables

- `wp_one_connections` - Relationships between entities
- `wp_one_events` - Complete audit trail
- `wp_one_knowledge` - Labels, embeddings, search
- `wp_one_thing_knowledge` - Thing-knowledge links

## Scripts

### Install WordPress Plugin

```bash
npm run install-wp-plugin -- /path/to/wordpress
```

### Create Plugin ZIP

```bash
npm run build-plugin
```

This creates `dist/one-platform-connector.zip` ready for WordPress upload.

### Generate API Keys

```bash
npm run generate-keys
```

## Configuration Examples

### Basic WordPress (Read-only)

```typescript
import { WordPressProviderLive } from '@one-platform/wordpress';

export const layer = WordPressProviderLive({
  baseUrl: 'https://yoursite.com/wp-json/wp/v2',
  auth: {
    username: 'admin',
    applicationPassword: 'xxxx xxxx xxxx',
  },
});
```

### Enhanced WordPress (Full CRUD)

```typescript
import { WordPressProviderEnhancedLive } from '@one-platform/wordpress';

export const layer = WordPressProviderEnhancedLive({
  url: 'https://yoursite.com',
  apiKey: 'xxxx xxxx xxxx',
  organizationId: 'my-org',
});
```

### With WooCommerce

```typescript
import { createWooCommerceExtension } from '@one-platform/wordpress';

const woocommerce = createWooCommerceExtension(
  'https://yoursite.com',
  'ck_xxxxx',
  'cs_xxxxx'
);

// List products
const products = await Effect.runPromise(
  woocommerce.listProducts({ limit: 10 })
);
```

## TypeScript Support

Full TypeScript definitions included:

```typescript
import type {
  Thing,
  Connection,
  Event,
  Knowledge,
  CreateThingInput,
  CreateConnectionInput,
  ListThingsOptions,
} from '@one-platform/wordpress';
```

## Requirements

### Frontend
- Node.js 18+
- TypeScript 5+
- Effect.ts (included)

### WordPress
- WordPress 5.9+
- PHP 7.4+
- MySQL 5.6+
- WooCommerce 5.0+ (optional)

## Troubleshooting

### WordPress REST API Not Working

```bash
# Test API
curl https://yoursite.com/wp-json/

# Fix permalinks
wp rewrite flush
```

### Plugin Tables Not Created

```bash
# Deactivate and reactivate
wp plugin deactivate one-platform-connector
wp plugin activate one-platform-connector
```

### CORS Errors

Add to WordPress `functions.php`:

```php
add_action('rest_api_init', function() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
    header('Access-Control-Allow-Headers: Authorization, Content-Type');
});
```

## Documentation

- [WordPress Plugin Documentation](./plugin/one-platform-connector/README.md)
- [API Reference](./docs/API.md)
- [TypeScript Examples](./src/examples.tsx)
- [Astro Integration](./src/astro-config-example.ts)

## Support

- **GitHub:** https://github.com/one-ie/one
- **Discord:** https://discord.gg/one-platform
- **Email:** support@one.ie
- **Docs:** https://one.ie/docs

## License

MIT

## Changelog

### 1.0.0 - 2025-01-16

- Initial release
- WordPress plugin with 6-dimension ontology
- TypeScript providers for Astro/React
- WooCommerce integration
- Complete REST API
- Admin dashboard
- Example components
