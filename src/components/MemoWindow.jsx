import { useState, useEffect, useRef, useCallback } from 'react'
import { tokens } from '../tokens'
import * as Icon from './icons'
import SlashDropdown, { COMMANDS } from './SlashDropdown'

function renderInline(s, t) {
  const parts = []
  let i = 0, buf = ''
  while (i < s.length) {
    if (s[i] === '*' && s[i+1] === '*') {
      if (buf) { parts.push(<span key={i+'t'}>{buf}</span>); buf = '' }
      const end = s.indexOf('**', i+2)
      if (end === -1) { buf += s.slice(i); break }
      parts.push(<strong key={i} style={{ fontWeight: 700 }}>{s.slice(i+2, end)}</strong>)
      i = end + 2
    } else if (s[i] === '*') {
      if (buf) { parts.push(<span key={i+'t'}>{buf}</span>); buf = '' }
      const end = s.indexOf('*', i+1)
      if (end === -1) { buf += s.slice(i); break }
      parts.push(<em key={i}>{s.slice(i+1, end)}</em>)
      i = end + 1
    } else if (s[i] === '`') {
      if (buf) { parts.push(<span key={i+'t'}>{buf}</span>); buf = '' }
      const end = s.indexOf('`', i+1)
      if (end === -1) { buf += s.slice(i); break }
      parts.push(<code key={i} style={{
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 12, background: t.codeBg, padding: '1px 5px', borderRadius: 4,
      }}>{s.slice(i+1, end)}</code>)
      i = end + 1
    } else { buf += s[i]; i++ }
  }
  if (buf) parts.push(<span key='last'>{buf}</span>)
  return parts
}

function MarkdownBody({ text, t }) {
  const lines = text.split('\n')
  const rendered = []
  let listBuf = []

  const flushList = () => {
    if (!listBuf.length) return
    rendered.push(
      <ul key={`l${rendered.length}`} style={{ margin: '4px 0 8px', padding: 0, listStyle: 'none' }}>
        {listBuf.map((item, i) => (
          <li key={i} style={{ display: 'flex', gap: 8, padding: '2px 0', fontSize: 13.5, lineHeight: 1.55 }}>
            <span style={{ color: t.subtle, flexShrink: 0 }}>—</span>
            <span style={{ flex: 1 }}>{renderInline(item, t)}</span>
          </li>
        ))}
      </ul>
    )
    listBuf = []
  }

  lines.forEach((line, idx) => {
    if (line.startsWith('- ')) { listBuf.push(line.slice(2)); return }
    flushList()
    if (line.startsWith('# ')) {
      rendered.push(<h3 key={idx} style={{ fontSize: 15, fontWeight: 700, margin: '2px 0 8px', letterSpacing: '-0.015em' }}>{line.slice(2)}</h3>)
    } else if (line.startsWith('## ')) {
      rendered.push(<h4 key={idx} style={{ fontSize: 13.5, fontWeight: 600, margin: '10px 0 4px' }}>{line.slice(3)}</h4>)
    } else if (line.startsWith('> ')) {
      rendered.push(
        <blockquote key={idx} style={{
          margin: '6px 0', paddingLeft: 10,
          borderLeft: `2px solid ${t.subtle}`,
          color: t.subtle, fontSize: 13, lineHeight: 1.55, fontStyle: 'italic',
        }}>
          {renderInline(line.slice(2), t)}
        </blockquote>
      )
    } else if (line.trim() === '') {
      rendered.push(<div key={idx} style={{ height: 6 }} />)
    } else {
      rendered.push(
        <p key={idx} style={{ margin: '2px 0', fontSize: 13.5, lineHeight: 1.6, letterSpacing: '-0.005em' }}>
          {renderInline(line, t)}
        </p>
      )
    }
  })
  flushList()
  return <>{rendered}</>
}

