/* global React */
const { useState, useRef, useEffect } = React;

const StickyIcon = {
  Plus: (p) => (
    <svg viewBox="0 0 16 16" fill="none" {...p}>
      <path d="M8 3.25V12.75M3.25 8H12.75" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  Pin: (p) => (
    <svg viewBox="0 0 14 14" fill="none" {...p}>
      <path d="M8.6 1.6L12.4 5.4L10 6L7.8 11.2L2.8 6.2L8 4L8.6 1.6Z" stroke="currentColor" strokeWidth="1.05" strokeLinejoin="round" />
      <path d="M5 9L1.5 12.5" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" />
    </svg>
  ),
  PinFilled: (p) => (
    <svg viewBox="0 0 14 14" fill="none" {...p}>
      <path d="M8.6 1.6L12.4 5.4L10 6L7.8 11.2L2.8 6.2L8 4L8.6 1.6Z" fill="currentColor" stroke="currentColor" strokeWidth="1.05" strokeLinejoin="round" />
      <path d="M5 9L1.5 12.5" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" />
    </svg>
  ),
  Minimize: (p) => (
    <svg viewBox="0 0 12 12" fill="none" {...p}>
      <path d="M3 6H9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  ),
  Close: (p) => (
    <svg viewBox="0 0 12 12" fill="none" {...p}>
      <path d="M3.25 3.25L8.75 8.75M8.75 3.25L3.25 8.75" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  ),
  More: (p) => (
    <svg viewBox="0 0 16 16" fill="none" {...p}>
      <circle cx="3.5" cy="8" r="1.1" fill="currentColor" />
      <circle cx="8" cy="8" r="1.1" fill="currentColor" />
      <circle cx="12.5" cy="8" r="1.1" fill="currentColor" />
    </svg>
  ),
  Resize: (p) => (
    <svg viewBox="0 0 12 12" fill="none" {...p}>
      <path d="M11 5L5 11M11 9L9 11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  ),
  List: (p) => (
    <svg viewBox="0 0 16 16" fill="none" {...p}>
      <path d="M4 5H12M4 8H12M4 11H9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),
  Palette: (p) => (
    <svg viewBox="0 0 16 16" fill="none" {...p}>
      <rect x="2.5" y="2.5" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2.5 7H13.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
  Trash: (p) => (
    <svg viewBox="0 0 16 16" fill="none" {...p}>
      <path d="M3 5H13M6 5V3.5C6 3.22 6.22 3 6.5 3H9.5C9.78 3 10 3.22 10 3.5V5M4.5 5L5 12.5C5 12.78 5.22 13 5.5 13H10.5C10.78 13 11 12.78 11 12.5L11.5 5" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Check: (p) => (
    <svg viewBox="0 0 12 12" fill="none" {...p}>
      <path d="M2.5 6.25L5 8.75L9.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Bold: (p) => (
    <svg viewBox="0 0 14 14" fill="none" {...p}>
      <path d="M4 2.5H8.25C9.49 2.5 10.5 3.51 10.5 4.75C10.5 5.99 9.49 7 8.25 7H4V2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M4 7H8.75C10.13 7 11.25 8.12 11.25 9.5C11.25 10.88 10.13 11.5 8.75 11.5H4V7Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  ),
  Underline: (p) => (
    <svg viewBox="0 0 14 14" fill="none" {...p}>
      <path d="M4 2.5V7.5C4 9.16 5.34 10.5 7 10.5C8.66 10.5 10 9.16 10 7.5V2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M3 12.5H11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  Checkbox: (p) => (
    <svg viewBox="0 0 14 14" fill="none" {...p}>
      <rect x="2.5" y="2.5" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 7L6.5 8.5L9 5.75" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Strike: (p) => (
    <svg viewBox="0 0 14 14" fill="none" {...p}>
      <path d="M4 4.25C4 3.28 5 2.5 6.5 2.5C7.7 2.5 8.6 3 9 3.75" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M5 9.5C5 10.5 6 11.5 7.5 11.5C9 11.5 10 10.7 10 9.5C10 8.7 9.6 8.2 9 7.85" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M2.5 7H11.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
};

function StickyToggle({ on, onChange, theme }) {
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={(e) => { e.stopPropagation(); onChange && onChange(!on); }}
      style={{
        width: 30, height: 18, borderRadius: 999, padding: 0, border: "none",
        position: "relative", cursor: "pointer",
        transition: "background 180ms ease",
        background: on
          ? (isDark ? "#E8E8E8" : "#1A1A1A")
          : (isDark ? "#3A3A3D" : "#D9D9DC"),
        flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute", top: 2, left: on ? 14 : 2,
        width: 14, height: 14, borderRadius: 999,
        background: "#FFFFFF",
        boxShadow: "0 1px 2px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.06)",
        transition: "left 180ms cubic-bezier(.4,.0,.2,1)",
      }} />
    </button>
  );
}

// Render a markdown-ish text body with inline styling.
// Achromatic. Supports # headings, **bold**, *italic*, `code`, - lists, > quotes.
function MarkdownBody({ text, theme }) {
  const isDark = theme === "dark";
  const fg = isDark ? "#EAEAEC" : "#1A1A1F";
  const muted = isDark ? "#86868A" : "#86868D";
  const codeBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const quoteBar = isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.15)";

  const lines = text.split("\n");
  const rendered = [];
  let listBuffer = [];

  const flushList = () => {
    if (listBuffer.length) {
      rendered.push(
        <ul key={`l-${rendered.length}`} style={{ margin: "4px 0 8px 0", padding: 0, listStyle: "none" }}>
          {listBuffer.map((item, i) => (
            <li key={i} style={{ display: "flex", gap: 8, padding: "2px 0", fontSize: 13.5, lineHeight: 1.55, color: fg }}>
              <span style={{ color: muted, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>—</span>
              <span style={{ flex: 1 }}>{renderInline(item, fg, muted, codeBg)}</span>
            </li>
          ))}
        </ul>,
      );
      listBuffer = [];
    }
  };

  lines.forEach((line, idx) => {
    if (line.startsWith("- ")) { listBuffer.push(line.slice(2)); return; }
    flushList();
    if (line.startsWith("# ")) {
      rendered.push(<h3 key={idx} style={{ fontSize: 16, fontWeight: 700, margin: "2px 0 8px", letterSpacing: "-0.015em", color: fg }}>{line.slice(2)}</h3>);
    } else if (line.startsWith("## ")) {
      rendered.push(<h4 key={idx} style={{ fontSize: 13, fontWeight: 600, margin: "10px 0 4px", letterSpacing: "0.04em", textTransform: "uppercase", color: muted }}>{line.slice(3)}</h4>);
    } else if (line.startsWith("> ")) {
      rendered.push(
        <blockquote key={idx} style={{ margin: "6px 0", paddingLeft: 10, borderLeft: `2px solid ${quoteBar}`, color: muted, fontSize: 13, lineHeight: 1.55, fontStyle: "italic" }}>
          {renderInline(line.slice(2), muted, muted, codeBg)}
        </blockquote>,
      );
    } else if (line.trim() === "") {
      rendered.push(<div key={idx} style={{ height: 6 }} />);
    } else {
      rendered.push(
        <p key={idx} style={{ margin: "2px 0", fontSize: 13.5, lineHeight: 1.6, color: fg, letterSpacing: "-0.005em" }}>
          {renderInline(line, fg, muted, codeBg)}
        </p>,
      );
    }
  });
  flushList();
  return <>{rendered}</>;
}

function renderInline(s, fg, muted, codeBg) {
  // tokenize: **bold**, *italic*, `code`
  const tokens = [];
  let i = 0;
  let buf = "";
  while (i < s.length) {
    if (s[i] === "*" && s[i + 1] === "*") {
      if (buf) { tokens.push({ t: "text", v: buf }); buf = ""; }
      const end = s.indexOf("**", i + 2);
      if (end === -1) { buf += s.slice(i); break; }
      tokens.push({ t: "bold", v: s.slice(i + 2, end) });
      i = end + 2;
    } else if (s[i] === "*") {
      if (buf) { tokens.push({ t: "text", v: buf }); buf = ""; }
      const end = s.indexOf("*", i + 1);
      if (end === -1) { buf += s.slice(i); break; }
      tokens.push({ t: "italic", v: s.slice(i + 1, end) });
      i = end + 1;
    } else if (s[i] === "`") {
      if (buf) { tokens.push({ t: "text", v: buf }); buf = ""; }
      const end = s.indexOf("`", i + 1);
      if (end === -1) { buf += s.slice(i); break; }
      tokens.push({ t: "code", v: s.slice(i + 1, end) });
      i = end + 1;
    } else {
      buf += s[i]; i++;
    }
  }
  if (buf) tokens.push({ t: "text", v: buf });

  return tokens.map((tk, k) => {
    if (tk.t === "bold") return <strong key={k} style={{ fontWeight: 700, color: fg }}>{tk.v}</strong>;
    if (tk.t === "italic") return <em key={k} style={{ fontStyle: "italic", color: fg }}>{tk.v}</em>;
    if (tk.t === "code") return <code key={k} style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12, background: codeBg, padding: "1px 5px", borderRadius: 4, color: fg }}>{tk.v}</code>;
    return <span key={k}>{tk.v}</span>;
  });
}

function MoreDropdown({ theme, onClose, onPaletteOpen }) {
  const isDark = theme === "dark";
  const bg = isDark ? "#202024" : "#FFFFFF";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const text = isDark ? "#EAEAEC" : "#1A1A1F";
  const muted = isDark ? "#86868A" : "#86868D";
  const hover = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
  const divider = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  const Row = ({ icon, label, shortcut, color, onClick, trailing }) => {
    const [h, setH] = useState(false);
    return (
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setH(true)}
        onMouseLeave={() => setH(false)}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          width: "100%", padding: "7px 10px", borderRadius: 7,
          border: "none", background: h ? hover : "transparent",
          color: color || text, fontSize: 12.5, fontFamily: "inherit",
          cursor: "pointer", textAlign: "left", letterSpacing: "-0.005em",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", color: color || muted }}>{icon}</span>
        <span style={{ flex: 1 }}>{label}</span>
        {trailing}
        {shortcut && <span style={{ fontSize: 10.5, color: muted, letterSpacing: "0.04em" }}>{shortcut}</span>}
      </button>
    );
  };

  return (
    <div
      style={{
        position: "absolute", top: "calc(100% + 4px)", right: 4,
        minWidth: 200, padding: 6,
        background: bg, border: `0.5px solid ${border}`, borderRadius: 11,
        boxShadow: isDark
          ? "0 16px 40px -10px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.04)"
          : "0 16px 40px -10px rgba(15,15,20,0.18), 0 2px 6px -2px rgba(15,15,20,0.08)",
        zIndex: 9999, fontFamily: "inherit",
      }}
    >
      <Row icon={<StickyIcon.List width={13} height={13} />} label="Note list" shortcut="⌘L" />
      <div onMouseEnter={onPaletteOpen} style={{ position: "relative" }}>
        <Row
          icon={<StickyIcon.Palette width={13} height={13} />}
          label="Note color"
          trailing={
            <div style={{ display: "flex", gap: 3, marginRight: 4 }}>
              {[isDark ? "#202024" : "#FFFFFF", isDark ? "#2A2A2E" : "#F4F4F2", isDark ? "#36363A" : "#E8E8E5"].map((c, i) => (
                <span key={i} style={{ width: 10, height: 10, borderRadius: 3, background: c, border: `0.5px solid ${border}` }} />
              ))}
            </div>
          }
        />
      </div>
      <div style={{ height: 1, background: divider, margin: "4px 6px" }} />
      <Row icon={<StickyIcon.Trash width={13} height={13} />} label="Delete memo" shortcut="⌫" />
    </div>
  );
}

const SLASH_COMMANDS = [
  { id: "date",     emoji: "📅", cmd: "/date",     hint: "오늘 날짜 삽입" },
  { id: "time",     emoji: "🕐", cmd: "/time",     hint: "현재 시간 삽입" },
  { id: "tomorrow", emoji: "📅", cmd: "/tomorrow", hint: "내일 날짜 삽입" },
  { id: "todo",     emoji: "☑",  cmd: "/todo",     hint: "체크박스 삽입" },
  { id: "hr",       emoji: "➖", cmd: "/hr",       hint: "구분선 삽입" },
  { id: "code",     emoji: "💻", cmd: "/code",     hint: "코드 블럭 삽입" },
];

function SlashCommandPalette({ theme, query = "", selected = 0 }) {
  const isDark = theme === "dark";
  const bg = isDark ? "#202024" : "#FFFFFF";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const text = isDark ? "#EAEAEC" : "#1A1A1F";
  const muted = isDark ? "#86868A" : "#86868D";
  const hover = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
  const divider = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const kbdBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";

  const q = (query || "").replace(/^\//, "").toLowerCase();
  const list = q ? SLASH_COMMANDS.filter((c) => c.cmd.slice(1).startsWith(q)) : SLASH_COMMANDS;

  return (
    <div
      style={{
        position: "absolute", top: "100%", left: 0,
        marginTop: 6,
        width: 248, padding: 6,
        background: bg, border: `0.5px solid ${border}`, borderRadius: 11,
        boxShadow: isDark
          ? "0 16px 40px -10px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.04)"
          : "0 16px 40px -10px rgba(15,15,20,0.18), 0 2px 6px -2px rgba(15,15,20,0.08)",
        zIndex: 9998, fontFamily: "inherit",
      }}
    >
      <div style={{
        padding: "5px 8px 7px", fontSize: 10, color: muted,
        letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600,
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
      }}>
        <span>Commands</span>
        <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 500, letterSpacing: "0.04em" }}>
          {list.length}
        </span>
      </div>
      <div style={{ height: 1, background: divider, margin: "0 4px 4px" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {list.map((c, i) => {
          const isSel = i === selected;
          return (
            <div
              key={c.id}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "7px 9px", borderRadius: 7,
                background: isSel ? hover : "transparent",
                cursor: "pointer",
              }}
            >
              <span style={{
                fontSize: 14, lineHeight: 1, width: 16, textAlign: "center",
                filter: isDark ? "saturate(0)" : "saturate(0)",
                opacity: 0.9,
              }}>{c.emoji}</span>
              <span style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 12, color: text, letterSpacing: "0.005em",
                background: isSel ? "transparent" : "transparent",
                padding: "1px 0",
                minWidth: 72,
              }}>{c.cmd}</span>
              <span style={{ flex: 1, fontSize: 12, color: muted, letterSpacing: "-0.005em" }}>
                {c.hint}
              </span>
              {isSel && (
                <span style={{
                  fontSize: 9.5, color: muted, letterSpacing: "0.06em",
                  background: kbdBg, padding: "2px 5px", borderRadius: 4,
                }}>↵</span>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ height: 1, background: divider, margin: "4px 4px 0" }} />
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "6px 8px 4px", fontSize: 10, color: muted, letterSpacing: "0.02em",
      }}>
        <span>↑↓ navigate · ↵ insert</span>
        <span>esc</span>
      </div>
    </div>
  );
}

function StickyMemo({
  theme = "light",
  width = 320,
  height = 380,
  initialContent,
  dropdownOpen = false,
  pinned = false,
  grouped = true,
  pinHover = false,
  showResize = true,
  slashOpen = false,
  slashQuery = "",
  slashSelected = 0,
}) {
  const isDark = theme === "dark";

  const defaultContent = initialContent ?? `# Tuesday, slow morning
A few threads to chase before the standup. Keep it short.

## To do
- Reply to **Mira** about the Q3 review
- Pull the *cutover* numbers from last week
- Cancel internet by Wed — \`landlord@flat\`

> "The moon is a button." — overheard, kept for posterity.

Coffee dialed in finer. Espresso log updated.`;

  const [content, setContent] = useState(defaultContent);
  const [isPinned, setIsPinned] = useState(pinned);
  const [isGrouped, setIsGrouped] = useState(grouped);
  const [open, setOpen] = useState(dropdownOpen);
  const [editing, setEditing] = useState(false);
  const taRef = useRef(null);

  useEffect(() => { setOpen(dropdownOpen); }, [dropdownOpen]);

  const bg = isDark ? "#161618" : "#FCFCFA";
  const titleBarBg = isDark ? "rgba(28,28,30,0.92)" : "rgba(252,252,250,0.92)";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const subtle = isDark ? "#86868A" : "#86868D";
  const subtleHover = isDark ? "#D4D4D6" : "#1A1A1F";
  const text = isDark ? "#EAEAEC" : "#1A1A1F";
  const bottomBarBg = isDark ? "rgba(20,20,22,0.85)" : "rgba(248,248,245,0.85)";

  const charCount = content.replace(/\s+/g, "").length;
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  const IconBtn = ({ children, onClick, active, "aria-label": al, danger, size = 22 }) => {
    const [h, setH] = useState(false);
    return (
      <button
        type="button"
        aria-label={al}
        onClick={onClick}
        onMouseEnter={() => setH(true)}
        onMouseLeave={() => setH(false)}
        style={{
          width: size, height: size, borderRadius: 6, border: "none",
          background: h || active ? (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)") : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: active ? text : (h ? subtleHover : subtle),
          cursor: "pointer", transition: "background 120ms, color 120ms",
        }}
      >
        {children}
      </button>
    );
  };

  return (
    <div
      style={{
        width, height, borderRadius: 14, overflow: "visible",
        background: bg,
        border: `0.5px solid ${border}`,
        boxShadow: isDark
          ? "0 30px 60px -20px rgba(0,0,0,0.65), 0 0 0 0.5px rgba(255,255,255,0.04)"
          : "0 30px 60px -20px rgba(15,15,20,0.18), 0 4px 12px -2px rgba(15,15,20,0.06)",
        fontFamily: "'Pretendard Variable', 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
        color: text, display: "flex", flexDirection: "column", position: "relative",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          height: 34, padding: "0 6px",
          background: titleBarBg,
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderBottom: `0.5px solid ${border}`,
          borderTopLeftRadius: 14, borderTopRightRadius: 14,
          display: "flex", alignItems: "center", gap: 2,
          userSelect: "none", flexShrink: 0,
        }}
      >
        <IconBtn aria-label="New memo"><StickyIcon.Plus width={11} height={11} /></IconBtn>

        {/* Drag area */}
        <div style={{ flex: 1, height: "100%", cursor: "grab", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 10.5, color: subtle, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>
            {isPinned ? "Pinned" : "Sticky memo"}
          </span>
        </div>

        <IconBtn aria-label="More" active={open} onClick={() => setOpen((v) => !v)}>
          <StickyIcon.More width={12} height={12} />
        </IconBtn>
        <IconBtn aria-label="Pin" active={isPinned} onClick={() => setIsPinned((v) => !v)}>
          {isPinned ? <StickyIcon.PinFilled width={11} height={11} /> : <StickyIcon.Pin width={11} height={11} />}
        </IconBtn>
        <IconBtn aria-label="Minimize"><StickyIcon.Minimize width={11} height={11} /></IconBtn>
        <IconBtn aria-label="Close"><StickyIcon.Close width={11} height={11} /></IconBtn>

        {open && <MoreDropdown theme={theme} onClose={() => setOpen(false)} />}
      </div>

      {/* Body — markdown editing area */}
      <div
        onClick={() => { setEditing(true); setTimeout(() => taRef.current && taRef.current.focus(), 0); }}
        style={{
          flex: 1,
          padding: "16px 18px 14px",
          overflow: slashOpen ? "visible" : "auto",
          cursor: "text",
          position: "relative",
        }}
      >
        {editing ? (
          <textarea
            ref={taRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={() => setEditing(false)}
            style={{
              width: "100%", height: "100%", resize: "none", border: "none",
              outline: "none", background: "transparent",
              color: text, fontFamily: "inherit", fontSize: 13.5, lineHeight: 1.6,
              letterSpacing: "-0.005em", padding: 0,
            }}
          />
        ) : (
          <>
            {(() => {
              if (!slashOpen) return <MarkdownBody text={content} theme={theme} />;
              // Anchor the palette to the inline caret where "/" was typed.
              // We render the body up to the last slash, then an inline anchor span
              // holding the typed slash query + a blinking caret + the palette.
              const slashIdx = content.lastIndexOf("/");
              const before = slashIdx >= 0 ? content.slice(0, slashIdx) : content;
              const typed = slashIdx >= 0 ? content.slice(slashIdx) : ("/" + (slashQuery || "").replace(/^\//, ""));
              return (
                <>
                  <MarkdownBody text={before} theme={theme} />
                  <span style={{
                    position: "relative",
                    display: "inline-flex",
                    alignItems: "baseline",
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: 13,
                    color: text,
                    letterSpacing: "0.005em",
                  }}>
                    <span>{typed}</span>
                    <span
                      aria-hidden="true"
                      style={{
                        display: "inline-block",
                        width: 1.5,
                        height: 14,
                        background: text,
                        marginLeft: 1,
                        transform: "translateY(2px)",
                        animation: "stickyCaret 1.1s steps(1) infinite",
                      }}
                    />
                    <SlashCommandPalette
                      theme={theme}
                      query={typed}
                      selected={slashSelected}
                    />
                  </span>
                </>
              );
            })()}
          </>
        )}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          height: 34, padding: "0 4px 0 8px",
          background: bottomBarBg,
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderTop: `0.5px solid ${border}`,
          borderBottomLeftRadius: 14, borderBottomRightRadius: 14,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0, userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
          {[
            { key: "bold",      label: "Bold",          Icon: StickyIcon.Bold },
            { key: "underline", label: "Underline",     Icon: StickyIcon.Underline },
            { key: "checkbox",  label: "Checkbox",      Icon: StickyIcon.Checkbox },
            { key: "strike",    label: "Strikethrough", Icon: StickyIcon.Strike },
          ].map(({ key, label, Icon }) => (
            <IconBtn key={key} aria-label={label} size={25}>
              <Icon width={15} height={15} />
            </IconBtn>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10.5, color: subtle, letterSpacing: "0.02em" }}>Group</span>
          <StickyToggle on={isGrouped} onChange={setIsGrouped} theme={theme} />
        </div>
      </div>

      {/* Resize handle */}
      {showResize && (
        <div
          style={{
            position: "absolute", right: 2, bottom: 2,
            width: 14, height: 14, color: subtle, opacity: 0.6,
            pointerEvents: "none",
            display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
          }}
        >
          <StickyIcon.Resize width={10} height={10} />
        </div>
      )}
    </div>
  );
}

Object.assign(window, { StickyMemo, SlashCommandPalette });
