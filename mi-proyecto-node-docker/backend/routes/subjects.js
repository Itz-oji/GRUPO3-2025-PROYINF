const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todas las materias (tablas existentes)
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`
    );
    const nombres = result.rows.map(r => r.tablename);
    res.json(nombres);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin', async (req, res) => {
  const { name } = req.body;

  if (!req.user || !ADMIN_EMAILS.includes(req.user.emails[0].value)) {
    return res.status(403).json({ error: 'No autorizado' });
  }

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS "${name}" (
        id SERIAL PRIMARY KEY,
        name TEXT,
        difficulty TEXT,
        statement TEXT,
        options JSONB
      )
    `);
    res.json({ message: 'Tabla creada con éxito' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/admin/:subject', async (req, res) => {
  const { subject } = req.params;

  if (!req.user || !ADMIN_EMAILS.includes(req.user.emails[0].value)) {
    return res.status(403).json({ error: 'No autorizado' });
  }

  try {
    await db.query(`DROP TABLE IF EXISTS "${subject}"`);
    res.json({ message: 'Materia eliminada con éxito' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