function MoreDropdown({ t, onDelete, onNoteList }) {
  return (
    <div
      onMouseDown={e => e.preventDefault()}
      style={{
        position: 'absolute', top: 'calc(100% + 4px)', right: 4,
        minWidth: 200, padding: 6,
        background: t.dropdownBg,
        border: `0.5px solid ${t.borderStrong}`,
        borderRadius: 11,
        boxShadow: t.dropdownShadow,
        zIndex: 9999,
      }}
    >
      <DropRow icon={<Icon.List width={13} height={13} />} label="Note list" shortcut="⌘L" t={t} onClick={onNoteList} />
      <div style={{ height: 1, background: t.border, margin: '4px 6px' }} />
      <DropRow
        icon={<Icon.Trash width={13} height={13} />}
        label="Delete memo"
        shortcut="⌫"
        t={t}
        danger
        onClick={onDelete}
      />
    </div>
  )
}

function DropRow({ icon, label, shortcut, t, danger, onClick }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      type="button"
      onMouseDown={e => e.preventDefault()}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', padding: '7px 10px', borderRadius: 7,
        border: 'none', background: hover ? t.hoverFill : 'transparent',
        color: danger ? '#D9534F' : t.text,
        fontSize: 12.5, cursor: 'pointer', textAlign: 'left',
      }}
    >
      <span style={{ color: danger ? '#D9534F' : t.subtle }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {shortcut && <span style={{ fontSize: 10.5, color: t.subtle }}>{shortcut}</span>}
    </button>
  )
}

function IconBtn({ children, onClick, active, t, size = 22 }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      type="button"
      onMouseDown={e => e.preventDefault()}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: size, height: size, borderRadius: 6, border: 'none',
        background: hover || active ? t.hoverFill : 'transparent',
        color: active || hover ? t.text : t.subtle,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'background 120ms, color 120ms',
        WebkitAppRegion: 'no-drag',
      }}
    >
      {children}
    </button>
  )
}

function Toggle({ on, onChange, t }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onMouseDown={e => e.preventDefault()}
      onClick={() => onChange(!on)}
      style={{
        width: 30, height: 18, borderRadius: 999, padding: 0, border: 'none',
        position: 'relative', cursor: 'pointer',
        transition: 'background 180ms ease',
        background: on ? t.accentFill : t.subtle,
        flexShrink: 0,
        WebkitAppRegion: 'no-drag',
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: on ? 14 : 2,
        width: 14, height: 14, borderRadius: 999,
        background: '#FFFFFF',
        boxShadow: '0 1px 2px rgba(0,0,0,0.18)',
        transition: 'left 180ms cubic-bezier(.4,.0,.2,1)',
      }} />
    </button>
  )
}

function findSlashAtCursor(text, cursorPos) {
  // Find '/' immediately before cursor with no space/newline between slash and cursor
  const segment = text.slice(0, cursorPos)
  const lastNewline = segment.lastIndexOf('\n')
  const lineStart = lastNewline + 1
  const line = segment.slice(lineStart)
  const slashIdx = line.lastIndexOf('/')
  if (slashIdx === -1) return null
  // Only valid if there's no space between the slash and cursor
  const afterSlash = line.slice(slashIdx + 1)
  if (afterSlash.includes(' ')) return null
  return {
    query: '/' + afterSlash,
    absoluteSlashPos: lineStart + slashIdx,
  }
}

