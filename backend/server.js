const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

// Allow larger payloads (up to 10MB)
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Serve static files from /public and /backend
app.use(express.static(path.join(__dirname, '../public')));
app.use('/backend', express.static(path.join(__dirname)));

// API endpoint to add an employee
app.post('/api/employees', (req, res) => {
  const { name, department, date, photo } = req.body;
  db.run(
    `INSERT INTO employees (name, department, date, photo) VALUES (?, ?, ?, ?)`,
    [name, department, date, photo],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Employee added', id: this.lastID });
    }
  );
});

// API endpoint to fetch all employees
app.get('/api/employees', (req, res) => {
  db.all(`SELECT * FROM employees`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// API endpoint to delete an employee
app.delete('/api/employees/:id', (req, res) => {
  db.run(`DELETE FROM employees WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Employee deleted' });
  });
});

// Serve admin.html
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Serve login.html
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});
// Error logger
app.use((err, req, res, next) => {
  console.error('❌ Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
