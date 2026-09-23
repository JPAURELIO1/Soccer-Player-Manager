# Soccer Player Manager

A mobile CRUD application for managing a squad of soccer players.

| Layer | Technology |
| --- | --- |
| Mobile app | React Native (Expo SDK 57, Expo Router, TypeScript) |
| UI | Design tokens in `src/theme.ts`, Bebas Neue + Inter (`@expo-google-fonts`), `react-native-svg` for the squad donut, `expo-linear-gradient` for the position cards |
| API | PHP 8 REST endpoints returning JSON |
| Database | MySQL / MariaDB |
| Hosting | Freehostia (shared PHP + MySQL) |
| Domain | DuckDNS subdomain pointing at the Freehostia site |
| API testing | Postman collection with automated tests |

```
Soccer-Player-Manager/
├── mobile/     Expo app — run with `npx expo start`
├── backend/    PHP API — upload to Freehostia's public_html/api
└── postman/    Collection + environment to import into Postman
```

---

## What the app does

Five screens covering the full CRUD cycle:

| Screen | Purpose | API call |
| --- | --- | --- |
| Squad | Squad overview strip (average age, average height, nations, position donut) above a searchable list of player cards, pull to refresh | `GET /players.php` |
| Player Card | Full gradient card for one player | `GET /players.php?id=1` |
| Sign Player | Validated form, optional photo | `POST /players.php` |
| Edit Player | Same form, pre-filled | `PUT /players.php?id=1` |
| About | App info and a live backend status indicator | — |

The overview strip is computed from the players the list request already
returned, so it costs no extra call.

Delete is available from both the list card and the details screen, each behind a
confirmation dialog.

---

## Setup

Work through these in order. Steps 1–3 put the API online; step 4 proves it
works; step 5 points the app at it.

### 1. Create the database on Freehostia

1. Log in to Freehostia and open **cPanel → MySQL Databases**.
2. Create a database, e.g. `soccer`. Freehostia prefixes it with your account
   id, so the real name ends up looking like `abcd1234_soccer` — **write down
   the full prefixed name**.
3. Create a MySQL user, set a password, and **add the user to the database with
   ALL PRIVILEGES**. This step is easy to miss and causes an
   "Access denied" error later.
4. Open **cPanel → phpMyAdmin**, select your database, go to the **Import** tab,
   choose `backend/schema.sql`, and click **Go**.

You should now see a `players` table with 5 sample players.

### 2. Upload the API

1. Open `backend/config.php` and fill in the four values from step 1:

   ```php
   define('DB_HOST', 'localhost');        // some Freehostia plans use mysql.freehostia.com
   define('DB_NAME', 'abcd1234_soccer');
   define('DB_USER', 'abcd1234_soccer');
   define('DB_PASS', 'your-password');
   ```

   If `localhost` gives a connection error, check the hostname shown on the
   cPanel MySQL page and use that instead.

2. Upload everything in `backend/` to **`public_html/api/`** using cPanel's File
   Manager or FTP. Include the `.htaccess` file — File Manager hides dotfiles
   until you enable "Show hidden files" in its settings.

3. Visit `https://yoursite.freehostia.com/api/index.php` in a browser. A working
   install returns:

   ```json
   {"success":true,"database":{"connected":true,"table":true,"players":5}, ...}
   ```

   If `connected` is `false`, the credentials in `config.php` are wrong. If
   `table` is `false`, the schema import in step 1 did not run.

4. Once everything works, set `DEBUG` to `false` in `config.php` so raw database
   errors are no longer exposed.

### 3. Point DuckDNS at the site

DuckDNS gives you a free subdomain such as `soccerpm.duckdns.org`. Because
Freehostia is **shared** hosting, one extra step is needed: pointing the DNS
record at the server is not enough on its own, since Apache decides which
account to serve based on the hostname in the request.

