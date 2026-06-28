const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./employees.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    date TEXT NOT NULL,
    photo TEXT
  )`);
});

module.exports = db;
