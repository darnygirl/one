<?php
/**
 * Installation and Database Setup
 *
 * @package ONE_Platform_Connector
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * ONE_Platform_Installer Class
 */
class ONE_Platform_Installer {

    /**
     * Database tables
     */
    private static $tables = array(
        'connections',
        'events',
        'knowledge',
        'thing_knowledge'
    );

    /**
     * Plugin activation
     */
    public static function activate() {
        if (!current_user_can('activate_plugins')) {
            return;
        }

        self::create_tables();
        self::create_options();
        self::create_roles();
        self::create_cron_jobs();

        // Flush rewrite rules
        flush_rewrite_rules();

        ONE_Platform_Connector::log('Plugin activated successfully');
    }

    /**
     * Plugin deactivation
     */
    public static function deactivate() {
        if (!current_user_can('activate_plugins')) {
            return;
        }

        self::remove_cron_jobs();

        // Flush rewrite rules
        flush_rewrite_rules();

        ONE_Platform_Connector::log('Plugin deactivated');
    }

    /**
     * Create database tables
     */
    private static function create_tables() {
        global $wpdb;

        $charset_collate = $wpdb->get_charset_collate();
        $tables_created = array();

        // Connections table
        $table_name = $wpdb->prefix . 'one_connections';
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
            $sql = "CREATE TABLE $table_name (
                id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
                from_thing_id varchar(255) NOT NULL,
                to_thing_id varchar(255) NOT NULL,
                relationship_type varchar(100) NOT NULL,
                metadata longtext DEFAULT NULL,
                strength decimal(3,2) DEFAULT 1.00,
                valid_from bigint(20) DEFAULT NULL,
                valid_to bigint(20) DEFAULT NULL,
                group_id varchar(255) DEFAULT NULL,
                created_at datetime DEFAULT CURRENT_TIMESTAMP,
                updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                deleted_at datetime DEFAULT NULL,
                PRIMARY KEY  (id),
                KEY from_thing_id (from_thing_id(191)),
                KEY to_thing_id (to_thing_id(191)),
                KEY relationship_type (relationship_type),
                KEY group_id (group_id(191)),
                KEY created_at (created_at),
                KEY deleted_at (deleted_at)
            ) $charset_collate;";

