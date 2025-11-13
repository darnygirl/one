/**
 * Astro Configuration Example for WordPress Integration
 *
 * This file shows how to configure Astro to use WordPress as the backend
 * for the ONE platform.
 */

import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import { wordPressProvider, wordPressProviderEnhanced } from "./src/providers/wordpress";

// ============================================================================
// OPTION 1: Basic WordPress Provider (Read-only)
// ============================================================================

export default defineConfig({
  integrations: [react()],
  vite: {
    define: {
      // WordPress configuration
      "import.meta.env.WORDPRESS_URL": JSON.stringify(
        process.env.WORDPRESS_URL || "https://your-wordpress-site.com"
      ),
      "import.meta.env.WORDPRESS_USERNAME": JSON.stringify(
        process.env.WORDPRESS_USERNAME || "admin"
      ),
      "import.meta.env.WORDPRESS_APP_PASSWORD": JSON.stringify(
        process.env.WORDPRESS_APP_PASSWORD || ""
      ),
    },
  },
});

// ============================================================================
// OPTION 2: Enhanced WordPress Provider (Full CRUD)
// ============================================================================

// Requires WordPress plugin: "one-platform-connector"
export const enhancedConfig = defineConfig({
  integrations: [react()],
  vite: {
    define: {
      "import.meta.env.WORDPRESS_URL": JSON.stringify(
        process.env.WORDPRESS_URL || "https://your-wordpress-site.com"
      ),
      "import.meta.env.WORDPRESS_API_KEY": JSON.stringify(
        process.env.WORDPRESS_API_KEY || ""
      ),
      "import.meta.env.WORDPRESS_USERNAME": JSON.stringify(
        process.env.WORDPRESS_USERNAME || "admin"
      ),
      "import.meta.env.ORGANIZATION_ID": JSON.stringify(
        process.env.ORGANIZATION_ID || "default-org"
      ),
    },
  },
});

// ============================================================================
// OPTION 3: WooCommerce Integration
// ============================================================================

export const wooCommerceConfig = defineConfig({
  integrations: [react()],
  vite: {
    define: {
      "import.meta.env.WORDPRESS_URL": JSON.stringify(
        process.env.WORDPRESS_URL || "https://your-woocommerce-site.com"
      ),
      "import.meta.env.WC_CONSUMER_KEY": JSON.stringify(
        process.env.WC_CONSUMER_KEY || ""
      ),
      "import.meta.env.WC_CONSUMER_SECRET": JSON.stringify(
        process.env.WC_CONSUMER_SECRET || ""
      ),
    },
  },
});

// ============================================================================
// USAGE IN APPLICATION
// ============================================================================

/**
 * Example: Initialize WordPress Provider in app
 *
 * ```typescript
 * // src/lib/provider.ts
 * import { Layer } from "effect";
 * import { WordPressProviderLive } from "@/providers/wordpress";
 *
 * export const AppLayer = WordPressProviderLive({
 *   baseUrl: import.meta.env.WORDPRESS_URL + "/wp-json/wp/v2",
 *   auth: {
 *     username: import.meta.env.WORDPRESS_USERNAME,
 *     applicationPassword: import.meta.env.WORDPRESS_APP_PASSWORD,
 *   },
 * });
 * ```
 *
 * Example: Initialize Enhanced WordPress Provider
 *
 * ```typescript
 * // src/lib/provider.ts
 * import { Layer } from "effect";
 * import { WordPressProviderEnhancedLive } from "@/providers/wordpress";
 *
 * export const AppLayer = WordPressProviderEnhancedLive({
 *   url: import.meta.env.WORDPRESS_URL,
 *   apiKey: import.meta.env.WORDPRESS_API_KEY,
 *   username: import.meta.env.WORDPRESS_USERNAME,
 *   organizationId: import.meta.env.ORGANIZATION_ID,
 * });
 * ```
 *
 * Example: Use in React Component
 *
 * ```tsx
 * // src/components/Posts.tsx
 * import { useEffect, useState } from "react";
 * import { Effect } from "effect";
 * import { DataProviderService } from "@/providers/DataProvider";
 * import { AppLayer } from "@/lib/provider";
 *
 * export function Posts() {
 *   const [posts, setPosts] = useState([]);
 *
 *   useEffect(() => {
 *     const program = Effect.gen(function* () {
 *       const provider = yield* DataProviderService;
 *       return yield* provider.things.list({ type: "blog_post" });
 *     });
 *
 *     Effect.runPromise(program.pipe(Effect.provide(AppLayer)))
 *       .then(setPosts)
 *       .catch(console.error);
 *   }, []);
 *
 *   return (
 *     <div>
 *       {posts.map((post) => (
 *         <article key={post._id}>
 *           <h2>{post.name}</h2>
 *           <div dangerouslySetInnerHTML={{ __html: post.properties.content }} />
 *         </article>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */

// ============================================================================
// ENVIRONMENT VARIABLES
// ============================================================================

/**
 * Create a .env file in your project root:
 *
 * ```env
 * # Basic WordPress
 * WORDPRESS_URL=https://your-wordpress-site.com
 * WORDPRESS_USERNAME=admin
 * WORDPRESS_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx
 *
 * # Enhanced WordPress (with custom plugin)
 * WORDPRESS_API_KEY=your_application_password
 * ORGANIZATION_ID=your-org-id
 *
 * # WooCommerce
 * WC_CONSUMER_KEY=ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 * WC_CONSUMER_SECRET=cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 * ```
 */

// ============================================================================
// CLOUDFLARE PAGES DEPLOYMENT
// ============================================================================

/**
 * When deploying to Cloudflare Pages, add environment variables:
 *
 * 1. Go to your Cloudflare Pages project settings
 * 2. Navigate to "Environment variables"
 * 3. Add the variables:
 *    - WORDPRESS_URL
 *    - WORDPRESS_USERNAME
 *    - WORDPRESS_APP_PASSWORD
 *    - WC_CONSUMER_KEY (if using WooCommerce)
 *    - WC_CONSUMER_SECRET (if using WooCommerce)
 *
 * 4. Redeploy your site
 */
