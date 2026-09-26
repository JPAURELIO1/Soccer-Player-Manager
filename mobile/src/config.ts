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

/**
 * ---------------------------------------------------------------------------
 *  THIRD-PARTY API — REST Countries v5 (https://restcountries.com)
 * ---------------------------------------------------------------------------
 *  Powers the flag + country facts on each Player Card and the Nations tab.
 *
 *  The key comes from a free account at https://restcountries.com/sign-up.
 *  For the web build, add "localhost" to the key's CORS allowed origins at
 *  https://restcountries.com/api-keys — native apps (Expo Go) need no setup.
 */
export const COUNTRIES_API_URL = 'https://api.restcountries.com/countries/v5';
export const COUNTRIES_API_KEY = 'rc_live_8c0240e688534ef5b9a58b375ace69d7';
