const { ipcMain, BrowserWindow } = require('electron')
const { randomUUID } = require('crypto')
const db = require('../db')

function registerWindowHandlers(memoWindows, createMemoWindow) {
  ipcMain.handle('window:open', (_, memo_id) => {
    if (memoWindows.has(memo_id)) {
      memoWindows.get(memo_id).focus()
      return
    }
    let bounds = db.prepare('SELECT * FROM memo_window WHERE memo_id = ?').get(memo_id)
    if (!bounds) {
      db.prepare(`
        INSERT INTO memo_window (id, memo_id, x, y, width, height, is_open)
        VALUES (?, ?, 100, 100, 300, 400, 0)
      `).run(randomUUID(), memo_id)
      bounds = { x: 100, y: 100, width: 300, height: 400 }
    }
    db.prepare('UPDATE memo_window SET is_open = 1 WHERE memo_id = ?').run(memo_id)
    createMemoWindow(memo_id, bounds)
  })

  ipcMain.handle('window:close', (_, memo_id) => {
    const win = memoWindows.get(memo_id)
    if (win && !win.isDestroyed()) win.close()
    db.prepare('UPDATE memo_window SET is_open = 0 WHERE memo_id = ?').run(memo_id)
  })

  ipcMain.handle('window:updateBounds', (_, memo_id, x, y, width, height) => {
    db.prepare(`
      UPDATE memo_window SET x = ?, y = ?, width = ?, height = ? WHERE memo_id = ?
    `).run(x, y, width, height, memo_id)
  })

  ipcMain.handle('window:restoreAll', () => {
    const openWindows = db.prepare('SELECT * FROM memo_window WHERE is_open = 1').all()
    for (const w of openWindows) {
      if (!memoWindows.has(w.memo_id)) {
        createMemoWindow(w.memo_id, w)
      }
    }
  })

  ipcMain.handle('app:minimize', (_, memo_id) => {
    const win = memoWindows.get(memo_id)
    if (win && !win.isDestroyed()) win.minimize()
  })

  ipcMain.handle('app:togglePin', (_, memo_id) => {
    const memo = db.prepare('SELECT is_pinned FROM memo WHERE id = ?').get(memo_id)
    if (!memo) return false
    const newPin = memo.is_pinned ? 0 : 1
    db.prepare('UPDATE memo SET is_pinned = ? WHERE id = ?').run(newPin, memo_id)
    const win = memoWindows.get(memo_id)
    if (win && !win.isDestroyed()) win.setAlwaysOnTop(!!newPin)
    return !!newPin
  })

  ipcMain.handle('app:toggleGroup', (_, memo_id) => {
    const memo = db.prepare('SELECT is_grouped FROM memo WHERE id = ?').get(memo_id)
    if (!memo) return false
    const newGroup = memo.is_grouped ? 0 : 1
    db.prepare('UPDATE memo SET is_grouped = ? WHERE id = ?').run(newGroup, memo_id)
    return !!newGroup
  })

  ipcMain.handle('self:minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) win.minimize()
  })

  ipcMain.handle('self:close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) win.close()
  })

  ipcMain.handle('app:focusGroup', () => {
    const grouped = db.prepare('SELECT id FROM memo WHERE is_grouped = 1').all()
    for (const { id } of grouped) {
      const win = memoWindows.get(id)
      if (win && !win.isDestroyed()) win.show()
    }
  })
}

module.exports = { registerWindowHandlers }
