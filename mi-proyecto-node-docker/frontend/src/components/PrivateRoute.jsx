import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/auth';

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>; // O un spinner
  }

  return user ? children : <Navigate to="/login" />;
}