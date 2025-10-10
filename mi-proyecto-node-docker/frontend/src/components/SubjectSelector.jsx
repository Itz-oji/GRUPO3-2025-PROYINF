import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function SubjectSelector() {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const subjects = [
    "Matemática",
    "Lenguaje",
    "Física",
    "Historia",
    "Biología"
  ];

  useEffect(() => {
    if (!selectedSubject) return;
    fetchExams(selectedSubject);
  }, [selectedSubject]);

  const fetchExams = async (subject) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/exams/${subject}`);
      setExams(res.data);
    } catch (err) {
      console.error("Error cargando exámenes:", err);
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = (examId) => {
    navigate(`/exam/${examId}`);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Exámenes por Materia</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        {subjects.map((subject) => (
          <button
            key={subject}
            onClick={() =>
              setSelectedSubject(selectedSubject === subject ? null : subject)
            }
            className={`px-4 py-2 rounded-xl shadow font-semibold transition-all ${
              selectedSubject === subject
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {subject}
          </button>
        ))}
      </div>

      {selectedSubject && (
        <div>
          <h2 className="text-xl font-bold mb-4">
            Exámenes de {selectedSubject}
          </h2>

          {loading ? (
            <p className="text-gray-500">Cargando exámenes...</p>
          ) : exams.length === 0 ? (
            <p className="text-gray-500">No hay exámenes disponibles.</p>
          ) : (
            <ul className="space-y-2">
              {exams.map((exam) => (
                <li
                  key={exam.id}
                  className="border p-3 rounded shadow flex justify-between items-center hover:bg-gray-50"
                >
                  <div>
                    <p className="font-bold">{exam.name}</p>
                    <p className="text-sm text-gray-500">{exam.description}</p>
                    <p className="text-sm text-gray-400">
                      Creado el: {new Date(exam.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleStartExam(exam.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Realizar ensayo
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
