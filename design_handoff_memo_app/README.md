# Handoff: Memo — Desktop App

A minimalist, achromatic desktop memo app with two surfaces:
1. **Memo Hub** — a browse/search window listing all memos.
2. **Sticky Memo** — a single floating sticky-note window with markdown rendering, slash commands, and a `…` dropdown menu.

Both surfaces ship in matched **light** and **dark** themes.

---

## About the design files

The files in this bundle are **design references built in HTML/React (via inline Babel)**. They are pixel-spec prototypes meant to communicate *intended look and behavior*, not production code to copy directly.

Your job is to **recreate these designs in the target codebase's existing environment** (React/Vue/SwiftUI/native macOS, etc.), using its established component library, theming system, and patterns. If no app environment exists yet, pick whatever framework best fits the target platform (Electron + React or Tauri + React are good defaults for a cross-platform desktop memo app; SwiftUI for native macOS).

Read the HTML files in a browser to see them live. Read the `.jsx` files to inspect exact values, but **don't try to lift the React-via-Babel code into a real codebase as-is** — rewrite it in your project's idioms.

## Fidelity

**High-fidelity.** All colors, radii, type sizes, paddings, shadows, and interaction states are spec'd. Match them pixel-for-pixel.

---

## Design tokens

### Color palette (achromatic, warm-tinted)

| Token | Light | Dark |
|---|---|---|
| `bg` (window background, behind list) | `#F3F3F1` | `#0F0F11` |
| `surface` (card / titlebar fill) | `#FAFAF8` | `#161618` |
| `surface-alt` (input fill) | `#FFFFFF` | `#1F1F22` |
| `text` | `#15151A` | `#F4F4F5` |
| `subtle` (meta, timestamps) | `#7A7A80` | `#86868A` |
| `border` | `rgba(0,0,0,0.06)` | `rgba(255,255,255,0.06)` |
| `border-strong` (window edge) | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.08)` |
| `hover-fill` | `rgba(0,0,0,0.05)` | `rgba(255,255,255,0.07)` |
| `accent-fill` (CTA, toggle on) | `#15151A` | `#F4F4F5` |
| `accent-text` (text on accent) | `#FAFAF8` | `#0F0F11` |
| Dropdown surface | `#FFFFFF` | `#202024` |
| Code-inline bg | `rgba(0,0,0,0.05)` | `rgba(255,255,255,0.08)` |

### Typography

- **Family**: `Pretendard Variable`, fallback `Pretendard`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`.
- **Font smoothing**: `-webkit-font-smoothing: antialiased`.
- **Letter spacing**: titles `-0.01em`; menu/body slight `-0.005em`.
- Sizes used:
  - Window title (titlebar label): `12px / 500` (`#7A7A80` light, `#86868A` dark)
  - Hub h1 ("All memos"): `20px / 600`, `-0.02em`
  - Hub meta ("N notes"): `11px / 500`
  - Card title: `13.5px / 600`
  - Card preview: `12px / 400`, line-height `1.5`, 2-line clamp
  - Card meta row: `11px / 500`
  - Tag pill: `9.5px / 500`, uppercase, letter-spacing `0.04em`, 1px 4px padding, `0.5px` border
  - Search input: `12.5px / 400`
  - Sticky body: `13.5px / 400`, line-height `1.6`
  - Sticky h1: `15px / 700`
  - Sticky h2: `13.5px / 600`
  - Dropdown row label: `12.5px`
  - Slash command name: `12.5px`, font-family `ui-monospace, SFMono-Regular, Menlo, monospace`
  - Slash command hint: `11.5px`, color `subtle`
  - Kbd badge (↵): `9.5px`, letter-spacing `0.06em`

### Radii

| Where | Radius |
|---|---|
| Window outer | **14–16 px** (Hub `16`, Sticky `14`) |
| Card | `12` |
| Dropdown surface | `10–11` (Hub `10`, Sticky `11`) |
| Search input | `9` |
| Icon button hover surface | `6` |
| New-memo CTA pill | `999` |
| Toggle track / thumb | `999` / `999` |
| Tag pill | `4` |
| Kbd badge | `4` |

