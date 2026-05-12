# CLAUDE.md — Sticky Memo Desktop App

## 프로젝트 개요
바탕화면 스티커 메모 앱. 각 메모가 독립 창으로 바탕화면에 부유하며, 그룹 토글로 관련 메모를 한번에 소환할 수 있는 Electron 데스크탑 앱.

**타겟 유저**: 업무량이 많아 아이디어와 할일관리가 절실한 30대 김사원

---

## 기술 스택
- **Frontend**: React + Vite
- **Desktop**: Electron
- **DB**: SQLite (better-sqlite3)
- **Font**: Pretendard
- **OS**: Windows
- **소스관리**: GitHub
- **배포**: GitHub Releases + electron-builder (.exe)

---

## 프로젝트 구조
```
sticky-memo/
├── electron/
│   ├── main.js          # 메인 프로세스
│   ├── preload.js       # preload 스크립트
│   ├── ipc/             # IPC 핸들러
│   │   ├── memo.js
│   │   └── window.js
│   └── db/
│       ├── index.js     # DB 연결
│       └── schema.sql   # DDL
├── src/
│   ├── main.jsx
│   ├── index.css
│   ├── App.jsx
│   └── components/
│       ├── HubWindow.jsx        # 메모 목록 창
│       ├── MemoWindow.jsx       # 개별 메모 창
│       ├── TitleBar.jsx         # 상단 타이틀바
│       ├── BottomBar.jsx        # 하단 포맷팅바
│       └── SlashDropdown.jsx    # 슬래시 명령어 드롭다운
├── public/
├── package.json
├── vite.config.js
└── CLAUDE.md
```

---

## 핵심 기능 명세

### 1. 메모 목록 창 (허브)
- 앱 실행 시 첫 번째로 뜨는 창
- 전체 메모 목록 표시 (제목 · 미리보기 · 날짜)
- 각 메모 카드 우측에 ⋮ 버튼 → 메모 삭제
- `+ New` 버튼 → 새 메모 창 생성
- 메모 카드 클릭 → 해당 메모 창 바탕화면에 열림
- 검색 기능
- 허브 창은 항상 독립적으로 존재

### 2. 개별 메모 창 (스티커)
- 바탕화면에 독립적으로 부유
- 리사이즈 가능
- 창 위치 / 크기 저장 → 앱 재시작 시 복원
- 마크다운 기반 편집

**타이틀바 (좌 → 우)**
- 좌측: `+` (새 메모 창 생성)
- 중앙: 드래그 영역
- 우측: `...` · 핀 · `_` · `×`
- `...` 드롭다운: 노트 목록 / 노트 색 선택 / 메모 삭제

**하단바**
- 좌측: `B` (볼드) · `U` (밑줄) · `☑` (체크박스) · `S` (취소선)
- 우측: 그룹 토글 스위치

### 3. 그룹 토글
- 하단바 우측 토글 ON → 해당 메모 그룹에 포함
- Alt+Tab으로 그룹 메모 선택 시 → 그룹 전체 동시에 앞으로
- 토글 OFF → 독립 동작

### 4. 슬래시 명령어
- `/` 입력 시 커서 바로 아래에 드롭다운 출력
- 입력한 문자로 실시간 필터링

| 명령어 | 기능 |
|--------|------|
| `/date` | 오늘 날짜 삽입 |
| `/time` | 현재 시간 삽입 |
| `/tomorrow` | 내일 날짜 삽입 |
| `/todo` | 체크박스 삽입 (`- [ ] `) |
| `/hr` | 구분선 삽입 (`---`) |
| `/code` | 코드 블럭 삽입 (` ``` `) |

**키보드**: `↑↓` 이동 · `Enter` 선택 · `Esc` 닫기

### 5. 세션 복원
- 앱 종료 전 열려있던 메모 창 → 재실행 시 위치/크기 그대로 복원

### 6. 메모 삭제
- 허브 ⋮ 버튼 또는 메모 창 `...` → Delete memo
- 창 닫기(×)는 삭제가 아님 → 목록에 유지

---

## DB 스키마

```sql
CREATE TABLE memo (
    id         TEXT PRIMARY KEY,
    title      TEXT NOT NULL DEFAULT '',
    content    TEXT NOT NULL DEFAULT '',
    is_grouped INTEGER NOT NULL DEFAULT 0,
    is_pinned  INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE TABLE memo_window (
    id      TEXT PRIMARY KEY,
    memo_id TEXT NOT NULL UNIQUE,
    x       INTEGER NOT NULL DEFAULT 100,
    y       INTEGER NOT NULL DEFAULT 100,
    width   INTEGER NOT NULL DEFAULT 300,
    height  INTEGER NOT NULL DEFAULT 400,
    is_open INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (memo_id) REFERENCES memo(id) ON DELETE CASCADE
);
```

---

## IPC 채널 명세

### 메모 CRUD
| 채널 | 파라미터 | 반환 |
|------|----------|------|
| `memo:getAll` | 없음 | memo[] |
| `memo:getOne` | id | memo |
| `memo:create` | 없음 | memo |
| `memo:update` | id, changes | memo |
| `memo:delete` | id | boolean |

### 창 관리
| 채널 | 파라미터 | 반환 |
|------|----------|------|
| `window:open` | memo_id | void |
| `window:close` | memo_id | void |
| `window:updateBounds` | memo_id, x, y, width, height | void |
| `window:restoreAll` | 없음 | void |

### 앱 제어
| 채널 | 파라미터 | 반환 |
|------|----------|------|
| `app:minimize` | memo_id | void |
| `app:togglePin` | memo_id | boolean |
| `app:toggleGroup` | memo_id | boolean |
| `app:focusGroup` | 없음 | void |

---

## 디자인 토큰
- **폰트**: Pretendard
- **모드**: Light (기본) / Dark
- **모서리**: Rounded (12–16px)
- **컬러**: 무채색 계열
- **메모 창 스타일**: 흰 카드

---

## 개발 순서
1. Electron + Vite + React 프로젝트 세팅
2. SQLite 연결 + 테이블 생성
3. IPC 핸들러 구현 (memo CRUD)
4. 허브 창 UI
5. 개별 메모 창 UI
6. 슬래시 명령어 드롭다운
7. 하단바 포맷팅 버튼
8. 그룹 토글 + Alt+Tab 연동
9. 세션 복원
10. 라이트 / 다크 모드
11. electron-builder `.exe` 빌드

---

## 주의사항
- 창 닫기(×) = 창만 닫힘, 데이터 삭제 아님
- 삭제는 반드시 명시적 액션(⋮ 또는 ... → Delete)으로만
- 로그인 없음, 완전 로컬 앱
- 서버 없음, 외부 API 없음
- Vercel 배포 없음 → GitHub Releases로 .exe 배포
