import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  extractPreview,
  extractTitle,
  parseContent,
  formatDate,
} from '../memoText'

// ----------------------------------------------------------------------------
// extractPreview
// ----------------------------------------------------------------------------

describe('extractPreview', () => {
  it('빈 입력에 대해 빈 문자열을 반환한다', () => {
    expect(extractPreview('')).toBe('')
    expect(extractPreview(null)).toBe('')
    expect(extractPreview(undefined)).toBe('')
  })

  it('Tiptap JSON에서 첫 번째 비어 있지 않은 텍스트를 반환한다', () => {
    const raw = JSON.stringify({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: '제목 줄' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '두 번째 줄' }] },
      ],
    })
    expect(extractPreview(raw)).toBe('제목 줄')
  })

  it('첫 번째 비어 있는 단락을 건너뛴다', () => {
    const raw = JSON.stringify({
      type: 'doc',
      content: [
        { type: 'paragraph' },
        { type: 'paragraph', content: [{ type: 'text', text: '   ' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '진짜 내용' }] },
      ],
    })
    expect(extractPreview(raw)).toBe('진짜 내용')
  })

  it('중첩된 노드(예: heading 안의 text)에서 텍스트를 추출한다', () => {
    const raw = JSON.stringify({
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [
            { type: 'text', text: '안녕 ' },
            { type: 'text', text: '세상' },
          ],
        },
      ],
    })
    expect(extractPreview(raw)).toBe('안녕 세상')
  })

  it('모든 노드가 비어 있으면 빈 문자열을 반환한다', () => {
    const raw = JSON.stringify({
      type: 'doc',
      content: [{ type: 'paragraph' }, { type: 'paragraph' }],
    })
    expect(extractPreview(raw)).toBe('')
  })

  it('JSON 파싱에 실패하면 마크다운 폴백을 사용한다', () => {
    expect(extractPreview('hello world')).toBe('hello world')
  })

  it('마크다운 폴백에서 헤딩 마커를 제거한다', () => {
    expect(extractPreview('# 제목입니다\n본문')).toBe('제목입니다')
    expect(extractPreview('### 작은 제목')).toBe('작은 제목')
  })

  it('마크다운 폴백에서 볼드/이탤릭 마커를 제거한다', () => {
    expect(extractPreview('**굵게** 그리고 *기울임*')).toBe('굵게 그리고 기울임')
  })

  it('마크다운 폴백에서 빈 라인을 건너뛴다', () => {
    expect(extractPreview('\n\n실제 내용\n다음 줄')).toBe('실제 내용')
  })

  it('JSON처럼 보이지만 doc 타입이 아니면 폴백으로 처리한다', () => {
    const raw = JSON.stringify({ type: 'paragraph', content: [] })
    // doc 타입이 아니면 폴백 → 첫 줄(원본 JSON 문자열) 반환
    expect(extractPreview(raw)).not.toBe('')
  })

  it('content가 없는 doc도 처리한다', () => {
    const raw = JSON.stringify({ type: 'doc' })
    expect(extractPreview(raw)).toBe('')
  })

  it('text가 누락된 text 노드를 안전하게 처리한다', () => {
    const raw = JSON.stringify({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '다음' }] },
      ],
    })
    expect(extractPreview(raw)).toBe('다음')
  })
})

// ----------------------------------------------------------------------------
// extractTitle
// ----------------------------------------------------------------------------

describe('extractTitle', () => {
  it('null/undefined 입력에 대해 빈 문자열을 반환한다', () => {
    expect(extractTitle(null)).toBe('')
    expect(extractTitle(undefined)).toBe('')
    expect(extractTitle({})).toBe('')
  })

  it('content가 없는 doc은 빈 문자열을 반환한다', () => {
    expect(extractTitle({ type: 'doc' })).toBe('')
    expect(extractTitle({ type: 'doc', content: [] })).toBe('')
  })

  it('첫 번째로 content가 있는 노드의 텍스트를 반환한다', () => {
    const doc = {
      type: 'doc',
      content: [
        { type: 'paragraph' },
        { type: 'paragraph', content: [{ type: 'text', text: '진짜 제목' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '두 번째' }] },
      ],
    }
    expect(extractTitle(doc)).toBe('진짜 제목')
  })

  it('여러 text 노드를 이어붙인다', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: '안녕' },
            { type: 'text', text: ' ' },
            { type: 'text', text: '세상' },
          ],
        },
      ],
    }
    expect(extractTitle(doc)).toBe('안녕 세상')
  })

  it('text가 아닌 자식 노드는 무시한다', () => {
    const doc = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: '텍스트만' },
            { type: 'image', attrs: { src: 'x' } },
          ],
        },
      ],
    }
    expect(extractTitle(doc)).toBe('텍스트만')
  })

  it('80자로 잘라낸다', () => {
    const longText = 'a'.repeat(200)
    const doc = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: longText }] }],
    }
    expect(extractTitle(doc)).toBe('a'.repeat(80))
    expect(extractTitle(doc).length).toBe(80)
  })

  it('80자 이하는 그대로 반환한다', () => {
    const text = 'a'.repeat(50)
    const doc = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
    }
    expect(extractTitle(doc)).toBe(text)
  })
})

