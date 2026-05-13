# Frontend Codemap

**Last Updated:** 2026-05-13
**Entry Points:** `src/main.jsx` -> `src/App.jsx`

## Structure

```
src/
├── main.jsx                       # ReactDOM.createRoot bootstrap
├── App.jsx                        # Routes window by URL param (hub / memo)
├── index.css                      # Global + Tiptap editor styles
├── tokens.js                      # Light/dark design token factory
├── components/
│   ├── HubWindow.jsx              # Memo list + search + new button
│   ├── MemoWindow.jsx             # Sticky memo editor (Tiptap)
│   ├── SlashDropdown.jsx          # `/` command palette + COMMANDS table
│   └── icons.jsx                  # Inline SVG icon set
└── lib/
    ├── memoText.js                # Pure text utilities (extracted)
    └── __tests__/
        └── memoText.test.js       # Vitest, 32 cases
```

## Module Map

| Module | Exports | Depends on |
|--------|---------|------------|
| `main.jsx` | (side-effect) | `react`, `react-dom/client`, `App`, `./index.css` |
| `App.jsx` | `default App` | `react`, `HubWindow`, `MemoWindow`, `window.api` |
| `tokens.js` | `tokens(isDark)` | — |
| `components/HubWindow.jsx` | `default HubWindow` | `react`, `tokens`, `icons`, `lib/memoText` (extractPreview, formatDate), `window.api` |
| `components/MemoWindow.jsx` | `default MemoWindow` | `react`, `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-task-list`, `@tiptap/extension-task-item`, `@tiptap/extension-underline`, `tokens`, `icons`, `SlashDropdown` (+ `COMMANDS`), `lib/memoText` (parseContent, extractTitle) |
| `components/SlashDropdown.jsx` | `default SlashDropdown`, `COMMANDS` | `tokens` |
| `components/icons.jsx` | `Search`, `Plus`, `Minus`, `Close`, `Grip`, `MoreVert`, `MoreHoriz`, `Trash`, `Pin`, `PinFilled`, `Bold`, `Underline`, `Checkbox`, `Strike`, `List`, `Palette` | — |
| `lib/memoText.js` | `extractPreview`, `extractTitle`, `parseContent`, `formatDate` | — (pure) |

## Routing

`App.jsx` reads `window.api.getWindowParams()` (set by preload from URL query):

- `type === 'memo' && memoId` -> `<MemoWindow memoId theme />`
- otherwise -> `<HubWindow theme />`

Theme is currently hard-coded `'light'`; `tokens.js` already supports dark.

## Component Responsibilities

### HubWindow
- Loads all memos via `api.memo.getAll()` on mount.
- Local state: `memos`, `query`, `selectedId`, `menuId`.
- Per card: title, preview (`extractPreview`), updated date (`formatDate`), kebab menu with Delete.
- Floating "New memo" button -> `api.memo.create` + `api.window.open`.
- Search filters by `title` and `content` substring (case-insensitive).
- Custom title bar with `WebkitAppRegion: 'drag'`; `self.minimize`/`self.close` for window chrome.

### MemoWindow
- Tiptap `useEditor` with StarterKit + TaskList + TaskItem (nested off) + Underline.
- Loads memo via `api.memo.getOne(memoId)`; `parseContent` migrates legacy markdown to Tiptap doc.
- Auto-save: 800ms debounce on `onUpdate`; also flushes on unmount. Saves `JSON.stringify(json)` and `extractTitle(json)`.
- Slash command flow: `findSlash` scans current line; `slashRef` mirrors state for `handleKeyDown` closure; arrow/Enter/Esc consumed by `editorProps.handleKeyDown`; `SlashDropdown` rendered as `position: fixed` at caret.
- Bottom bar: Bold / Underline / Checkbox (taskList) / Strike via editor chain; word & char count; Group toggle via `api.app.toggleGroup`.
- Title bar: New memo (+), `...` -> MoreDropdown (Note list -> `hub.show`, Delete memo), Pin toggle, minimize, close.

### SlashDropdown
- Exports `COMMANDS` array (`today`, `time`, `tomorrow`, `todo`, `divider`, `quote`).
- Filters by prefix of `cmd.slice(1)` against query (the `/` stripped).
- Each `run(editor, range)` first `deleteRange(range)` then applies the action.
- Note: CLAUDE.md spec lists `/date /time /tomorrow /todo /hr /code` but current implementation uses `/today /time /tomorrow /todo /divider /quote` — mismatch to track.

### icons.jsx
- 16 inline SVG components, all `currentColor`-driven so token coloring works.

### lib/memoText.js (pure, fully tested)
| Function | Behaviour |
|----------|-----------|
| `extractPreview(raw)` | Tiptap doc -> first non-empty block text; fallback strips markdown markers from first non-blank line. |
| `extractTitle(json)` | First block with non-empty `content`, joined text nodes, sliced to 80 chars. |
| `parseContent(raw)` | Empty -> null; valid doc JSON -> as-is; otherwise migrates each line into a paragraph. |
| `formatDate(ts)` | `''` / `오늘 HH:MM` / `어제` / `M월 D일`. |

## Tests

- `src/lib/__tests__/memoText.test.js` — vitest, 32 cases covering all four helpers (Tiptap doc paths, markdown fallback, edge cases for date math).
- Run via `npm test` / `npm run test:watch` / `npm run test:coverage`.

## Styling

- Inline style objects keyed by `tokens(isDark)`; minimal CSS in `src/index.css` (Tiptap editor classes such as `.memo-editor-wrapper`).
- Frameless windows use `WebkitAppRegion: 'drag'` on bars and `'no-drag'` on interactive elements.

## Related Codemaps

- [architecture.md](./architecture.md), [backend.md](./backend.md), [data.md](./data.md)
