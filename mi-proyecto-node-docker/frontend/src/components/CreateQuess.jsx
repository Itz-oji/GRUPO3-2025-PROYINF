import { useEffect, useState } from 'react';
import axios from 'axios';

export default function CreateQuess() {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [questionName, setQuestionName] = useState('');
  const [statement, setStatement] = useState('');
  const [options, setOptions] = useState([{ text: '', isCorrect: false }]);
  const [questions, setQuestions] = useState([]);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const subjects = ["Matemática", "Lenguaje", "Física", "Historia", "Biología"];
  const difficulties = ["Fácil", "Media", "Difícil"];

  useEffect(() => {
    if (selectedSubject) fetchQuestions(selectedSubject);
  }, [selectedSubject]);

  const fetchQuestions = async (subject) => {
    try {
      const res = await axios.get(`/api/questions/${encodeURIComponent(subject)}`);
      console.log("Respuesta del backend:", res.data); 
      const parsedQuestions = res.data.map(q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options)
      }));
      setQuestions(parsedQuestions);
    } catch (err) {
      console.error('Error al cargar preguntas:', err);
      setQuestions([]);
    }
  };

  const handleAddOption = () => setOptions([...options, { text: '', isCorrect: false }]);
  const handleOptionChange = (i, value) => {
    const newOptions = [...options];
    newOptions[i].text = value;
    setOptions(newOptions);
  };
  const handleSelectCorrect = (i) =>
    setOptions(options.map((opt, idx) => ({ ...opt, isCorrect: idx === i })));

  const handleSaveQuestion = async () => {
    if (!selectedSubject) return alert('Selecciona una materia');
    if (!questionName || !difficulty || !statement || options.length === 0) {
      return alert('Completa todos los campos y agrega al menos una alternativa');
    }

    try {
      const res = await axios.post(`/api/questions/${encodeURIComponent(selectedSubject)}`, {
        name: questionName,
        difficulty,
        statement,
        options
      });

      alert(res.data.message); // Mensaje de éxito

      // Reset del formulario
      setQuestionName('');
      setDifficulty('');
      setStatement('');
      setOptions([{ text: '', isCorrect: false }]);

      // Refrescar listado de preguntas
      fetchQuestions(selectedSubject);
    } catch (err) {
      console.error('Error al guardar la pregunta:', err);
      alert('Error al guardar la pregunta');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 max-w-6xl mx-auto">
      {/* FORMULARIO */}
      <div>
        <h2 className="text-xl font-bold mb-4">Crear Pregunta</h2>

        <label>Selecciona materia:</label>
        <select
          value={selectedSubject}
          onChange={e => setSelectedSubject(e.target.value)}
          className="border p-2 w-full mb-2"
        >
          <option value="">-- Elige --</option>
          {subjects.map((s, i) => (
            <option key={i} value={s}>{s}</option>
          ))}
        </select>

        <label>Dificultad:</label>
        <select
          value={difficulty}
          onChange={e => setDifficulty(e.target.value)}
          className="border p-2 w-full mb-4"
        >
          <option value="">-- Elige --</option>
          {difficulties.map((d, i) => (
            <option key={i} value={d}>{d}</option>
          ))}
        </select>

        <label>Nombre de la pregunta:</label>
        <input
          className="border p-2 w-full mb-4"
          value={questionName}
          onChange={e => setQuestionName(e.target.value)}
        />

        <label>Enunciado:</label>
        <textarea
          className="border p-2 w-full mb-4"
          rows={4}
          value={statement}
          onChange={e => setStatement(e.target.value)}
        />

        <label>Alternativas:</label>
        {options.map((opt, i) => (
          <div key={i} className="flex items-center mb-2">
            <input
              type="radio"
              name="correctOption"
              checked={opt.isCorrect}
              onChange={() => handleSelectCorrect(i)}
              className="mr-2"
            />
            <input
              type="text"
              className="border p-2 w-full"
              value={opt.text}
              onChange={e => handleOptionChange(i, e.target.value)}
            />
          </div>
        ))}

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleAddOption}
            className="bg-green-500 text-white px-4 py-1 rounded"
          >
            Agregar alternativa
          </button>

          <button
            onClick={handleSaveQuestion}
            className="bg-blue-600 text-white px-6 py-1 rounded"
          >
            Guardar Pregunta
          </button>
        </div>
      </div>

      {/* LISTADO DE PREGUNTAS */}
      <div>
        <h2 className="text-xl font-bold mb-4">Últimas Preguntas</h2>
        {questions.length === 0 ? (
          <p className="text-gray-500">No hay preguntas registradas.</p>
        ) : (
          <ul className="space-y-2">
            {questions.map(q => (
              <li
                key={q.id}
                className="border p-3 rounded shadow cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
