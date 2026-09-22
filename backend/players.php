<?php
/**
 * Players REST endpoint  —  the whole CRUD surface of the app.
 *
 *   GET    players.php            list every player (optional ?search=messi)
 *   GET    players.php?id=1       fetch one player
 *   POST   players.php            create a player   (JSON body)
 *   PUT    players.php?id=1       update a player   (JSON body)
 *   DELETE players.php?id=1       delete a player
 *
 * With the bundled .htaccess these also work as /api/players and /api/players/1.
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/validation.php';

bootstrap();

/** Columns returned to clients, in a stable order. */
const PLAYER_COLUMNS = 'id, full_name, age, jersey_number, nationality, team,
                        position, preferred_foot, height, photo, description,
                        created_at, updated_at';

/** Casts numeric columns so JSON carries real numbers, not strings. */
function shape_player($row) {
    if (!$row) {
        return null;
    }
    $row['id']            = (int) $row['id'];
    $row['age']           = (int) $row['age'];
    $row['jersey_number'] = (int) $row['jersey_number'];
    $row['height']        = (float) $row['height'];
    return $row;
}

/** Reads ?id= from the query string, or null when absent. */
function requested_id() {
    if (!isset($_GET['id']) || trim((string) $_GET['id']) === '') {
        return null;
    }
    $id = trim((string) $_GET['id']);
    if (!ctype_digit($id) || (int) $id < 1) {
        send_error(400, 'Player id must be a positive whole number.');
    }
    return (int) $id;
}

function find_player($id) {
    $stmt = db()->prepare('SELECT ' . PLAYER_COLUMNS . ' FROM players WHERE id = ?');
    $stmt->execute(array($id));
    return shape_player($stmt->fetch());
}

// ---------------------------------------------------------------- GET
function handle_get() {
    $id = requested_id();

    if ($id !== null) {
        $player = find_player($id);
        if (!$player) {
            send_error(404, 'Player ' . $id . ' was not found.');
        }
        send_json(200, array('success' => true, 'data' => $player));
    }

    $search = isset($_GET['search']) ? trim((string) $_GET['search']) : '';

    if ($search !== '') {
        $like = '%' . $search . '%';
        $stmt = db()->prepare(
            'SELECT ' . PLAYER_COLUMNS . ' FROM players
             WHERE full_name LIKE ? OR team LIKE ? OR position LIKE ? OR nationality LIKE ?
             ORDER BY full_name ASC'
        );
        $stmt->execute(array($like, $like, $like, $like));
    } else {
        $stmt = db()->query('SELECT ' . PLAYER_COLUMNS . ' FROM players ORDER BY full_name ASC');
    }

    $players = array_map('shape_player', $stmt->fetchAll());

    send_json(200, array(
        'success' => true,
        'count'   => count($players),
        'data'    => $players,
    ));
}

// --------------------------------------------------------------- POST
function handle_post() {
    list($player, $errors) = validate_player(read_body());

    if ($errors) {
        send_error(422, 'Please fix the highlighted fields.', $errors);
    }

    $stmt = db()->prepare(
        'INSERT INTO players
            (full_name, age, jersey_number, nationality, team,
             position, preferred_foot, height, photo, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute(array(
        $player['full_name'], $player['age'], $player['jersey_number'],
        $player['nationality'], $player['team'], $player['position'],
        $player['preferred_foot'], $player['height'], $player['photo'],
        $player['description'],
    ));

    $created = find_player((int) db()->lastInsertId());

    send_json(201, array(
        'success' => true,
        'message' => $created['full_name'] . ' was added to the squad.',
        'data'    => $created,
    ));
}

// ---------------------------------------------------------------- PUT
function handle_put() {
    $id = requested_id();
    if ($id === null) {
        send_error(400, 'Updating a player requires an id, e.g. players.php?id=1');
    }
    if (!find_player($id)) {
        send_error(404, 'Player ' . $id . ' was not found.');
    }

    list($player, $errors) = validate_player(read_body());
    if ($errors) {
        send_error(422, 'Please fix the highlighted fields.', $errors);
    }

    $stmt = db()->prepare(
        'UPDATE players SET
            full_name = ?, age = ?, jersey_number = ?, nationality = ?, team = ?,
            position = ?, preferred_foot = ?, height = ?, photo = ?, description = ?
         WHERE id = ?'
    );
    $stmt->execute(array(
        $player['full_name'], $player['age'], $player['jersey_number'],
        $player['nationality'], $player['team'], $player['position'],
        $player['preferred_foot'], $player['height'], $player['photo'],
        $player['description'], $id,
    ));

    $updated = find_player($id);

    send_json(200, array(
        'success' => true,
        'message' => $updated['full_name'] . ' was updated.',
        'data'    => $updated,
    ));
}

// ------------------------------------------------------------- DELETE
function handle_delete() {
    $id = requested_id();
    if ($id === null) {
        send_error(400, 'Deleting a player requires an id, e.g. players.php?id=1');
    }

    $player = find_player($id);
    if (!$player) {
        send_error(404, 'Player ' . $id . ' was not found.');
    }

    $stmt = db()->prepare('DELETE FROM players WHERE id = ?');
    $stmt->execute(array($id));

    send_json(200, array(
        'success' => true,
        'message' => $player['full_name'] . ' was removed from the squad.',
        'data'    => array('id' => $id),
    ));
}

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':    handle_get();    break;
        case 'POST':   handle_post();   break;
        case 'PUT':    handle_put();    break;
        case 'DELETE': handle_delete(); break;
        default:
            header('Allow: GET, POST, PUT, DELETE, OPTIONS');
            send_error(405, $_SERVER['REQUEST_METHOD'] . ' is not supported on this endpoint.');
    }
} catch (PDOException $e) {
    $detail = DEBUG ? $e->getMessage() : null;
    send_json(500, array(
        'success' => false,
        'message' => 'The server could not complete that request.',
        'error'   => $detail,
    ));
}
