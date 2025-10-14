import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function ExamPage() {
  const { examId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [answers, setAnswers] = useState({}); // respuestas seleccionadas por el usuario
  const [finished, setFinished] = useState(false); // si terminó el ensayo
  const [results, setResults] = useState({}); // resultados finales por pregunta

  useEffect(() => {
    const fetchExamQuestions = async () => {
      try {
        const res = await axios.get(`/api/exams/questions/${examId}`);
        setQuestions(res.data);
      } catch (err) {
        console.error("Error cargando preguntas del examen:", err);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExamQuestions();
  }, [examId]);

  // Manejar selección de respuesta
  const handleSelect = (questionId, optionIndex) => {
    if (finished) return; // no permitir cambios después de terminar
    setAnswers({ ...answers, [questionId]: optionIndex });
  };

  // Terminar ensayo y calcular resultados
  const handleFinish = () => {
    const res = {};
    questions.forEach((q) => {
      const selectedIndex = answers[q.id];
      if (selectedIndex === undefined) {
        res[q.id] = false; // si no respondió, se considera incorrecta
      } else {
        res[q.id] = q.options[selectedIndex].isCorrect === true;
      }
    });
    setResults(res);
    setFinished(true);
  };

  // Contar aciertos y errores
  const correctCount = Object.values(results).filter((r) => r).length;
  const incorrectCount = Object.values(results).filter((r) => !r).length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Examen</h1>

      {loading ? (
        <p>Cargando preguntas...</p>
      ) : questions.length === 0 ? (
        <p>No hay preguntas en este examen.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {questions.map((q, idx) => (
              <li key={q.id} className="border p-4 rounded shadow bg-white">
                <p className="font-bold mb-2">{idx + 1}. {q.name}</p>
                <p className="mb-3">{q.statement}</p>

                <div className="space-y-2">
                  {q.options.map((opt, i) => (
                    <label
                      key={i}
                      className={`flex items-center p-2 rounded cursor-pointer ${
                        answers[q.id] === i
                          ? 'bg-blue-100 border border-blue-400'
                          : 'bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        className="mr-2"
                        checked={answers[q.id] === i}
                        onChange={() => handleSelect(q.id, i)}
                        disabled={finished}
                      />
                      {opt.text}
                    </label>
                  ))}
                </div>

                {finished && results[q.id] !== undefined && (
                  <div className="mt-2 font-semibold">
                    {results[q.id] ? (
                      <span className="text-green-600">✅ Correcto</span>
                    ) : (
                      <span className="text-red-600">❌ Incorrecto</span>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>

          {!finished && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleFinish}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              >
                Terminar ensayo
              </button>
            </div>
          )}

          {finished && (
            <div className="mt-6 p-4 border rounded bg-gray-100">
              <h2 className="text-xl font-bold mb-2">Resumen del ensayo</h2>
              <p>Aciertos: {correctCount}</p>
              <p>Errores: {incorrectCount}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
