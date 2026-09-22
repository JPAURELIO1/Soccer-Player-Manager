<?php
require_once __DIR__ . '/config.php';

/**
 * Returns a shared PDO connection, or sends a 500 JSON error and exits.
 */
function db() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, array(
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ));
    } catch (PDOException $e) {
        $detail = DEBUG ? $e->getMessage() : 'Check config.php credentials.';
        send_json(500, array(
            'success' => false,
            'message' => 'Database connection failed.',
            'error'   => $detail,
        ));
    }
    return $pdo;
}
