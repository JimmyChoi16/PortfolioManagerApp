const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all assets
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM assets');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET asset by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM assets WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST create asset
router.post('/', async (req, res) => {
  const { type, symbol, name, quantity, purchasePrice, purchaseDate } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO assets (type, symbol, name, quantity, purchasePrice, purchaseDate) VALUES (?,?,?,?,?,?)',
      [type, symbol, name, quantity, purchasePrice, purchaseDate]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT update asset
router.put('/:id', async (req, res) => {
  const { type, symbol, name, quantity, purchasePrice, purchaseDate } = req.body;
  try {
    await db.query(
      'UPDATE assets SET type=?, symbol=?, name=?, quantity=?, purchasePrice=?, purchaseDate=? WHERE id=?',
      [type, symbol, name, quantity, purchasePrice, purchaseDate, req.params.id]
    );
    res.json({ id: req.params.id, ...req.body });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE asset
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM assets WHERE id=?', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;