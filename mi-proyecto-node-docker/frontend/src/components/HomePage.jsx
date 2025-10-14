import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';

export default function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      {/* Sección fija para mostrar nombre y logout */}
      {user && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            right: 30,
            textAlign: 'right',
          }}
        >
          <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
            Bienvenido, {user.name}
          </div>
          <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
            <strong>{user.role}</strong>
          </div>
          <button onClick={handleLogout}>Cerrar sesión</button>
        </div>
      )}

      {/* Contenido centrado */}
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <h1>Sistema de Ensayos PAES</h1>
        <p>Prepárate para la PAES con ensayos prácticos</p>
        {user?.role === 'profesor' ? (
          <>
            <button onClick={() => navigate('/crear-pregunta')}>Crear Pregunta</button>
            <button onClick={() => navigate('/crear-ensayo')}>Crear Ensayo</button>
          </>
        ) : (
          <>
            <button onClick={() => navigate('/Examenes')}>Realizar Ensayo</button>
            <button onClick={() => navigate('/Preguntas-liberadas')}>Preguntas liberadas</button>
          </>
        )}
      </div>
    </div>
  );
}