            require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
            dbDelta($sql);
            $tables_created[] = 'connections';
        }

        // Events table
        $table_name = $wpdb->prefix . 'one_events';
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
            $sql = "CREATE TABLE $table_name (
                id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
                type varchar(100) NOT NULL,
                actor_id varchar(255) DEFAULT NULL,
                target_id varchar(255) DEFAULT NULL,
                timestamp datetime DEFAULT CURRENT_TIMESTAMP,
                group_id varchar(255) DEFAULT NULL,
                metadata longtext DEFAULT NULL,
                PRIMARY KEY  (id),
                KEY type (type),
                KEY actor_id (actor_id(191)),
                KEY target_id (target_id(191)),
                KEY group_id (group_id(191)),
                KEY timestamp (timestamp)
            ) $charset_collate;";

            dbDelta($sql);
            $tables_created[] = 'events';
        }

        // Knowledge table
        $table_name = $wpdb->prefix . 'one_knowledge';
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
            $sql = "CREATE TABLE $table_name (
                id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
                knowledge_type varchar(50) NOT NULL,
                text longtext DEFAULT NULL,
                embedding longtext DEFAULT NULL,
                embedding_model varchar(100) DEFAULT NULL,
                embedding_dim int DEFAULT NULL,
                source_thing_id varchar(255) DEFAULT NULL,
                source_field varchar(100) DEFAULT NULL,
                chunk_index int DEFAULT NULL,
                chunk_start int DEFAULT NULL,
                chunk_end int DEFAULT NULL,
                token_count int DEFAULT NULL,
                labels longtext DEFAULT NULL,
                metadata longtext DEFAULT NULL,
                created_at datetime DEFAULT CURRENT_TIMESTAMP,
                updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                deleted_at datetime DEFAULT NULL,
                PRIMARY KEY  (id),
                KEY knowledge_type (knowledge_type),
                KEY source_thing_id (source_thing_id(191)),
                KEY deleted_at (deleted_at),
                FULLTEXT KEY text_fulltext (text)
            ) $charset_collate;";

            dbDelta($sql);
            $tables_created[] = 'knowledge';
        }

        // Thing-Knowledge relationship table
        $table_name = $wpdb->prefix . 'one_thing_knowledge';
        if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
            $sql = "CREATE TABLE $table_name (
                id bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
                thing_id varchar(255) NOT NULL,
                knowledge_id bigint(20) UNSIGNED NOT NULL,
                role varchar(50) DEFAULT NULL,
                metadata longtext DEFAULT NULL,
                created_at datetime DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY  (id),
                KEY thing_id (thing_id(191)),
                KEY knowledge_id (knowledge_id),
                KEY role (role)
            ) $charset_collate;";

            dbDelta($sql);
            $tables_created[] = 'thing_knowledge';
        }

        // Log tables created
        if (!empty($tables_created)) {
            ONE_Platform_Connector::log('Created tables: ' . implode(', ', $tables_created));
        }

        // Store database version
        update_option('one_platform_db_version', ONE_PLATFORM_VERSION);
    }

    /**
     * Create default plugin options
     */
    private static function create_options() {
        $options = array(
            'one_platform_api_enabled' => 'yes',
            'one_platform_sync_enabled' => 'yes',
            'one_platform_log_events' => 'yes',
            'one_platform_woocommerce_sync' => 'yes',
            'one_platform_organization_id' => get_bloginfo('name'),
            'one_platform_api_version' => '1.0',
        );

        foreach ($options as $key => $value) {
            if (get_option($key) === false) {
                add_option($key, $value);
            }
        }

        ONE_Platform_Connector::log('Plugin options created');
    }

    /**
     * Create custom roles and capabilities
     */
    private static function create_roles() {
        // Get the administrator role
        $admin_role = get_role('administrator');

        if ($admin_role) {
            // Add capabilities to administrator
            $admin_role->add_cap('manage_one_platform');
            $admin_role->add_cap('view_one_connections');
            $admin_role->add_cap('edit_one_connections');
            $admin_role->add_cap('view_one_events');
            $admin_role->add_cap('view_one_knowledge');
            $admin_role->add_cap('edit_one_knowledge');
        }

        // Add capabilities to editor
        $editor_role = get_role('editor');
        if ($editor_role) {
            $editor_role->add_cap('view_one_connections');
            $editor_role->add_cap('view_one_events');
            $editor_role->add_cap('view_one_knowledge');
        }

        ONE_Platform_Connector::log('Roles and capabilities created');
    }

    /**
     * Create cron jobs
     */
    private static function create_cron_jobs() {
        if (!wp_next_scheduled('one_platform_sync_events')) {
            wp_schedule_event(time(), 'hourly', 'one_platform_sync_events');
        }

        if (!wp_next_scheduled('one_platform_cleanup')) {
            wp_schedule_event(time(), 'daily', 'one_platform_cleanup');
        }

        ONE_Platform_Connector::log('Cron jobs scheduled');
    }

    /**
     * Remove cron jobs
     */
    private static function remove_cron_jobs() {
        wp_clear_scheduled_hook('one_platform_sync_events');
        wp_clear_scheduled_hook('one_platform_cleanup');
    }

    /**
     * Get table name with prefix
     *
     * @param string $table
     * @return string
     */
    public static function get_table_name($table) {
        global $wpdb;
        return $wpdb->prefix . 'one_' . $table;
    }

    /**
     * Check if all tables exist
     *
     * @return bool
     */
    public static function tables_exist() {
        global $wpdb;

        foreach (self::$tables as $table) {
            $table_name = self::get_table_name($table);
            if ($wpdb->get_var("SHOW TABLES LIKE '$table_name'") != $table_name) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get database statistics
     *
     * @return array
     */
    public static function get_stats() {
        global $wpdb;

        $stats = array();

        foreach (self::$tables as $table) {
            $table_name = self::get_table_name($table);
            $count = $wpdb->get_var("SELECT COUNT(*) FROM $table_name");
            $stats[$table] = intval($count);
        }

        return $stats;
    }

    /**
     * Drop all plugin tables (used on uninstall)
     */
    public static function drop_tables() {
        global $wpdb;

        foreach (self::$tables as $table) {
            $table_name = self::get_table_name($table);
            $wpdb->query("DROP TABLE IF EXISTS $table_name");
        }

        delete_option('one_platform_db_version');

        ONE_Platform_Connector::log('All tables dropped');
    }

    /**
     * Clean old data
     */
    public static function cleanup_old_data() {
        global $wpdb;

        // Delete soft-deleted records older than 30 days
        $connections_table = self::get_table_name('connections');
        $knowledge_table = self::get_table_name('knowledge');

        $wpdb->query("DELETE FROM $connections_table WHERE deleted_at IS NOT NULL AND deleted_at < DATE_SUB(NOW(), INTERVAL 30 DAY)");
        $wpdb->query("DELETE FROM $knowledge_table WHERE deleted_at IS NOT NULL AND deleted_at < DATE_SUB(NOW(), INTERVAL 30 DAY)");

        ONE_Platform_Connector::log('Old data cleaned up');
    }
}
