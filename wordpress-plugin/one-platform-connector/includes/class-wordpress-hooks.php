<?php
/**
 * WordPress Hooks Integration
 */

if (!defined('ABSPATH')) exit;

class ONE_Platform_WordPress_Hooks {

    public function __construct() {
        // Post events
        add_action('publish_post', array($this, 'post_published'), 10, 2);
        add_action('post_updated', array($this, 'post_updated'), 10, 3);
        add_action('before_delete_post', array($this, 'post_deleted'), 10, 2);
        
        // Comment events
        add_action('comment_post', array($this, 'comment_added'), 10, 3);
        
        // User events
        add_action('user_register', array($this, 'user_registered'), 10, 1);
        add_action('wp_login', array($this, 'user_logged_in'), 10, 2);
        
        // Taxonomy (categories/tags) connections
        add_action('set_object_terms', array($this, 'terms_set'), 10, 6);
    }

    public function post_published($post_id, $post) {
        $this->log_event('post_published', array(
            'actor_id' => 'user_' . $post->post_author,
            'target_id' => 'wp_post_' . $post_id,
            'metadata' => array(
                'title' => $post->post_title,
                'type' => $post->post_type,
                'status' => $post->post_status,
            ),
        ));
    }

    public function post_updated($post_id, $post_after, $post_before) {
        if ($post_after->post_status === 'auto-draft') return;
        
        $this->log_event('post_updated', array(
            'actor_id' => 'user_' . get_current_user_id(),
            'target_id' => 'wp_post_' . $post_id,
            'metadata' => array(
                'title' => $post_after->post_title,
            ),
        ));
    }

    public function post_deleted($post_id, $post) {
        $this->log_event('post_deleted', array(
            'actor_id' => 'user_' . get_current_user_id(),
            'target_id' => 'wp_post_' . $post_id,
        ));
    }

    public function comment_added($comment_id, $approved, $commentdata) {
        $this->log_event('comment_added', array(
            'actor_id' => 'user_' . $commentdata['user_id'],
            'target_id' => 'wp_post_' . $commentdata['comment_post_ID'],
            'metadata' => array(
                'comment_id' => $comment_id,
                'approved' => $approved,
            ),
        ));
    }

    public function user_registered($user_id) {
        $user = get_user_by('id', $user_id);
        
        $this->log_event('user_registered', array(
            'actor_id' => 'system',
            'target_id' => 'wp_user_' . $user_id,
            'metadata' => array(
                'email' => $user->user_email,
                'username' => $user->user_login,
            ),
        ));
    }

    public function user_logged_in($user_login, $user) {
        $this->log_event('user_logged_in', array(
            'actor_id' => 'wp_user_' . $user->ID,
            'target_id' => 'wp_user_' . $user->ID,
            'metadata' => array(
                'username' => $user_login,
            ),
        ));
    }

    public function terms_set($object_id, $terms, $tt_ids, $taxonomy, $append, $old_tt_ids) {
        if ($taxonomy !== 'post_tag' && $taxonomy !== 'category') return;
        
        foreach ($tt_ids as $term_id) {
            $term = get_term($term_id, $taxonomy);
            if (!$term) continue;
            
            $this->create_connection(array(
                'from_thing_id' => 'wp_post_' . $object_id,
                'to_thing_id' => 'wp_term_' . $term_id,
                'relationship_type' => $taxonomy === 'post_tag' ? 'tagged_with' : 'categorized_as',
                'metadata' => array(
                    'term_name' => $term->name,
                    'taxonomy' => $taxonomy,
                ),
            ));
        }
    }

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

    private function create_connection($data) {
        global $wpdb;
        $table = ONE_Platform_Installer::get_table_name('connections');
        
        // Check if connection already exists
        $exists = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM $table WHERE from_thing_id = %s AND to_thing_id = %s AND relationship_type = %s AND deleted_at IS NULL",
            $data['from_thing_id'],
            $data['to_thing_id'],
            $data['relationship_type']
        ));
        
        if ($exists) return;
        
        $wpdb->insert($table, array(
            'from_thing_id' => $data['from_thing_id'],
            'to_thing_id' => $data['to_thing_id'],
            'relationship_type' => $data['relationship_type'],
            'metadata' => json_encode($data['metadata'] ?? array()),
        ));
    }
}
