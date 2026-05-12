/* global React */
const { useState, useMemo } = React;

// ---------- Icons (achromatic, hairline) ----------
const Icon = {
  Search: (props) => (
    <svg viewBox="0 0 16 16" fill="none" {...props}>
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  ),
  Plus: (props) => (
    <svg viewBox="0 0 16 16" fill="none" {...props}>
      <path d="M8 3.25V12.75M3.25 8H12.75" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  Minimize: (props) => (
    <svg viewBox="0 0 12 12" fill="none" {...props}>
      <path d="M3 6H9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  ),
  Close: (props) => (
    <svg viewBox="0 0 12 12" fill="none" {...props}>
      <path d="M3.25 3.25L8.75 8.75M8.75 3.25L3.25 8.75" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  ),
  Grip: (props) => (
    <svg viewBox="0 0 10 16" fill="none" {...props}>
      <circle cx="3" cy="4" r="0.8" fill="currentColor" />
      <circle cx="7" cy="4" r="0.8" fill="currentColor" />
      <circle cx="3" cy="8" r="0.8" fill="currentColor" />
      <circle cx="7" cy="8" r="0.8" fill="currentColor" />
      <circle cx="3" cy="12" r="0.8" fill="currentColor" />
      <circle cx="7" cy="12" r="0.8" fill="currentColor" />
    </svg>
  ),
  Sort: (props) => (
    <svg viewBox="0 0 16 16" fill="none" {...props}>
      <path d="M4 4H12M5.5 8H10.5M7 12H9" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  ),
  Pin: (props) => (
    <svg viewBox="0 0 14 14" fill="none" {...props}>
      <path d="M8.5 1.5L12.5 5.5L10 6L8 11L3 6L8 4L8.5 1.5Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M5 9L1.5 12.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  ),
  MoreVert: (props) => (
    <svg viewBox="0 0 16 16" fill="none" {...props}>
      <circle cx="8" cy="3.5" r="1.1" fill="currentColor" />
      <circle cx="8" cy="8" r="1.1" fill="currentColor" />
      <circle cx="8" cy="12.5" r="1.1" fill="currentColor" />
    </svg>
  ),
  Trash: (props) => (
    <svg viewBox="0 0 16 16" fill="none" {...props}>
      <path d="M3 5H13M6 5V3.5C6 3.22 6.22 3 6.5 3H9.5C9.78 3 10 3.22 10 3.5V5M4.5 5L5 12.5C5 12.78 5.22 13 5.5 13H10.5C10.78 13 11 12.78 11 12.5L11.5 5" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

// ---------- Toggle ----------
function Toggle({ on, onChange, theme }) {
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={(e) => { e.stopPropagation(); onChange(!on); }}
      style={{
        width: 30,
        height: 18,
        borderRadius: 999,
        padding: 0,
        border: "none",
        position: "relative",
        cursor: "pointer",
        transition: "background 180ms ease",
        background: on
          ? (isDark ? "#E8E8E8" : "#1A1A1A")
          : (isDark ? "#3A3A3D" : "#D9D9DC"),
        boxShadow: on
          ? "inset 0 0 0 0.5px rgba(0,0,0,0.08)"
          : (isDark ? "inset 0 0 0 0.5px rgba(255,255,255,0.04)" : "inset 0 0 0 0.5px rgba(0,0,0,0.04)"),
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: on ? 14 : 2,
          width: 14,
          height: 14,
          borderRadius: 999,
          background: on ? (isDark ? "#0F0F10" : "#FFFFFF") : (isDark ? "#0F0F10" : "#FFFFFF"),
          boxShadow: "0 1px 2px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.06)",
          transition: "left 180ms cubic-bezier(.4,.0,.2,1)",
        }}
      />
    </button>
  );
}

// ---------- Memo Item ----------
function MemoItem({ memo, theme, selected, onClick, dense, menuOpen, onMenuToggle, onDelete }) {
  const isDark = theme === "dark";
  const [hover, setHover] = useState(false);

  const cardBg = isDark
    ? (selected ? "#222226" : "#1A1A1D")
    : (selected ? "#FFFFFF" : "#FFFFFF");
  const cardBorder = isDark
    ? (selected ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.05)")
    : (selected ? "rgba(0,0,0,0.10)" : "rgba(0,0,0,0.05)");
  const cardShadow = selected
    ? (isDark
        ? "0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -8px rgba(0,0,0,0.5)"
        : "0 1px 2px rgba(15,15,20,0.04), 0 6px 20px -6px rgba(15,15,20,0.10)")
    : (isDark
        ? "0 1px 1px rgba(0,0,0,0.25)"
        : "0 1px 1px rgba(15,15,20,0.03), 0 1px 0 rgba(15,15,20,0.02)");
  const titleColor = isDark ? "#F4F4F5" : "#15151A";
  const metaColor = isDark ? "#86868A" : "#86868D";
  const subtleHover = isDark ? "#D4D4D6" : "#1A1A1F";
  const previewColor = isDark ? "#A8A8AC" : "#5F5F66";
  const menuBg = isDark ? "#202024" : "#FFFFFF";
  const menuBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const menuHover = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      style={{
        background: cardBg,
        border: `0.5px solid ${cardBorder}`,
        borderRadius: 12,
        padding: dense ? "11px 13px" : "13px 14px",
        boxShadow: cardShadow,
        cursor: "pointer",
        transition: "background 140ms ease, box-shadow 160ms ease, transform 160ms ease",
        transform: hover && !selected ? "translateY(-0.5px)" : "translateY(0)",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        {memo.pinned && (
          <Icon.Pin
            width={9}
            height={9}
            style={{ color: isDark ? "#A8A8AC" : "#86868D", flexShrink: 0 }}
          />
        )}
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: titleColor,
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineHeight: 1.35,
            flex: 1,
          }}
        >
          {memo.title}
        </div>
        <button
          type="button"
          aria-label="More"
          onClick={(e) => { e.stopPropagation(); onMenuToggle && onMenuToggle(memo.id); }}
          onMouseEnter={(e) => (e.currentTarget.style.color = subtleHover)}
          onMouseLeave={(e) => (e.currentTarget.style.color = metaColor)}
          style={{
            width: 25, height: 25, borderRadius: 6, border: "none",
            background: menuOpen ? (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)") : "transparent",
            color: menuOpen ? (isDark ? "#F4F4F5" : "#15151A") : metaColor,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", flexShrink: 0,
            opacity: hover || menuOpen ? 1 : 0.55,
            transition: "opacity 120ms, background 120ms, color 120ms",
          }}
        >
          <Icon.MoreVert width={17} height={17} />
        </button>
      </div>

      {memo.preview && !dense && (
        <div
          style={{
            fontSize: 11.5,
            color: previewColor,
            lineHeight: 1.45,
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            letterSpacing: "-0.005em",
          }}
        >
          {memo.preview}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10.5, color: metaColor, letterSpacing: "0.01em" }}>
        <span>{memo.date}</span>
      </div>

      {menuOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute", top: 36, right: 8,
            minWidth: 148, padding: 5,
            background: menuBg, border: `0.5px solid ${menuBorder}`, borderRadius: 10,
            boxShadow: isDark
              ? "0 16px 40px -10px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.04)"
              : "0 16px 40px -10px rgba(15,15,20,0.18), 0 2px 6px -2px rgba(15,15,20,0.08)",
            zIndex: 30,
          }}
        >
          <button
            type="button"
            onClick={() => onDelete && onDelete(memo.id)}
            onMouseEnter={(e) => (e.currentTarget.style.background = menuHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            style={{
              display: "flex", alignItems: "center", gap: 9,
              width: "100%", padding: "7px 9px", borderRadius: 6,
              border: "none", background: "transparent",
              color: isDark ? "#F4F4F5" : "#15151A",
              fontSize: 12.5, fontFamily: "inherit",
              cursor: "pointer", textAlign: "left", letterSpacing: "-0.005em",
            }}
          >
            <Icon.Trash width={13} height={13} style={{ color: metaColor }} />
            <span style={{ flex: 1 }}>Delete memo</span>
            <span style={{ fontSize: 10, color: metaColor, letterSpacing: "0.04em" }}>⌫</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ---------- Memo Window ----------
function MemoWindow({ theme = "light", width = 380, height = 580, initialQuery = "" }) {
  const isDark = theme === "dark";

  const [query, setQuery] = useState(initialQuery);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [memos, setMemos] = useState([
    { id: 1, title: "Q3 product review notes", preview: "Three open threads from the offsite — pricing, onboarding, and the retention deck.", date: "Today, 10:42", group: "Work", grouped: true, pinned: true },
    { id: 2, title: "Reading list — May", preview: "Annie Dillard, Borges short stories, and the long Knuth interview.", date: "Today, 09:14", group: "Personal", grouped: false, pinned: false },
    { id: 3, title: "Apartment checklist", preview: "Movers Friday. Cancel internet by Wed. Keys to landlord.", date: "Yesterday", group: "Home", grouped: true, pinned: false },
    { id: 4, title: "Espresso log", preview: "Onyx Monarch — 18g in, 36g out, 28s. A touch sour, dial finer.", date: "Yesterday", group: "Personal", grouped: true, pinned: false },
    { id: 5, title: "Draft: resignation letter", preview: "Two weeks notice. Keep it warm. No drama.", date: "May 8", group: "Work", grouped: false, pinned: false },
    { id: 6, title: "Things Mira said this week", preview: "‘The moon is a button.’ Logged for posterity.", date: "May 7", group: "Family", grouped: true, pinned: false },
    { id: 7, title: "Server migration plan", preview: "Cutover window: Sunday 02:00–04:00. Roll-back path documented.", date: "May 6", group: "Work", grouped: true, pinned: false },
    { id: 8, title: "Recipes worth keeping", preview: "Salt cod brandade. The good gochujang glaze. Mom's plum jam ratios.", date: "May 4", group: "Home", grouped: false, pinned: false },
  ]);

  const filtered = useMemo(() => {
    if (!query.trim()) return memos;
    const q = query.toLowerCase();
    return memos.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.preview.toLowerCase().includes(q) ||
        m.group.toLowerCase().includes(q),
    );
  }, [memos, query]);

  // theme palette
  const bg = isDark ? "#0F0F11" : "#F3F3F1";
  const surface = isDark ? "#161618" : "#FAFAF8";
  const titleBarBg = isDark ? "rgba(22,22,24,0.92)" : "rgba(250,250,248,0.92)";
  const text = isDark ? "#F4F4F5" : "#15151A";
  const subtle = isDark ? "#86868A" : "#7A7A80";
  const border = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const inputBg = isDark ? "#1F1F22" : "#FFFFFF";
  const inputBorder = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)";

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 16,
        overflow: "hidden",
        background: bg,
        border: `0.5px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
        boxShadow: isDark
          ? "0 30px 60px -20px rgba(0,0,0,0.65), 0 0 0 0.5px rgba(255,255,255,0.04)"
          : "0 30px 60px -20px rgba(15,15,20,0.18), 0 4px 12px -2px rgba(15,15,20,0.06)",
        fontFamily: "'Pretendard', 'Pretendard Variable', -apple-system, BlinkMacSystemFont, sans-serif",
        color: text,
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          height: 38,
          background: titleBarBg,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: `0.5px solid ${border}`,
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          flexShrink: 0,
          userSelect: "none",
          cursor: "default",
          gap: 8,
        }}
      >
        {/* drag grip */}
        <div style={{ color: subtle, opacity: 0.5, display: "flex", alignItems: "center" }}>
          <Icon.Grip width={8} height={12} />
        </div>
        <div
          style={{
            flex: 1,
            fontSize: 11.5,
            fontWeight: 500,
            color: subtle,
            letterSpacing: "0.02em",
            textAlign: "center",
            marginRight: 48,
          }}
        >
          Memo
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            type="button"
            aria-label="Minimize"
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              border: "none",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: subtle,
              cursor: "pointer",
              transition: "background 120ms",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Icon.Minimize width={11} height={11} />
          </button>
          <button
            type="button"
            aria-label="Close"
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              border: "none",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: subtle,
              cursor: "pointer",
              transition: "background 120ms, color 120ms",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
              e.currentTarget.style.color = text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = subtle;
            }}
          >
            <Icon.Close width={11} height={11} />
          </button>
        </div>
      </div>

      {/* Header / Search */}
      <div
        style={{
          padding: "16px 16px 10px",
          background: bg,
          borderBottom: `0.5px solid ${border}`,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexShrink: 0, minWidth: 0 }}>
            <h1 style={{ fontSize: 19, fontWeight: 700, margin: 0, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>All memos</h1>
            <span style={{ fontSize: 12, color: subtle, fontVariantNumeric: "tabular-nums" }}>
              {filtered.length}
            </span>
          </div>
          <button
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 11.5,
              fontWeight: 500,
              color: text,
              background: isDark ? "#262629" : "#FFFFFF",
              border: `0.5px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"}`,
              borderRadius: 8,
              padding: "5px 9px 5px 8px",
              cursor: "pointer",
              boxShadow: isDark ? "none" : "0 1px 1px rgba(15,15,20,0.03)",
              fontFamily: "inherit",
            }}
          >
            <Icon.Plus width={11} height={11} />
            New
          </button>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: inputBg,
            border: `0.5px solid ${inputBorder}`,
            borderRadius: 9,
            padding: "7px 10px",
            boxShadow: isDark ? "none" : "0 1px 1px rgba(15,15,20,0.02)",
          }}
        >
          <Icon.Search width={12} height={12} style={{ color: subtle, flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search memos"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 12.5,
              color: text,
              fontFamily: "inherit",
              letterSpacing: "-0.005em",
              padding: 0,
            }}
          />
          <kbd
            style={{
              fontSize: 9.5,
              color: subtle,
              fontFamily: "inherit",
              border: `0.5px solid ${border}`,
              borderRadius: 4,
              padding: "1px 4px",
              letterSpacing: "0.04em",
              background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
            }}
          >
            ⌘K
          </kbd>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 11 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: subtle }}>
            <Icon.Sort width={11} height={11} />
            <span>Recent</span>
          </div>
          <div style={{ fontSize: 10.5, color: subtle, letterSpacing: "0.01em" }}>
            {memos.length} notes
          </div>
        </div>
      </div>

      {/* Memo list */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "10px 12px 80px",
          background: surface,
          display: "flex",
          flexDirection: "column",
          gap: 7,
        }}
      >
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: subtle, fontSize: 12 }}>
            No memos match "{query}".
          </div>
        ) : (
          filtered.map((m) => (
            <MemoItem
              key={m.id}
              memo={m}
              theme={theme}
              selected={m.id === 1 && !query}
              onClick={() => setOpenMenuId(null)}
              menuOpen={openMenuId === m.id}
              onMenuToggle={(id) => setOpenMenuId((cur) => (cur === id ? null : id))}
              onDelete={(id) => { setMemos((prev) => prev.filter((mm) => mm.id !== id)); setOpenMenuId(null); }}
            />
          ))
        )}
      </div>

      {/* Floating new memo button */}
      <button
        type="button"
        style={{
          position: "absolute",
          right: 16,
          bottom: 16,
          height: 40,
          padding: "0 16px 0 14px",
          borderRadius: 999,
          border: "none",
          background: isDark ? "#F4F4F5" : "#15151A",
          color: isDark ? "#0F0F11" : "#FAFAF8",
          fontSize: 12.5,
          fontWeight: 600,
          fontFamily: "inherit",
          letterSpacing: "-0.005em",
          display: "flex",
          alignItems: "center",
          gap: 6,
          cursor: "pointer",
          boxShadow: isDark
            ? "0 8px 24px -6px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.1)"
            : "0 8px 24px -6px rgba(15,15,20,0.25), 0 0 0 0.5px rgba(0,0,0,0.05)",
          transition: "transform 140ms ease, box-shadow 160ms ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
      >
        <Icon.Plus width={12} height={12} />
        New memo
      </button>
    </div>
  );
}

Object.assign(window, { MemoWindow });
