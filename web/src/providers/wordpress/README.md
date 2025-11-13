# WordPress Integration for ONE Platform

Complete WordPress and WooCommerce integration for the ONE Platform, mapping WordPress data structures to the 6-dimension ontology.

## Overview

This integration provides two WordPress provider implementations:

1. **WordPressProvider** - Basic read/write integration using WordPress REST API
2. **WordPressProviderEnhanced** - Full CRUD with custom endpoints for connections, events, and knowledge
3. **WooCommerceExtension** - E-commerce features using WooCommerce REST API

## Files

```
wordpress/
├── README.md                        # This file
├── WordPressProvider.ts             # Basic WordPress provider
├── WordPressProviderEnhanced.ts     # Enhanced provider with custom endpoints
├── WooCommerceExtension.ts          # WooCommerce e-commerce integration
├── index.ts                         # Export module
├── examples.tsx                     # React component examples
├── astro-config-example.ts          # Astro configuration examples
└── wordpress-plugin-template.php    # WordPress plugin for custom endpoints
```

## Quick Start

### 1. Install WordPress Plugin (Enhanced Provider Only)

```bash
# Copy the plugin to WordPress
cp wordpress-plugin-template.php /path/to/wordpress/wp-content/plugins/one-platform-connector.php

# Or create a plugin directory
mkdir /path/to/wordpress/wp-content/plugins/one-platform-connector
cp wordpress-plugin-template.php /path/to/wordpress/wp-content/plugins/one-platform-connector/index.php

# Activate the plugin
wp plugin activate one-platform-connector
```

### 2. Generate WordPress Application Password

1. Go to **Users → Your Profile** in WordPress admin
2. Scroll to **Application Passwords**
3. Enter name: "ONE Platform"
4. Click **Add New Application Password**
5. Copy the generated password

### 3. Configure Environment Variables

```env
# .env
WORDPRESS_URL=https://your-wordpress-site.com
WORDPRESS_USERNAME=admin
WORDPRESS_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx

# For WooCommerce
WC_CONSUMER_KEY=ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WC_CONSUMER_SECRET=cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# For Enhanced Provider
ORGANIZATION_ID=your-org-id
```

### 4. Initialize Provider

```typescript
// src/lib/provider.ts
import { WordPressProviderLive } from "@/providers/wordpress";

export const AppLayer = WordPressProviderLive({
  baseUrl: import.meta.env.WORDPRESS_URL + "/wp-json/wp/v2",
  auth: {
    username: import.meta.env.WORDPRESS_USERNAME,
    applicationPassword: import.meta.env.WORDPRESS_APP_PASSWORD,
  },
});
```

### 5. Use in Components

```tsx
import { Effect } from "effect";
import { DataProviderService } from "@/providers/DataProvider";
import { AppLayer } from "@/lib/provider";

function MyComponent() {
  const program = Effect.gen(function* () {
    const provider = yield* DataProviderService;
    return yield* provider.things.list({ type: "blog_post" });
  });

  Effect.runPromise(program.pipe(Effect.provide(AppLayer)))
    .then(console.log)
    .catch(console.error);
}
```

## Provider Comparison

| Feature | Basic | Enhanced | WooCommerce |
|---------|-------|----------|-------------|
| WordPress Posts | ✅ | ✅ | - |
| WordPress Pages | ✅ | ✅ | - |
| WordPress Users | ✅ | ✅ | ✅ |
| Custom Post Types | ✅ | ✅ | - |
| Categories/Tags | ✅ | ✅ | - |
| Connections | ❌ | ✅ | ✅ |
| Events | ❌ | ✅ | ✅ |
| Knowledge | 🟡 (read-only) | ✅ | - |
| Products | - | - | ✅ |
| Orders | - | - | ✅ |
| Customers | - | - | ✅ |
| Plugin Required | ❌ | ✅ | ❌ |

## Ontology Mapping

### Things

