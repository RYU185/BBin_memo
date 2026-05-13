# Backend Codemap

**Last Updated:** 2026-05-13
**Entry Point:** `electron/main.js`

## Structure

```
electron/
├── main.js            # App lifecycle, window factory, group focus, session restore
├── preload.js         # contextBridge -> window.api
├── ipc/
│   ├── memo.js        # memo:* CRUD handlers
│   └── window.js      # window:*, app:*, self:* handlers
└── db/
    ├── index.js       # better-sqlite3 connection, pragmas, schema bootstrap
    └── schema.sql     # canonical DDL (mirrored by index.js exec)
```

## Module Map

| Module | Exports | Depends on |
|--------|---------|------------|
| `electron/main.js` | (entry, no exports) | `electron` (app, BrowserWindow, ipcMain), `path`, `./db`, `./ipc/memo`, `./ipc/window` |
| `electron/preload.js` | (contextBridge side-effect) | `electron` (contextBridge, ipcRenderer) |
| `electron/ipc/memo.js` | `registerMemoHandlers()` | `electron`, `crypto.randomUUID`, `../db` |
| `electron/ipc/window.js` | `registerWindowHandlers(memoWindows, createMemoWindow)` | `electron`, `crypto.randomUUID`, `../db` |
| `electron/db/index.js` | `db` (better-sqlite3 instance) | `better-sqlite3`, `path`, `electron.app` |

## main.js Responsibilities

- `isDev = !app.isPackaged` -> `loadWindow` chooses `http://localhost:5173` vs `dist/index.html`.
- Holds `memoWindows: Map<memoId, BrowserWindow>` and singleton `hubWindow`.
- `createHubWindow()` — 360x640 frameless window with preload, contextIsolation on, nodeIntegration off. Loaded with `?window=hub`.
- `createMemoWindow(memoId, bounds)` — frameless, min 200x150. Wires:
  - `closed` -> remove from map, `UPDATE memo_window SET is_open = 0`.
  - `moved` / `resized` -> persist `{x, y, width, height}` to `memo_window`.
  - `focus` -> if memo grouped, `showInactive()` + `moveTop()` all other grouped windows.
  - Initial pin restore via `setAlwaysOnTop`.
- `app.whenReady`:
  - Lazy-requires `./db` (so `app.getPath('userData')` is valid).
  - Registers memo + window IPC handlers.
  - Registers `hub:show` handler.
  - Creates hub window.
  - Restores all `is_open = 1` memo windows.
- `app.on('window-all-closed')` quits on non-darwin.

## preload.js Surface

Exposes single global `window.api` with sub-namespaces:

- `api.memo`: `getAll`, `getOne(id)`, `create()`, `update(id, changes)`, `delete(id)`
- `api.window`: `open(id)`, `close(id)`, `updateBounds(id, x, y, w, h)`, `restoreAll()`
- `api.app`: `minimize(id)`, `togglePin(id)`, `toggleGroup(id)`, `focusGroup()`
- `api.hub`: `show()`
- `api.self`: `minimize()`, `close()` (operate on the sender's own window)
- `api.getWindowParams()` — reads URL query `window` and `id` (defaults `hub` / `null`)

## IPC Handlers

### ipc/memo.js — `registerMemoHandlers()`

| Channel | Behaviour |
|---------|-----------|
| `memo:getAll` | `SELECT * FROM memo ORDER BY updated_at DESC` |
| `memo:getOne` | `SELECT * FROM memo WHERE id = ?` |
| `memo:create` | Inserts blank memo + paired `memo_window` row (default bounds, `is_open = 0`); returns the row. UUIDs via `randomUUID()`. |
| `memo:update` | Whitelists keys via `ALLOWED_UPDATE_KEYS = ['title', 'content', 'is_grouped', 'is_pinned']`; always bumps `updated_at`. |
| `memo:delete` | `DELETE FROM memo WHERE id = ?`; `memo_window` cascades via FK. |

### ipc/window.js — `registerWindowHandlers(memoWindows, createMemoWindow)`

| Channel | Behaviour |
|---------|-----------|
| `window:open` | Focus existing or create new memo window. Ensures `memo_window` row exists. Sets `is_open = 1`. |
| `window:close` | Closes BrowserWindow if alive, sets `is_open = 0`. |
| `window:updateBounds` | Persists explicit bounds (renderer-initiated). |
| `window:restoreAll` | Reopens every `is_open = 1` memo not already in `memoWindows`. |
| `app:minimize` | `BrowserWindow.minimize()` for memo. |
| `app:togglePin` | Flips `is_pinned`, calls `setAlwaysOnTop` on live window; returns new boolean. |
| `app:toggleGroup` | Flips `is_grouped`; returns new boolean. |
| `app:focusGroup` | `show()` every grouped, live memo window. |
| `self:minimize` | Minimizes sender via `BrowserWindow.fromWebContents(event.sender)`. |
| `self:close` | Closes sender. |

### main.js — `hub:show`

Shows the existing hub window or recreates it.

## DB Layer (`electron/db/index.js`)

- Opens `path.join(app.getPath('userData'), 'memo.db')`.
- Pragmas: `journal_mode = WAL`, `foreign_keys = ON`.
- `db.exec(...)` runs `CREATE TABLE IF NOT EXISTS` for both tables (mirrors `schema.sql`).
- Exports the `Database` instance directly; consumers use `db.prepare(...).run|get|all`.

## Build Config (`package.json`)

- `main`: `electron/main.js`
- Scripts: `dev` (concurrently runs vite + electron after wait-on), `build` (vite), `dist` (vite + electron-builder), `rebuild` (better-sqlite3 native against electron headers), `test*` (vitest).
- electron-builder: NSIS target on win; `files` include `dist/**`, `electron/**`, `package.json`; `asarUnpack` for `better-sqlite3` native binding.

## Related Codemaps

- [architecture.md](./architecture.md), [frontend.md](./frontend.md), [data.md](./data.md)
