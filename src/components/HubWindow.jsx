import { useState, useEffect, useMemo, useCallback } from 'react'
import { tokens } from '../tokens'
import * as Icon from './icons'
import { extractPreview, formatDate } from '../lib/memoText'

const api = window.api

function CardMenu({ isDark, t, onDelete, onClose }) {
  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        position: 'absolute', top: 36, right: 8,
        minWidth: 148, padding: 5,
        background: t.dropdownBg,
        border: `0.5px solid ${t.borderStrong}`,
        borderRadius: 10,
        boxShadow: t.dropdownShadow,
        zIndex: 30,
      }}
    >
      <button
        type="button"
        onClick={onDelete}
        onMouseEnter={e => e.currentTarget.style.background = t.hoverFill}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        style={{
          display: 'flex', alignItems: 'center', gap: 9,
          width: '100%', padding: '7px 9px', borderRadius: 6,
          border: 'none', background: 'transparent',
          color: t.text, fontSize: 12.5, cursor: 'pointer', textAlign: 'left',
          letterSpacing: '-0.005em',
        }}
      >
        <Icon.Trash width={13} height={13} style={{ color: t.subtle }} />
        <span style={{ flex: 1 }}>Delete memo</span>
        <span style={{ fontSize: 10, color: t.subtle, letterSpacing: '0.04em' }}>⌫</span>
      </button>
    </div>
  )
}

function MemoCard({ memo, theme, isDark, t, selected, menuOpen, onSelect, onMenuToggle, onDelete }) {
  const [hover, setHover] = useState(false)
  const preview = extractPreview(memo.content)

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onSelect}
      style={{
        background: selected ? t.surfaceAlt : t.surfaceAlt,
        border: `0.5px solid ${selected ? t.borderStrong : t.border}`,
        borderRadius: 12,
        padding: '13px 14px',
        boxShadow: selected
          ? (isDark ? '0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -8px rgba(0,0,0,0.5)' : '0 1px 2px rgba(15,15,20,0.04), 0 6px 20px -6px rgba(15,15,20,0.10)')
          : (isDark ? '0 1px 1px rgba(0,0,0,0.25)' : '0 1px 0 rgba(15,15,20,0.02)'),
        cursor: 'pointer',
        transition: 'transform 120ms ease, box-shadow 160ms ease',
        transform: hover && !selected ? 'translateY(-1px)' : 'translateY(0)',
        display: 'flex', flexDirection: 'column', gap: 6,
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        {memo.is_pinned === 1 && (
          <Icon.Pin width={9} height={9} style={{ color: t.subtle, flexShrink: 0 }} />
        )}
        <div style={{
          fontSize: 13.5, fontWeight: 600, color: t.text,
          letterSpacing: '-0.01em', whiteSpace: 'nowrap',
          overflow: 'hidden', textOverflow: 'ellipsis',
          lineHeight: 1.35, flex: 1,
        }}>
          {memo.title || '제목 없음'}
        </div>
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onMenuToggle() }}
          onMouseEnter={e => e.currentTarget.style.background = t.hoverFill}
          onMouseLeave={e => e.currentTarget.style.background = menuOpen ? t.hoverFill : 'transparent'}
          style={{
            width: 25, height: 25, borderRadius: 6, border: 'none',
            background: menuOpen ? t.hoverFill : 'transparent',
            color: menuOpen ? t.text : t.subtle,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
            opacity: hover || menuOpen ? 1 : 0.55,
            transition: 'opacity 120ms, background 120ms, color 120ms',
          }}
        >
          <Icon.MoreVert width={17} height={17} />
        </button>
      </div>

      {preview && (
        <div style={{
          fontSize: 12, color: t.subtle, lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
          letterSpacing: '-0.005em',
        }}>
          {preview}
        </div>
      )}

      <div style={{ fontSize: 11, color: t.subtle, letterSpacing: '0.01em' }}>
        {formatDate(memo.updated_at)}
      </div>

      {menuOpen && (
        <CardMenu
          isDark={isDark}
          t={t}
          onDelete={onDelete}
        />
      )}
    </div>
  )
}