| ONE Type | WordPress Type | Endpoint |
|----------|----------------|----------|
| `blog_post` | Post | `/wp/v2/posts` |
| `page` | Page | `/wp/v2/pages` |
| `creator` | User | `/wp/v2/users` |
| `course` | Custom Post Type | `/wp/v2/course` |
| `lesson` | Custom Post Type | `/wp/v2/lesson` |
| `product` | WooCommerce Product | `/wc/v3/products` |
| `customer` | WooCommerce Customer | `/wc/v3/customers` |

### Connections

| ONE Connection | WordPress Implementation |
|----------------|-------------------------|
| `created_by` | Post author field |
| `part_of` | Post parent field |
| `tagged_with` | Post tags |
| `categorized_as` | Post categories |
| `purchased` | WooCommerce orders |
| Custom connections | `wp_one_connections` table |

### Events

| ONE Event | WordPress Implementation |
|-----------|-------------------------|
| `thing_created` | Post published hook |
| `thing_updated` | Post modified hook |
| `order_created` | WooCommerce order |
| `order_completed` | WooCommerce order status |
| Custom events | `wp_one_events` table |

### Knowledge

| ONE Feature | WordPress Implementation |
|-------------|-------------------------|
| Labels | Categories/Tags |
| Search | WordPress search API |
| Embeddings | `wp_one_knowledge` table |

## Examples

### List Blog Posts

```tsx
import { WordPressBlogList } from "@/providers/wordpress/examples";

export function BlogPage() {
  return <WordPressBlogList />;
}
```

### Create WordPress Post

```tsx
import { CreateWordPressPost } from "@/providers/wordpress/examples";

export function NewPostPage() {
  return <CreateWordPressPost />;
}
```

### Display WooCommerce Products

```tsx
import { WooCommerceProductGrid } from "@/providers/wordpress/examples";

export function ShopPage() {
  return <WooCommerceProductGrid />;
}
```

### Show Order History

```tsx
import { WooCommerceOrderHistory } from "@/providers/wordpress/examples";

export function OrdersPage({ customerId }: { customerId: string }) {
  return <WooCommerceOrderHistory customerId={customerId} />;
}
```

## WooCommerce Setup

### 1. Install WooCommerce

```bash
wp plugin install woocommerce --activate
```

### 2. Generate API Keys

1. Go to **WooCommerce → Settings → Advanced → REST API**
2. Click **Add key**
3. Enter description: "ONE Platform"
4. User: Select admin user
5. Permissions: Read/Write
6. Click **Generate API key**
7. Copy the **Consumer key** and **Consumer secret**

### 3. Use WooCommerce Extension

```typescript
import { createWooCommerceExtension } from "@/providers/wordpress";

const woocommerce = createWooCommerceExtension(
  import.meta.env.WORDPRESS_URL,
  import.meta.env.WC_CONSUMER_KEY,
  import.meta.env.WC_CONSUMER_SECRET
);

// List products
const products = await Effect.runPromise(woocommerce.listProducts({ limit: 10 }));

// Create product
const productId = await Effect.runPromise(
  woocommerce.createProduct({
    type: "product",
    name: "My Product",
    properties: {
      price: 29.99,
      description: "Product description",
    },
  })
);

// Get orders
const orders = await Effect.runPromise(
  woocommerce.listOrders({ customerId: "wc-customer-123" })
);
```

## Advanced Features

### Custom Post Types

```php
// In WordPress functions.php or plugin
function register_course_post_type() {
  register_post_type('course', [
    'label' => 'Courses',
    'public' => true,
    'show_in_rest' => true,  // Required for REST API
    'rest_base' => 'course',
    'supports' => ['title', 'editor', 'custom-fields'],
  ]);
}
add_action('init', 'register_course_post_type');
```

### Advanced Custom Fields (ACF)

