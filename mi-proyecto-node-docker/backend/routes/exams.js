const express = require('express');
const router = express.Router();
const db = require('../db');


router.post('/', async (req, res) => {
  const { name, description, questions, subject } = req.body;

  if (!name || !questions || !Array.isArray(questions) || questions.length === 0 || !subject) {
    return res.status(400).json({ error: 'Nombre y preguntas son obligatorias' });
  }

  try {
    // 1️⃣ Crear tabla de exams si no existe
    await db.query(`
      CREATE TABLE IF NOT EXISTS exams (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        subject TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    const columnCheck = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='exams' AND column_name='subject'
    `);

    if (columnCheck.rows.length === 0) {
      await db.query(`ALTER TABLE exams ADD COLUMN subject TEXT NOT NULL DEFAULT ''`);
    }

    // 2️⃣ Crear tabla de relación exam_questions si no existe
    await db.query(`
      CREATE TABLE IF NOT EXISTS exam_questions (
        exam_id INT REFERENCES exams(id) ON DELETE CASCADE,
        question_id INT NOT NULL,
        PRIMARY KEY (exam_id, question_id)
      )
    `);

    // 3️⃣ Insertar examen
    const examResult = await db.query(
      `INSERT INTO exams (name, description, subject) VALUES ($1, $2, $3) RETURNING id`,
      [name, description, subject]
    );

    const examId = examResult.rows[0].id;

    // 4️⃣ Insertar preguntas asociadas
    for (const qId of questions) {
      await db.query(
        `INSERT INTO exam_questions (exam_id, question_id) VALUES ($1, $2)`,
        [examId, qId]
      );
    }

    res.json({ message: 'Examen creado correctamente ✅', examId });

  } catch (err) {
    console.error('Error creando examen:', err);
    res.status(500).json({ error: 'Error al crear examen' });
  }
});


router.get('/:subject', async (req, res) => {
  const { subject } = req.params;
  try {
    const result = await db.query(
      `SELECT id, name, description, subject, created_at
       FROM exams
       WHERE subject = $1
       ORDER BY created_at DESC`,
      [subject]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener exámenes' });
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
      ORDER BY q.id
    `, [examId]);

    res.json(result.rows); // options ya es JSONB en la DB
  } catch (err) {
    console.error('Error al obtener preguntas del examen:', err);
    res.status(500).json({ error: 'Error al obtener preguntas del examen' });
  }
});


module.exports = router;
