import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import MOUForm from './components/MOUForm';
import FilterDownload from './components/FilterDownload';
import EditMOU from './components/EditMOU'; // you’ll create this next


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/add" element={<MOUForm />} />
        <Route path="/search" element={<FilterDownload />} />
        <Route path="/edit/:index" element={<EditMOU />} />
      </Routes>
    </Router>
  );
}

export default App;
