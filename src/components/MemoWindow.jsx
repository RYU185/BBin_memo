import { useState, useEffect, useRef, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Underline from '@tiptap/extension-underline'
import { tokens } from '../tokens'
import * as Icon from './icons'
import SlashDropdown, { COMMANDS } from './SlashDropdown'

function parseContent(raw) {
  if (!raw) return null
  try {
    const doc = JSON.parse(raw)
    if (doc.type === 'doc') return doc
  } catch {}
  // 기존 마크다운 문자열 → 단순 단락으로 마이그레이션
  const lines = raw.split('\n')
  return {
    type: 'doc',
    content: lines.map(line =>
      line.trim()
        ? { type: 'paragraph', content: [{ type: 'text', text: line }] }
        : { type: 'paragraph' }
    ),
  }
}

function extractTitle(json) {
  const node = json?.content?.find(n => n.content?.length)
  if (!node) return ''
  return node.content
    .filter(n => n.type === 'text')
    .map(n => n.text)
    .join('')
    .slice(0, 80)
}

function findSlash(editor) {
  const { state } = editor
  const { from } = state.selection
  const $from = state.doc.resolve(from)
  const lineStart = $from.start()
  const textBefore = state.doc.textBetween(lineStart, from)
  const match = textBefore.match(/\/(\w*)$/)
  if (!match) return null
  const slashFrom = from - match[0].length
  const coords = editor.view.coordsAtPos(from)
  return {
    query: '/' + match[1],
    range: { from: slashFrom, to: from },
    pos: { top: coords.bottom + 6, left: coords.left },
  }
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
      <DropRow icon={<Icon.Trash width={13} height={13} />} label="Delete memo" shortcut="⌫" t={t} danger onClick={onDelete} />
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
        flexShrink: 0, WebkitAppRegion: 'no-drag',
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

export default function MemoWindow({ memoId, theme = 'light' }) {
  const isDark = theme === 'dark'
  const t = tokens(isDark)
  const saveTimer = useRef(null)
  const editorRef = useRef(null)

  const [isPinned, setIsPinned] = useState(false)
  const [isGrouped, setIsGrouped] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [slashOpen, setSlashOpen] = useState(false)
  const [slashQuery, setSlashQuery] = useState('')
  const [slashIdx, setSlashIdx] = useState(0)
  const [slashPos, setSlashPos] = useState(null)
  const [slashRange, setSlashRange] = useState(null)

  // ref로 최신 슬래시 상태 유지 (handleKeyDown 클로저 문제 방지)
  const slashRef = useRef({ open: false, idx: 0, query: '', range: null })

  const saveContent = useCallback((json) => {
    const api = window.api
    if (!api || !memoId) return
    api.memo.update(memoId, {
      content: JSON.stringify(json),
      title: extractTitle(json),
    })
  }, [memoId])

  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({ nested: false }),
      Underline,
    ],
    content: null,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()
      clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => saveContent(json), 800)

      const found = findSlash(editor)
      if (found) {
        const q = found.query.replace(/^\//, '').toLowerCase()
        const cmds = q ? COMMANDS.filter(c => c.cmd.slice(1).startsWith(q)) : COMMANDS
        slashRef.current = { open: true, idx: 0, query: found.query, range: found.range, cmds }
        setSlashOpen(true)
        setSlashQuery(found.query)
        setSlashIdx(0)
        setSlashPos(found.pos)
        setSlashRange(found.range)
      } else {
        slashRef.current = { ...slashRef.current, open: false }
        setSlashOpen(false)
      }
    },
    editorProps: {
      handleKeyDown: (_view, event) => {
        const s = slashRef.current
        if (!s.open) return false

        const ed = editorRef.current
        if (!ed) return false

        if (event.key === 'ArrowDown') {
          event.preventDefault()
          const next = Math.min(s.idx + 1, (s.cmds?.length ?? 1) - 1)
          slashRef.current = { ...s, idx: next }
          setSlashIdx(next)
          return true
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault()
          const prev = Math.max(s.idx - 1, 0)
          slashRef.current = { ...s, idx: prev }
          setSlashIdx(prev)
          return true
        }
        if (event.key === 'Enter') {
          const cmd = s.cmds?.[s.idx]
          if (cmd) {
            event.preventDefault()
            cmd.run(ed, s.range)
            slashRef.current = { ...s, open: false }
            setSlashOpen(false)
            return true
          }
        }
        if (event.key === 'Escape') {
          slashRef.current = { ...s, open: false }
          setSlashOpen(false)
          return true
        }
        return false
      },
    },
  })

  // editorRef 동기화
  useEffect(() => { editorRef.current = editor }, [editor])

  // 메모 로드
  useEffect(() => {
    const api = window.api
    if (!api || !memoId || !editor) return
    api.memo.getOne(memoId).then(m => {
      if (!m) return
      setIsPinned(!!m.is_pinned)
      setIsGrouped(!!m.is_grouped)
      const parsed = parseContent(m.content)
      if (parsed) editor.commands.setContent(parsed, false)
    })
  }, [editor, memoId])

  // 언마운트 시 즉시 저장
  useEffect(() => {
    return () => {
      clearTimeout(saveTimer.current)
      const ed = editorRef.current
      if (ed) saveContent(ed.getJSON())
    }
  }, [saveContent])

  const handleTogglePin = async () => {
    const api = window.api
    if (!api) return
    setIsPinned(await api.app.togglePin(memoId))
  }

  const handleToggleGroup = async () => {
    const api = window.api
    if (!api) return
    setIsGrouped(await api.app.toggleGroup(memoId))
  }

  const handleDelete = async () => {
    const api = window.api
    if (!api) return
    clearTimeout(saveTimer.current)
    await api.memo.delete(memoId)
    api.self.close()
  }

  const wordCount = editor
    ? editor.state.doc.textContent.trim().split(/\s+/).filter(Boolean).length
    : 0
  const charCount = editor
    ? editor.state.doc.textContent.replace(/\s+/g, '').length
    : 0

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
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
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
        className={`memo-editor-wrapper${isDark ? ' dark' : ''}`}
        style={{
          flex: 1, padding: '16px 18px 14px',
          overflow: 'auto', position: 'relative',
          WebkitAppRegion: 'no-drag',
          '--subtle': t.subtle,
          '--text': t.text,
          '--code-bg': t.codeBg,
        }}
      >
        <EditorContent editor={editor} />

        {slashOpen && slashPos && (
          <div style={{
            position: 'fixed',
            top: slashPos.top,
            left: slashPos.left,
            zIndex: 9998,
          }}>
            <SlashDropdown
              theme={theme}
              query={slashQuery}
              selected={slashIdx}
              onSelect={cmd => {
                cmd.run(editor, slashRange)
                slashRef.current = { ...slashRef.current, open: false }
                setSlashOpen(false)
              }}
            />
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div style={{
        height: 34, padding: '0 4px 0 8px',
        background: bottomBarBg,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderTop: `0.5px solid ${t.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0, WebkitAppRegion: 'no-drag',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {[
            { label: 'Bold',          icon: <Icon.Bold width={15} height={15} />,      fn: () => editor?.chain().focus().toggleBold().run() },
            { label: 'Underline',     icon: <Icon.Underline width={15} height={15} />, fn: () => editor?.chain().focus().toggleUnderline().run() },
            { label: 'Checkbox',      icon: <Icon.Checkbox width={15} height={15} />,  fn: () => editor?.chain().focus().toggleTaskList().run() },
            { label: 'Strikethrough', icon: <Icon.Strike width={15} height={15} />,    fn: () => editor?.chain().focus().toggleStrike().run() },
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
