import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function ExamPage() {
  const { examId } = useParams();
  console.log('examId:', examId);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Examen</h1>

      {loading ? (
        <p>Cargando preguntas...</p>
      ) : questions.length === 0 ? (
        <p>No hay preguntas en este examen.</p>
      ) : (
        <ul className="space-y-4">
          {questions.map((q, idx) => (
            <li key={q.id} className="border p-4 rounded shadow">
              <p className="font-bold">{idx + 1}. {q.name}</p>
              <p>{q.statement}</p>
              <ul className="pl-4 list-disc mt-2">
                {q.options.map((opt, i) => (
                  <li key={i}>{opt.text}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
