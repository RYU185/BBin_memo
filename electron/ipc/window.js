const { ipcMain, BrowserWindow } = require('electron')
const { randomUUID } = require('crypto')
const db = require('../db')

function registerWindowHandlers(memoWindows, createMemoWindow) {
  ipcMain.handle('window:open', (_, memo_id) => {
    try {
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
    } catch (err) {
      console.error('[window:open]', err)
      throw err
    }
  })

  ipcMain.handle('window:close', (_, memo_id) => {
    try {
      const win = memoWindows.get(memo_id)
      if (win && !win.isDestroyed()) win.close()
      db.prepare('UPDATE memo_window SET is_open = 0 WHERE memo_id = ?').run(memo_id)
    } catch (err) {
      console.error('[window:close]', err)
      throw err
    }
  })

  ipcMain.handle('window:updateBounds', (_, memo_id, x, y, width, height) => {
    try {
      db.prepare(`
        UPDATE memo_window SET x = ?, y = ?, width = ?, height = ? WHERE memo_id = ?
      `).run(x, y, width, height, memo_id)
    } catch (err) {
      console.error('[window:updateBounds]', err)
      throw err
    }
  })

  ipcMain.handle('window:restoreAll', () => {
    try {
      const openWindows = db.prepare('SELECT * FROM memo_window WHERE is_open = 1').all()
      for (const w of openWindows) {
        if (!memoWindows.has(w.memo_id)) {
          createMemoWindow(w.memo_id, w)
        }
      }
    } catch (err) {
      console.error('[window:restoreAll]', err)
      throw err
    }
  })

  ipcMain.handle('app:minimize', (_, memo_id) => {
    try {
      const win = memoWindows.get(memo_id)
      if (win && !win.isDestroyed()) win.minimize()
    } catch (err) {
      console.error('[app:minimize]', err)
      throw err
    }
  })

  ipcMain.handle('app:togglePin', (_, memo_id) => {
    try {
      const memo = db.prepare('SELECT is_pinned FROM memo WHERE id = ?').get(memo_id)
      if (!memo) return false
      const newPin = memo.is_pinned ? 0 : 1
      db.prepare('UPDATE memo SET is_pinned = ? WHERE id = ?').run(newPin, memo_id)
      const win = memoWindows.get(memo_id)
      if (win && !win.isDestroyed()) win.setAlwaysOnTop(!!newPin)
      return !!newPin
    } catch (err) {
      console.error('[app:togglePin]', err)
      throw err
    }
  })

  ipcMain.handle('app:toggleGroup', (_, memo_id) => {
    try {
      const memo = db.prepare('SELECT is_grouped FROM memo WHERE id = ?').get(memo_id)
      if (!memo) return false
      const newGroup = memo.is_grouped ? 0 : 1
      db.prepare('UPDATE memo SET is_grouped = ? WHERE id = ?').run(newGroup, memo_id)
      return !!newGroup
    } catch (err) {
      console.error('[app:toggleGroup]', err)
      throw err
    }
  })

  ipcMain.handle('self:minimize', (event) => {
    try {
      const win = BrowserWindow.fromWebContents(event.sender)
      if (win) win.minimize()
    } catch (err) {
      console.error('[self:minimize]', err)
      throw err
    }
  })

  ipcMain.handle('self:close', (event) => {
    try {
      const win = BrowserWindow.fromWebContents(event.sender)
      if (win) win.close()
    } catch (err) {
      console.error('[self:close]', err)
      throw err
    }
  })

  ipcMain.handle('app:focusGroup', () => {
    try {
      const grouped = db.prepare('SELECT id FROM memo WHERE is_grouped = 1').all()
      for (const { id } of grouped) {
        const win = memoWindows.get(id)
        if (win && !win.isDestroyed()) win.show()
      }
    } catch (err) {
      console.error('[app:focusGroup]', err)
      throw err
    }
  })
}

module.exports = { registerWindowHandlers }
