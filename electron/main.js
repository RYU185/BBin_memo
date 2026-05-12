const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

const isDev = !app.isPackaged

// memoWindows, createMemoWindow는 db 초기화 이후 사용되므로 whenReady 안에서 선언
const memoWindows = new Map()
let hubWindow = null

function loadWindow(win, params = {}) {
  if (isDev) {
    const query = new URLSearchParams(params).toString()
    win.loadURL(`http://localhost:5173${query ? '?' + query : ''}`)
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'), { query: params })
  }
}

function createHubWindow() {
  hubWindow = new BrowserWindow({
    width: 360,
    height: 640,
    frame: false,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  loadWindow(hubWindow, { window: 'hub' })

  hubWindow.on('closed', () => {
    hubWindow = null
  })
}

function createMemoWindow(memoId, bounds) {
  const db = require('./db')

  const win = new BrowserWindow({
    x: bounds.x || 100,
    y: bounds.y || 100,
    width: bounds.width || 300,
    height: bounds.height || 400,
    minWidth: 200,
    minHeight: 150,
    frame: false,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  loadWindow(win, { window: 'memo', id: memoId })
  memoWindows.set(memoId, win)

  // 창 닫기 = 데이터 삭제 아님, is_open만 0으로
  win.on('closed', () => {
    memoWindows.delete(memoId)
    db.prepare('UPDATE memo_window SET is_open = 0 WHERE memo_id = ?').run(memoId)
  })

  // 이동/리사이즈 시 위치 저장
  const saveBounds = () => {
    if (win.isDestroyed()) return
    const { x, y, width, height } = win.getBounds()
    db.prepare(`
      UPDATE memo_window SET x = ?, y = ?, width = ?, height = ? WHERE memo_id = ?
    `).run(x, y, width, height, memoId)
  }
  win.on('moved', saveBounds)
  win.on('resized', saveBounds)

  // 그룹 창 포커스: 그룹에 속한 창이 포커스되면 나머지 그룹 창도 앞으로
  win.on('focus', () => {
    const memo = db.prepare('SELECT is_grouped FROM memo WHERE id = ?').get(memoId)
    if (!memo?.is_grouped) return
    const grouped = db.prepare('SELECT id FROM memo WHERE is_grouped = 1 AND id != ?').all(memoId)
    for (const { id } of grouped) {
      const groupedWin = memoWindows.get(id)
      if (!groupedWin || groupedWin.isDestroyed()) continue
      if (!groupedWin.isVisible()) groupedWin.showInactive()
      groupedWin.moveTop()
    }
  })

  // 핀 상태 복원
  const memo = db.prepare('SELECT is_pinned FROM memo WHERE id = ?').get(memoId)
  if (memo?.is_pinned) win.setAlwaysOnTop(true)
}

app.whenReady().then(() => {
  // db는 app ready 이후 최초 require 시 초기화됨
  const db = require('./db')
  const { registerMemoHandlers } = require('./ipc/memo')
  const { registerWindowHandlers } = require('./ipc/window')

  registerMemoHandlers()
  registerWindowHandlers(memoWindows, createMemoWindow)

  ipcMain.handle('hub:show', () => {
    if (hubWindow && !hubWindow.isDestroyed()) {
      hubWindow.show()
      hubWindow.focus()
    } else {
      createHubWindow()
    }
  })

  createHubWindow()

  // 세션 복원: 마지막으로 열려있던 메모 창 복원
  const openWindows = db.prepare('SELECT * FROM memo_window WHERE is_open = 1').all()
  for (const w of openWindows) {
    createMemoWindow(w.memo_id, w)
  }

  app.on('activate', () => {
    if (!hubWindow) createHubWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
