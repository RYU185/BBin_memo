# Data Codemap

**Last Updated:** 2026-05-13
**Sources:** `electron/db/schema.sql`, `electron/db/index.js`, `electron/ipc/memo.js`, `electron/ipc/window.js`, `electron/preload.js`

## Storage

- Engine: SQLite via `better-sqlite3` (synchronous, in-process).
- Location: `app.getPath('userData')/memo.db` (per-OS user dir).
- Pragmas: `journal_mode = WAL`, `foreign_keys = ON`.
- Schema is created at boot with `CREATE TABLE IF NOT EXISTS` (no migrations system yet).

## Schema

### `memo`
| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT | PK, UUID v4 from `crypto.randomUUID()` |
| `title` | TEXT | NOT NULL, default `''`. Updated from Tiptap via `extractTitle` (<=80 chars) |
| `content` | TEXT | NOT NULL, default `''`. Stores `JSON.stringify(tiptap_doc)`; legacy markdown is migrated by `parseContent` on read |
| `is_grouped` | INTEGER | 0/1 boolean |
| `is_pinned` | INTEGER | 0/1 boolean |
| `created_at` | INTEGER | `Date.now()` ms |
| `updated_at` | INTEGER | `Date.now()` ms (bumped on every `memo:update`) |

### `memo_window`
| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT | PK, UUID |
| `memo_id` | TEXT | UNIQUE, FK -> `memo.id` `ON DELETE CASCADE` |
| `x`, `y` | INTEGER | Default 100 |
| `width` | INTEGER | Default 300 |
| `height` | INTEGER | Default 400 |
| `is_open` | INTEGER | 0/1; drives session restore |

One-to-one with `memo`; created alongside the memo in `memo:create` and via lazy insert in `window:open` if missing.

## IPC Channel Specs

### Memo CRUD (`electron/ipc/memo.js`)

| Channel | Params | Returns | SQL |
|---------|--------|---------|-----|
| `memo:getAll` | — | `Memo[]` | `SELECT * FROM memo ORDER BY updated_at DESC` |
| `memo:getOne` | `id` | `Memo \| undefined` | `SELECT * FROM memo WHERE id = ?` |
| `memo:create` | — | `Memo` | INSERT memo (blank) + INSERT memo_window (default bounds, closed) |
| `memo:update` | `id`, `changes` | `Memo` | Whitelist `title \| content \| is_grouped \| is_pinned`; always sets `updated_at = now` |
| `memo:delete` | `id` | `boolean` | `DELETE FROM memo WHERE id = ?` (cascades window) |

### Window control (`electron/ipc/window.js`)

| Channel | Params | Returns | Side effects |
|---------|--------|---------|--------------|
| `window:open` | `memo_id` | `void` | Focus existing or create BrowserWindow; ensure row; `is_open = 1` |
| `window:close` | `memo_id` | `void` | Close window; `is_open = 0` |
| `window:updateBounds` | `memo_id, x, y, w, h` | `void` | UPDATE bounds |
| `window:restoreAll` | — | `void` | Recreate every `is_open = 1` not already mapped |

### App control (`electron/ipc/window.js` + `electron/main.js`)

| Channel | Params | Returns | Side effects |
|---------|--------|---------|--------------|
| `app:minimize` | `memo_id` | `void` | `BrowserWindow.minimize()` |
| `app:togglePin` | `memo_id` | `boolean` (new pin) | Flip `is_pinned`; `setAlwaysOnTop` on live window |
| `app:toggleGroup` | `memo_id` | `boolean` (new group) | Flip `is_grouped` |
| `app:focusGroup` | — | `void` | `show()` every grouped, live window |
| `hub:show` | — | `void` | Show/recreate hub window |
| `self:minimize` | — (sender) | `void` | Minimize sender window |
| `self:close` | — (sender) | `void` | Close sender window |

All channels resolve through `ipcRenderer.invoke` -> `ipcMain.handle`. Preload (`electron/preload.js`) exposes them under `window.api.{memo,window,app,hub,self}`.

## Content Format

`memo.content` round-trip:

```
Tiptap editor JSON  --JSON.stringify-->  memo.content (TEXT)
                                              |
                                              v
                                    parseContent(raw):
                                      - empty       -> null
                                      - doc JSON    -> use as-is
                                      - legacy text -> migrate per-line to paragraphs
                                              |
                                              v
                                       editor.commands.setContent
```

Helpers (`src/lib/memoText.js`):

- `extractTitle(doc)` derives `memo.title` on every save.
- `extractPreview(raw)` produces the hub card preview (handles both doc JSON and legacy markdown).
- `formatDate(updated_at)` formats hub card dates.

## Data Flow Scenarios

### Create memo from hub
```
HubWindow "New memo"
  -> api.memo.create()      -> memo:create  (INSERT memo + memo_window)
  -> api.window.open(id)    -> window:open  (is_open=1, createMemoWindow)
  -> api.memo.getAll()      -> memo:getAll  (refresh list)
```

### Edit memo
```
Tiptap onUpdate (debounced 800ms)
  -> api.memo.update(id, { content: JSON.stringify(doc), title: extractTitle(doc) })
  -> memo:update (UPDATE memo SET title, content, updated_at)
```

### Move / resize memo window
```
BrowserWindow 'moved' | 'resized' (main.js)
  -> UPDATE memo_window SET x, y, width, height
```
Renderer-driven path also available via `window:updateBounds`, but is not currently invoked.

### Pin / group toggle
```
MemoWindow toggle
  -> api.app.togglePin(id)   -> UPDATE memo.is_pinned, setAlwaysOnTop, returns new value
  -> api.app.toggleGroup(id) -> UPDATE memo.is_grouped, returns new value
```

### Group focus (Alt+Tab UX)
```
BrowserWindow 'focus' on grouped memo
  -> SELECT id FROM memo WHERE is_grouped=1 AND id != self
  -> for each: showInactive() + moveTop()
```

### Session restore
```
app.whenReady
  -> SELECT * FROM memo_window WHERE is_open = 1
  -> createMemoWindow(memo_id, bounds) for each
```

### Delete
```
HubWindow card menu | MemoWindow ... menu
  -> api.memo.delete(id)
  -> DELETE FROM memo WHERE id = ?   (memo_window cascades)
```

## Validation Notes

- `memo:update` whitelists keys to prevent arbitrary column writes.
- No Zod / schema validation on `changes` values (booleans expected to be 0/1 numerics or coerced by SQLite).
- All UUIDs come from Node `crypto.randomUUID`, not user input.

## Related Codemaps

- [architecture.md](./architecture.md), [backend.md](./backend.md), [frontend.md](./frontend.md)
