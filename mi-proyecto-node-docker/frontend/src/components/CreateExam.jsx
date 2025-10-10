import { useEffect, useState } from 'react';
import axios from 'axios';

export default function CreateExam() {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [examName, setExamName] = useState('');
  const [examDescription, setExamDescription] = useState('');

  const subjects = ["Matemática", "Lenguaje", "Física", "Historia", "Biología"];

  useEffect(() => {
    if (!selectedSubject) return;
    fetchQuestions(selectedSubject);
  }, [selectedSubject]);

  const fetchQuestions = async (subject) => {
    setLoading(true);
    try {
      // Ahora todas las preguntas están en una tabla y filtramos por subject
      const res = await axios.get(`/api/questions/${subject}`);
      // Parseamos options si no lo hizo el backend
      const parsedQuestions = res.data.map(q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options)
      }));
      setQuestions(parsedQuestions);
    } catch (err) {
      console.error("Error cargando preguntas:", err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestionSelection = (qId) => {
    setSelectedQuestions((prev) =>
      prev.includes(qId)
        ? prev.filter(id => id !== qId)
        : [...prev, qId]
    );
  };

  const handleCreateExam = async () => {
    if (!examName) return alert('Ingresa un nombre para el examen');
    try {
      await axios.post('/api/exams', {
        name: examName,
        description: examDescription,
        subject: selectedSubject,
        questions: selectedQuestions
      });
      alert('Examen creado correctamente ✅');
      setShowModal(false);
      setExamName('');
      setExamDescription('');
      setSelectedQuestions([]);
    } catch (err) {
      console.error(err);
      alert('Error al crear el examen');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Banco de Preguntas</h1>

      {/* Botones de materias */}
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

      {/* Lista de preguntas */}
      {selectedSubject && (
        <div>
          <h2 className="text-xl font-bold mb-4">
            Preguntas de {selectedSubject}
          </h2>

          {loading ? (
            <p className="text-gray-500">Cargando preguntas...</p>
          ) : questions.length === 0 ? (
            <p className="text-gray-500">No hay preguntas disponibles.</p>
          ) : (
            <ul className="space-y-2">
              {questions.map((q) => (
                <li
                  key={q.id}
                  className="border p-3 rounded shadow cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div
                      onClick={() =>
                        setExpandedQuestion(
                          expandedQuestion === q.id ? null : q.id
                        )
                      }
                      className="flex-1"
                    >
                      <p className="font-bold">{q.name}</p>
                      <p className="text-sm text-gray-500">
                        Materia: {q.subject} | Dificultad: {q.difficulty}
                      </p>
                      {expandedQuestion === q.id && (
                        <div className="mt-2">
                          <p className="text-gray-700">{q.statement}</p>
                          <ul className="mt-2 pl-4 list-disc">
                            {q.options.map((opt, idx) => (
                              <li
                                key={idx}
                                className={opt.isCorrect ? 'text-green-600 font-semibold' : ''}
                              >
                                {opt.text}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Checkbox para seleccionar pregunta */}
                    <input
                      type="checkbox"
                      checked={selectedQuestions.includes(q.id)}
                      onChange={() => toggleQuestionSelection(q.id)}
                      className="ml-4"
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Botón para crear examen */}
          {selectedQuestions.length > 0 && (
            <div className="mt-6">
              <button
                onClick={() => setShowModal(true)}
                className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700"
              >
                Crear examen con {selectedQuestions.length} preguntas
              </button>
            </div>
          )}

          {/* Modal de creación de examen */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded shadow max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">Nuevo Examen</h2>
                <label className="block mb-2">Nombre del examen:</label>
                <input
                  type="text"
                  className="border p-2 w-full mb-4"
                  value={examName}
                  onChange={e => setExamName(e.target.value)}
                />
                <label className="block mb-2">Descripción:</label>
                <textarea
                  className="border p-2 w-full mb-4"
                  rows={4}
                  value={examDescription}
                  onChange={e => setExamDescription(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateExam}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Crear
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
