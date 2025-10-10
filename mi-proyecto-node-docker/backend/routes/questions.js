const express = require('express');
const router = express.Router();
const db = require('../db');

// Guardar pregunta en una materia específica
router.post('/:subject', async (req, res) => {
  const { subject } = req.params;
  const { name, difficulty, statement, options } = req.body;

  if (!subject || !name || !difficulty || !statement || !options) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        statement TEXT NOT NULL,
        options JSONB NOT NULL,
        subject TEXT NOT NULL
      );
    `);
    const result = await db.query(`
      INSERT INTO questions (name, difficulty, statement, options, subject)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, difficulty, statement, JSON.stringify(options), subject]);

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
      SELECT id, name, difficulty, statement, options, subject
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

//Funcion para eliminar contenido de las tablas

/*
router.delete('/:subject', async (req, res) => {
  const { subject } = req.params; // ej: "Matemática"

  try {
    // Borrar todas las preguntas de la tabla de esa materia
    await db.query(`DELETE FROM "${subject}"`);
    console.log(`🗑️  Contenido eliminado de: ${subject}`);

    res.json({ message: `Todas las preguntas de ${subject} fueron eliminadas correctamente 🧹` });
  } catch (err) {
    console.error('❌ Error al eliminar preguntas:', err.message);
    res.status(500).json({ error: err.message });
  }
});
*/

module.exports = router;
