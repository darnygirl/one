<?php
/**
 * WooCommerce Integration
 *
 * @package ONE_Platform_Connector
 */

if (!defined('ABSPATH')) exit;

class ONE_Platform_WooCommerce_Integration {

    public function __construct() {
        // Product events
        add_action('woocommerce_new_product', array($this, 'product_created'), 10, 1);
        add_action('woocommerce_update_product', array($this, 'product_updated'), 10, 1);
        add_action('woocommerce_delete_product', array($this, 'product_deleted'), 10, 1);
        
        // Order events
        add_action('woocommerce_new_order', array($this, 'order_created'), 10, 1);
        add_action('woocommerce_order_status_changed', array($this, 'order_status_changed'), 10, 4);
        add_action('woocommerce_payment_complete', array($this, 'payment_completed'), 10, 1);
        
        // Customer events
        add_action('woocommerce_created_customer', array($this, 'customer_created'), 10, 1);
        
        // Cart/Purchase connections
        add_action('woocommerce_add_to_cart', array($this, 'added_to_cart'), 10, 6);
        add_action('woocommerce_order_status_completed', array($this, 'purchase_completed'), 10, 1);
    }

    /**
     * Product created event
     */
    public function product_created($product_id) {
        $product = wc_get_product($product_id);
        if (!$product) return;
        
        $this->log_event('product_created', array(
            'actor_id' => 'user_' . get_current_user_id(),
            'target_id' => 'wc_product_' . $product_id,
            'metadata' => array(
                'product_name' => $product->get_name(),
                'product_type' => $product->get_type(),
                'price' => $product->get_price(),
                'sku' => $product->get_sku(),
            ),
        ));
    }

    /**
     * Product updated event
     */
    public function product_updated($product_id) {
        $product = wc_get_product($product_id);
        if (!$product) return;
        
        $this->log_event('product_updated', array(
            'actor_id' => 'user_' . get_current_user_id(),
            'target_id' => 'wc_product_' . $product_id,
            'metadata' => array(
                'product_name' => $product->get_name(),
                'price' => $product->get_price(),
            ),
        ));
    }

    /**
     * Product deleted event
     */
    public function product_deleted($product_id) {
        $this->log_event('product_deleted', array(
            'actor_id' => 'user_' . get_current_user_id(),
            'target_id' => 'wc_product_' . $product_id,
        ));
    }

    /**
     * Order created event
     */
    public function order_created($order_id) {
        $order = wc_get_order($order_id);
        if (!$order) return;
        
        $this->log_event('order_created', array(
            'actor_id' => 'wc_customer_' . $order->get_customer_id(),
            'target_id' => 'wc_order_' . $order_id,
            'metadata' => array(
                'order_number' => $order->get_order_number(),
                'total' => $order->get_total(),
                'currency' => $order->get_currency(),
                'status' => $order->get_status(),
                'item_count' => $order->get_item_count(),
            ),
        ));
    }

    /**
     * Order status changed event
     */
    public function order_status_changed($order_id, $old_status, $new_status, $order) {
        $this->log_event('order_status_changed', array(
            'actor_id' => 'system',
            'target_id' => 'wc_order_' . $order_id,
            'metadata' => array(
                'old_status' => $old_status,
                'new_status' => $new_status,
                'total' => $order->get_total(),
            ),
        ));
    }

    /**
     * Payment completed event
     */
    public function payment_completed($order_id) {
        $order = wc_get_order($order_id);
        if (!$order) return;
        
        $this->log_event('payment_completed', array(
            'actor_id' => 'wc_customer_' . $order->get_customer_id(),
            'target_id' => 'wc_order_' . $order_id,
            'metadata' => array(
                'amount' => $order->get_total(),
                'payment_method' => $order->get_payment_method(),
                'transaction_id' => $order->get_transaction_id(),
            ),
        ));
    }

    /**
     * Customer created event
     */
    public function customer_created($customer_id) {
        $customer = new WC_Customer($customer_id);
        
        $this->log_event('customer_created', array(
            'actor_id' => 'system',
            'target_id' => 'wc_customer_' . $customer_id,
            'metadata' => array(
                'email' => $customer->get_email(),
                'first_name' => $customer->get_first_name(),
                'last_name' => $customer->get_last_name(),
            ),
        ));
    }

    /**
     * Added to cart (create connection)
     */
    public function added_to_cart($cart_item_key, $product_id, $quantity, $variation_id, $variation, $cart_item_data) {
        $customer_id = get_current_user_id();
        
        if ($customer_id) {
            $this->create_connection(array(
                'from_thing_id' => 'wc_customer_' . $customer_id,
                'to_thing_id' => 'wc_product_' . $product_id,
                'relationship_type' => 'added_to_cart',
                'metadata' => array(
                    'quantity' => $quantity,
                    'variation_id' => $variation_id,
                ),
            ));
        }
    }

    /**
     * Purchase completed (create purchase connection)
     */
    public function purchase_completed($order_id) {
        $order = wc_get_order($order_id);
        if (!$order) return;
        
        $customer_id = $order->get_customer_id();
        
        foreach ($order->get_items() as $item) {
            $product_id = $item->get_product_id();
            
            $this->create_connection(array(
                'from_thing_id' => 'wc_customer_' . $customer_id,
                'to_thing_id' => 'wc_product_' . $product_id,
                'relationship_type' => 'purchased',
                'metadata' => array(
                    'order_id' => $order_id,
                    'quantity' => $item->get_quantity(),
                    'total' => $item->get_total(),
                    'date' => $order->get_date_completed()->format('Y-m-d H:i:s'),
                ),
            ));
        }
    }

    /**
     * Log event helper
     */
    private function log_event($type, $data) {
        if (get_option('one_platform_log_events') !== 'yes') return;
        
        global $wpdb;
        $table = ONE_Platform_Installer::get_table_name('events');
        
        $wpdb->insert($table, array(
            'type' => $type,
            'actor_id' => $data['actor_id'],
            'target_id' => $data['target_id'],
            'metadata' => json_encode($data['metadata'] ?? array()),
        ));
    }

    /**
     * Create connection helper
     */
    private function create_connection($data) {
        global $wpdb;
        $table = ONE_Platform_Installer::get_table_name('connections');
        
        $wpdb->insert($table, array(
            'from_thing_id' => $data['from_thing_id'],
            'to_thing_id' => $data['to_thing_id'],
            'relationship_type' => $data['relationship_type'],
            'metadata' => json_encode($data['metadata'] ?? array()),
        ));
    }
}
