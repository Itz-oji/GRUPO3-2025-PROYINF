const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ Guardar pregunta en una materia específica
router.post('/:subject', async (req, res) => {
  const { subject } = req.params;
  const { name, difficulty, statement, options, liberada = false } = req.body;

  if (!subject || !name || !difficulty || !statement || !options) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    // Crear la tabla si no existe, incluyendo la columna 'liberada'
    await db.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        statement TEXT NOT NULL,
        options JSONB NOT NULL,
        subject TEXT NOT NULL,
        liberada BOOLEAN DEFAULT FALSE
      );
    `);

    // Insertar la pregunta con el valor de 'liberada'
    const result = await db.query(`
      INSERT INTO questions (name, difficulty, statement, options, subject, liberada)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [name, difficulty, statement, JSON.stringify(options), subject, liberada]);

    res.json({
      message: 'Pregunta guardada correctamente ✅',
      saved: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Obtener preguntas de una materia
router.get('/:subject', async (req, res) => {
  const { subject } = req.params;
  try {
    const result = await db.query(`
      SELECT id, name, difficulty, statement, options, subject, liberada
      FROM questions
      WHERE subject = $1
      ORDER BY id DESC
      LIMIT 10
    `,  [subject]);

    res.json(result.rows.map(q => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Nueva ruta: actualizar el estado de 'liberada'
router.patch('/:id/liberar', async (req, res) => {
  const { id } = req.params;
  const { liberada } = req.body;

  if (liberada === undefined) {
    return res.status(400).json({ error: 'Falta el valor de liberada' });
  }

  try {
    const result = await db.query(
      'UPDATE questions SET liberada = $1 WHERE id = $2 RETURNING liberada',
      [liberada, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Pregunta no encontrada' });
    }

    res.json({
      message: `Pregunta ${liberada ? 'liberada' : 'bajada'} correctamente ✅`,
      liberada: result.rows[0].liberada
    });

  } catch (err) {
    console.error('❌ Error al actualizar estado de liberada:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Obtener preguntas de un examen específico
router.get('/questions/:examId', async (req, res) => {
  const { examId } = req.params;

  if (!examId) return res.status(400).json({ error: 'examId es requerido' });

  try {
    const result = await db.query(`
      SELECT q.id, q.name, q.statement, q.options
      FROM questions q
      JOIN exam_questions eq ON q.id = eq.question_id
      WHERE eq.exam_id = $1
    `, [examId]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener preguntas del examen:', err);
    res.status(500).json({ error: 'Error al obtener preguntas del examen' });
  }
});

router.get('/liberadas/:subject', async (req, res) => {
  const { subject } = req.params;
  try {
    const result = await db.query(`
      SELECT id, name, difficulty, statement, options, subject, liberada
      FROM questions
      WHERE subject = $1 AND liberada = true
      ORDER BY id DESC
    `, [subject]);

    res.json(
      result.rows.map(q => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
