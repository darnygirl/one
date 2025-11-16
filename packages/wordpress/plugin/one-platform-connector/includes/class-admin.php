<?php
/**
 * Admin Dashboard and Settings
 */

if (!defined('ABSPATH')) exit;

class ONE_Platform_Admin {

    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_assets'));
    }

    public function add_admin_menu() {
        add_menu_page(
            __('ONE Platform', 'one-platform'),
            __('ONE Platform', 'one-platform'),
            'manage_options',
            'one-platform',
            array($this, 'dashboard_page'),
            'dashicons-networking',
            30
        );

        add_submenu_page(
            'one-platform',
            __('Dashboard', 'one-platform'),
            __('Dashboard', 'one-platform'),
            'manage_options',
            'one-platform',
            array($this, 'dashboard_page')
        );

        add_submenu_page(
            'one-platform',
            __('Settings', 'one-platform'),
            __('Settings', 'one-platform'),
            'manage_options',
            'one-platform-settings',
            array($this, 'settings_page')
        );

        add_submenu_page(
            'one-platform',
            __('Connections', 'one-platform'),
            __('Connections', 'one-platform'),
            'view_one_connections',
            'one-platform-connections',
            array($this, 'connections_page')
        );

        add_submenu_page(
            'one-platform',
            __('Events', 'one-platform'),
            __('Events', 'one-platform'),
            'view_one_events',
            'one-platform-events',
            array($this, 'events_page')
        );
    }

    public function register_settings() {
        register_setting('one_platform_settings', 'one_platform_api_enabled');
        register_setting('one_platform_settings', 'one_platform_sync_enabled');
        register_setting('one_platform_settings', 'one_platform_log_events');
        register_setting('one_platform_settings', 'one_platform_woocommerce_sync');
        register_setting('one_platform_settings', 'one_platform_organization_id');
    }

    public function enqueue_admin_assets($hook) {
        if (strpos($hook, 'one-platform') === false) return;
        
        wp_enqueue_style('one-platform-admin', ONE_PLATFORM_PLUGIN_URL . 'assets/css/admin.css', array(), ONE_PLATFORM_VERSION);
        wp_enqueue_script('one-platform-admin', ONE_PLATFORM_PLUGIN_URL . 'assets/js/admin.js', array('jquery'), ONE_PLATFORM_VERSION, true);
    }

    public function dashboard_page() {
        $stats = ONE_Platform_Installer::get_stats();
        $wc_active = class_exists('WooCommerce');
        ?>
        <div class="wrap">
            <h1><?php _e('ONE Platform Dashboard', 'one-platform'); ?></h1>
            
            <div class="one-platform-dashboard">
                <div class="card">
                    <h2><?php _e('Statistics', 'one-platform'); ?></h2>
                    <table class="widefat">
                        <tbody>
                            <tr>
                                <td><strong><?php _e('Connections', 'one-platform'); ?></strong></td>
                                <td><?php echo number_format($stats['connections']); ?></td>
                            </tr>
                            <tr>
                                <td><strong><?php _e('Events', 'one-platform'); ?></strong></td>
                                <td><?php echo number_format($stats['events']); ?></td>
                            </tr>
                            <tr>
                                <td><strong><?php _e('Knowledge Items', 'one-platform'); ?></strong></td>
                                <td><?php echo number_format($stats['knowledge']); ?></td>
                            </tr>
                            <tr>
                                <td><strong><?php _e('Thing-Knowledge Links', 'one-platform'); ?></strong></td>
                                <td><?php echo number_format($stats['thing_knowledge']); ?></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="card">
                    <h2><?php _e('Integration Status', 'one-platform'); ?></h2>
                    <p><strong><?php _e('WordPress:', 'one-platform'); ?></strong> <span class="status-active">Active</span></p>
                    <p><strong><?php _e('WooCommerce:', 'one-platform'); ?></strong> 
                        <?php if ($wc_active): ?>
                            <span class="status-active">Active</span>
                        <?php else: ?>
                            <span class="status-inactive">Not Installed</span>
                        <?php endif; ?>
                    </p>
                </div>

                <div class="card">
                    <h2><?php _e('REST API Endpoints', 'one-platform'); ?></h2>
                    <ul>
                        <li><code>GET /wp-json/one/v1/connections</code></li>
                        <li><code>POST /wp-json/one/v1/connections</code></li>
                        <li><code>GET /wp-json/one/v1/events</code></li>
                        <li><code>POST /wp-json/one/v1/events</code></li>
                        <li><code>GET /wp-json/one/v1/knowledge</code></li>
                        <li><code>POST /wp-json/one/v1/knowledge</code></li>
                    </ul>
                </div>
            </div>
        </div>
        <?php
    }

    public function settings_page() {
        ?>
        <div class="wrap">
            <h1><?php _e('ONE Platform Settings', 'one-platform'); ?></h1>
            
            <form method="post" action="options.php">
                <?php settings_fields('one_platform_settings'); ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php _e('Enable API', 'one-platform'); ?></th>
                        <td>
                            <input type="checkbox" name="one_platform_api_enabled" value="yes" <?php checked(get_option('one_platform_api_enabled'), 'yes'); ?>>
                            <p class="description"><?php _e('Enable REST API endpoints', 'one-platform'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php _e('Enable Sync', 'one-platform'); ?></th>
                        <td>
                            <input type="checkbox" name="one_platform_sync_enabled" value="yes" <?php checked(get_option('one_platform_sync_enabled'), 'yes'); ?>>
                            <p class="description"><?php _e('Automatically sync data to ONE Platform', 'one-platform'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php _e('Log Events', 'one-platform'); ?></th>
                        <td>
                            <input type="checkbox" name="one_platform_log_events" value="yes" <?php checked(get_option('one_platform_log_events'), 'yes'); ?>>
                            <p class="description"><?php _e('Log WordPress and WooCommerce events', 'one-platform'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php _e('WooCommerce Sync', 'one-platform'); ?></th>
                        <td>
                            <input type="checkbox" name="one_platform_woocommerce_sync" value="yes" <?php checked(get_option('one_platform_woocommerce_sync'), 'yes'); ?> <?php disabled(!class_exists('WooCommerce')); ?>>
                            <p class="description"><?php _e('Sync WooCommerce products, orders, and customers', 'one-platform'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php _e('Organization ID', 'one-platform'); ?></th>
                        <td>
                            <input type="text" name="one_platform_organization_id" value="<?php echo esc_attr(get_option('one_platform_organization_id')); ?>" class="regular-text">
                            <p class="description"><?php _e('Unique identifier for this WordPress installation', 'one-platform'); ?></p>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }

    public function connections_page() {
        global $wpdb;
        $table = ONE_Platform_Installer::get_table_name('connections');
        $connections = $wpdb->get_results("SELECT * FROM $table WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 100", ARRAY_A);
        ?>
        <div class="wrap">
            <h1><?php _e('Connections', 'one-platform'); ?></h1>
            
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>From</th>
                        <th>Relationship</th>
                        <th>To</th>
                        <th>Created</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($connections as $conn): ?>
                    <tr>
                        <td><?php echo $conn['id']; ?></td>
                        <td><?php echo esc_html($conn['from_thing_id']); ?></td>
                        <td><strong><?php echo esc_html($conn['relationship_type']); ?></strong></td>
                        <td><?php echo esc_html($conn['to_thing_id']); ?></td>
                        <td><?php echo esc_html($conn['created_at']); ?></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        <?php
    }

    public function events_page() {
        global $wpdb;
        $table = ONE_Platform_Installer::get_table_name('events');
        $events = $wpdb->get_results("SELECT * FROM $table ORDER BY timestamp DESC LIMIT 100", ARRAY_A);
        ?>
        <div class="wrap">
            <h1><?php _e('Events', 'one-platform'); ?></h1>
            
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Actor</th>
                        <th>Target</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($events as $event): ?>
                    <tr>
                        <td><?php echo $event['id']; ?></td>
                        <td><strong><?php echo esc_html($event['type']); ?></strong></td>
                        <td><?php echo esc_html($event['actor_id']); ?></td>
                        <td><?php echo esc_html($event['target_id']); ?></td>
                        <td><?php echo esc_html($event['timestamp']); ?></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        <?php
    }
}
