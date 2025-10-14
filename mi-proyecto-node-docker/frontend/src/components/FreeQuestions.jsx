import React, { useEffect, useState } from "react";
import axios from "axios";

export default function FreeQuestions() {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({}); // para guardar la respuesta del usuario
  const [results, setResults] = useState({}); // para mostrar si acertó o no

  const subjects = ["Matemática", "Lenguaje", "Física", "Historia", "Biología"];

  // Cargar preguntas liberadas cuando se selecciona una materia
  useEffect(() => {
    if (!selectedSubject) return;
    fetchFreeQuestions(selectedSubject);
  }, [selectedSubject]);

  const fetchFreeQuestions = async (subject) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/questions/liberadas/${subject}`);
      setQuestions(res.data);
    } catch (err) {
      console.error("Error cargando preguntas liberadas:", err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Manejar selección de respuesta
  const handleSelect = (questionId, optionIndex) => {
    setAnswers({ ...answers, [questionId]: optionIndex });
  };

  // Verificar la respuesta seleccionada
  const handleCheck = (question) => {
    const selectedIndex = answers[question.id];
    if (selectedIndex === undefined) return;

    const selected = question.options[selectedIndex];
    const correct = selected.isCorrect === true;
    setResults({ ...results, [question.id]: correct });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Preguntas Liberadas</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        {subjects.map((subject) => (
          <button
            key={subject}
            onClick={() =>
              setSelectedSubject(selectedSubject === subject ? null : subject)
            }
            className={`px-4 py-2 rounded-xl shadow font-semibold transition-all ${
              selectedSubject === subject
                ? "bg-green-600 text-white"
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
            Preguntas de {selectedSubject}
          </h2>

          {loading ? (
            <p className="text-gray-500">Cargando preguntas...</p>
          ) : questions.length === 0 ? (
            <p className="text-gray-500">No hay preguntas liberadas.</p>
          ) : (
            <ul className="space-y-4">
              {questions.map((q) => (
                <li
                  key={q.id}
                  className="border p-4 rounded-2xl shadow bg-white hover:bg-gray-50"
                >
                  <p className="font-semibold text-lg mb-3">{q.statement}</p>

                  <div className="space-y-2">
                    {q.options.map((opt, index) => (
                      <label
                        key={index}
                        className={`flex items-center p-2 rounded cursor-pointer ${
                          answers[q.id] === index
                            ? "bg-blue-100 border-blue-400"
                            : "bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          className="mr-2"
                          checked={answers[q.id] === index}
                          onChange={() => handleSelect(q.id, index)}
                        />
                        {opt.text}
                      </label>
                    ))}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleCheck(q)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Verificar
                    </button>

                    {results[q.id] !== undefined && (
                      <span
                        className={`font-semibold ${
                          results[q.id]
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {results[q.id] ? "✅ Correcto" : "❌ Incorrecto"}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