### Shadows

Light:
- Window: `0 30px 60px -20px rgba(15,15,20,0.18), 0 4px 12px -2px rgba(15,15,20,0.06)`
- Card resting: `0 1px 0 rgba(15,15,20,0.02)`
- Card selected/hover lift: `0 4px 12px -3px rgba(15,15,20,0.08)`
- Dropdown: `0 16px 40px -10px rgba(15,15,20,0.18), 0 0 0 0.5px rgba(15,15,20,0.04)`

Dark:
- Window: `0 30px 60px -20px rgba(0,0,0,0.65), 0 0 0 0.5px rgba(255,255,255,0.04)`
- Card hover: `0 4px 12px -3px rgba(0,0,0,0.4)`
- Dropdown: `0 16px 40px -10px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.04)`

### Spacing

- Card inner padding: `13–14 px` (dense mode `11–13`)
- Card list gap: `10 px`
- Hub side padding: `16 px`
- Sticky body padding: `14 16 px`
- Sticky titlebar height: `38 px` (Hub also `38`)
- Sticky bottom bar height: `34 px`
- Dropdown row padding: `7 9–10 px`

---

## Surface 1 — Memo Hub

A list/search window. Default size **420 × 720**, min width **380**, scales down cleanly to 340 ("compact" variant).

### Layout (top → bottom)

1. **Title bar** (38 px, blurred surface, 0.5 px bottom border)
   - Left: 6-dot grip handle (drag region) — 2-col × 3-row dots, `#86868A`/`#7A7A80`.
   - Center: text label "Memo" (12 / 500, subtle).
   - Right: minimize and close icon-buttons (22 × 22, radius 6, hover fills `hover-fill`). Close uses an X glyph; minimize a horizontal bar. **Do not use macOS traffic lights** — this is a custom title bar.

2. **Header row** (padding `14 16 8`)
   - h1 "All memos" — must `white-space: nowrap` and live inside a `flex-shrink: 0` container so it survives compact widths.
   - Right: "N notes" meta (11 / 500, subtle).

3. **Search input** (radius 9, 0.5 px border, 7 10 px padding)
   - Magnifier icon (12, subtle), then `<input>` (12.5 px, transparent, no outline).
   - Background: `#FFFFFF` light / `#1F1F22` dark.

4. **Card list** (vertical, gap 10, scrollable)
   - See "Memo card" below.

5. **Floating "New memo" pill** (bottom-right, 16 px inset)
   - Height 40, side padding `0 16 0 14`, radius 999.
   - Background `accent-fill`, text `accent-text`. Plus icon then label.

### Memo card

Width 100%, radius 12, 0.5 px border, padding `13 14` (dense `11 13`):

- **Top-right corner**: pin glyph if pinned (small, subtle color).
- **Row 1**: title (13.5 / 600), flex-1; on the right, the **`⋮` button** — **25 × 25**, radius 6, **icon size 17 × 17**. Default `color: subtle`; on hover/menu-open background `hover-fill`, color `text`.
- **Row 2**: preview (12 / 400, line-height 1.5, 2-line clamp, color `subtle`).
- **Row 3** (meta): date (11 / 500, subtle), then a tag pill (`9.5/500`, uppercase, 0.04em, 1 4 px padding, 0.5 px border).
- **Selected** state (only when no search query): card background lifts to `surface-alt` (`#FFFFFF` / `#1F1F22`), shadow upgraded.
- **Hover**: 1 px translateY-up animation (transform 120 ms ease).

#### `⋮` dropdown (anchored beneath the button)

Appears `top: 36, right: 8` relative to the card.
- Width `min 148`, padding 5, radius 10, 0.5 px border, dropdown shadow.
- Single row: **"Delete memo"** with a `⌫` shortcut hint on the right. Row padding `7 9`, radius 6, hover `hover-fill`. Click removes the memo from state.

