import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../utils/api';

/**
 * ProtectedRoute component
 * Wraps protected routes and redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = auth.isAuthenticated();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
