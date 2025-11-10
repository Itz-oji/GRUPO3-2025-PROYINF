const express = require('express');
const router = express.Router();
const db = require('../db');

// Guardar pregunta en una materia específica
router.post('/:subject', async (req, res) => {
  const { subject } = req.params;
  const { name, difficulty, statement, options, answer } = req.body;

  if (!subject || !name || !difficulty || !statement || !options || !answer) {
    return res.status(400).json({ error: 'Faltan datos obligatorios (incluyendo answer)' });
  }

  if (typeof options !== 'object' || Array.isArray(options)) {
    return res.status(400).json({ error: 'options debe ser un objeto con claves tipo A, B, C...' });
  }

  if (!options.hasOwnProperty(answer)) {
    return res.status(400).json({ error: `La clave answer "${answer}" no existe en options` });
  }
  

  try {
    // Verificar si la columna 'answer' existe, y crearla si no
    await db.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'questions' AND column_name = 'answer'
        ) THEN
          ALTER TABLE questions ADD COLUMN answer TEXT NOT NULL DEFAULT 'A';
        END IF;
      END
      $$;
    `);

    // Crear tabla si no existe
    await db.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        statement TEXT NOT NULL,
        options JSONB NOT NULL,
        answer TEXT NOT NULL,
        subject TEXT NOT NULL
      );
    `);

    // Insertar pregunta
    const result = await db.query(`
      INSERT INTO questions (name, difficulty, statement, options, answer, subject)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [name, difficulty, statement, JSON.stringify(options), answer, subject]);

    res.json({
      message: 'Pregunta guardada correctamente ✅',
      saved: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener preguntas por materia
router.get('/:subject', async (req, res) => {
  const { subject } = req.params;
  try {
    const result = await db.query(`
      SELECT id, name, difficulty, statement, options, subject
      FROM questions
      WHERE subject = $1
      ORDER BY id DESC
      LIMIT 10
    `, [subject]);

    res.json(result.rows.map(q => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener preguntas de un examen (sin mostrar la respuesta)
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

module.exports = router;

