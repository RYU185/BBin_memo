# Architecture Codemap

**Last Updated:** 2026-05-13
**Entry Points:** `electron/main.js`, `src/main.jsx`

## High-Level Architecture

```
+-------------------------------------------------------+
|                  Electron App (Windows)               |
|                                                       |
|  +-------------------+    +------------------------+  |
|  |  Main Process     |    |   Renderer Processes   |  |
|  |  electron/main.js |    |   (one per BrowserWin) |  |
|  |                   |    |                        |  |
|  |  - Window mgmt    |<-->|  Hub Window  (React)   |  |
|  |  - IPC handlers   | IPC|  Memo Windows (React)  |  |
|  |  - SQLite (sync)  |    |  - Tiptap editor       |  |
|  +---------+---------+    +-----------+------------+  |
|            |                          ^               |
|            v                          | preload       |
|  +-------------------+    +-----------+------------+  |
|  | better-sqlite3    |    | electron/preload.js    |  |
|  | userData/memo.db  |    | exposes window.api     |  |
|  +-------------------+    +------------------------+  |
+-------------------------------------------------------+
```

## Process Split

| Process | File | Role |
|---------|------|------|
| Main | `electron/main.js` | App lifecycle, BrowserWindow factory, session restore, group focus orchestration |
| Preload | `electron/preload.js` | Exposes `window.api` via `contextBridge` (contextIsolation on, nodeIntegration off) |
| Renderer | `src/main.jsx` -> `App.jsx` | Reads URL params, routes to `HubWindow` or `MemoWindow` |

## Window Topology

- **Hub window** — single instance, frameless, lists all memos.
- **Memo windows** — one per open memo, frameless, resizable, position/size persisted to DB on `moved`/`resized`.
- Window type is selected via URL query (`?window=hub` or `?window=memo&id=<uuid>`), parsed by `preload.getWindowParams()`.

## IPC Channel Namespaces

| Namespace | Module | Purpose |
|-----------|--------|---------|
| `memo:*` | `electron/ipc/memo.js` | CRUD on `memo` table |
| `window:*` | `electron/ipc/window.js` | Open / close / bounds / restore memo windows |
| `app:*` | `electron/ipc/window.js` | Pin, group toggle, minimize, group focus |
| `self:*` | `electron/ipc/window.js` | Renderer asks its own window to minimize/close |
| `hub:*` | `electron/main.js` | Show or recreate the hub window |

See `data.md` for full channel signatures.

## Cross-Process Data Flow

```
User action (renderer)
   |
   v
window.api.<ns>.<method>()      [preload]
   |
   v ipcRenderer.invoke
   |
   v
ipcMain.handle                  [main]
   |
   v
better-sqlite3 prepared stmt    [main, synchronous]
   |
   v
Return value -> renderer Promise
```

Window lifecycle events (`moved`, `resized`, `closed`, `focus`) are wired in `main.js` and write to `memo_window` directly, bypassing renderer.

## Group Focus Behaviour

`createMemoWindow` registers a `focus` handler. When a window whose memo has `is_grouped = 1` gains focus, every other grouped, non-destroyed window is `showInactive()` + `moveTop()`, bringing the group forward together (Alt+Tab UX).

## Session Restore

On `app.whenReady`, `main.js` reads `memo_window WHERE is_open = 1` and recreates each window with stored bounds. `is_open` is set to 1 in `window:open` and back to 0 on window close.

## External Dependencies (runtime)

- `better-sqlite3` — synchronous SQLite, native binding (asarUnpack required)
- `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-task-list`, `@tiptap/extension-task-item`, `@tiptap/extension-underline` — rich editor
- `electron` ^29 — desktop shell
- React 18, Vite 5 — renderer toolchain

## Related Codemaps

- [frontend.md](./frontend.md) — renderer components, hooks, pure utils
- [backend.md](./backend.md) — main process, IPC, DB layer
- [data.md](./data.md) — schema, channel specs, data flow detail
