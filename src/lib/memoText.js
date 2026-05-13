/**
 * 메모 텍스트 유틸리티
 *
 * Tiptap JSON 문서와 레거시 마크다운 사이의 변환·추출 로직을
 * 순수 함수로 모아둔 모듈. UI 컴포넌트와 분리되어 단위 테스트
 * 가능하도록 설계.
 */

/**
 * Tiptap 노드 트리에서 텍스트만 재귀적으로 이어붙인다.
 * - text 노드: `text` 필드 사용 (없으면 빈 문자열)
 * - 기타 노드: 자식 노드를 순회
 */
function nodeToText(node) {
  if (!node) return ''
  if (node.type === 'text') return node.text ?? ''
  const children = node.content ?? []
  return children.map(nodeToText).join('')
}

/**
 * 메모 카드의 미리보기 텍스트를 추출한다.
 *
 * 우선순위:
 *   1) `raw`가 Tiptap doc JSON이면 → 첫 번째 비어 있지 않은 블록의 텍스트
 *   2) 그 외 (JSON 파싱 실패, doc 타입 아님) → 마크다운 폴백
 *      · 빈 줄 제외 첫 줄
 *      · `#` 헤딩 마커 제거
 *      · `**`, `*` 강조 마커 제거
 */
export function extractPreview(raw) {
  if (!raw) return ''
  try {
    const doc = JSON.parse(raw)
    if (doc.type !== 'doc') throw new Error('not a doc')
    for (const node of (doc.content ?? [])) {
      const text = nodeToText(node).trim()
      if (text) return text
    }
    return ''
  } catch {
    return (
      raw
        .split('\n')
        .filter(Boolean)[0]
        ?.replace(/^#+\s*/, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '') || ''
    )
  }
}

/**
 * Tiptap doc JSON에서 메모 제목을 추출한다.
 *
 * 정책:
 *   - 첫 번째로 content 배열이 비어 있지 않은 블록을 찾는다.
 *   - 그 블록의 text 노드들을 이어붙인 뒤 80자로 잘라낸다.
 *   - 입력이 비어 있거나 후보 블록이 없으면 빈 문자열을 반환한다.
 */
export function extractTitle(json) {
  const node = json?.content?.find(n => n.content?.length)
  if (!node) return ''
  return node.content
    .filter(n => n.type === 'text')
    .map(n => n.text)
    .join('')
    .slice(0, 80)
}

/**
 * DB에 저장된 원본 문자열(`memo.content`)을 Tiptap doc JSON으로 파싱한다.
 *
 * 시나리오:
 *   - 빈 입력 → null (편집기 초기 상태 유지)
 *   - 유효한 doc JSON → 그대로 반환
 *   - 그 외 → 줄 단위로 paragraph를 생성하여 doc으로 마이그레이션
 *     · 공백/빈 줄은 content 없는 빈 paragraph
 */
export function parseContent(raw) {
  if (!raw) return null
  try {
    const doc = JSON.parse(raw)
    if (doc.type === 'doc') return doc
  } catch {
    // fall through to markdown migration
  }
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

/**
 * 메모 카드의 날짜 표시 문자열을 생성한다.
 *
 * 규칙:
 *   - falsy → ''
 *   - 오늘 → "오늘 HH:MM" (zero-padded)
 *   - 어제 → "어제"
 *   - 그 외 → "M월 D일"
 */
export function formatDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const diffDays = Math.floor((now - d) / 86400000)
  if (diffDays === 0) {
    const hh = d.getHours().toString().padStart(2, '0')
    const mm = d.getMinutes().toString().padStart(2, '0')
    return `오늘 ${hh}:${mm}`
  }
  if (diffDays === 1) return '어제'
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}