1. At [duckdns.org](https://www.duckdns.org), sign in and create a subdomain.
2. Find your Freehostia server's IP: **cPanel → Server Information → Shared IP
   Address**, or run `ping yoursite.freehostia.com`.
3. Paste that IP into the DuckDNS **current ip** box and click **update ip**.
4. In Freehostia, add `soccerpm.duckdns.org` to your account as a **parked** or
   **addon domain** (cPanel → Domains), pointing at the same `public_html`.

Then check `http://soccerpm.duckdns.org/api/index.php` returns the same JSON as
step 2.

> **Two things to be aware of.** Free hosting plans sometimes restrict adding
> extra domains — if cPanel refuses, keep using the `freehostia.com` URL in the
> app and demonstrate DuckDNS separately. Also, your SSL certificate covers
> `*.freehostia.com`, **not** your DuckDNS name, so `https://soccerpm.duckdns.org`
> will fail certificate validation. Use `http://` for the DuckDNS address, and
> see [Android and plain HTTP](#android-and-plain-http) below.

### 4. Test with Postman

1. Import both files from `postman/` (**Import** → drag both in).
2. Select the **Soccer Player Manager** environment, top right.
3. Set `baseUrl` to the folder containing `players.php`, with **no trailing
   slash**:

   ```
   https://yoursite.freehostia.com/api
   ```

4. Run **Health check** first, then the rest top to bottom, or use **Run
   collection** to execute all of them at once.

Each request has assertions attached, so the runner shows a pass/fail summary.
The collection covers every CRUD operation plus three failure cases — a
validation rejection (422), a missing record (404), and deletion confirmed by a
follow-up read. **Create** saves the new player's id into a variable, so the
later requests need no manual editing.

### 5. Run the mobile app

1. Open `mobile/src/config.ts` and set the one value in it:

   ```ts
   export const API_BASE_URL = 'http://soccerpm.duckdns.org/api';
   ```

2. Install and start:

   ```bash
   cd mobile
   npm install
   npx expo start
   ```

3. Scan the QR code with **Expo Go** on your phone.

To run it in a browser instead, use `npm run web` (or press `w` at the Expo
prompt) and open <http://localhost:8081>. On a desktop window the app is held
in a centred phone-width column, so the mobile layout is not stretched across
the monitor.

The About tab shows the address the app is using and whether it is connected —
useful during a demo, and the fastest way to diagnose a blank list.

---

## Troubleshooting

**"Could not reach the server"**
The phone cannot open `API_BASE_URL`. Open that exact URL in the phone's own
browser — if it fails there too, the problem is the hosting or the address, not
the app.

**"The server replied with something that is not JSON"**
The URL returned an HTML page: usually a 404, a directory listing, or a
Freehostia parking page. Check that `players.php` really sits at
`public_html/api/` and that `API_BASE_URL` has no trailing slash.

<a id="android-and-plain-http"></a>**Requests fail on Android but work elsewhere**
Android blocks plain `http://` traffic outside Expo Go. Either use the
`https://yoursite.freehostia.com` URL, or, if you build a standalone APK, add:

```bash
npx expo install expo-build-properties
```

```jsonc
// app.json → expo.plugins
["expo-build-properties", { "android": { "usesCleartextTraffic": true } }]
```

**Testing against XAMPP instead of Freehostia**
Copy `backend/` into `C:\xampp\htdocs\soccer-api`, start Apache and MySQL, and
import `schema.sql` through phpMyAdmin. Set `API_BASE_URL` to your PC's **LAN
IP** — `http://192.168.1.10/soccer-api`, from `ipconfig` — not `localhost`,
which on a phone points at the phone itself.

**A saved photo makes requests slow**
Photos are stored as base64 text inside the player record, so a large image
makes every list response heavier. The picker already compresses to 40% quality
at 1:1; leaving the photo blank uses the coloured initials avatar instead.

---

## API reference

Base URL is the folder containing `players.php`. All responses are JSON with a
`success` flag; successful reads and writes carry the record in `data`.

| Method | Path | Purpose | Success |
| --- | --- | --- | --- |
| `GET` | `/index.php` | Health check | 200 |
| `GET` | `/players.php` | List all players | 200 |
| `GET` | `/players.php?search=messi` | Search name, team, position, nationality | 200 |
| `GET` | `/players.php?id=1` | Fetch one player | 200 |
| `POST` | `/players.php` | Create a player | 201 |
| `PUT` | `/players.php?id=1` | Update a player | 200 |
| `DELETE` | `/players.php?id=1` | Delete a player | 200 |

With `.htaccess` active, `/players` and `/players/1` also work. The
query-string form is used by the app because it works even where `mod_rewrite`
is disabled.

### Player fields

| Field | Type | Rules |
| --- | --- | --- |
| `full_name` | string | Required, 2–100 characters |
| `age` | integer | Required, 15–60 |
| `jersey_number` | integer | Required, 1–99 |
| `nationality` | string | Required, ≤ 60 characters |
| `team` | string | Required, ≤ 80 characters |
| `position` | enum | `Forward`, `Midfielder`, `Defender`, `Goalkeeper` |
| `preferred_foot` | enum | `Left`, `Right`, `Both` |
| `height` | decimal | Required, 1.00–2.50 (metres) |
| `photo` | string | Optional base64 data URI, or `""` for none |
| `description` | string | Required, ≤ 2000 characters |

Validation runs in two places: in the app before sending, and again in
`backend/validation.php`. The server copy is the one that matters, since the API
is also callable directly from Postman.

### Error responses

```jsonc
// 422 — one or more fields failed validation
{
  "success": false,
  "message": "Please fix the highlighted fields.",
  "errors": { "age": "Age must be between 15 and 60." }
}

// 404 — no such record
{ "success": false, "message": "Player 12 was not found." }
```

The app reads `errors` and shows each message under its own input.