### Search behavior

- Filters by case-insensitive substring across title + preview.
- When query is non-empty, no card shows the "selected" treatment.
- Empty-result state: list area shows centered subtle copy "No memos match '<query>'." (12 px, subtle).

### States to implement

- Default (light, dark)
- Searching (with matching cards filtered)
- Empty result
- Compact 340 px width (header must not wrap)

---

## Surface 2 — Sticky Memo

A single floating note window. Default **340 × 400**, also shown at **260 × 320** and **420 × 320**.

### Layout

1. **Title bar** (38 px, blurred surface, 0.5 px bottom border)
   - Left: small **`+`** icon-button (22 × 22, hover `hover-fill`) — creates a new note.
   - Center: drag region (flex-1), containing a tiny "Saved" status when relevant.
   - Right cluster, **strict order left→right**: `…` (more) · pin · minimize · close. Each 22 × 22, radius 6, hover `hover-fill`. Active/pinned state for pin uses `hover-fill` background as the "on" indicator.

2. **Body** (flex-1, padding `14 16`, `overflow: visible`)
   - Click to switch to a `<textarea>` (transparent, no outline, font-size 13.5, line-height 1.6).
   - Blur → render markdown subset (see below).
   - **Note**: body uses `overflow: visible` so the slash palette can escape vertically if needed.

3. **Bottom bar** (34 px, blurred, 0.5 px top border)
   - Left cluster: **formatting buttons B · U · ☑ · S** — each **25 × 25**, radius 6, **icon 15 × 15**, hover `hover-fill`. (Bold / Underline / Checkbox / Strikethrough.)
   - Right: word + char count (small, subtle) then a **Group** toggle (track 30 × 18, thumb 14, radius 999, "on" track = `accent-fill`, "off" track = subtle border + transparent).

### Markdown rendering (live, on blur)

Supported syntax (line-based, with inline tokens):

| Syntax | Render |
|---|---|
| `# heading` | h1, 15 px / 700 |
| `## heading` | h2, 13.5 px / 600 |
| `- item` | list bullet (• then text) |
| `> quote` | left 2 px border `subtle`, padding-left 8, italic color `subtle` |
| `**bold**` | `<strong>`, weight 700 |
| `*italic*` | `<em>` |
| `` `code` `` | inline `<code>`: ui-monospace, 12 px, 1 5 px padding, radius 4, bg `code-inline` |

### `…` dropdown

Anchored **`top: calc(100% + 4px), right: 4`** beneath the `…` button (overlays body content via `z-index: 9999`):

- Surface: `#FFFFFF` / `#202024`, 0.5 px border, radius 11, padding 6, dropdown shadow.
- Min-width 200.
- Rows (each 7 10 px, radius 7, hover `hover-fill`, label 12.5):
  1. **Note list** — icon + label + shortcut `⌘L`
  2. **Note color** — icon + label + a 3-swatch preview on the right (10 × 10 each, radius 3, 0.5 px border). On hover, a secondary palette flyout appears.
  3. **Delete** — destructive (red `#D9534F` / `#E96A60`), trash icon

### Slash command palette

Triggered when the user types `/` in the body. The palette is **anchored inline** at the slash caret position — not floating from a fixed offset. To achieve this:

- Split the body string at the **last `/`**.
- Render text before the slash as-is, then an inline `<span>` containing: the typed slash query (`/`, `/t`, `/to`…), a blinking caret (1 px wide, 1.1 em tall, `text` color, 1 s steps animation), then the palette in a positioned wrapper underneath.

Palette surface:
- Width 248, padding 6, radius 11, 0.5 px border, dropdown shadow.
- `margin-top: 6` from the inline anchor.

Commands (filter on prefix-match of the slash query):

| Command | Hint (Korean) |
|---|---|
| `/today` | 오늘 날짜 |
| `/time` | 현재 시간 |
| `/tomorrow` | 내일 날짜 |
| `/todo` | 할일 체크박스 |
| `/divider` | 구분선 |
| `/quote` | 인용구 |

