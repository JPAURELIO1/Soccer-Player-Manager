<?php
/**
 * Shared request/response helpers. Included by every endpoint.
 */

/** Emits CORS headers. Expo Go on web + Postman both need these. */
function send_cors_headers() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With');
    header('Access-Control-Max-Age: 86400');
}

/** Sends a JSON response and stops. */
function send_json($status, $payload) {
    if (!headers_sent()) {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
    }
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function send_error($status, $message, $errors = null) {
    $body = array('success' => false, 'message' => $message);
    if ($errors !== null) {
        $body['errors'] = $errors;
    }
    send_json($status, $body);
}

/**
 * Reads the request body as an associative array.
 * Accepts JSON (what the app sends) and form-encoded bodies (handy in Postman).
 */
function read_body() {
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return array();
    }

    $decoded = json_decode($raw, true);
    if (is_array($decoded)) {
        return $decoded;
    }

    // Fall back to x-www-form-urlencoded, including for PUT where PHP
    // does not populate $_POST for us.
    $parsed = array();
    parse_str($raw, $parsed);
    return is_array($parsed) ? $parsed : array();
}

/** Bootstraps every endpoint: CORS, preflight, and error visibility. */
function bootstrap() {
    send_cors_headers();

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }

    if (DEBUG) {
        ini_set('display_errors', '0');   // never leak HTML into a JSON body
        error_reporting(E_ALL);
    }
}
