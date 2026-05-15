import { tokens } from '../tokens'

export const COMMANDS = [
  {
    id: 'date', cmd: '/date', hint: '오늘 날짜',
    run: (editor, range) => editor.chain().focus().deleteRange(range)
      .insertContent(new Date().toLocaleDateString('ko-KR')).run(),
  },
  {
    id: 'time', cmd: '/time', hint: '현재 시간',
    run: (editor, range) => editor.chain().focus().deleteRange(range)
      .insertContent(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })).run(),
  },
  {
    id: 'tomorrow', cmd: '/tomorrow', hint: '내일 날짜',
    run: (editor, range) => {
      const d = new Date(); d.setDate(d.getDate() + 1)
      editor.chain().focus().deleteRange(range)
        .insertContent(d.toLocaleDateString('ko-KR')).run()
    },
  },
  {
    id: 'todo', cmd: '/todo', hint: '할일 체크박스',
    run: (editor, range) => editor.chain().focus().deleteRange(range).toggleTaskList().run(),
  },
  {
    id: 'hr', cmd: '/hr', hint: '구분선',
    run: (editor, range) => editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
  {
    id: 'code', cmd: '/code', hint: '코드 블럭',
    run: (editor, range) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
]

export default function SlashDropdown({ theme = 'light', query = '', selected = 0, onSelect }) {
  const isDark = theme === 'dark'
  const t = tokens(isDark)

  const q = query.replace(/^\//, '').toLowerCase()
  const list = q ? COMMANDS.filter(c => c.cmd.slice(1).startsWith(q)) : COMMANDS

  if (list.length === 0) return null

  return (
    <div
      onMouseDown={e => e.preventDefault()}
      style={{
        width: 248, padding: 6,
        background: t.dropdownBg,
        border: `0.5px solid ${t.borderStrong}`,
        borderRadius: 11,
        boxShadow: t.dropdownShadow,
        zIndex: 9998,
      }}
    >
      <div style={{
        padding: '5px 8px 7px',
        fontSize: 10, color: t.subtle,
        letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600,
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>Commands</span>
        <span>{list.length}</span>
      </div>
      <div style={{ height: 1, background: t.border, margin: '0 4px 4px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {list.map((c, i) => {
          const isSel = i === selected
          return (
            <div
              key={c.id}
              onMouseDown={e => { e.preventDefault(); onSelect && onSelect(c) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '7px 9px', borderRadius: 7,
                background: isSel ? t.hoverFill : 'transparent',
                cursor: 'pointer',
              }}
            >
              <span style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: 12, color: t.text, minWidth: 72,
              }}>{c.cmd}</span>
              <span style={{ flex: 1, fontSize: 12, color: t.subtle }}>{c.hint}</span>
              {isSel && (
                <span style={{
                  fontSize: 9.5, color: t.subtle, letterSpacing: '0.06em',
                  background: t.hoverFill, padding: '2px 5px', borderRadius: 4,
                }}>↵</span>
              )}
            </div>
          )
        })}
      </div>
      <div style={{ height: 1, background: t.border, margin: '4px 4px 0' }} />
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        padding: '6px 8px 4px', fontSize: 10, color: t.subtle,
      }}>
        <span>↑↓ navigate · ↵ insert</span>
        <span>esc</span>
      </div>
    </div>
  )
}
