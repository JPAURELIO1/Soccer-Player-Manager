<?php
/**
 * Validation rules for a player payload.
 * Mirrors the rules enforced in the mobile form so the API stays trustworthy
 * even when it is called straight from Postman.
 */

function allowed_positions() {
    return array('Forward', 'Midfielder', 'Defender', 'Goalkeeper');
}

function allowed_feet() {
    return array('Left', 'Right', 'Both');
}

/** Trims a value to a string; non-scalars become ''. */
function str_field($data, $key) {
    if (!isset($data[$key]) || is_array($data[$key])) {
        return '';
    }
    return trim((string) $data[$key]);
}

/**
 * Validates and normalises a player payload.
 * Returns array($cleanPlayer, $errors). $errors is field => message.
 */
function validate_player($data) {
    $errors = array();
    $clean  = array();

    $name = str_field($data, 'full_name');
    if ($name === '') {
        $errors['full_name'] = 'Full name is required.';
    } elseif (mb_strlen($name) < 2 || mb_strlen($name) > 100) {
        $errors['full_name'] = 'Full name must be between 2 and 100 characters.';
    }
    $clean['full_name'] = $name;

    $age = str_field($data, 'age');
    if ($age === '') {
        $errors['age'] = 'Age is required.';
    } elseif (!ctype_digit($age)) {
        $errors['age'] = 'Age must be a whole number.';
    } elseif ((int) $age < 15 || (int) $age > 60) {
        $errors['age'] = 'Age must be between 15 and 60.';
    }
    $clean['age'] = (int) $age;

    $jersey = str_field($data, 'jersey_number');
    if ($jersey === '') {
        $errors['jersey_number'] = 'Jersey number is required.';
    } elseif (!ctype_digit($jersey)) {
        $errors['jersey_number'] = 'Jersey number must be a whole number.';
    } elseif ((int) $jersey < 1 || (int) $jersey > 99) {
        $errors['jersey_number'] = 'Jersey number must be between 1 and 99.';
    }
    $clean['jersey_number'] = (int) $jersey;

    $nationality = str_field($data, 'nationality');
    if ($nationality === '') {
        $errors['nationality'] = 'Nationality is required.';
    } elseif (mb_strlen($nationality) > 60) {
        $errors['nationality'] = 'Nationality must be 60 characters or fewer.';
    }
    $clean['nationality'] = $nationality;

    $team = str_field($data, 'team');
    if ($team === '') {
        $errors['team'] = 'Team is required.';
    } elseif (mb_strlen($team) > 80) {
        $errors['team'] = 'Team must be 80 characters or fewer.';
    }
    $clean['team'] = $team;

    $position = str_field($data, 'position');
    if ($position === '') {
        $errors['position'] = 'Position is required.';
    } elseif (!in_array($position, allowed_positions(), true)) {
        $errors['position'] = 'Position must be one of: ' . implode(', ', allowed_positions()) . '.';
    }
    $clean['position'] = $position;

    $foot = str_field($data, 'preferred_foot');
    if ($foot === '') {
        $errors['preferred_foot'] = 'Preferred foot is required.';
    } elseif (!in_array($foot, allowed_feet(), true)) {
        $errors['preferred_foot'] = 'Preferred foot must be one of: ' . implode(', ', allowed_feet()) . '.';
    }
    $clean['preferred_foot'] = $foot;

    // Accepts "1.70", "1,70" and "1.70 m" so a stray unit does not fail the form.
    $heightRaw = str_field($data, 'height');
    $height    = str_replace(',', '.', preg_replace('/[^0-9.,]/', '', $heightRaw));
    if ($heightRaw === '') {
        $errors['height'] = 'Height is required.';
    } elseif (!is_numeric($height)) {
        $errors['height'] = 'Height must be a number in metres, e.g. 1.70.';
    } elseif ((float) $height < 1.00 || (float) $height > 2.50) {
        $errors['height'] = 'Height must be between 1.00 m and 2.50 m.';
    }
    $clean['height'] = round((float) $height, 2);

    $description = str_field($data, 'description');
    if ($description === '') {
        $errors['description'] = 'Description is required.';
    } elseif (mb_strlen($description) > 2000) {
        $errors['description'] = 'Description must be 2000 characters or fewer.';
    }
    $clean['description'] = $description;

    // Photo is optional. Empty string and null both mean "use the initials avatar".
    $photo = isset($data['photo']) && !is_array($data['photo']) ? trim((string) $data['photo']) : '';
    if ($photo === '') {
        $clean['photo'] = null;
    } elseif (strlen($photo) > MAX_PHOTO_CHARS) {
        $errors['photo'] = 'Photo is too large. Please choose a smaller image.';
        $clean['photo'] = null;
    } else {
        $clean['photo'] = $photo;
    }

    return array($clean, $errors);
}
