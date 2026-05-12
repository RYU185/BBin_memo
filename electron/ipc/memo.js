const { ipcMain } = require('electron')
const { randomUUID } = require('crypto')
const db = require('../db')

const ALLOWED_UPDATE_KEYS = ['title', 'content', 'is_grouped', 'is_pinned']

function registerMemoHandlers() {
  ipcMain.handle('memo:getAll', () => {
    return db.prepare('SELECT * FROM memo ORDER BY updated_at DESC').all()
  })

  ipcMain.handle('memo:getOne', (_, id) => {
    return db.prepare('SELECT * FROM memo WHERE id = ?').get(id)
  })

  ipcMain.handle('memo:create', () => {
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
  })

  ipcMain.handle('memo:update', (_, id, changes) => {
    const keys = Object.keys(changes).filter(k => ALLOWED_UPDATE_KEYS.includes(k))
    if (keys.length === 0) return db.prepare('SELECT * FROM memo WHERE id = ?').get(id)

    const now = Date.now()
    const setClause = [...keys.map(k => `${k} = ?`), 'updated_at = ?'].join(', ')
    const values = [...keys.map(k => changes[k]), now, id]

    db.prepare(`UPDATE memo SET ${setClause} WHERE id = ?`).run(...values)
    return db.prepare('SELECT * FROM memo WHERE id = ?').get(id)
  })

  ipcMain.handle('memo:delete', (_, id) => {
    const result = db.prepare('DELETE FROM memo WHERE id = ?').run(id)
    return result.changes > 0
  })
}

module.exports = { registerMemoHandlers }
