const Database = require('better-sqlite3')
const path = require('path')
const { app } = require('electron')

const dbPath = path.join(app.getPath('userData'), 'memo.db')
const db = new Database(dbPath)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS memo (
    id         TEXT PRIMARY KEY,
    title      TEXT NOT NULL DEFAULT '',
    content    TEXT NOT NULL DEFAULT '',
    is_grouped INTEGER NOT NULL DEFAULT 0,
    is_pinned  INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS memo_window (
    id      TEXT PRIMARY KEY,
    memo_id TEXT NOT NULL UNIQUE,
    x       INTEGER NOT NULL DEFAULT 100,
    y       INTEGER NOT NULL DEFAULT 100,
    width   INTEGER NOT NULL DEFAULT 300,
    height  INTEGER NOT NULL DEFAULT 400,
    is_open INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (memo_id) REFERENCES memo(id) ON DELETE CASCADE
  );
`)

module.exports = db
