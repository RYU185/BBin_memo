const { ipcMain } = require('electron')
const { randomUUID } = require('crypto')
const db = require('../db')

const ALLOWED_UPDATE_KEYS = ['title', 'content', 'is_grouped', 'is_pinned']

function registerMemoHandlers() {
  ipcMain.handle('memo:getAll', () => {
    try {
      return db.prepare('SELECT * FROM memo ORDER BY updated_at DESC').all()
    } catch (err) {
      console.error('[memo:getAll]', err)
      throw err
    }
  })

  ipcMain.handle('memo:getOne', (_, id) => {
    try {
      return db.prepare('SELECT * FROM memo WHERE id = ?').get(id)
    } catch (err) {
      console.error('[memo:getOne]', err)
      throw err
    }
  })

  ipcMain.handle('memo:create', () => {
    try {
      const id = randomUUID()
      const now = Date.now()
      db.prepare(`
        INSERT INTO memo (id, title, content, is_grouped, is_pinned, created_at, updated_at)
        VALUES (?, '', '', 0, 0, ?, ?)
      `).run(id, now, now)
      db.prepare(`
        INSERT INTO memo_window (id, memo_id, x, y, width, height, is_open)
        VALUES (?, ?, 100, 100, 300, 400, 0)
      `).run(randomUUID(), id)
      return db.prepare('SELECT * FROM memo WHERE id = ?').get(id)
    } catch (err) {
      console.error('[memo:create]', err)
      throw err
    }
  })

  ipcMain.handle('memo:update', (_, id, changes) => {
    try {
      const keys = Object.keys(changes).filter(k => ALLOWED_UPDATE_KEYS.includes(k))
      if (keys.length === 0) return db.prepare('SELECT * FROM memo WHERE id = ?').get(id)

      const now = Date.now()
      const setClause = [...keys.map(k => `${k} = ?`), 'updated_at = ?'].join(', ')
      const values = [...keys.map(k => changes[k]), now, id]

      db.prepare(`UPDATE memo SET ${setClause} WHERE id = ?`).run(...values)
      return db.prepare('SELECT * FROM memo WHERE id = ?').get(id)
    } catch (err) {
      console.error('[memo:update]', err)
      throw err
    }
  })

  ipcMain.handle('memo:delete', (_, id) => {
    try {
      const result = db.prepare('DELETE FROM memo WHERE id = ?').run(id)
      return result.changes > 0
    } catch (err) {
      console.error('[memo:delete]', err)
      throw err
    }
  })
}

module.exports = { registerMemoHandlers }