export default function MemoWindow({ memoId, theme = 'light' }) {
  const isDark = theme === 'dark'
  const t = tokens(isDark)
  const taRef = useRef(null)
  const saveTimer = useRef(null)
  const contentRef = useRef('')

  const [content, setContent] = useState('')
  const [editing, setEditing] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const [isGrouped, setIsGrouped] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [slashOpen, setSlashOpen] = useState(false)
  const [slashQuery, setSlashQuery] = useState('')
  const [slashIdx, setSlashIdx] = useState(0)

  useEffect(() => {
    const api = window.api
    if (!api || !memoId) return
    api.memo.getOne(memoId).then(m => {
      if (!m) return
      setContent(m.content || '')
      contentRef.current = m.content || ''
      setIsPinned(!!m.is_pinned)
      setIsGrouped(!!m.is_grouped)
    })
  }, [memoId])

  const saveContent = useCallback((val) => {
    const api = window.api
    if (!api || !memoId) return
    const title = val.split('\n')[0].replace(/^#+\s*/, '').slice(0, 80)
    api.memo.update(memoId, { content: val, title })
  }, [memoId])

  useEffect(() => {
    return () => {
      clearTimeout(saveTimer.current)
      if (contentRef.current) saveContent(contentRef.current)
    }
  }, [saveContent])

  const handleContentChange = (e) => {
    const val = e.target.value
    const cursor = e.target.selectionStart
    setContent(val)
    contentRef.current = val
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveContent(val), 800)

    const found = findSlashAtCursor(val, cursor)
    if (found) {
      setSlashOpen(true)
      setSlashQuery(found.query)
      setSlashIdx(0)
    } else {
      setSlashOpen(false)
    }
  }

  const handleKeyDown = (e) => {
    if (!slashOpen) return
    const q = slashQuery.replace(/^\//, '').toLowerCase()
    const list = q ? COMMANDS.filter(c => c.cmd.slice(1).startsWith(q)) : COMMANDS

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSlashIdx(i => Math.min(i + 1, list.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSlashIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (list[slashIdx]) insertSlashCommand(list[slashIdx])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setSlashOpen(false)
    }
  }

  const insertSlashCommand = (cmd) => {
    const ta = taRef.current
    if (!ta) return
    // Read live value from DOM to avoid stale closure
    const liveVal = ta.value
    const cursor = ta.selectionStart
    const found = findSlashAtCursor(liveVal, cursor)
    if (!found) { setSlashOpen(false); return }

    const expansion = cmd.expand()
    const newVal = liveVal.slice(0, found.absoluteSlashPos) + expansion + liveVal.slice(cursor)
    const newCursor = found.absoluteSlashPos + expansion.length

    setContent(newVal)
    contentRef.current = newVal
    clearTimeout(saveTimer.current)
    saveContent(newVal)
    setSlashOpen(false)

    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(newCursor, newCursor)
    }, 0)
  }

  const applyFormat = (prefix, suffix = prefix) => {
    const ta = taRef.current
    if (!ta) return
    const liveVal = ta.value
    const s = ta.selectionStart
    const e = ta.selectionEnd
    const selected = liveVal.slice(s, e)
    const newVal = liveVal.slice(0, s) + prefix + selected + suffix + liveVal.slice(e)
    const newCursor = s + prefix.length + selected.length + suffix.length

    setContent(newVal)
    contentRef.current = newVal
    clearTimeout(saveTimer.current)
    saveContent(newVal)

    if (!editing) setEditing(true)
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(newCursor, newCursor)
    }, 0)
  }

  const handleTogglePin = async () => {
    const api = window.api
    if (!api) return
    const next = await api.app.togglePin(memoId)
    setIsPinned(next)
  }

  const handleToggleGroup = async () => {
    const api = window.api
    if (!api) return
    const next = await api.app.toggleGroup(memoId)
    setIsGrouped(next)
  }

  const handleDelete = async () => {
    const api = window.api
    if (!api) return
    clearTimeout(saveTimer.current)
    await api.memo.delete(memoId)
    api.self.close()
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const charCount = content.replace(/\s+/g, '').length
  const titleBarBg = isDark ? 'rgba(28,28,30,0.92)' : 'rgba(252,252,250,0.92)'
  const bottomBarBg = isDark ? 'rgba(20,20,22,0.85)' : 'rgba(248,248,245,0.85)'

  return (
    <div style={{
      width: '100%', height: '100%',
      background: isDark ? '#161618' : '#FCFCFA',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: "'Pretendard Variable', 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
      color: t.text,
    }}>
      {/* Title bar */}
      <div style={{
        height: 38, padding: '0 6px',
        background: titleBarBg,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `0.5px solid ${t.border}`,
        display: 'flex', alignItems: 'center', gap: 2,
        flexShrink: 0,
        position: 'relative', zIndex: 10,
        WebkitAppRegion: 'drag',
      }}>
        <IconBtn t={t} onClick={async () => {
          const api = window.api
          if (!api) return
          const m = await api.memo.create()
          await api.window.open(m.id)
        }}>
          <Icon.Plus width={11} height={11} />
        </IconBtn>

        <div style={{
          flex: 1, height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          WebkitAppRegion: 'drag',
        }}>
          <span style={{
            fontSize: 10.5, color: t.subtle,
            letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 500,
            pointerEvents: 'none',
          }}>
            {isPinned ? 'Pinned' : 'Sticky memo'}
          </span>
        </div>

        <div style={{ position: 'relative', WebkitAppRegion: 'no-drag' }}>
          <IconBtn t={t} active={moreOpen} onClick={() => setMoreOpen(v => !v)}>
            <Icon.MoreHoriz width={12} height={12} />
          </IconBtn>
          {moreOpen && (
            <MoreDropdown
              t={t}
              onDelete={handleDelete}
              onNoteList={() => { setMoreOpen(false); window.api?.hub.show() }}
            />
          )}
        </div>
        <IconBtn t={t} active={isPinned} onClick={handleTogglePin}>
          {isPinned ? <Icon.PinFilled width={11} height={11} /> : <Icon.Pin width={11} height={11} />}
        </IconBtn>
        <IconBtn t={t} onClick={() => window.api?.self.minimize()}>
          <Icon.Minus width={11} height={11} />
        </IconBtn>
        <IconBtn t={t} onClick={() => window.api?.self.close()}>
          <Icon.Close width={11} height={11} />
        </IconBtn>
      </div>

      {/* Body */}
      <div
        onClick={() => {
          if (!editing) {
            setEditing(true)
            setTimeout(() => taRef.current?.focus(), 0)
          }
        }}
        style={{
          flex: 1, padding: '16px 18px 14px',
          overflow: 'auto',
          cursor: 'text', position: 'relative',
          WebkitAppRegion: 'no-drag',
        }}
      >
        {editing ? (
          <>
            <textarea
              ref={taRef}
              value={content}
              onChange={handleContentChange}
              onBlur={() => {
                setEditing(false)
                setSlashOpen(false)
                clearTimeout(saveTimer.current)
                saveContent(contentRef.current)
              }}
              onKeyDown={handleKeyDown}
              style={{
                width: '100%', height: '100%', resize: 'none',
                border: 'none', outline: 'none',
                background: 'transparent', color: t.text,
                fontSize: 13.5, lineHeight: 1.6,
                letterSpacing: '-0.005em', padding: 0,
              }}
            />
            {slashOpen && (
              <div style={{ position: 'absolute', top: 16, left: 18, zIndex: 9998 }}>
                <SlashDropdown
                  theme={theme}
                  query={slashQuery}
                  selected={slashIdx}
                  onSelect={insertSlashCommand}
                />
              </div>
            )}
          </>
        ) : (
          <MarkdownBody text={content || ' '} t={t} />
        )}
      </div>

      {/* Bottom bar */}
      <div style={{
        height: 34, padding: '0 4px 0 8px',
        background: bottomBarBg,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: `0.5px solid ${t.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
        WebkitAppRegion: 'no-drag',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {[
            { label: 'Bold',          icon: <Icon.Bold width={15} height={15} />,      fn: () => applyFormat('**') },
            { label: 'Underline',     icon: <Icon.Underline width={15} height={15} />, fn: () => applyFormat('<u>', '</u>') },
            { label: 'Checkbox',      icon: <Icon.Checkbox width={15} height={15} />,  fn: () => applyFormat('- [ ] ', '') },
            { label: 'Strikethrough', icon: <Icon.Strike width={15} height={15} />,    fn: () => applyFormat('~~') },
          ].map(({ label, icon, fn }) => (
            <IconBtn key={label} t={t} size={25} onClick={fn}>{icon}</IconBtn>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10.5, color: t.subtle }}>
            {wordCount}w · {charCount}c
          </span>
          <span style={{ fontSize: 10.5, color: t.subtle }}>Group</span>
          <Toggle on={isGrouped} onChange={handleToggleGroup} t={t} />
        </div>
      </div>
    </div>
  )
}