export default function HubWindow({ theme = 'light' }) {
  const isDark = theme === 'dark'
  const t = tokens(isDark)

  const [memos, setMemos] = useState([])
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [menuId, setMenuId] = useState(null)

  const loadMemos = useCallback(async () => {
    if (!api) return
    const list = await api.memo.getAll()
    setMemos(list)
  }, [])

  useEffect(() => {
    loadMemos()
  }, [loadMemos])

  useEffect(() => {
    const handler = () => setMenuId(null)
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return memos
    const q = query.toLowerCase()
    return memos.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.content.toLowerCase().includes(q)
    )
  }, [memos, query])

  const handleNew = async () => {
    if (!api) return
    const memo = await api.memo.create()
    await api.window.open(memo.id)
    await loadMemos()
  }

  const handleCardClick = async (id) => {
    setSelectedId(id)
    if (!api) return
    await api.window.open(id)
  }

  const handleDelete = async (id) => {
    if (!api) return
    await api.memo.delete(id)
    setMenuId(null)
    if (selectedId === id) setSelectedId(null)
    await loadMemos()
  }

  const titleBarBg = isDark ? 'rgba(22,22,24,0.92)' : 'rgba(250,250,248,0.92)'

  return (
    <div style={{
      width: '100%', height: '100%',
      background: t.bg,
      fontFamily: "'Pretendard Variable', 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
      color: t.text,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Title bar */}
      <div
        style={{
          height: 38,
          background: titleBarBg,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: `0.5px solid ${t.border}`,
          display: 'flex', alignItems: 'center',
          padding: '0 12px',
          flexShrink: 0,
          WebkitAppRegion: 'drag',
        }}
      >
        <div style={{ color: t.subtle, opacity: 0.5, display: 'flex', alignItems: 'center' }}>
          <Icon.Grip width={8} height={12} />
        </div>
        <div style={{
          flex: 1, fontSize: 12, fontWeight: 500, color: t.subtle,
          letterSpacing: '0.02em', textAlign: 'center', marginRight: 48,
        }}>
          Memo
        </div>
        <div style={{ display: 'flex', gap: 4, WebkitAppRegion: 'no-drag' }}>
          <WinBtn onClick={() => api?.self.minimize()} subtle={t.subtle} hoverFill={t.hoverFill}>
            <Icon.Minus width={11} height={11} />
          </WinBtn>
          <WinBtn onClick={() => api?.self.close()} subtle={t.subtle} hoverFill={t.hoverFill}>
            <Icon.Close width={11} height={11} />
          </WinBtn>
        </div>
      </div>

      {/* Header + Search */}
      <div style={{
        padding: '14px 16px 10px',
        background: t.bg,
        borderBottom: `0.5px solid ${t.border}`,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexShrink: 0 }}>
            <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              All memos
            </h1>
            <span style={{ fontSize: 11, color: t.subtle, fontVariantNumeric: 'tabular-nums' }}>
              {filtered.length}
            </span>
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: t.surfaceAlt,
          border: `0.5px solid ${t.border}`,
          borderRadius: 9, padding: '7px 10px',
        }}>
          <Icon.Search width={12} height={12} style={{ color: t.subtle, flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search memos"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1, border: 'none', outline: 'none',
              background: 'transparent', fontSize: 12.5, color: t.text,
              letterSpacing: '-0.005em', padding: 0,
              WebkitAppRegion: 'no-drag',
            }}
          />
        </div>
      </div>

      {/* Memo list */}
      <div className="hub-memo-list" style={{
        flex: 1, overflowY: 'auto',
        padding: '10px 12px 80px',
        background: t.surface,
        display: 'flex', flexDirection: 'column', gap: 7,
      }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: t.subtle, fontSize: 12 }}>
            {query ? `"${query}"와 일치하는 메모가 없습니다.` : '메모가 없습니다.'}
          </div>
        ) : (
          filtered.map(m => (
            <MemoCard
              key={m.id}
              memo={m}
              theme={theme}
              isDark={isDark}
              t={t}
              selected={m.id === selectedId && !query}
              menuOpen={menuId === m.id}
              onSelect={() => handleCardClick(m.id)}
              onMenuToggle={() => setMenuId(cur => cur === m.id ? null : m.id)}
              onDelete={() => handleDelete(m.id)}
            />
          ))
        )}
      </div>

      {/* Floating new memo button */}
      <button
        type="button"
        onClick={handleNew}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        style={{
          position: 'absolute', right: 16, bottom: 16,
          height: 40, padding: '0 16px 0 14px',
          borderRadius: 999, border: 'none',
          background: t.accentFill, color: t.accentText,
          fontSize: 12.5, fontWeight: 600, letterSpacing: '-0.005em',
          display: 'flex', alignItems: 'center', gap: 6,
          cursor: 'pointer',
          boxShadow: isDark
            ? '0 8px 24px -6px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.1)'
            : '0 8px 24px -6px rgba(15,15,20,0.25), 0 0 0 0.5px rgba(0,0,0,0.05)',
          transition: 'transform 140ms ease, box-shadow 160ms ease',
          WebkitAppRegion: 'no-drag',
        }}
      >
        <Icon.Plus width={12} height={12} />
        New memo
      </button>
    </div>
  )
}

function WinBtn({ children, onClick, subtle, hoverFill }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 22, height: 22, borderRadius: 6, border: 'none',
        background: hover ? hoverFill : 'transparent',
        color: subtle, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 120ms',
      }}
    >
      {children}
    </button>
  )
}
