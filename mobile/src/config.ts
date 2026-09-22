/**
 * ---------------------------------------------------------------------------
 *  THE ONE LINE YOU EDIT AFTER DEPLOYING THE BACKEND
 * ---------------------------------------------------------------------------
 *  Point this at the folder that contains players.php.
 *
 *  Examples:
 *    Freehostia direct   https://yoursite.freehostia.com/api
 *    DuckDNS alias       https://soccerpm.duckdns.org/api
 *    XAMPP on this PC    http://192.168.1.10/soccer-api     <- your LAN IP,
 *                        NOT localhost: the phone running Expo Go is a
 *                        different device and localhost would point at itself.
 *
 *  No trailing slash.
 */
export const API_BASE_URL = 'http://hellojpsoccer.duckdns.org';

/** Abort a request that takes longer than this, so the UI never hangs. */
export const REQUEST_TIMEOUT_MS = 15000;
