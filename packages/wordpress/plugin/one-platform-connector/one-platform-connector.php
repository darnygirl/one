<?php
/**
 * Plugin Name: ONE Platform Connector
 * Plugin URI: https://one.ie
 * Description: Connects WordPress and WooCommerce to the ONE Platform with complete 6-dimension ontology support including connections, events, knowledge, and real-time synchronization.
 * Version: 1.0.0
 * Requires at least: 5.9
 * Requires PHP: 7.4
 * Author: ONE Platform
 * Author URI: https://one.ie
 * License: MIT
 * License URI: https://opensource.org/licenses/MIT
 * Text Domain: one-platform
 * Domain Path: /languages
 * WC requires at least: 5.0
 * WC tested up to: 8.5
 *
 * @package ONE_Platform_Connector
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Define plugin constants
define('ONE_PLATFORM_VERSION', '1.0.0');
define('ONE_PLATFORM_PLUGIN_FILE', __FILE__);
define('ONE_PLATFORM_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('ONE_PLATFORM_PLUGIN_URL', plugin_dir_url(__FILE__));
define('ONE_PLATFORM_PLUGIN_BASENAME', plugin_basename(__FILE__));

/**
 * Main ONE Platform Connector Class
 *
 * @class ONE_Platform_Connector
 * @version 1.0.0
 */
final class ONE_Platform_Connector {

    /**
     * The single instance of the class
     *
     * @var ONE_Platform_Connector
     */
    protected static $_instance = null;

    /**
     * Main ONE_Platform_Connector Instance
     *
     * Ensures only one instance of ONE_Platform_Connector is loaded or can be loaded.
     *
     * @static
     * @return ONE_Platform_Connector - Main instance
     */
    public static function instance() {
        if (is_null(self::$_instance)) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    /**
     * Constructor
     */
    public function __construct() {
        $this->includes();
        $this->init_hooks();

        do_action('one_platform_loaded');
    }

    /**
     * Include required core files
     */
    private function includes() {
        // Core includes
        require_once ONE_PLATFORM_PLUGIN_DIR . 'includes/class-installer.php';
        require_once ONE_PLATFORM_PLUGIN_DIR . 'includes/class-rest-connections.php';
        require_once ONE_PLATFORM_PLUGIN_DIR . 'includes/class-rest-events.php';
        require_once ONE_PLATFORM_PLUGIN_DIR . 'includes/class-rest-knowledge.php';
        require_once ONE_PLATFORM_PLUGIN_DIR . 'includes/class-wordpress-hooks.php';
        require_once ONE_PLATFORM_PLUGIN_DIR . 'includes/class-admin.php';

        // WooCommerce integration
        if (class_exists('WooCommerce')) {
            require_once ONE_PLATFORM_PLUGIN_DIR . 'includes/class-woocommerce-integration.php';
        }
    }

    /**
     * Hook into actions and filters
     */
    private function init_hooks() {
        // Activation and deactivation hooks
        register_activation_hook(__FILE__, array('ONE_Platform_Installer', 'activate'));
        register_deactivation_hook(__FILE__, array('ONE_Platform_Installer', 'deactivate'));

        // Initialize plugin
        add_action('init', array($this, 'init'), 0);
        add_action('plugins_loaded', array($this, 'on_plugins_loaded'), -1);

        // REST API initialization
        add_action('rest_api_init', array($this, 'init_rest_api'));

        // Admin initialization
        if (is_admin()) {
            new ONE_Platform_Admin();
        }
    }

    /**
     * Init when WordPress Initializes
     */
    public function init() {
        // Before init action
        do_action('before_one_platform_init');

        // Set up localization
        $this->load_plugin_textdomain();

        // Initialize WordPress hooks
        new ONE_Platform_WordPress_Hooks();

        // Initialize WooCommerce integration if available
        if (class_exists('WooCommerce')) {
            new ONE_Platform_WooCommerce_Integration();
        }

        // Init action
        do_action('one_platform_init');
    }

    /**
     * When WordPress has loaded all plugins
     */
    public function on_plugins_loaded() {
        do_action('one_platform_plugins_loaded');
    }

    /**
     * Initialize REST API
     */
    public function init_rest_api() {
        new ONE_Platform_REST_Connections();
        new ONE_Platform_REST_Events();
        new ONE_Platform_REST_Knowledge();
    }

    /**
     * Load Localization files
     */
    public function load_plugin_textdomain() {
        load_plugin_textdomain('one-platform', false, dirname(plugin_basename(__FILE__)) . '/languages');
    }

    /**
     * Get the plugin url
     *
     * @return string
     */
    public function plugin_url() {
        return untrailingslashit(plugins_url('/', __FILE__));
    }

    /**
     * Get the plugin path
     *
     * @return string
     */
    public function plugin_path() {
        return untrailingslashit(plugin_dir_path(__FILE__));
    }

    /**
     * Get Ajax URL
     *
     * @return string
     */
    public function ajax_url() {
        return admin_url('admin-ajax.php', 'relative');
    }

    /**
     * Log a message
     *
     * @param string $message
     * @param string $level
     */
    public static function log($message, $level = 'info') {
        if (WP_DEBUG === true) {
            if (is_array($message) || is_object($message)) {
                error_log('[ONE Platform ' . strtoupper($level) . '] ' . print_r($message, true));
            } else {
                error_log('[ONE Platform ' . strtoupper($level) . '] ' . $message);
            }
        }
    }
}

/**
 * Main instance of ONE_Platform_Connector
 *
 * Returns the main instance of ONE_Platform_Connector to prevent the need to use globals.
 *
 * @return ONE_Platform_Connector
 */
function ONE_Platform() {
    return ONE_Platform_Connector::instance();
}

// Initialize the plugin
ONE_Platform();
