# ONE Platform Connector - WordPress Plugin

Complete WordPress and WooCommerce integration plugin for the ONE Platform with full 6-dimension ontology support.

## Features

✅ **Complete 6-Dimension Ontology Support**
- Connections - Relationships between WordPress entities
- Events - Complete audit trail of all actions
- Knowledge - Labels, embeddings, and search
- Things - WordPress posts, pages, products, users

✅ **WordPress Integration**
- Automatic event logging for posts, comments, users
- Category and tag connections
- Custom post type support
- User activity tracking

✅ **WooCommerce Integration**
- Product events (created, updated, deleted)
- Order tracking and status changes
- Purchase connections (customer → product)
- Customer events
- Cart activity tracking
- Payment completion events

✅ **REST API Endpoints**
- `/wp-json/one/v1/connections` - Full CRUD for connections
- `/wp-json/one/v1/events` - Event logging and retrieval
- `/wp-json/one/v1/knowledge` - Knowledge management

✅ **Admin Dashboard**
- Statistics overview
- Connection browser
- Event viewer
- Settings management
- Integration status

## Installation

### Method 1: WordPress Admin

1. Download the plugin ZIP file
2. Go to **Plugins → Add New** in WordPress admin
3. Click **Upload Plugin** and select the ZIP file
4. Click **Install Now** and then **Activate**

### Method 2: Manual Installation

1. Upload the `one-platform-connector` folder to `/wp-content/plugins/`
2. Activate the plugin through the 'Plugins' menu in WordPress

### Method 3: WP-CLI

```bash
wp plugin install one-platform-connector.zip --activate
```

## Requirements

- **WordPress:** 5.9 or higher
- **PHP:** 7.4 or higher
- **MySQL:** 5.6 or higher
- **WooCommerce:** 5.0 or higher (optional, for e-commerce features)

## Configuration

### 1. Initial Setup

After activation, go to **ONE Platform → Settings** to configure:

- **Enable API** - Turn REST API endpoints on/off
- **Enable Sync** - Automatic data synchronization
- **Log Events** - Track WordPress and WooCommerce events
- **WooCommerce Sync** - Enable WooCommerce integration
- **Organization ID** - Unique identifier for this installation

### 2. Application Password (for API Access)

1. Go to **Users → Your Profile**
2. Scroll to **Application Passwords**
3. Enter name: "ONE Platform API"
4. Click **Add New Application Password**
5. Copy the generated password

### 3. WooCommerce Setup (Optional)

If using WooCommerce:

1. Install and activate WooCommerce
2. Go to **WooCommerce → Settings → Advanced → REST API**
3. Click **Add key**
4. Set permissions to **Read/Write**
5. Copy the Consumer Key and Consumer Secret

## Database Schema

The plugin creates 4 custom tables:

### wp_one_connections
Stores relationships between entities.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| from_thing_id | varchar(255) | Source entity |
| to_thing_id | varchar(255) | Target entity |
| relationship_type | varchar(100) | Type of relationship |
| metadata | longtext | JSON metadata |
| strength | decimal(3,2) | Connection strength (0-1) |
| valid_from | bigint | Start timestamp |
| valid_to | bigint | End timestamp |
| group_id | varchar(255) | Organization ID |
| created_at | datetime | Created timestamp |
| updated_at | datetime | Updated timestamp |
| deleted_at | datetime | Soft delete timestamp |

### wp_one_events
Complete audit trail of all actions.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| type | varchar(100) | Event type |
| actor_id | varchar(255) | Who performed the action |
| target_id | varchar(255) | What was affected |
| timestamp | datetime | When it happened |
| group_id | varchar(255) | Organization ID |
| metadata | longtext | JSON event data |

