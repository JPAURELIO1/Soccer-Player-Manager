<?php
/**
 * Database + app configuration.
 *
 * On Freehostia: cPanel > MySQL Databases gives you the real values.
 * They usually look like:
 *   host     mysql.freehostia.com   (NOT "localhost" on some plans)
 *   name     abcd1234_soccer
 *   user     abcd1234_soccer
 * Fill them in below, then upload this folder to public_html/api.
 */

define('DB_HOST', 'localhost');
define('DB_NAME', 'jusaur1_soccerdb');
define('DB_USER', 'jusaur1_soccerdb');
define('DB_PASS', 'Jppass@123');
define('DB_CHARSET', 'utf8mb4');

// Max size of a base64 player photo we will accept (characters).
// Kept under the Chocolate plan's 2MB upload cap: ~1.3MB of base64 text,
// which is roughly a 950KB image. Raise it if you move to a bigger plan.
define('MAX_PHOTO_CHARS', 1300000);

// Set to false once you are done developing to hide PHP error details.
define('DEBUG', true);