// ----------------------------------------------------------------------------
// parseContent
// ----------------------------------------------------------------------------

describe('parseContent', () => {
  it('빈 입력에 대해 null을 반환한다', () => {
    expect(parseContent('')).toBeNull()
    expect(parseContent(null)).toBeNull()
    expect(parseContent(undefined)).toBeNull()
  })

  it('유효한 Tiptap JSON 문자열을 파싱한다', () => {
    const doc = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: '안녕' }] }],
    }
    expect(parseContent(JSON.stringify(doc))).toEqual(doc)
  })

  it('doc이 아닌 JSON은 마크다운으로 폴백한다', () => {
    const raw = JSON.stringify({ type: 'paragraph' })
    const result = parseContent(raw)
    expect(result.type).toBe('doc')
    expect(Array.isArray(result.content)).toBe(true)
  })

  it('일반 텍스트를 단락 단위 doc으로 마이그레이션한다', () => {
    const result = parseContent('첫 줄\n둘째 줄\n셋째 줄')
    expect(result).toEqual({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: '첫 줄' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '둘째 줄' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '셋째 줄' }] },
      ],
    })
  })

  it('빈 라인을 content 없는 paragraph로 마이그레이션한다', () => {
    const result = parseContent('A\n\nB')
    expect(result.content).toEqual([
      { type: 'paragraph', content: [{ type: 'text', text: 'A' }] },
      { type: 'paragraph' },
      { type: 'paragraph', content: [{ type: 'text', text: 'B' }] },
    ])
  })

  it('공백만 있는 라인을 빈 단락으로 처리한다', () => {
    const result = parseContent('   ')
    expect(result.content).toEqual([{ type: 'paragraph' }])
  })

  it('잘못된 JSON은 마크다운 폴백을 사용한다', () => {
    const result = parseContent('{not json')
    expect(result.type).toBe('doc')
    expect(result.content[0]).toEqual({
      type: 'paragraph',
      content: [{ type: 'text', text: '{not json' }],
    })
  })
})

// ----------------------------------------------------------------------------
// formatDate
// ----------------------------------------------------------------------------

describe('formatDate', () => {
  beforeEach(() => {
    // 고정된 "지금" = 2026-05-13 15:30 (KST 가정, 단위는 UTC)
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 4, 13, 15, 30, 0)) // month는 0-인덱스
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('falsy 입력에 대해 빈 문자열을 반환한다', () => {
    expect(formatDate(0)).toBe('')
    expect(formatDate(null)).toBe('')
    expect(formatDate(undefined)).toBe('')
  })

  it('오늘의 타임스탬프는 "오늘 HH:MM" 형식으로 반환한다', () => {
    const today9am = new Date(2026, 4, 13, 9, 5, 0).getTime()
    expect(formatDate(today9am)).toBe('오늘 09:05')
  })

  it('정각도 zero-padding을 유지한다', () => {
    const today = new Date(2026, 4, 13, 0, 0, 0).getTime()
    expect(formatDate(today)).toBe('오늘 00:00')
  })

  it('어제의 타임스탬프는 "어제"를 반환한다', () => {
    const yesterday = new Date(2026, 4, 12, 14, 0, 0).getTime()
    expect(formatDate(yesterday)).toBe('어제')
  })

  it('2일 이상 지난 타임스탬프는 "M월 D일" 형식으로 반환한다', () => {
    const twoDaysAgo = new Date(2026, 4, 11, 14, 0, 0).getTime()
    expect(formatDate(twoDaysAgo)).toBe('5월 11일')
  })

  it('다른 달 날짜도 처리한다', () => {
    const monthsAgo = new Date(2026, 0, 4, 12, 0, 0).getTime()
    expect(formatDate(monthsAgo)).toBe('1월 4일')
  })
})
