// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/auth';

import HomePage from "./components/HomePage";
import SubjectSelector from "./components/SubjectSelector";
import FreeQuestions from "./components/FreeQuestions";
import QuestionBuilder from "./components/CreateQuess";
import ExamBuilder from "./components/CreateExam";
import ExamPage from "./components/ExamPage";
import LoginPage from "./pages/loginPage"; 
import { useParams } from 'react-router-dom';

function ExamPageWrapper() {
  const { subject } = useParams();
  return <ExamPage subject={subject} />;
}

function App() {
  const { user, loading } = useAuth();

  // Mientras se carga el usuario desde localStorage, muestra algo
  if (loading) {
    return <div>Cargando...</div>; // o un Spinner
  }
  
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/" element={user ? <HomePage /> : <Navigate to="/login" />} />
      <Route path="/Examenes" element={user ? <SubjectSelector /> : <Navigate to="/login" />} />
      <Route path="/Preguntas-liberadas" element={user ? <FreeQuestions /> : <Navigate to="/login" />} />
      <Route path="/crear-pregunta" element={user ? <QuestionBuilder /> : <Navigate to="/login" />} />
      <Route path="/crear-ensayo" element={user ? <ExamBuilder /> : <Navigate to="/login" />} />
      <Route path="/exam/:examId" element={user ? <ExamPage /> : <Navigate to="/login" />} />
    </Routes>
  );
}

export default App;