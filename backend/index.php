<?php
/**
 * Health check. Open this URL in a browser right after uploading to Freehostia
 * to confirm PHP runs, the database credentials work, and the table exists.
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';

bootstrap();

$status = array(
    'success'  => true,
    'name'     => 'Soccer Player Manager API',
    'version'  => '1.0',
    'php'      => PHP_VERSION,
    'time'     => date('c'),
    'database' => array('connected' => false, 'table' => false, 'players' => null),
    'endpoints' => array(
        'GET    players.php'        => 'List players (optional ?search=)',
        'GET    players.php?id=1'   => 'Fetch one player',
        'POST   players.php'        => 'Create a player',
        'PUT    players.php?id=1'   => 'Update a player',
        'DELETE players.php?id=1'   => 'Delete a player',
    ),
);

try {
    $pdo = db();
    $status['database']['connected'] = true;

    $count = $pdo->query('SELECT COUNT(*) FROM players')->fetchColumn();
    $status['database']['table']   = true;
    $status['database']['players'] = (int) $count;
} catch (PDOException $e) {
    $status['success'] = false;
    $status['database']['error'] = DEBUG
        ? $e->getMessage()
        : 'Database not reachable, or the players table has not been imported yet.';
}

send_json($status['success'] ? 200 : 500, $status);
