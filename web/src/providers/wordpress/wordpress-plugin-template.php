<?php
/**
 * Plugin Name: ONE Platform Connector
 * Plugin URI: https://one.ie
 * Description: Connects WordPress to the ONE Platform with custom REST API endpoints for connections, events, and knowledge.
 * Version: 1.0.0
 * Author: ONE Platform
 * Author URI: https://one.ie
 * License: MIT
 * Text Domain: one-platform
 *
 * Installation:
 * 1. Upload this file to wp-content/plugins/one-platform-connector/
 * 2. Activate the plugin through the 'Plugins' menu in WordPress
 * 3. Custom REST endpoints will be available at /wp-json/one/v1/
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// ============================================================================
// DATABASE TABLES
// ============================================================================

register_activation_hook(__FILE__, 'one_platform_create_tables');

function one_platform_create_tables() {
    global $wpdb;
    $charset_collate = $wpdb->get_charset_collate();

    // Connections table
    $table_name = $wpdb->prefix . 'one_connections';
    $sql = "CREATE TABLE $table_name (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        from_thing_id varchar(255) NOT NULL,
        to_thing_id varchar(255) NOT NULL,
        relationship_type varchar(100) NOT NULL,
        metadata longtext,
        valid_from bigint(20),
        valid_to bigint(20),
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY from_thing_id (from_thing_id),
        KEY to_thing_id (to_thing_id),
        KEY relationship_type (relationship_type)
    ) $charset_collate;";

    // Events table
    $table_name = $wpdb->prefix . 'one_events';
    $sql .= "CREATE TABLE $table_name (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        type varchar(100) NOT NULL,
        actor_id varchar(255),
        target_id varchar(255),
        timestamp datetime DEFAULT CURRENT_TIMESTAMP,
        metadata longtext,
        PRIMARY KEY  (id),
        KEY type (type),
        KEY actor_id (actor_id),
        KEY target_id (target_id),
        KEY timestamp (timestamp)
    ) $charset_collate;";

    // Knowledge table
    $table_name = $wpdb->prefix . 'one_knowledge';
    $sql .= "CREATE TABLE $table_name (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        knowledge_type varchar(50) NOT NULL,
        text longtext,
        embedding longtext,
        embedding_model varchar(100),
        embedding_dim int,
        source_thing_id varchar(255),
        source_field varchar(100),
        labels longtext,
        metadata longtext,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY knowledge_type (knowledge_type),
        KEY source_thing_id (source_thing_id),
        FULLTEXT KEY text (text)
    ) $charset_collate;";

    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($sql);
}

// ============================================================================
// REST API ENDPOINTS
// ============================================================================

add_action('rest_api_init', function () {
    // Connections endpoints
    register_rest_route('one/v1', '/connections', [
        'methods' => 'GET',
        'callback' => 'one_get_connections',
        'permission_callback' => 'one_check_permissions',
    ]);

    register_rest_route('one/v1', '/connections', [
        'methods' => 'POST',
        'callback' => 'one_create_connection',
        'permission_callback' => 'one_check_permissions',
    ]);

    register_rest_route('one/v1', '/connections/(?P<id>\d+)', [
        'methods' => 'GET',
        'callback' => 'one_get_connection',
        'permission_callback' => 'one_check_permissions',
    ]);

    register_rest_route('one/v1', '/connections/(?P<id>\d+)', [
        'methods' => 'DELETE',
        'callback' => 'one_delete_connection',
        'permission_callback' => 'one_check_permissions',
    ]);

    // Events endpoints
    register_rest_route('one/v1', '/events', [
        'methods' => 'GET',
        'callback' => 'one_get_events',
        'permission_callback' => 'one_check_permissions',
    ]);

    register_rest_route('one/v1', '/events', [
        'methods' => 'POST',
        'callback' => 'one_create_event',
        'permission_callback' => 'one_check_permissions',
    ]);

    register_rest_route('one/v1', '/events/(?P<id>\d+)', [
        'methods' => 'GET',
        'callback' => 'one_get_event',
        'permission_callback' => 'one_check_permissions',
    ]);

    // Knowledge endpoints
    register_rest_route('one/v1', '/knowledge', [
        'methods' => 'GET',
        'callback' => 'one_get_knowledge',
        'permission_callback' => 'one_check_permissions',
    ]);

    register_rest_route('one/v1', '/knowledge', [
        'methods' => 'POST',
        'callback' => 'one_create_knowledge',
        'permission_callback' => 'one_check_permissions',
    ]);

    register_rest_route('one/v1', '/knowledge/(?P<id>\d+)', [
        'methods' => 'GET',
        'callback' => 'one_get_knowledge_item',
        'permission_callback' => 'one_check_permissions',
    ]);
});

// ============================================================================
// PERMISSION CALLBACK
// ============================================================================

function one_check_permissions() {
    // Allow if user is authenticated with Application Password
    return current_user_can('read');
}

// ============================================================================
// CONNECTIONS HANDLERS
// ============================================================================

function one_get_connections($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'one_connections';

    $from_thing_id = $request->get_param('from_thing_id');
    $to_thing_id = $request->get_param('to_thing_id');
    $relationship_type = $request->get_param('relationship_type');
    $per_page = $request->get_param('per_page') ?: 10;
    $page = $request->get_param('page') ?: 1;

    $where = [];
    $values = [];

    if ($from_thing_id) {
        $where[] = 'from_thing_id = %s';
        $values[] = $from_thing_id;
    }

    if ($to_thing_id) {
        $where[] = 'to_thing_id = %s';
        $values[] = $to_thing_id;
    }

    if ($relationship_type) {
        $where[] = 'relationship_type = %s';
        $values[] = $relationship_type;
    }

    $where_clause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

    $values[] = (int) $per_page;
    $values[] = ((int) $page - 1) * (int) $per_page;

    $sql = $wpdb->prepare(
        "SELECT * FROM $table_name $where_clause ORDER BY created_at DESC LIMIT %d OFFSET %d",
        $values
    );

    $results = $wpdb->get_results($sql);

    return rest_ensure_response($results);
}

function one_get_connection($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'one_connections';
    $id = $request['id'];

    $result = $wpdb->get_row($wpdb->prepare(
        "SELECT * FROM $table_name WHERE id = %d",
        $id
    ));

    if (!$result) {
        return new WP_Error('not_found', 'Connection not found', ['status' => 404]);
    }

    return rest_ensure_response($result);
}

function one_create_connection($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'one_connections';

    $data = [
        'from_thing_id' => $request->get_param('from_thing_id'),
        'to_thing_id' => $request->get_param('to_thing_id'),
        'relationship_type' => $request->get_param('relationship_type'),
        'metadata' => $request->get_param('metadata'),
        'valid_from' => $request->get_param('valid_from'),
        'valid_to' => $request->get_param('valid_to'),
    ];

    $wpdb->insert($table_name, $data);
    $id = $wpdb->insert_id;

    $result = $wpdb->get_row($wpdb->prepare(
        "SELECT * FROM $table_name WHERE id = %d",
        $id
    ));

    return rest_ensure_response($result);
}

function one_delete_connection($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'one_connections';
    $id = $request['id'];

    $result = $wpdb->delete($table_name, ['id' => $id]);

    if ($result === false) {
        return new WP_Error('delete_failed', 'Failed to delete connection', ['status' => 500]);
    }

    return rest_ensure_response(['success' => true]);
}

// ============================================================================
// EVENTS HANDLERS
// ============================================================================

function one_get_events($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'one_events';

    $type = $request->get_param('type');
    $actor_id = $request->get_param('actor_id');
    $target_id = $request->get_param('target_id');
    $from = $request->get_param('from');
    $to = $request->get_param('to');
    $per_page = $request->get_param('per_page') ?: 10;
    $page = $request->get_param('page') ?: 1;

    $where = [];
    $values = [];

    if ($type) {
        $where[] = 'type = %s';
        $values[] = $type;
    }

    if ($actor_id) {
        $where[] = 'actor_id = %s';
        $values[] = $actor_id;
    }

    if ($target_id) {
        $where[] = 'target_id = %s';
        $values[] = $target_id;
    }

    if ($from) {
        $where[] = 'UNIX_TIMESTAMP(timestamp) >= %d';
        $values[] = $from;
    }

    if ($to) {
        $where[] = 'UNIX_TIMESTAMP(timestamp) <= %d';
        $values[] = $to;
    }

    $where_clause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

    $values[] = (int) $per_page;
    $values[] = ((int) $page - 1) * (int) $per_page;

    $sql = $wpdb->prepare(
        "SELECT * FROM $table_name $where_clause ORDER BY timestamp DESC LIMIT %d OFFSET %d",
        $values
    );

    $results = $wpdb->get_results($sql);

    return rest_ensure_response($results);
}

function one_get_event($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'one_events';
    $id = $request['id'];

    $result = $wpdb->get_row($wpdb->prepare(
        "SELECT * FROM $table_name WHERE id = %d",
        $id
    ));

    if (!$result) {
        return new WP_Error('not_found', 'Event not found', ['status' => 404]);
    }

    return rest_ensure_response($result);
}

function one_create_event($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'one_events';

    $data = [
        'type' => $request->get_param('type'),
        'actor_id' => $request->get_param('actor_id'),
        'target_id' => $request->get_param('target_id'),
        'timestamp' => $request->get_param('timestamp') ?: current_time('mysql'),
        'metadata' => $request->get_param('metadata'),
    ];

    $wpdb->insert($table_name, $data);
    $id = $wpdb->insert_id;

    $result = $wpdb->get_row($wpdb->prepare(
        "SELECT * FROM $table_name WHERE id = %d",
        $id
    ));

    return rest_ensure_response($result);
}

// ============================================================================
// KNOWLEDGE HANDLERS
// ============================================================================

function one_get_knowledge($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'one_knowledge';

    $knowledge_type = $request->get_param('knowledge_type');
    $labels = $request->get_param('labels');
    $per_page = $request->get_param('per_page') ?: 10;
    $page = $request->get_param('page') ?: 1;

    $where = [];
    $values = [];

    if ($knowledge_type) {
        $where[] = 'knowledge_type = %s';
        $values[] = $knowledge_type;
    }

    if ($labels) {
        $where[] = 'labels LIKE %s';
        $values[] = '%' . $wpdb->esc_like($labels) . '%';
    }

    $where_clause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

    $values[] = (int) $per_page;
    $values[] = ((int) $page - 1) * (int) $per_page;

    $sql = $wpdb->prepare(
        "SELECT * FROM $table_name $where_clause ORDER BY created_at DESC LIMIT %d OFFSET %d",
        $values
    );

    $results = $wpdb->get_results($sql);

    return rest_ensure_response($results);
}

function one_get_knowledge_item($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'one_knowledge';
    $id = $request['id'];

    $result = $wpdb->get_row($wpdb->prepare(
        "SELECT * FROM $table_name WHERE id = %d",
        $id
    ));

    if (!$result) {
        return new WP_Error('not_found', 'Knowledge item not found', ['status' => 404]);
    }

    return rest_ensure_response($result);
}

function one_create_knowledge($request) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'one_knowledge';

    $data = [
        'knowledge_type' => $request->get_param('knowledge_type'),
        'text' => $request->get_param('text'),
        'embedding' => $request->get_param('embedding'),
        'embedding_model' => $request->get_param('embedding_model'),
        'embedding_dim' => $request->get_param('embedding_dim'),
        'source_thing_id' => $request->get_param('source_thing_id'),
        'source_field' => $request->get_param('source_field'),
        'labels' => $request->get_param('labels'),
        'metadata' => $request->get_param('metadata'),
    ];

    $wpdb->insert($table_name, $data);
    $id = $wpdb->insert_id;

    $result = $wpdb->get_row($wpdb->prepare(
        "SELECT * FROM $table_name WHERE id = %d",
        $id
    ));

    return rest_ensure_response($result);
}

// ============================================================================
// ADMIN MENU
// ============================================================================

add_action('admin_menu', function () {
    add_menu_page(
        'ONE Platform',
        'ONE Platform',
        'manage_options',
        'one-platform',
        'one_platform_admin_page',
        'dashicons-networking',
        30
    );
});

function one_platform_admin_page() {
    global $wpdb;
    $connections_count = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}one_connections");
    $events_count = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}one_events");
    $knowledge_count = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}one_knowledge");

    ?>
    <div class="wrap">
        <h1>ONE Platform Connector</h1>
        <p>WordPress integration with the ONE Platform</p>

        <div style="margin-top: 30px;">
            <h2>Statistics</h2>
            <table class="wp-list-table widefat fixed striped">
                <tbody>
                    <tr>
                        <td><strong>Connections</strong></td>
                        <td><?php echo number_format($connections_count); ?></td>
                    </tr>
                    <tr>
                        <td><strong>Events</strong></td>
                        <td><?php echo number_format($events_count); ?></td>
                    </tr>
                    <tr>
                        <td><strong>Knowledge Items</strong></td>
                        <td><?php echo number_format($knowledge_count); ?></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div style="margin-top: 30px;">
            <h2>REST API Endpoints</h2>
            <ul>
                <li><code>GET /wp-json/one/v1/connections</code> - List connections</li>
                <li><code>POST /wp-json/one/v1/connections</code> - Create connection</li>
                <li><code>GET /wp-json/one/v1/events</code> - List events</li>
                <li><code>POST /wp-json/one/v1/events</code> - Create event</li>
                <li><code>GET /wp-json/one/v1/knowledge</code> - List knowledge</li>
                <li><code>POST /wp-json/one/v1/knowledge</code> - Create knowledge</li>
            </ul>
        </div>

        <div style="margin-top: 30px;">
            <h2>Documentation</h2>
            <p>Visit <a href="https://one.ie/docs" target="_blank">https://one.ie/docs</a> for complete documentation.</p>
        </div>
    </div>
    <?php
}