```php
// ACF fields are automatically mapped to thing properties
if (function_exists('acf_add_local_field_group')) {
  acf_add_local_field_group([
    'key' => 'group_course',
    'title' => 'Course Fields',
    'fields' => [
      [
        'key' => 'field_price',
        'label' => 'Price',
        'name' => 'price',
        'type' => 'number',
      ],
      [
        'key' => 'field_duration',
        'label' => 'Duration',
        'name' => 'duration',
        'type' => 'text',
      ],
    ],
    'location' => [
      [
        [
          'param' => 'post_type',
          'operator' => '==',
          'value' => 'course',
        ],
      ],
    ],
    'show_in_rest' => true,
  ]);
}
```

### CORS Configuration

```php
// In WordPress functions.php
function add_cors_headers() {
  header('Access-Control-Allow-Origin: https://your-frontend.com');
  header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
  header('Access-Control-Allow-Headers: Authorization, Content-Type');
  header('Access-Control-Allow-Credentials: true');

  if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    status_header(200);
    exit();
  }
}
add_action('rest_api_init', 'add_cors_headers', 15);
```

## Deployment

### Cloudflare Pages

```bash
# Add environment variables in Cloudflare Pages dashboard
# Settings → Environment variables

WORDPRESS_URL=https://your-wordpress-site.com
WORDPRESS_USERNAME=admin
WORDPRESS_APP_PASSWORD=xxxx xxxx xxxx xxxx
WC_CONSUMER_KEY=ck_xxxxxxxxxxxxxxxx
WC_CONSUMER_SECRET=cs_xxxxxxxxxxxxxxxx
```

### Vercel

```bash
# Add environment variables in Vercel dashboard
vercel env add WORDPRESS_URL
vercel env add WORDPRESS_USERNAME
vercel env add WORDPRESS_APP_PASSWORD
```

## Troubleshooting

### Authentication Issues

```bash
# Test WordPress REST API
curl -u "username:application_password" \
  https://your-site.com/wp-json/wp/v2/posts

# Test WooCommerce API
curl "https://your-site.com/wp-json/wc/v3/products?consumer_key=ck_xxx&consumer_secret=cs_xxx"
```

### CORS Errors

1. Add CORS headers in `functions.php` (see above)
2. Or install "WP REST API - OAuth 1.0a Server" plugin
3. Or use a CORS proxy for development

### 404 Errors

1. Check that permalinks are set to "Post name" (not "Plain")
2. Go to **Settings → Permalinks** and click **Save Changes**
3. Check .htaccess file has WordPress rewrite rules

### Plugin Not Working

1. Check database tables exist:
   ```sql
   SHOW TABLES LIKE 'wp_one_%';
   ```
2. Reactivate plugin:
   ```bash
   wp plugin deactivate one-platform-connector
   wp plugin activate one-platform-connector
   ```

## Performance Optimization

### Caching

```typescript
// Implement caching layer
import { Effect, Cache } from "effect";

const cachedProvider = {
  things: {
    list: Cache.make({
      capacity: 100,
      timeToLive: "5 minutes",
      lookup: (options) => provider.things.list(options),
    }),
  },
};
```

### Pagination

```typescript
// Use pagination for large datasets
const allPosts = await Effect.runPromise(
  Effect.gen(function* () {
    const provider = yield* DataProviderService;
    let page = 1;
    let allPosts: Thing[] = [];
    let posts: Thing[];

    do {
      posts = yield* provider.things.list({
        type: "blog_post",
        limit: 100,
        offset: (page - 1) * 100,
      });
      allPosts = [...allPosts, ...posts];
      page++;
    } while (posts.length === 100);

    return allPosts;
  }).pipe(Effect.provide(AppLayer))
);
```

## Resources

- **WordPress REST API**: https://developer.wordpress.org/rest-api/
- **WooCommerce REST API**: https://woocommerce.github.io/woocommerce-rest-api-docs/
- **Effect Documentation**: https://effect.website
- **ONE Platform Docs**: https://one.ie/docs

## License

MIT

## Support

For issues and questions:
- GitHub: https://github.com/one-ie/one/issues
- Discord: https://discord.gg/one-platform
- Email: support@one.ie
