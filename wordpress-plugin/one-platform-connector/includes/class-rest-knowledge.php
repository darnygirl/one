<?php
/**
 * REST API: Knowledge Endpoints
 */

if (!defined('ABSPATH')) exit;

class ONE_Platform_REST_Knowledge {
    protected $namespace = 'one/v1';
    protected $resource_name = 'knowledge';

    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    public function register_routes() {
        register_rest_route($this->namespace, '/' . $this->resource_name, array(
            array(
                'methods' => 'GET',
                'callback' => array($this, 'get_items'),
                'permission_callback' => '__return_true',
            ),
            array(
                'methods' => 'POST',
                'callback' => array($this, 'create_item'),
                'permission_callback' => array($this, 'create_permissions_check'),
            ),
        ));

        register_rest_route($this->namespace, '/' . $this->resource_name . '/(?P<id>[\d]+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_item'),
            'permission_callback' => '__return_true',
        ));
    }

    public function get_items($request) {
        global $wpdb;
        $table = ONE_Platform_Installer::get_table_name('knowledge');
        
        $knowledge_type = $request->get_param('knowledge_type');
        $source_thing_id = $request->get_param('source_thing_id');
        $per_page = $request->get_param('per_page') ?: 10;
        
        $where = array('deleted_at IS NULL');
        $values = array();
        
        if ($knowledge_type) {
            $where[] = 'knowledge_type = %s';
            $values[] = $knowledge_type;
        }
        if ($source_thing_id) {
            $where[] = 'source_thing_id = %s';
            $values[] = $source_thing_id;
        }
        
        $values[] = $per_page;
        
        $sql = $wpdb->prepare(
            "SELECT * FROM $table WHERE " . implode(' AND ', $where) . " ORDER BY created_at DESC LIMIT %d",
            $values
        );
        
        $results = $wpdb->get_results($sql, ARRAY_A);
        foreach ($results as &$result) {
            if (isset($result['metadata'])) $result['metadata'] = json_decode($result['metadata'], true);
            if (isset($result['labels'])) $result['labels'] = json_decode($result['labels'], true);
            if (isset($result['embedding'])) $result['embedding'] = json_decode($result['embedding'], true);
        }
        
        return rest_ensure_response($results);
    }

    public function get_item($request) {
        global $wpdb;
        $table = ONE_Platform_Installer::get_table_name('knowledge');
        
        $result = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table WHERE id = %d AND deleted_at IS NULL",
            $request['id']
        ), ARRAY_A);
        
        if (!$result) {
            return new WP_Error('not_found', 'Knowledge not found', array('status' => 404));
        }
        
        if (isset($result['metadata'])) $result['metadata'] = json_decode($result['metadata'], true);
        if (isset($result['labels'])) $result['labels'] = json_decode($result['labels'], true);
        if (isset($result['embedding'])) $result['embedding'] = json_decode($result['embedding'], true);
        
        return rest_ensure_response($result);
    }

    public function create_item($request) {
        global $wpdb;
        $table = ONE_Platform_Installer::get_table_name('knowledge');
        
        $data = array(
            'knowledge_type' => $request->get_param('knowledge_type'),
            'text' => $request->get_param('text'),
            'embedding_model' => $request->get_param('embedding_model'),
            'embedding_dim' => $request->get_param('embedding_dim'),
            'source_thing_id' => $request->get_param('source_thing_id'),
            'source_field' => $request->get_param('source_field'),
        );
        
        if ($metadata = $request->get_param('metadata')) {
            $data['metadata'] = json_encode($metadata);
        }
        if ($labels = $request->get_param('labels')) {
            $data['labels'] = json_encode($labels);
        }
        if ($embedding = $request->get_param('embedding')) {
            $data['embedding'] = json_encode($embedding);
        }
        
        $wpdb->insert($table, $data);
        $id = $wpdb->insert_id;
        
        return $this->get_item(new WP_REST_Request('GET', '', array('id' => $id)));
    }

    public function create_permissions_check($request) {
        return current_user_can('edit_posts');
    }
}
