<?php
/**
 * Uninstall Script
 *
 * @package ONE_Platform_Connector
 */

if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Load plugin files
require_once plugin_dir_path(__FILE__) . 'includes/class-installer.php';

// Drop all tables
ONE_Platform_Installer::drop_tables();

// Delete all options
delete_option('one_platform_api_enabled');
delete_option('one_platform_sync_enabled');
delete_option('one_platform_log_events');
delete_option('one_platform_woocommerce_sync');
delete_option('one_platform_organization_id');
delete_option('one_platform_api_version');
delete_option('one_platform_db_version');

// Clear any cached data
wp_cache_flush();

// Log uninstallation
error_log('[ONE Platform] Plugin uninstalled and all data removed');
