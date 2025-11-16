<?php
/**
 * REST API: Connections Endpoints
 *
 * @package ONE_Platform_Connector
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * ONE_Platform_REST_Connections Class
 */
class ONE_Platform_REST_Connections {

    /**
     * Namespace
     *
     * @var string
     */
    protected $namespace = 'one/v1';

    /**
     * Resource name
     *
     * @var string
     */
    protected $resource_name = 'connections';

    /**
     * Constructor
     */
    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    /**
     * Register REST API routes
     */
    public function register_routes() {
        // List connections
        register_rest_route($this->namespace, '/' . $this->resource_name, array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_items'),
                'permission_callback' => array($this, 'get_items_permissions_check'),
                'args' => $this->get_collection_params(),
            ),
            array(
                'methods' => WP_REST_Server::CREATABLE,
                'callback' => array($this, 'create_item'),
                'permission_callback' => array($this, 'create_item_permissions_check'),
                'args' => $this->get_endpoint_args_for_item_schema(WP_REST_Server::CREATABLE),
            ),
        ));

        // Get single connection
        register_rest_route($this->namespace, '/' . $this->resource_name . '/(?P<id>[\d]+)', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_item'),
                'permission_callback' => array($this, 'get_item_permissions_check'),
                'args' => array(
                    'id' => array(
                        'description' => __('Unique identifier for the connection.', 'one-platform'),
                        'type' => 'integer',
                    ),
                ),
            ),
            array(
                'methods' => WP_REST_Server::EDITABLE,
                'callback' => array($this, 'update_item'),
                'permission_callback' => array($this, 'update_item_permissions_check'),
                'args' => $this->get_endpoint_args_for_item_schema(WP_REST_Server::EDITABLE),
            ),
            array(
                'methods' => WP_REST_Server::DELETABLE,
                'callback' => array($this, 'delete_item'),
                'permission_callback' => array($this, 'delete_item_permissions_check'),
            ),
        ));

        // Get related things
        register_rest_route($this->namespace, '/' . $this->resource_name . '/related', array(
            array(
                'methods' => WP_REST_Server::READABLE,
                'callback' => array($this, 'get_related_items'),
                'permission_callback' => array($this, 'get_items_permissions_check'),
                'args' => array(
                    'thing_id' => array(
                        'required' => true,
                        'type' => 'string',
                    ),
                    'relationship_type' => array(
                        'type' => 'string',
                    ),
                    'direction' => array(
                        'type' => 'string',
                        'enum' => array('from', 'to', 'both'),
                        'default' => 'both',
                    ),
                ),
            ),
        ));
    }

    /**
     * Get connections list
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public function get_items($request) {
        global $wpdb;
        $table_name = ONE_Platform_Installer::get_table_name('connections');

        $from_thing_id = $request->get_param('from_thing_id');
        $to_thing_id = $request->get_param('to_thing_id');
        $relationship_type = $request->get_param('relationship_type');
        $group_id = $request->get_param('group_id');
        $per_page = $request->get_param('per_page') ?: 10;
        $page = $request->get_param('page') ?: 1;
        $offset = ($page - 1) * $per_page;

        $where = array('deleted_at IS NULL');
        $values = array();

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

        if ($group_id) {
            $where[] = 'group_id = %s';
            $values[] = $group_id;
        }

        $where_clause = implode(' AND ', $where);
        $values[] = $per_page;
        $values[] = $offset;

        $sql = $wpdb->prepare(
            "SELECT * FROM $table_name WHERE $where_clause ORDER BY created_at DESC LIMIT %d OFFSET %d",
            $values
        );

        $results = $wpdb->get_results($sql, ARRAY_A);

        // Parse JSON metadata
        foreach ($results as &$result) {
            if (isset($result['metadata'])) {
                $result['metadata'] = json_decode($result['metadata'], true);
            }
        }

        // Get total count for pagination
        $count_sql = $wpdb->prepare(
            "SELECT COUNT(*) FROM $table_name WHERE $where_clause",
            array_slice($values, 0, -2)
        );
        $total = $wpdb->get_var($count_sql);

        $response = rest_ensure_response($results);
        $response->header('X-WP-Total', $total);
        $response->header('X-WP-TotalPages', ceil($total / $per_page));

        return $response;
    }

    /**
     * Get single connection
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public function get_item($request) {
        global $wpdb;
        $table_name = ONE_Platform_Installer::get_table_name('connections');
        $id = $request['id'];

        $result = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table_name WHERE id = %d AND deleted_at IS NULL",
            $id
        ), ARRAY_A);

        if (!$result) {
            return new WP_Error(
                'not_found',
                __('Connection not found.', 'one-platform'),
                array('status' => 404)
            );
        }

        // Parse JSON metadata
        if (isset($result['metadata'])) {
            $result['metadata'] = json_decode($result['metadata'], true);
        }

        return rest_ensure_response($result);
    }

    /**
     * Create connection
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public function create_item($request) {
        global $wpdb;
        $table_name = ONE_Platform_Installer::get_table_name('connections');

        $data = array(
            'from_thing_id' => $request->get_param('from_thing_id'),
            'to_thing_id' => $request->get_param('to_thing_id'),
            'relationship_type' => $request->get_param('relationship_type'),
            'strength' => $request->get_param('strength') ?: 1.0,
            'valid_from' => $request->get_param('valid_from'),
            'valid_to' => $request->get_param('valid_to'),
            'group_id' => $request->get_param('group_id'),
        );

        // Handle metadata
        $metadata = $request->get_param('metadata');
        if ($metadata) {
            $data['metadata'] = json_encode($metadata);
        }

        $result = $wpdb->insert($table_name, $data);

        if ($result === false) {
            return new WP_Error(
                'create_failed',
                __('Failed to create connection.', 'one-platform'),
                array('status' => 500)
            );
        }

        $id = $wpdb->insert_id;

        // Log event
        $this->log_connection_event('connection_created', $id, $data);

        // Get created item
        $created = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table_name WHERE id = %d",
            $id
        ), ARRAY_A);

        if (isset($created['metadata'])) {
            $created['metadata'] = json_decode($created['metadata'], true);
        }

        return rest_ensure_response($created);
    }

    /**
     * Update connection
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public function update_item($request) {
        global $wpdb;
        $table_name = ONE_Platform_Installer::get_table_name('connections');
        $id = $request['id'];

        $data = array();

        if ($request->has_param('strength')) {
            $data['strength'] = $request->get_param('strength');
        }

        if ($request->has_param('metadata')) {
            $data['metadata'] = json_encode($request->get_param('metadata'));
        }

        if ($request->has_param('valid_from')) {
            $data['valid_from'] = $request->get_param('valid_from');
        }

        if ($request->has_param('valid_to')) {
            $data['valid_to'] = $request->get_param('valid_to');
        }

        if (empty($data)) {
            return new WP_Error(
                'no_data',
                __('No data to update.', 'one-platform'),
                array('status' => 400)
            );
        }

        $result = $wpdb->update($table_name, $data, array('id' => $id));

        if ($result === false) {
            return new WP_Error(
                'update_failed',
                __('Failed to update connection.', 'one-platform'),
                array('status' => 500)
            );
        }

        // Log event
        $this->log_connection_event('connection_updated', $id, $data);

        return $this->get_item($request);
    }

    /**
     * Delete connection (soft delete)
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public function delete_item($request) {
        global $wpdb;
        $table_name = ONE_Platform_Installer::get_table_name('connections');
        $id = $request['id'];

        // Soft delete
        $result = $wpdb->update(
            $table_name,
            array('deleted_at' => current_time('mysql')),
            array('id' => $id)
        );

        if ($result === false) {
            return new WP_Error(
                'delete_failed',
                __('Failed to delete connection.', 'one-platform'),
                array('status' => 500)
            );
        }

        // Log event
        $this->log_connection_event('connection_deleted', $id, array());

        return rest_ensure_response(array('success' => true, 'id' => $id));
    }

    /**
     * Get related items
     *
     * @param WP_REST_Request $request
     * @return WP_REST_Response|WP_Error
     */
    public function get_related_items($request) {
        global $wpdb;
        $table_name = ONE_Platform_Installer::get_table_name('connections');

        $thing_id = $request->get_param('thing_id');
        $relationship_type = $request->get_param('relationship_type');
        $direction = $request->get_param('direction') ?: 'both';

        $where = array('deleted_at IS NULL');
        $values = array();

        if ($direction === 'from' || $direction === 'both') {
            $where[] = 'from_thing_id = %s';
            $values[] = $thing_id;
        }

        if ($direction === 'to' || $direction === 'both') {
            if ($direction === 'both') {
                $where[count($where) - 1] = '(from_thing_id = %s OR to_thing_id = %s)';
                $values[] = $thing_id;
            } else {
                $where[] = 'to_thing_id = %s';
                $values[] = $thing_id;
            }
        }

        if ($relationship_type) {
            $where[] = 'relationship_type = %s';
            $values[] = $relationship_type;
        }

        $where_clause = implode(' AND ', $where);

        $sql = $wpdb->prepare(
            "SELECT * FROM $table_name WHERE $where_clause ORDER BY created_at DESC",
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

    /**
     * Log connection event
     *
     * @param string $event_type
     * @param int $connection_id
     * @param array $data
     */
    private function log_connection_event($event_type, $connection_id, $data) {
        if (get_option('one_platform_log_events') !== 'yes') {
            return;
        }

        global $wpdb;
        $events_table = ONE_Platform_Installer::get_table_name('events');

        $wpdb->insert($events_table, array(
            'type' => $event_type,
            'actor_id' => 'user_' . get_current_user_id(),
            'target_id' => 'connection_' . $connection_id,
            'metadata' => json_encode($data),
        ));
    }

    /**
     * Permission checks
     */
    public function get_items_permissions_check($request) {
        return current_user_can('read');
    }

    public function get_item_permissions_check($request) {
        return current_user_can('read');
    }

    public function create_item_permissions_check($request) {
        return current_user_can('edit_posts');
    }

    public function update_item_permissions_check($request) {
        return current_user_can('edit_posts');
    }

    public function delete_item_permissions_check($request) {
        return current_user_can('delete_posts');
    }

    /**
     * Get collection parameters
     *
     * @return array
     */
    public function get_collection_params() {
        return array(
            'from_thing_id' => array(
                'type' => 'string',
            ),
            'to_thing_id' => array(
                'type' => 'string',
            ),
            'relationship_type' => array(
                'type' => 'string',
            ),
            'group_id' => array(
                'type' => 'string',
            ),
            'page' => array(
                'type' => 'integer',
                'default' => 1,
            ),
            'per_page' => array(
                'type' => 'integer',
                'default' => 10,
            ),
        );
    }

    /**
     * Get endpoint args for item schema
     *
     * @param string $method
     * @return array
     */
    public function get_endpoint_args_for_item_schema($method = WP_REST_Server::CREATABLE) {
        $args = array();

        if ($method === WP_REST_Server::CREATABLE) {
            $args['from_thing_id'] = array(
                'required' => true,
                'type' => 'string',
            );
            $args['to_thing_id'] = array(
                'required' => true,
                'type' => 'string',
            );
            $args['relationship_type'] = array(
                'required' => true,
                'type' => 'string',
            );
        }

        $args['metadata'] = array(
            'type' => 'object',
        );
        $args['strength'] = array(
            'type' => 'number',
            'minimum' => 0,
            'maximum' => 1,
        );
        $args['valid_from'] = array(
            'type' => 'integer',
        );
        $args['valid_to'] = array(
            'type' => 'integer',
        );
        $args['group_id'] = array(
            'type' => 'string',
        );

        return $args;
    }
}
