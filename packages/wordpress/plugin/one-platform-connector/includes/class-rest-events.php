<?php
/**
 * REST API: Events Endpoints
 *
 * @package ONE_Platform_Connector
 */

if (!defined('ABSPATH')) exit;

class ONE_Platform_REST_Events {
    protected $namespace = 'one/v1';
    protected $resource_name = 'events';

    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    public function register_routes() {
        register_rest_route($this->namespace, '/' . $this->resource_name, array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_items'),
                'permission_callback' => '__return_true',
            ),
            array(
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => array($this, 'create_item'),
                'permission_callback' => array($this, 'create_permissions_check'),
            ),
        ));

        register_rest_route($this->namespace, '/' . $this->resource_name . '/(?P<id>[\d]+)', array(
            'methods' => WP_REST_Server::READABLE,
            'callback' => array($this, 'get_item'),
            'permission_callback' => '__return_true',
        ));
    }

    public function get_items($request) {
        global $wpdb;
        $table = ONE_Platform_Installer::get_table_name('events');
        
        $type = $request->get_param('type');
        $actor_id = $request->get_param('actor_id');
        $target_id = $request->get_param('target_id');
        $per_page = $request->get_param('per_page') ?: 10;
        $page = $request->get_param('page') ?: 1;
        
        $where = array('1=1');
        $values = array();
        
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
        
        $values[] = $per_page;
        $values[] = ($page - 1) * $per_page;
        
        $sql = $wpdb->prepare(
            "SELECT * FROM $table WHERE " . implode(' AND ', $where) . " ORDER BY timestamp DESC LIMIT %d OFFSET %d",
            $values
        );
        
        $results = $wpdb->get_results($sql, ARRAY_A);
        foreach ($results as &$result) {
            if (isset($result['metadata'])) {
                $result['metadata'] = json_decode($result['metadata'], true);
            }
        }
        
        return rest_ensure_response($results);
    }

    public function get_item($request) {
        global $wpdb;
        $table = ONE_Platform_Installer::get_table_name('events');
        
        $result = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table WHERE id = %d",
            $request['id']
        ), ARRAY_A);
        
        if (!$result) {
            return new WP_Error('not_found', 'Event not found', array('status' => 404));
        }
        
        if (isset($result['metadata'])) {
            $result['metadata'] = json_decode($result['metadata'], true);
        }
        
        return rest_ensure_response($result);
    }

    public function create_item($request) {
        global $wpdb;
        $table = ONE_Platform_Installer::get_table_name('events');
        
        $data = array(
            'type' => $request->get_param('type'),
            'actor_id' => $request->get_param('actor_id'),
            'target_id' => $request->get_param('target_id'),
            'group_id' => $request->get_param('group_id'),
            'timestamp' => current_time('mysql'),
        );
        
        if ($metadata = $request->get_param('metadata')) {
            $data['metadata'] = json_encode($metadata);
        }
        
        $wpdb->insert($table, $data);
        $id = $wpdb->insert_id;
        
        $created = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE id = %d", $id), ARRAY_A);
        if (isset($created['metadata'])) {
            $created['metadata'] = json_decode($created['metadata'], true);
        }
        
        return rest_ensure_response($created);
    }

    public function create_permissions_check($request) {
        return current_user_can('edit_posts');
    }
}
