import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import MOUForm from './components/MOUForm';
import FilterDownload from './components/FilterDownload';
import EditMOU from './components/EditMOU';
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add"
          element={
            <ProtectedRoute>
              <MOUForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <FilterDownload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit/:index"
          element={
            <ProtectedRoute>
              <EditMOU />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