### wp_one_knowledge
Labels, embeddings, and searchable content.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| knowledge_type | varchar(50) | label, document, chunk, vector_only |
| text | longtext | Searchable text content |
| embedding | longtext | JSON vector embedding |
| embedding_model | varchar(100) | Model name (e.g., "openai-ada-002") |
| embedding_dim | int | Embedding dimensions |
| source_thing_id | varchar(255) | Source entity |
| source_field | varchar(100) | Source field name |
| labels | longtext | JSON array of labels |
| metadata | longtext | JSON metadata |
| created_at | datetime | Created timestamp |
| updated_at | datetime | Updated timestamp |
| deleted_at | datetime | Soft delete timestamp |

### wp_one_thing_knowledge
Links between things and knowledge items.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| thing_id | varchar(255) | Thing identifier |
| knowledge_id | bigint | Knowledge item ID |
| role | varchar(50) | label, summary, chunk_of, etc. |
| metadata | longtext | JSON metadata |
| created_at | datetime | Created timestamp |

## REST API Usage

### Authentication

Use WordPress Application Passwords for API authentication:

```bash
curl -u "username:application_password" \
  https://yoursite.com/wp-json/one/v1/connections
```

### List Connections

```bash
GET /wp-json/one/v1/connections
```

Query parameters:
- `from_thing_id` - Filter by source
- `to_thing_id` - Filter by target
- `relationship_type` - Filter by type
- `per_page` - Results per page (default: 10)
- `page` - Page number

Example:
```bash
curl "https://yoursite.com/wp-json/one/v1/connections?from_thing_id=wp_post_123&per_page=20"
```

### Create Connection

```bash
POST /wp-json/one/v1/connections
```

Body:
```json
{
  "from_thing_id": "wp_post_123",
  "to_thing_id": "wp_user_1",
  "relationship_type": "created_by",
  "metadata": {
    "custom_field": "value"
  },
  "strength": 1.0
}
```

### Get Connection

```bash
GET /wp-json/one/v1/connections/{id}
```

### Update Connection

```bash
PUT /wp-json/one/v1/connections/{id}
```

Body:
```json
{
  "strength": 0.5,
  "metadata": {
    "updated_field": "new_value"
  }
}
```

### Delete Connection

```bash
DELETE /wp-json/one/v1/connections/{id}
```

### List Events

```bash
GET /wp-json/one/v1/events
```

Query parameters:
- `type` - Filter by event type
- `actor_id` - Filter by actor
- `target_id` - Filter by target
- `per_page` - Results per page
- `page` - Page number

### Create Event

```bash
POST /wp-json/one/v1/events
```

Body:
```json
{
  "type": "custom_event",
  "actor_id": "wp_user_1",
  "target_id": "wp_post_123",
  "metadata": {
    "action": "viewed",
    "duration": 45
  }
}
```

### List Knowledge

```bash
GET /wp-json/one/v1/knowledge
```

Query parameters:
- `knowledge_type` - Filter by type
- `source_thing_id` - Filter by source
- `per_page` - Results per page

### Create Knowledge

```bash
POST /wp-json/one/v1/knowledge
```

Body:
```json
{
  "knowledge_type": "label",
  "text": "Important Topic",
  "labels": ["category", "featured"],
  "source_thing_id": "wp_post_123",
  "metadata": {
    "relevance": "high"
  }
}
```

## Event Types

### WordPress Events

- `post_published` - Post published
- `post_updated` - Post updated
- `post_deleted` - Post deleted
- `comment_added` - Comment added
- `user_registered` - New user registered
- `user_logged_in` - User logged in

### WooCommerce Events

- `product_created` - New product created
- `product_updated` - Product updated
- `product_deleted` - Product deleted
- `order_created` - New order placed
- `order_status_changed` - Order status changed
- `payment_completed` - Payment completed
- `customer_created` - New customer created

### Connection Types

- `created_by` - Author relationship
- `tagged_with` - Post tag relationship
- `categorized_as` - Post category relationship
- `purchased` - Customer purchased product
- `added_to_cart` - Product added to cart

## Frontend Integration

Use with the ONE Platform frontend via the `WordPressProviderEnhanced`:

```typescript
import { WordPressProviderEnhancedLive } from "@/providers/wordpress";

const AppLayer = WordPressProviderEnhancedLive({
  url: "https://yoursite.com",
  apiKey: "your_application_password",
  organizationId: "your-org",
});
```

## Development

### Hooks and Filters

```php
// Before plugin initialization
do_action('before_one_platform_init');

// After plugin initialization
do_action('one_platform_init');

// After plugins loaded
do_action('one_platform_plugins_loaded');
```

### Custom Event Logging

```php
// Log custom event
global $wpdb;
$table = $wpdb->prefix . 'one_events';

$wpdb->insert($table, array(
    'type' => 'custom_action',
    'actor_id' => 'user_' . get_current_user_id(),
    'target_id' => 'custom_target_123',
    'metadata' => json_encode(array(
        'custom_field' => 'value'
    )),
));
```

### Custom Connection

```php
// Create custom connection
global $wpdb;
$table = $wpdb->prefix . 'one_connections';

$wpdb->insert($table, array(
    'from_thing_id' => 'wp_post_123',
    'to_thing_id' => 'wp_post_456',
    'relationship_type' => 'related_to',
    'metadata' => json_encode(array(
        'relevance' => 0.85
    )),
));
```

## Troubleshooting

### REST API Not Working

1. Check permalinks: **Settings → Permalinks** → Click **Save Changes**
2. Verify `.htaccess` has WordPress rewrite rules
3. Test API: `curl https://yoursite.com/wp-json/`

### Database Tables Not Created

1. Check database permissions
2. Deactivate and reactivate the plugin
3. Check error logs for SQL errors

### Events Not Logging

1. Go to **ONE Platform → Settings**
2. Ensure **Log Events** is enabled
3. Check database table exists: `SHOW TABLES LIKE 'wp_one_events';`

### WooCommerce Integration Not Working

1. Verify WooCommerce is installed and activated
2. Go to **ONE Platform → Settings**
3. Enable **WooCommerce Sync**

## Performance

### Optimization Tips

1. **Use Indexes** - All tables have proper indexes for common queries
2. **Pagination** - Always use `per_page` parameter for large datasets
3. **Caching** - Use WordPress object cache for frequently accessed data
4. **Cleanup** - Old soft-deleted records are automatically cleaned after 30 days

### Cron Jobs

The plugin schedules two cron jobs:

- `one_platform_sync_events` - Hourly event synchronization
- `one_platform_cleanup` - Daily cleanup of old data

## Security

### Capabilities

The plugin adds custom capabilities:

- `manage_one_platform` - Full access (administrators)
- `view_one_connections` - View connections
- `edit_one_connections` - Edit connections
- `view_one_events` - View events
- `view_one_knowledge` - View knowledge
- `edit_one_knowledge` - Edit knowledge

### Best Practices

1. Use Application Passwords instead of user passwords
2. Restrict API access to specific IP addresses if possible
3. Enable SSL/HTTPS for all API requests
4. Regularly update the plugin
5. Monitor the Events log for suspicious activity

## Uninstallation

### Keep Data

Simply deactivate the plugin. All data remains in the database.

### Remove All Data

Delete the plugin through WordPress admin. The uninstall script will:

1. Drop all custom tables
2. Delete all plugin options
3. Clear cached data

**Warning:** This action is irreversible!

## Support

- **Documentation:** https://one.ie/docs
- **GitHub:** https://github.com/one-ie/one
- **Discord:** https://discord.gg/one-platform
- **Email:** support@one.ie

## Changelog

### 1.0.0 - 2025-01-13

- Initial release
- Complete 6-dimension ontology support
- WordPress integration with event logging
- WooCommerce integration
- REST API endpoints
- Admin dashboard
- Settings page
- Connection and event browsers

## License

MIT License - See LICENSE file for details

## Credits

Built with ❤️ by the ONE Platform team

- Website: https://one.ie
- GitHub: https://github.com/one-ie/one
- Twitter: @oneplatform