(There used to be a `/week` — it was removed; do not include it.)

Row layout (per command):
- 7 9 px padding, radius 7, hover/selected bg = `hover-fill`.
- Icon (12 × 12), then `/command` in ui-monospace 12.5, then hint in 11.5 subtle.
- Selected row shows a `↵` kbd badge on the right (9.5 px, 0.06em, padding 2 5, radius 4, bg `kbd-bg`).

Palette footer (under a 0.5 px top divider, padding `5 9`):
- `↑↓ navigate · ↵ insert · esc`, 10 px subtle.

Keyboard:
- ↑/↓ moves `selected` index.
- Enter inserts the command's expansion at the caret and closes the palette.
- Esc closes.

---

## Interactions checklist

### Memo Hub

- [ ] Click a card → select it (selection is suppressed while a search query is active).
- [ ] Hover a card → 1 px lift via `transform: translateY(-1px)` with 120 ms ease.
- [ ] Type in search → filter list; show empty-state copy when no match.
- [ ] Click `⋮` on a card → open per-card dropdown; click outside → close.
- [ ] Click "Delete memo" in the dropdown → remove memo from state.
- [ ] Click "New memo" pill → create a new draft memo, open Sticky Memo on it.
- [ ] Title bar drag region must be the OS window's draggable region; close/minimize hit the OS chrome handlers.

### Sticky Memo

- [ ] Click body → enter edit mode (`<textarea>`).
- [ ] Blur → render markdown.
- [ ] Type `/` → open slash palette anchored at caret.
- [ ] ↑/↓ in palette → cycle commands; Enter → insert; Esc → close.
- [ ] Click `…` → open dropdown (overlays body, z 9999).
- [ ] Click pin → toggle pinned state (persisted to the memo).
- [ ] Toggle "Group" at bottom-right → toggle the memo's group membership.
- [ ] Click `+` (top-left) → spawn a new sticky.

---

## State model (suggested)

```ts
type Memo = {
  id: string;
  title: string;
  body: string;          // markdown source
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
  grouped: boolean;
  tag?: string;          // e.g. "WORK", "PERSONAL"
  color?: 'default' | 'paper' | 'sand'; // for Note color palette
};

type AppState = {
  memos: Memo[];
  query: string;
  selectedId: string | null;
  theme: 'light' | 'dark';
  openMenuId: string | null;     // hub: which card's ⋮ menu is open
  stickyState: {
    moreOpen: boolean;
    paletteOpen: boolean;        // Note color flyout
    slashOpen: boolean;
    slashQuery: string;          // text after the slash, e.g. "/t"
    slashSelected: number;
  };
};
```

Persist `memos`, `theme`, and `pinned`/`grouped` to disk (localStorage / app store / Core Data — whatever the host provides).

---

## Assets / dependencies

- **Pretendard Variable** — load via `@fontsource/pretendard-variable` (npm) or the CDN used in the prototypes:
  `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.css`
- Icons are inline SVG strokes — re-draw with your icon system (Lucide/Phosphor/SF Symbols all work). The set: plus, x, minimize-line, pin, more-vertical, more-horizontal, search, trash, list, palette, bold, underline, check-square, strikethrough, calendar, clock, divider-horizontal, quote.

No bitmap assets are used.

---

## Files in this bundle

| File | Purpose |
|---|---|
| `Memo Hub.html` | Standalone preview of the Hub (light + dark + states + compact) |
| `Sticky Memo.html` | Standalone preview of the Sticky Memo (light + dark + dropdown + slash palette + sizes) |
| `memo-app.jsx` | React/Babel source for the Hub — read for exact values, do **not** ship as-is |
| `sticky-memo.jsx` | React/Babel source for the Sticky Memo — same |
| `design-canvas.jsx` | Helper component used only to lay out the artboards in the previews; not part of the product UI |

Open the HTML files directly in a browser to interact with the prototypes.
