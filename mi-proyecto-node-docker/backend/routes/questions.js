const express = require('express');
const router = express.Router();
const db = require('../db');

// Guardar pregunta en una materia específica
router.post('/:subject', async (req, res) => {
  const { subject } = req.params;
  const { name, difficulty, statement, options } = req.body;

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS "${subject}" (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        statement TEXT NOT NULL,
        options JSONB NOT NULL
      )
    `);
    const result = await db.query(`
      INSERT INTO "${subject}" (name, difficulty, statement, options)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, difficulty, statement, JSON.stringify(options)]);

    res.json({
      message: 'Pregunta guardada correctamente ✅',
      saved: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:subject', async (req, res) => {
  const { subject } = req.params;
  try {
    const result = await db.query(`
      SELECT id, name, difficulty, statement, options
      FROM "${subject}"
      ORDER BY id DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
